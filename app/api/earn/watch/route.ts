import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

// In-memory rate limit: key -> { count, resetAt }
const watchRateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 10; // max 10 reward attempts per minute per IP
const RATE_WINDOW_MS = 60_000;

// Minimum seconds a token must be alive before it can be redeemed
const MIN_WATCH_SECONDS = 55;
// Max seconds a token stays valid (30 minutes)
const MAX_TOKEN_AGE_MS = 30 * 60_000;
// Anomaly threshold: flag if user earns more than this many rewards in 24h
const ANOMALY_THRESHOLD = 50;
// Velocity: max watch rewards per hour per user
const MAX_HOURLY_REWARDS = 8;

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const entry = watchRateLimit.get(ip);

    if (!entry || now > entry.resetAt) {
        watchRateLimit.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
        return true;
    }

    if (entry.count >= RATE_LIMIT) return false;

    entry.count++;
    return true;
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;

        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        if (session.user.isSuspended) {
            return NextResponse.json({ error: "Account Suspended" }, { status: 403 });
        }

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

        // Parse body dulu
        const data = await req.json();
        const { videoId, token } = data;

        if (!videoId || !token) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check user status — flagged/suspended users tidak dapat reward
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { isFlagged: true, isSuspended: true }
        });

        if (!currentUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (currentUser.isSuspended) {
            return NextResponse.json({ error: "Account suspended" }, { status: 403 });
        }

        if (currentUser.isFlagged) {
            // Flagged: consume token tapi tidak beri reward (bot tidak tahu terdeteksi)
            console.warn(`[SECURITY] Flagged user ${session.user.id} attempted watch reward from IP ${ip}`);
            await prisma.watchToken.updateMany({
                where: { token, userId: session.user.id },
                data: { usedAt: new Date() }
            });
            return NextResponse.json({ success: true, reward: 0, newBalance: 0 });
        }

        // Validate token exists, belongs to this user, and is for this video
        const watchToken = await prisma.watchToken.findUnique({
            where: { token }
        });

        if (!watchToken) {
            return NextResponse.json({ error: "Invalid token" }, { status: 400 });
        }

        if (watchToken.userId !== session.user.id) {
            return NextResponse.json({ error: "Token mismatch" }, { status: 403 });
        }

        if (watchToken.videoId !== videoId) {
            return NextResponse.json({ error: "Token video mismatch" }, { status: 403 });
        }

        // Token already used
        if (watchToken.usedAt !== null) {
            return NextResponse.json({ error: "Token already used" }, { status: 429 });
        }

        const now = Date.now();
        const tokenAgeMs = now - watchToken.issuedAt.getTime();

        // Token too young — user didn't actually wait
        if (tokenAgeMs < MIN_WATCH_SECONDS * 1000) {
            return NextResponse.json({ error: "Watch time not met" }, { status: 429 });
        }

        // Token too old — expired
        if (tokenAgeMs > MAX_TOKEN_AGE_MS) {
            await prisma.watchToken.delete({ where: { token } });
            return NextResponse.json({ error: "Token expired" }, { status: 400 });
        }

        // Anti-flood: Check if user already rewarded for this video in the last hour
        const recentView = await prisma.selfView.findFirst({
            where: {
                userId: session.user.id,
                videoId,
                createdAt: { gt: new Date(Date.now() - 3600000) }
            }
        });

        if (recentView) {
            await prisma.watchToken.update({ where: { token }, data: { usedAt: new Date() } });
            return NextResponse.json({ error: "Already rewarded for this video recently" }, { status: 429 });
        }

        // Velocity check: max rewards per jam
        const hourlyRewards = await prisma.earningLog.count({
            where: {
                userId: session.user.id,
                type: "WATCH",
                createdAt: { gt: new Date(Date.now() - 3600000) }
            }
        });

        if (hourlyRewards >= MAX_HOURLY_REWARDS) {
            await prisma.watchToken.update({ where: { token }, data: { usedAt: new Date() } });
            return NextResponse.json({ error: "Hourly limit reached" }, { status: 429 });
        }

        // Get reward amount from system settings
        const settings = await prisma.systemSettings.findUnique({
            where: { id: "global" }
        });

        const rewardAmount = settings?.watchRate || 0.005;

        // Mark token as used + grant reward in a transaction
        await prisma.$transaction(async (tx) => {
            await tx.watchToken.update({
                where: { token },
                data: { usedAt: new Date() }
            });

            await tx.selfView.create({
                data: {
                    userId: session.user.id,
                    videoId,
                    duration: Math.floor(tokenAgeMs / 1000),
                    rewarded: true
                }
            });

            await tx.user.update({
                where: { id: session.user.id },
                data: {
                    balanceWatch: {
                        increment: rewardAmount
                    }
                }
            });

            await tx.earningLog.create({
                data: {
                    userId: session.user.id,
                    amount: rewardAmount,
                    type: "WATCH"
                }
            });
        });

        // --- Anomaly Detection (non-blocking, runs after response) ---
        (async () => {
            try {
                const recentEarnings = await prisma.earningLog.count({
                    where: {
                        userId: session.user.id,
                        type: "WATCH",
                        createdAt: {
                            gt: new Date(Date.now() - 86400000) // last 24h
                        }
                    }
                });

                if (recentEarnings > ANOMALY_THRESHOLD) {
                    await prisma.user.updateMany({
                        where: {
                            id: session.user.id,
                            isFlagged: false // only flag once
                        },
                        data: {
                            isFlagged: true,
                            flagReason: `Earning anomaly: ${recentEarnings} watch rewards dalam 24 jam (threshold: ${ANOMALY_THRESHOLD})`
                        }
                    });
                    console.warn(`[ANOMALY] User ${session.user.id} flagged: ${recentEarnings} watch rewards in 24h`);
                }
            } catch (e) {
                console.error("[ANOMALY] Detection error:", e);
            }
        })();

        // Fetch updated balance
        const updatedUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { balanceWatch: true }
        });

        return NextResponse.json({
            success: true,
            reward: rewardAmount,
            newBalance: updatedUser?.balanceWatch ?? 0
        });

    } catch (error) {
        console.error("Error processing watch reward:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
