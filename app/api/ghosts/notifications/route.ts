import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // Ambil 1 bot acak
        const bots = await prisma.user.findMany({
            where: { isBot: true },
            select: { name: true, balanceWatch: true }
        });

        if (bots.length === 0) {
            return NextResponse.json({ active: false });
        }

        const randomBot = bots[Math.floor(Math.random() * bots.length)];
        const methods = ["DANA", "OVO", "GoPay", "ShopeePay", "PayPal"];
        const randomMethod = methods[Math.floor(Math.random() * methods.length)];

        return NextResponse.json({
            active: true,
            name: randomBot.name,
            amount: (Math.random() * 5 + 50).toFixed(2), // Antara $50.00 - $55.00
            method: randomMethod,
            milestone: (Math.random() * 10 + 35).toFixed(2) // Antara $35 - $45 buat member
        });
    } catch (error) {
        return NextResponse.json({ active: false }, { status: 500 });
    }
}
