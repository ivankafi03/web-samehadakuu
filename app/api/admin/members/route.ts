import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { deleteCacheByPrefix } from "@/lib/cache";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const members = await prisma.user.findMany({
            where: {
                role: 'MEMBER'
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                balanceWatch: true,
                balanceReferral: true,
                registrationIp: true,
                isFlagged: true,
                flagReason: true,
                isSuspended: true,
                deviceFingerprint: true,
                createdAt: true,
            },
            orderBy: [
                { isFlagged: 'desc' }, // flagged accounts appear first
                { createdAt: 'desc' }
            ]
        });

        return NextResponse.json(members);
    } catch (error) {
        console.error("Error fetching members:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Admin can unflag a member
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { userId, action } = await req.json();

        if (!userId || !action) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // --- PROTEKSI ADMIN ---
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (targetUser?.role === 'ADMIN') {
            return NextResponse.json({ error: "Forbidden: Cannot perform actions on Admin accounts" }, { status: 403 });
        }

        if (action === "unflag") {
            await prisma.user.update({
                where: { id: userId },
                data: { isFlagged: false, flagReason: null }
            });
            deleteCacheByPrefix("ranking:");
            return NextResponse.json({ success: true, message: "User unflagged" });
        }

        if (action === "suspend") {
            await prisma.user.update({
                where: { id: userId },
                data: { isSuspended: true, isFlagged: true, flagReason: "Suspended by admin" }
            });
            deleteCacheByPrefix("ranking:");
            return NextResponse.json({ success: true, message: "User suspended" });
        }

        if (action === "unsuspend") {
            await prisma.user.update({
                where: { id: userId },
                data: { isSuspended: false, isFlagged: false, flagReason: null }
            });
            deleteCacheByPrefix("ranking:");
            return NextResponse.json({ success: true, message: "User unsuspended" });
        }

        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    } catch (error) {
        console.error("Error updating member:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Admin can delete a member (DANGEROUS)
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;
        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "Missing userId" }, { status: 400 });
        }

        // --- PROTEKSI ADMIN ---
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { role: true }
        });

        if (targetUser?.role === 'ADMIN') {
            return NextResponse.json({ error: "Forbidden: Cannot delete Admin accounts" }, { status: 403 });
        }

        // Hapus semua data relasi user secara manual sebelum menghapus user utama
        // (Urutan penting untuk menghindari constraint error)
        await prisma.$transaction([
            prisma.earningLog.deleteMany({ where: { userId } }),
            prisma.watchToken.deleteMany({ where: { userId } }),
            prisma.selfView.deleteMany({ where: { userId } }),
            prisma.referralView.deleteMany({ where: { referrerId: userId } }),
            prisma.withdrawRequest.deleteMany({ where: { userId } }),
            prisma.watchHistory.deleteMany({ where: { userId } }),
            prisma.collectedLink.deleteMany({ where: { userId } }),
            prisma.comment.deleteMany({ where: { userId } }),
            prisma.chatMessage.deleteMany({ where: { userId } }),
            prisma.payoutRequest.deleteMany({ where: { userId } }),
            // Putuskan hubungan referral (jika dia mengajak orang lain, orang tersebut jadi tidak punya referrer)
            prisma.user.updateMany({
                where: { referredById: userId },
                data: { referredById: null }
            }),
            // Baru hapus user utama
            prisma.user.delete({ where: { id: userId } })
        ]);

        deleteCacheByPrefix("ranking:");
        return NextResponse.json({ success: true, message: "Member deleted successfully" });
    } catch (error) {
        console.error("Error deleting member:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
