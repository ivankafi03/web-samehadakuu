import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withCache } from "@/lib/cache";

export const dynamic = "force-dynamic";

function censorName(name: string | null) {
    if (!name) return "Ano*****m";
    if (name.length <= 3) return name + "*****";
    const start = name.substring(0, 3);
    const end = name.substring(name.length - 1);
    return `${start}*****${end}`;
}

// Native Helpers for Date Filtering
const getStartOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

const getEndOfDay = (date: Date) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
};

const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday...
    // Adjust to Monday start
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(d.setDate(diff));
    start.setHours(0, 0, 0, 0);
    return start;
};

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const period = searchParams.get("period") || "alltime"; // daily, weekly, alltime
        const type = searchParams.get("type") || "total"; // total, watch, referral

        const cacheKey = `ranking:${period}:${type}`;

        const ranking = await withCache(
            cacheKey,
            async () => {
                let dateFilter: any = {};
                const now = new Date();

                if (period === "daily") {
                    dateFilter.createdAt = {
                        gte: getStartOfDay(now),
                        lte: getEndOfDay(now)
                    };
                } else if (period === "weekly") {
                    dateFilter.createdAt = {
                        gte: getStartOfWeek(now)
                    };
                }

                // Add type filter for EarningLog if not 'total'
                if (type !== "total") {
                    dateFilter.type = type.toUpperCase(); // WATCH or REFERRAL
                }

                let result: any[] = [];

                if (period === "alltime") {
                    const topUsers = await prisma.user.findMany({
                        where: { role: "MEMBER" },
                        select: {
                            id: true,
                            name: true,
                            balanceWatch: true,
                            balanceReferral: true
                        },
                        take: 50 // Fetch more to sort accurately if type is total
                    });

                    const sortedUsers = topUsers.map(user => ({
                        id: user.id,
                        name: censorName(user.name),
                        watch: user.balanceWatch,
                        ref: user.balanceReferral,
                        total: user.balanceWatch + user.balanceReferral
                    })).sort((a, b) => {
                        if (type === "watch") return b.watch - a.watch;
                        if (type === "referral") return b.ref - a.ref;
                        return b.total - a.total;
                    }).slice(0, 20);

                    result = sortedUsers.map((user, index) => ({
                        rank: index + 1,
                        name: user.name,
                        earning: type === "watch" ? user.watch : type === "referral" ? user.ref : user.total,
                        isVerified: true
                    }));
                } else {
                    // For Daily/Weekly, aggregate EarningsLog
                    const aggregatedEarnings = await prisma.earningLog.groupBy({
                        by: ['userId'],
                        where: dateFilter,
                        _sum: {
                            amount: true
                        },
                        orderBy: {
                            _sum: {
                                amount: 'desc'
                            }
                        },
                        take: 20
                    });

                    const userIds = aggregatedEarnings.map(item => item.userId);
                    const users = await prisma.user.findMany({
                        where: { id: { in: userIds } },
                        select: { id: true, name: true }
                    });

                    result = aggregatedEarnings.map((item, index) => {
                        const user = users.find(u => u.id === item.userId);
                        return {
                            rank: index + 1,
                            name: censorName(user?.name || "Member"),
                            earning: item._sum.amount || 0,
                            isVerified: true
                        };
                    });
                }

                return result;
            },
            300 // 5 menit
        );

        return NextResponse.json(ranking);
    } catch (error) {
        console.error("Error fetching ranking:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
