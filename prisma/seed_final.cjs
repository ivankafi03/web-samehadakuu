const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
    const adminEmail = "admin@anime.com";
    const adminPassword = "admin123";

    const memberEmail = "member@anime.com";
    const memberPassword = "member123";

    const hashAdmin = await bcrypt.hash(adminPassword, 10);
    const hashMember = await bcrypt.hash(memberPassword, 10);

    // Seed Admin
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            name: "Main Admin",
            password: hashAdmin,
            role: "ADMIN",
            balanceWatch: 0,
            balanceReferral: 0,
        },
    });

    // Seed Sample Member
    await prisma.user.upsert({
        where: { email: memberEmail },
        update: {},
        create: {
            email: memberEmail,
            name: "Test Member",
            password: hashMember,
            role: "MEMBER",
            balanceWatch: 0,
            balanceReferral: 0,
        },
    });

    await prisma.systemSettings.upsert({
        where: { id: "global" },
        update: {},
        create: {
            id: "global",
            cpmRate: 1.5,
            watchRate: 0.005,
            referralRate: 0.01,
            skimRate: 0.2,
            minWithdrawal: 5.0,
        },
    });

    console.log("Seeding complete.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
