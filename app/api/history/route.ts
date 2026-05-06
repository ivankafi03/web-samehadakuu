import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const history = await prisma.watchHistory.findMany({
            where: { userId: session.user.id },
            orderBy: { updatedAt: "desc" },
            take: 20
        });

        return NextResponse.json(history);
    } catch (error) {
        console.error("Error fetching watch history:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;

        if (!session || !session.user?.id) {
            console.warn("HISTORY POST - Unauthorized access attempt");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { videoId, videoTitle, videoImage, videoUrl } = await req.json();

        if (!videoId || !videoTitle) {
            return NextResponse.json({ error: "Missing video data" }, { status: 400 });
        }

        // More robust upsert logic
        let history;
        try {
            history = await prisma.watchHistory.upsert({
                where: {
                    userId_videoId: {
                        userId: userId,
                        videoId: videoId
                    }
                },
                update: {
                    updatedAt: new Date(),
                    videoTitle, // Update title/image/url in case they changed
                    videoImage,
                    videoUrl
                },
                create: {
                    userId: userId,
                    videoId,
                    videoTitle,
                    videoImage,
                    videoUrl
                }
            });
        } catch (upsertError: any) {
            console.error("UPSERT ERROR:", upsertError.message);

            // Fallback for missing unique constraint name issues
            history = await prisma.watchHistory.findFirst({
                where: { userId, videoId }
            });

            if (history) {
                history = await prisma.watchHistory.update({
                    where: { id: history.id },
                    data: { updatedAt: new Date(), videoTitle, videoImage, videoUrl }
                });
            } else {
                history = await prisma.watchHistory.create({
                    data: { userId, videoId, videoTitle, videoImage, videoUrl }
                });
            }
        }

        return NextResponse.json(history);
    } catch (error: any) {
        console.error("CRITICAL HISTORY POST ERROR:", error.message);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
