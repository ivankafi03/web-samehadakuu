const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAndFix() {
    const user = await prisma.user.findUnique({
        where: { email: 'admin@gmail.com' }
    });
    
    console.log("DATA SEBELUM FIX:", user);

    if (user) {
        const updated = await prisma.user.update({
            where: { email: 'admin@gmail.com' },
            data: { 
                role: 'ADMIN', // Pastikan rolenya ADMIN
                isSuspended: false,
                isFlagged: false,
                flagReason: null
            }
        });
        console.log("DATA SESUDAH FIX:", updated);
    } else {
        console.log("User admin@gmail.com tidak ditemukan!");
    }
    
    await prisma.$disconnect();
}

checkAndFix();
