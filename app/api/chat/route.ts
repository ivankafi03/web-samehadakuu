import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const prisma = new PrismaClient();

export async function GET() {
    try {
        const messages = await prisma.chatMessage.findMany({
            take: 50,
            orderBy: { createdAt: "desc" },
            include: {
                user: {
                    select: { id: true, name: true, image: true, role: true }
                }
            }
        });

        // Normalize: expose content as "text" for frontend compatibility
        const normalized = messages.reverse().map(m => ({
            ...m,
            text: m.content,
        }));

        return NextResponse.json(normalized);
    } catch (error) {
        console.error("Chat fetch error:", error);
        return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (session.user.isSuspended) {
            return NextResponse.json({ error: "Account Suspended" }, { status: 403 });
        }

        const { content } = await req.json();
        if (!content || content.trim().length === 0) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email as string }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const message = await prisma.chatMessage.create({
            data: {
                content,
                userId: user.id,
                isAdmin: user.role === "ADMIN"
            },
            include: {
                user: {
                    select: { id: true, name: true, image: true, role: true }
                }
            }
        });

        return NextResponse.json({ ...message, text: message.content });
    } catch (error) {
        console.error("Chat send error:", error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Message ID required" }, { status: 400 });
        }

        await prisma.chatMessage.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Chat delete error:", error);
        return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
    }
}
