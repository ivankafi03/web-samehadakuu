import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId) {
        return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
    }

    try {
        const comments = await prisma.comment.findMany({
            where: { videoId },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                        role: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(comments);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions) as any;

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.isSuspended) {
        return NextResponse.json({ error: "Account Suspended" }, { status: 403 });
    }

    try {
        const { videoId, content } = await req.json();

        if (!videoId || !content) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                videoId,
                content,
                userId: (session.user as any).id
            },
            include: {
                user: {
                    select: {
                        name: true,
                        image: true,
                        role: true
                    }
                }
            }
        });

        return NextResponse.json(comment);
    } catch (error) {
        return NextResponse.json({ error: "Failed to post comment" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions) as any;

    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.user.isSuspended) {
        return NextResponse.json({ error: "Account Suspended" }, { status: 403 });
    }

    try {
        const { id } = await req.json();

        const comment = await prisma.comment.findUnique({
            where: { id }
        });

        if (!comment) {
            return NextResponse.json({ error: "Comment not found" }, { status: 404 });
        }

        // Only author or admin can delete
        if (comment.userId !== (session.user as any).id && (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.comment.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 });
    }
}
