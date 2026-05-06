import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET: list all blocked IPs
export async function GET() {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const blockedIps = await prisma.blockedIp.findMany({
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(blockedIps);
    } catch (error) {
        console.error("Error fetching blocked IPs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: block an IP
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { ip, reason } = await req.json();

        if (!ip) {
            return NextResponse.json({ error: "IP is required" }, { status: 400 });
        }

        // Upsert so blocking same IP again just updates the reason
        const blocked = await prisma.blockedIp.upsert({
            where: { ip },
            update: { reason, blockedBy: session.user.id },
            create: { ip, reason, blockedBy: session.user.id }
        });

        return NextResponse.json({ success: true, blocked });
    } catch (error) {
        console.error("Error blocking IP:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// DELETE: unblock an IP
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { ip } = await req.json();

        if (!ip) {
            return NextResponse.json({ error: "IP is required" }, { status: 400 });
        }

        await prisma.blockedIp.delete({ where: { ip } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error unblocking IP:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
