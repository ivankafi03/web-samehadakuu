import prisma from "./prisma";
import bcrypt from "bcryptjs";
import { Resend } from "resend";
import { backupDatabaseToTelegram } from "./backup";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function checkAndRotateAdminPassword() {
    try {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let rotation = await prisma.adminRotation.findUnique({
            where: { id: "global" }
        });

        // If no rotation record exists or it's time for next rotation
        if (!rotation || now >= rotation.nextRotation) {
            console.log("[ADMIN-ROTATION] Starting daily password rotation...");

            // 1. Generate new random password
            const newPassword = generateRandomPassword(16);
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // 2. Find admin user
            const admin = await prisma.user.findFirst({
                where: { role: "ADMIN" }
            });

            if (!admin) {
                console.error("[ADMIN-ROTATION] No admin found!");
                return;
            }

            // 3. Update admin password
            await prisma.user.update({
                where: { id: admin.id },
                data: { password: hashedPassword }
            });

            // 4. Update rotation record
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);

            await prisma.adminRotation.upsert({
                where: { id: "global" },
                update: {
                    lastRotation: now,
                    nextRotation: tomorrow
                },
                create: {
                    id: "global",
                    lastRotation: now,
                    nextRotation: tomorrow
                }
            });

            // 5. Backup database to Telegram
            await backupDatabaseToTelegram();

            // 6. Send email
            if (process.env.RESEND_API_KEY) {
                await resend.emails.send({
                    from: 'Samehadakuu Admin <onboarding@resend.dev>',
                    to: process.env.ADMIN_EMAIL || 'ivankafipradana@gmail.com',
                    subject: '🔐 Password Admin Baru - ' + today.toLocaleDateString(),
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; color: #333;">
                            <h2>Password Admin Harian</h2>
                            <p>Halo Admin, sesuai kebijakan keamanan, password kamu telah dirotasi otomatis untuk hari ini.</p>
                            <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; font-size: 20px; font-family: monospace; font-weight: bold; text-align: center; margin: 20px 0; border: 1px dashed #ccc;">
                                ${newPassword}
                            </div>
                            <p>Silakan gunakan password di atas untuk login kembali. Sesi lama kamu mungkin telah dihentikan.</p>
                            <hr />
                            <small>Keamanan Platform Samehadakuu Automated System</small>
                        </div>
                    `
                });
                console.log(`[ADMIN-ROTATION] Email sent to ${process.env.ADMIN_EMAIL || 'ivankafipradana@gmail.com'}`);
            } else {
                console.warn("[ADMIN-ROTATION] RESEND_API_KEY not found. Password updated to: " + newPassword);
            }

            return true; // Password was rotated
        }

        return false; // No rotation needed
    } catch (error) {
        console.error("[ADMIN-ROTATION] Error during rotation:", error);
        return false;
    }
}

function generateRandomPassword(length: number) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let retVal = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}
