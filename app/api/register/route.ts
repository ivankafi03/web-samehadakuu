import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { isVpnOrProxy, verifyTurnstile } from "@/lib/security";

// Max accounts allowed per IP address
const MAX_ACCOUNTS_PER_IP = 3;

export async function POST(req: Request) {
    try {
        const { name, email, password, referrerId, turnstileToken, fingerprint } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // 0. Turnstile CAPTCHA Check
        if (process.env.TURNSTILE_SECRET_KEY) {
            if (!turnstileToken) {
                return NextResponse.json({ error: "Silakan selesaikan CAPTCHA." }, { status: 400 });
            }
            const isHuman = await verifyTurnstile(turnstileToken);
            if (!isHuman) {
                return NextResponse.json({ error: "Verifikasi CAPTCHA gagal. Silakan coba lagi." }, { status: 400 });
            }
        }

        // Get client IP
        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";

        // 1. VPN/Proxy Check
        if (ip !== "unknown" && ip !== "127.0.0.1" && ip !== "::1") {
            const isVpn = await isVpnOrProxy(ip);
            if (isVpn) {
                return NextResponse.json(
                    { error: "Pendaftaran gagal. Penggunaan VPN/Proxy tidak diizinkan untuk keamanan platform." },
                    { status: 403 }
                );
            }
        }

        // Check accounts already registered from this IP
        if (ip !== "unknown") {
            const ipAccountCount = await prisma.user.count({
                where: { registrationIp: ip }
            });

            if (ipAccountCount >= MAX_ACCOUNTS_PER_IP) {
                return NextResponse.json(
                    { error: "Batas pendaftaran dari jaringan ini telah tercapai." },
                    { status: 429 }
                );
            }
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Find referrer if exists
        let referrer = null;
        if (referrerId) {
            referrer = await prisma.user.findFirst({
                where: {
                    id: {
                        startsWith: referrerId
                    }
                }
            });
        }

        // Create user and handle referral bonus in a transaction
        await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                    role: "MEMBER",
                    balanceWatch: 0,
                    balanceReferral: 0,
                    referredById: referrer?.id || null,
                    registrationIp: ip,
                    deviceFingerprint: fingerprint || null,
                }
            });

            if (referrer) {
                const settings = await tx.systemSettings.findUnique({ where: { id: "global" } });
                const bonus = settings?.registrationBonus || 0.10;

                await tx.user.update({
                    where: { id: referrer.id },
                    data: {
                        balanceReferral: {
                            increment: bonus
                        }
                    }
                });

                await tx.earningLog.create({
                    data: {
                        userId: referrer.id,
                        amount: bonus,
                        type: "BONUS"
                    }
                });
            }

            return newUser;
        });

        return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
