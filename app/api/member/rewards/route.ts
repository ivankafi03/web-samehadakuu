import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user?.id) {
            return NextResponse.json({ rewards: [] });
        }

        const userId = session.user.id;

        // 1. Ambil data user untuk cek bonus pendaftaran
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { registrationBonusClaimed: true }
        });

        const rewards = [];

        // 2. Jika belum klaim bonus pendaftaran, masukkan ke list
        if (user && !user.registrationBonusClaimed) {
            const settings = await prisma.systemSettings.findFirst();
            rewards.push({
                id: "REGISTRATION_BONUS",
                type: "REGISTRATION",
                title: "Welcome Bonus",
                message: "Klaim $1.00 pertama kamu sebagai hadiah selamat datang!",
                amount: settings?.registrationBonus || 1.00
            });
        }

        // 3. Ambil broadcast rewards yang aktif dan belum diklaim
        const activeBroadcasts = await prisma.broadcastReward.findMany({
            where: {
                isActive: true,
                NOT: {
                    claims: {
                        some: {
                            userId: userId
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        activeBroadcasts.forEach(b => {
            rewards.push({
                id: b.id,
                type: "BROADCAST",
                title: b.title,
                message: b.message,
                amount: b.amount
            });
        });

        return NextResponse.json({ rewards });

    } catch (error) {
        console.error("Error fetching rewards:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
