import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    const adminEmail = "admin@anime.com";
    const adminPassword = "AdminPassword123!";

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
                balance: 1000.0,
            },
        });
        console.log("Admin user created: admin@anime.com / AdminPassword123!");
    } else {
        console.log("Admin user already exists.");
    }

    const existingSettings = await prisma.systemSettings.findUnique({
        where: { id: "global" }
    });

    if (!existingSettings) {
        await prisma.systemSettings.create({
            data: {
                id: "global",
                cpmRate: 1.5,
                skimRate: 0.2,
                minWithdrawal: 5.0,
            }
        });
        console.log("Global settings initialized.");
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
