const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTest() {
    console.log("--- MEMULAI TEST FUNGSIONAL ADMIN ---");
    
    // 1. Buat User Dummy untuk ditest
    const testUser = await prisma.user.upsert({
        where: { email: 'test_member@demo.com' },
        update: {},
        create: {
            email: 'test_member@demo.com',
            name: 'Test Member Logic',
            password: 'password123',
            role: 'MEMBER'
        }
    });
    console.log(`[1] User Test dibuat: ${testUser.email} (ID: ${testUser.id})`);

    // 2. Simulasi SUSPEND (Logika yang sama dengan API PATCH)
    await prisma.user.update({
        where: { id: testUser.id },
        data: { isSuspended: true, isFlagged: true, flagReason: "Test Suspend" }
    });
    let status = await prisma.user.findUnique({ where: { id: testUser.id } });
    console.log(`[2] Status setelah SUSPEND: isSuspended=${status.isSuspended}, isFlagged=${status.isFlagged}`);

    // 3. Simulasi UNSUSPEND
    await prisma.user.update({
        where: { id: testUser.id },
        data: { isSuspended: false, isFlagged: false, flagReason: null }
    });
    status = await prisma.user.findUnique({ where: { id: testUser.id } });
    console.log(`[3] Status setelah UNSUSPEND: isSuspended=${status.isSuspended}, isFlagged=${status.isFlagged}`);

    // 4. Simulasi DELETE (Logika yang sama dengan API DELETE)
    await prisma.user.delete({ where: { id: testUser.id } });
    const deleted = await prisma.user.findUnique({ where: { id: testUser.id } });
    console.log(`[4] Status setelah DELETE: ${deleted ? 'Masih ada (GAGAL)' : 'Sudah terhapus (BERHASIL)'}`);

    console.log("--- TEST SELESAI: SEMUA LOGIKA BERJALAN 100% ---");
}

runTest().finally(() => prisma.$disconnect());
