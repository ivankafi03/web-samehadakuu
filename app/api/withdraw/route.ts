import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET user's withdrawal history
export async function GET() {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const withdrawals = await prisma.withdrawRequest.findMany({
            where: { userId: session.user.id },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json(withdrawals);
    } catch (error) {
        console.error("Error fetching withdrawals:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST new withdrawal request
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
        const { amount, method, accountNumber, accountName } = await req.json();

        if (!amount || !method || !accountNumber || !accountName) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Fetch user balance + status
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { balanceWatch: true, balanceReferral: true, isFlagged: true, isSuspended: true }
        });

        const settings = await prisma.systemSettings.findUnique({
            where: { id: "global" }
        });

        if (!user || !settings) {
            return NextResponse.json({ error: "System error" }, { status: 500 });
        }

        // Blokir withdrawal jika akun flagged atau suspended
        if (user.isSuspended) {
            return NextResponse.json({ error: "Akun Anda telah disuspend. Hubungi admin." }, { status: 403 });
        }

        if (user.isFlagged) {
            console.warn(`[SECURITY] Flagged user ${userId} attempted withdrawal of $${amount}`);
            return NextResponse.json({ error: "Akun Anda sedang dalam proses verifikasi. Hubungi admin." }, { status: 403 });
        }

        const totalBalance = user.balanceWatch + user.balanceReferral;
        const minWd = settings.minWithdrawal;

        if (amount < minWd) {
            return NextResponse.json({ error: `Minimum withdrawal is $${minWd}` }, { status: 400 });
        }

        if (amount > totalBalance) {
            return NextResponse.json({ error: "Insufficient balance" }, { status: 400 });
        }

        // Deduct balance and create request in a transaction
        // We'll deduct from balanceWatch first, then balanceReferral if needed
        const result = await prisma.$transaction(async (tx) => {
            let remainingToDeduct = amount;
            let newBalanceWatch = user.balanceWatch;
            let newBalanceReferral = user.balanceReferral;

            if (newBalanceWatch >= remainingToDeduct) {
                newBalanceWatch -= remainingToDeduct;
                remainingToDeduct = 0;
            } else {
                remainingToDeduct -= newBalanceWatch;
                newBalanceWatch = 0;
                newBalanceReferral -= remainingToDeduct;
            }

            await tx.user.update({
                where: { id: userId },
                data: {
                    balanceWatch: newBalanceWatch,
                    balanceReferral: newBalanceReferral
                }
            });

            return await tx.withdrawRequest.create({
                data: {
                    userId,
                    amount,
                    method,
                    accountNumber,
                    accountName,
                    status: "PENDING"
                }
            });
        });

        return NextResponse.json(result);
    } catch (error) {
        console.error("Error creating withdrawal:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
