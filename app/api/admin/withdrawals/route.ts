import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET withdrawal requests
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        const where: any = {};
        if (status) {
            where.status = status;
        }

        const withdrawals = await prisma.withdrawRequest.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(withdrawals);
    } catch (error) {
        console.error("Error fetching admin withdrawals:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH update withdrawal status
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, status } = await req.json();

        if (!id || !status) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const withdraw = await prisma.withdrawRequest.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!withdraw) {
            return NextResponse.json({ error: "Request not found" }, { status: 404 });
        }

        // If rejecting, return the balance to the user
        if (status === "REJECTED" && withdraw.status === "PENDING") {
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: withdraw.userId },
                    data: {
                        balanceWatch: {
                            increment: withdraw.amount
                        }
                    }
                }),
                prisma.withdrawRequest.update({
                    where: { id },
                    data: { status: "REJECTED" }
                })
            ]);
        } else {
            await prisma.withdrawRequest.update({
                where: { id },
                data: { 
                    status,
                    processedAt: status === "APPROVED" ? new Date() : null
                }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating withdrawal status:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
