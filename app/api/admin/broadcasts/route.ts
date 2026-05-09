import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const broadcasts = await prisma.broadcastReward.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { claims: true }
                }
            }
        });

        return NextResponse.json(broadcasts);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { title, message, amount } = await req.json();

        if (!title || !message || isNaN(amount)) {
            return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
        }

        const broadcast = await prisma.broadcastReward.create({
            data: {
                title,
                message,
                amount: parseFloat(amount)
            }
        });

        return NextResponse.json(broadcast);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, isActive } = await req.json();

        await prisma.broadcastReward.update({
            where: { id },
            data: { isActive }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
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

        if (!id) return NextResponse.json({ error: "ID missing" }, { status: 400 });

        await prisma.$transaction([
            prisma.userClaim.deleteMany({ where: { broadcastRewardId: id } }),
            prisma.broadcastReward.delete({ where: { id } })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
