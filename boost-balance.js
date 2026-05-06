const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function boost() {
    const email = "member_test@test.com";
    const user = await prisma.user.update({
        where: { email },
        data: {
            balanceWatch: 100.00
        }
    });
    console.log(`Boosted balance for ${email} to ${user.balanceWatch}`);
    await prisma.$disconnect();
}

boost();
