const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixRoles() {
    // 1. Kembalikan admin@gmail.com jadi MEMBER tapi UNSUSPEND
    await prisma.user.update({
        where: { email: 'admin@gmail.com' },
        data: { 
            role: 'MEMBER',
            isSuspended: false,
            isFlagged: false,
            flagReason: null
        }
    });
    console.log("admin@gmail.com dikembalikan ke MEMBER (Bebas).");

    // 2. Pastikan ivankafipradana@gmail.com adalah ADMIN dan BEBAS
    await prisma.user.update({
        where: { email: 'ivankafipradana@gmail.com' },
        data: { 
            role: 'ADMIN',
            isSuspended: false,
            isFlagged: false,
            flagReason: null
        }
    });
    console.log("ivankafipradana@gmail.com dipastikan sebagai ADMIN (Bebas).");
    
    await prisma.$disconnect();
}

fixRoles();
