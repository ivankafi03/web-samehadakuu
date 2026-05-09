import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = session.user.id;
        const { rewardId } = await req.json();

        if (!rewardId) {
            return NextResponse.json({ error: "Missing rewardId" }, { status: 400 });
        }

        return await prisma.$transaction(async (tx) => {
            let amount = 0;
            let type = "";

            if (rewardId === "REGISTRATION_BONUS") {
                // Klaim bonus pendaftaran
                const user = await tx.user.findUnique({
                    where: { id: userId },
                    select: { registrationBonusClaimed: true }
                });

                if (!user || user.registrationBonusClaimed) {
                    throw new Error("Bonus already claimed or user not found");
                }

                const settings = await tx.systemSettings.findFirst();
                amount = settings?.registrationBonus || 1.00;
                type = "REGISTRATION_BONUS";

                await tx.user.update({
                    where: { id: userId },
                    data: { registrationBonusClaimed: true }
                });
            } else {
                // Klaim broadcast reward
                const broadcast = await tx.broadcastReward.findUnique({
                    where: { id: rewardId, isActive: true }
                });

                if (!broadcast) {
                    throw new Error("Reward not found or inactive");
                }

                // Cek apakah sudah pernah klaim
                const existingClaim = await tx.userClaim.findUnique({
                    where: {
                        userId_broadcastRewardId: {
                            userId: userId,
                            broadcastRewardId: rewardId
                        }
                    }
                });

                if (existingClaim) {
                    throw new Error("Reward already claimed");
                }

                amount = broadcast.amount;
                type = "ADMIN_BONUS";

                await tx.userClaim.create({
                    data: {
                        userId: userId,
                        broadcastRewardId: rewardId
                    }
                });
            }

            // Tambahkan ke balanceBonus
            await tx.user.update({
                where: { id: userId },
                data: {
                    balanceBonus: {
                        increment: amount
                    }
                }
            });

            // Catat di EarningLog
            await tx.earningLog.create({
                data: {
                    userId: userId,
                    amount: amount,
                    type: "BONUS"
                }
            });

            return NextResponse.json({ 
                success: true, 
                message: `Berhasil klaim bonus $${amount.toFixed(2)}!`,
                amount
            });
        });

    } catch (error: any) {
        console.error("Error claiming reward:", error);
        return NextResponse.json({ error: error.message || "Gagal klaim bonus" }, { status: 400 });
    }
}
