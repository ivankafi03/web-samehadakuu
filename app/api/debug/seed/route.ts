import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Use a new client to bypass singleton for this debug route
const prisma = new PrismaClient();

export async function GET() {
    try {
        const adminEmail = "admin@anime.com";
        const adminPassword = "AdminPassword123!";

        await prisma.$connect();

        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail },
        });

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await prisma.user.create({
                data: {
                    email: adminEmail,
                    name: "Main Admin",
                    password: hashedPassword,
                    role: "ADMIN",
                    balanceWatch: 0,
                    balanceReferral: 0,
                },
            });
        }

        const settings = await prisma.systemSettings.findUnique({
            where: { id: "global" }
        });

        if (!settings) {
            await prisma.systemSettings.create({
                data: {
                    id: "global",
                    cpmRate: 1.5,
                    skimRate: 0.2,
                    minWithdrawal: 5.0,
                }
            });
        }

        return NextResponse.json({
            success: true,
            message: "Seeding finished. You can now login.",
            credentials: {
                email: "admin@anime.com",
                password: "AdminPassword123!"
            }
        });
    } catch (error: any) {
        console.error("DEBUG SEED ERROR:", error);
        return NextResponse.json({
            error: error.message,
            details: error.toString()
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
