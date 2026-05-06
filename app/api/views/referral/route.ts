import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// In-memory rate limit: IP -> { count, resetAt }
const referralRateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // max 20 referral pings per minute per IP
const RATE_WINDOW_MS = 60_000;

// Anomaly: jika 1 referrer dapat >200 CPM dalam 24 jam, flag
const REFERRAL_ANOMALY_THRESHOLD = 200;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = referralRateLimit.get(ip);

    if (!entry || now > entry.resetAt) {
        referralRateLimit.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
        return true;
    }

    if (entry.count >= RATE_LIMIT) return false;

    entry.count++;
    return true;
}

export async function POST(req: Request) {
    try {
        const { videoId, referrerId } = await req.json();
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

        // Rate limit by IP
        if (!checkRateLimit(ip)) {
            return NextResponse.json({ error: "Too many requests" }, { status: 429 });
        }

        // User-Agent check
        const userAgent = headerList.get("user-agent") || "";
        const isBotUA = !userAgent ||
            /bot|crawl|spider|headless|phantom|selenium|puppeteer|playwright|wget|curl/i.test(userAgent);

        if (isBotUA) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        if (!videoId || !referrerId) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        // Find referrer user
        const user = await prisma.user.findFirst({
            where: { id: { startsWith: referrerId } },
            select: { id: true, isFlagged: true, isSuspended: true }
        });

        if (!user) {
            return NextResponse.json({ error: "Referrer not found" }, { status: 404 });
        }

        // Referrer suspended/flagged: jangan bayar
        if (user.isSuspended || user.isFlagged) {
            // Silent accept agar bot tidak tahu terdeteksi
            console.warn(`[SECURITY] Referral reward skipped for flagged/suspended user ${user.id} from IP ${ip}`);
            return NextResponse.json({ success: true, rewarded: false });
        }

        const actualReferrerId = user.id;

        // Self-referral prevention: jika viewer sedang login dan dia = referrer, skip
        const session = await getServerSession(authOptions) as any;
        if (session?.user?.id && session.user.id === actualReferrerId) {
            return NextResponse.json({ message: "Self-referral not allowed" });
        }

        // 1. Restriction: Don't count same IP within 1 hour
        const recentView = await prisma.referralView.findFirst({
            where: {
                referrerId: actualReferrerId,
                videoId: videoId,
                ipAddress: ip,
                createdAt: { gt: new Date(Date.now() - 3600000) }
            }
        });

        if (recentView) {
            return NextResponse.json({ message: "View already registered recently" });
        }

        // 2. Create Referral View
        await prisma.referralView.create({
            data: {
                referrerId: actualReferrerId,
                videoId: videoId,
                ipAddress: ip,
                userAgent: userAgent.substring(0, 500),
            }
        });

        // 3. Reward based on CPM
        const settings = await prisma.systemSettings.findUnique({ where: { id: "global" } });
        const cpm = settings?.cpmRate || 1.50;
        const reward = cpm / 1000;

        // Apply Skim Rate Logic
        const skimRate = settings?.skimRate || 0.20;
        const shouldReward = Math.random() > skimRate;

        if (shouldReward) {
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: actualReferrerId },
                    data: { balanceReferral: { increment: reward } }
                }),
                prisma.earningLog.create({
                    data: { userId: actualReferrerId, amount: reward, type: "REFERRAL" }
                })
            ]);
        }

        // 4. Referral anomaly detection (non-blocking)
        (async () => {
            try {
                const recentReferralCount = await prisma.earningLog.count({
                    where: {
                        userId: actualReferrerId,
                        type: "REFERRAL",
                        createdAt: { gt: new Date(Date.now() - 86400000) }
                    }
                });

                if (recentReferralCount > REFERRAL_ANOMALY_THRESHOLD) {
                    await prisma.user.updateMany({
                        where: { id: actualReferrerId, isFlagged: false },
                        data: {
                            isFlagged: true,
                            flagReason: `Referral anomaly: ${recentReferralCount} CPM rewards dalam 24 jam (threshold: ${REFERRAL_ANOMALY_THRESHOLD})`
                        }
                    });
                    console.warn(`[ANOMALY] Referral user ${actualReferrerId} flagged: ${recentReferralCount} referral rewards in 24h`);
                }
            } catch (e) {
                console.error("[ANOMALY] Referral detection error:", e);
            }
        })();

        return NextResponse.json({ success: true, rewarded: shouldReward });
    } catch (error) {
        console.error("Error registering referral view:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
