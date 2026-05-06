const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAdmins() {
    try {
        const result = await prisma.user.updateMany({
            where: { role: 'ADMIN' },
            data: { 
                isSuspended: false, 
                isFlagged: false, 
                flagReason: null 
            }
        });
        console.log(`Berhasil memulihkan ${result.count} akun admin.`);
    } catch (err) {
        console.error('Gagal memulihkan admin:', err);
    } finally {
        await prisma.$disconnect();
    }
}

fixAdmins();
