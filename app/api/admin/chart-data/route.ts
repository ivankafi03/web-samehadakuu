import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { withCache } from "@/lib/cache";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await withCache(
            "admin:chart-data",
            async () => {
                const last7Days = [];
                for (let i = 6; i >= 0; i--) {
                    const date = new Date();
                    date.setDate(date.getDate() - i);
                    date.setHours(0, 0, 0, 0);

                    const nextDate = new Date(date);
                    nextDate.setDate(nextDate.getDate() + 1);

                    const dayEarnings = await prisma.earningLog.aggregate({
                        where: {
                            createdAt: {
                                gt: date,
                                lt: nextDate
                            }
                        },
                        _sum: { amount: true }
                    });

                    const dayPayouts = await prisma.withdrawRequest.aggregate({
                        where: {
                            status: "APPROVED",
                            updatedAt: {
                                gt: date,
                                lt: nextDate
                            }
                        },
                        _sum: { amount: true }
                    });

                    last7Days.push({
                        name: date.toLocaleDateString('id-ID', { weekday: 'short' }),
                        earnings: dayEarnings._sum.amount || 0,
                        payouts: dayPayouts._sum.amount || 0,
                    });
                }
                return last7Days;
            },
            300 // 5 menit
        );

        return NextResponse.json(data);
    } catch (error) {
        console.error("Chart data error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
