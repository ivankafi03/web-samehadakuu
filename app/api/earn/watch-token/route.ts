import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { randomBytes } from "crypto";

// In-memory rate limit: userId -> { count, resetAt }
const tokenRateLimit = new Map<string, { count: number; resetAt: number }>();
const TOKEN_RATE_LIMIT = 15; // max 15 token requests per minute per user
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(key: string): boolean {
    const now = Date.now();
    const entry = tokenRateLimit.get(key);

    if (!entry || now > entry.resetAt) {
        tokenRateLimit.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
        return true;
    }

    if (entry.count >= TOKEN_RATE_LIMIT) return false;

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

        const userId = session.user.id;

        // Rate limit check (per user)
        if (!checkRateLimit(`user:${userId}`)) {
            return NextResponse.json({ error: "Too many token requests" }, { status: 429 });
        }

        // Check User-Agent (basic bot detection)
        const headerList = await headers();
        const userAgent = headerList.get("user-agent") || "";
        const isBotUA = !userAgent ||
            /bot|crawl|spider|headless|phantom|selenium|puppeteer|playwright|wget|curl/i.test(userAgent);

        if (isBotUA) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { videoId } = await req.json();

        if (!videoId || typeof videoId !== "string" || videoId.length > 200) {
            return NextResponse.json({ error: "Invalid videoId" }, { status: 400 });
        }

        // Invalidate any existing unused token for this user+video (user re-clicked play)
        await prisma.watchToken.deleteMany({
            where: {
                userId,
                videoId,
                usedAt: null,
            }
        });

        // Generate secure random token
        const token = randomBytes(32).toString("hex");

        await prisma.watchToken.create({
            data: {
                userId,
                videoId,
                token,
            }
        });

        return NextResponse.json({ token });

    } catch (error) {
        console.error("Error generating watch token:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
