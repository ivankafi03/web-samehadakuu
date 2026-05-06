import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const now = new Date();
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        const endOfDay = new Date(now.setHours(23, 59, 59, 999));

        // 1. Today's Views (Self + Referral)
        const [selfViewsToday, referralViewsToday] = await Promise.all([
            prisma.selfView.count({
                where: {
                    userId,
                    createdAt: { gte: startOfDay, lte: endOfDay }
                }
            }),
            prisma.referralView.count({
                where: {
                    referrerId: userId,
                    createdAt: { gte: startOfDay, lte: endOfDay }
                }
            })
        ]);

        // 2. Today's Earnings (Watch vs Referral)
        const [watchEarningsToday, referralEarningsToday] = await Promise.all([
            prisma.earningLog.aggregate({
                where: {
                    userId,
                    type: "WATCH",
                    createdAt: { gte: startOfDay, lte: endOfDay }
                },
                _sum: { amount: true }
            }),
            prisma.earningLog.aggregate({
                where: {
                    userId,
                    type: "REFERRAL",
                    createdAt: { gte: startOfDay, lte: endOfDay }
                },
                _sum: { amount: true }
            })
        ]);

        // 3. Watchtime (Self + Referral)
        const [selfWatchtime, referralWatchtime] = await Promise.all([
            prisma.selfView.aggregate({
                where: { userId },
                _sum: { duration: true }
            }),
            prisma.referralView.aggregate({
                where: { referrerId: userId },
                _sum: { duration: true }
            })
        ]);

        const totalWatchtimeSec = (selfWatchtime._sum.duration || 0) + (referralWatchtime._sum.duration || 0);
        const totalViews = await prisma.selfView.count({ where: { userId } }) + await prisma.referralView.count({ where: { referrerId: userId } });

        const avgRetention = totalViews > 0 ? totalWatchtimeSec / totalViews : 0;

        return NextResponse.json({
            todayViews: selfViewsToday + referralViewsToday,
            todayReferralViews: referralViewsToday,
            todayEarnings: (watchEarningsToday._sum.amount || 0) + (referralEarningsToday._sum.amount || 0),
            todayWatchEarnings: watchEarningsToday._sum.amount || 0,
            todayReferralEarnings: referralEarningsToday._sum.amount || 0,
            totalWatchtime: totalWatchtimeSec,
            avgRetention: Math.round(avgRetention)
        });

    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
