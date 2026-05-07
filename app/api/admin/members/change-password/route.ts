import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions) as any;

        // Proteksi: Hanya Admin yang boleh akses
        if (!session || session.user?.role !== "ADMIN") {
            return new Response("Unauthorized", { status: 401 });
        }

        const { userId, newPassword } = await req.json();

        if (!userId || !newPassword || newPassword.length < 6) {
            return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
        }

        // Hash password baru
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update di database
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ message: "Password berhasil diubah" });
    } catch (error) {
        console.error("Error changing password:", error);
        return NextResponse.json({ error: "Gagal mengubah password" }, { status: 500 });
    }
}
