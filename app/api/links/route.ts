import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;

        const links = await (prisma as any).collectedLink.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" }
        });

        // Add view counts (ranking) for each link
        const linksWithStats = await Promise.all(links.map(async (link: any) => {
            const viewCount = await prisma.referralView.count({
                where: {
                    referrerId: userId,
                    videoId: link.videoId
                }
            });
            return { ...link, viewCount };
        }));

        // Sort by viewCount desc
        linksWithStats.sort((a, b) => b.viewCount - a.viewCount);

        return NextResponse.json(linksWithStats);
    } catch (error) {
        console.error("Error fetching links with stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (session.user.isSuspended) {
            return NextResponse.json({ error: "Account Suspended" }, { status: 403 });
        }

        const userId = session.user.id;
        const { videoId, videoTitle, videoUrl } = await req.json();

        // Avoid duplicates in collection
        const existing = await (prisma as any).collectedLink.findFirst({
            where: { userId, videoId }
        });

        if (existing) {
            return NextResponse.json({ message: "Already collected" }, { status: 200 });
        }

        const link = await (prisma as any).collectedLink.create({
            data: {
                userId,
                videoId,
                videoTitle,
                videoUrl
            }
        });

        return NextResponse.json(link);
    } catch (error) {
        console.error("Error collecting link:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (session.user.isSuspended) {
            return NextResponse.json({ error: "Account Suspended" }, { status: 403 });
        }

        const userId = session.user.id;

        let ids: string[] = [];
        try {
            const body = await req.json();
            ids = body.ids || [];
        } catch (e) {
            // No body provided, assume Clear All
        }

        if (ids.length > 0) {
            // Delete specific links
            await (prisma as any).collectedLink.deleteMany({
                where: {
                    userId: userId,
                    id: { in: ids }
                }
            });
            return NextResponse.json({ message: `${ids.length} links deleted` });
        } else {
            // Clear all
            await (prisma as any).collectedLink.deleteMany({
                where: { userId: userId }
            });
            return NextResponse.json({ message: "All links cleared" });
        }
    } catch (error) {
        console.error("Error deleting links:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
