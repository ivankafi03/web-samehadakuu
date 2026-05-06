import fs from 'fs';
import path from 'path';
import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function backupDatabaseToTelegram() {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.warn("[BACKUP] Telegram Bot Token or Chat ID not found. Skipping backup.");
        return;
    }

    try {
        const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
        
        if (!fs.existsSync(dbPath)) {
            console.error("[BACKUP] Database file not found at: " + dbPath);
            return;
        }

        const stats = fs.statSync(dbPath);
        const fileSizeMB = stats.size / (1024 * 1024);

        console.log(`[BACKUP] Starting backup of dev.db (${fileSizeMB.toFixed(2)} MB)...`);

        const formData = new FormData();
        const fileBuffer = fs.readFileSync(dbPath);
        const blob = new Blob([fileBuffer]);
        
        formData.append('chat_id', TELEGRAM_CHAT_ID);
        formData.append('document', blob, `backup_anime_${new Date().toISOString().split('T')[0]}.db`);
        formData.append('caption', `📦 *Database Backup Automated*\n\n📅 Date: ${new Date().toLocaleString()}\n📂 File: dev.db\n⚖️ Size: ${fileSizeMB.toFixed(2)} MB\n✅ Status: Success`);

        const response = await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendDocument`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        if (response.data.ok) {
            console.log("[BACKUP] Backup successfully sent to Telegram!");
            return true;
        } else {
            console.error("[BACKUP] Telegram API Error:", response.data);
            return false;
        }
    } catch (error) {
        console.error("[BACKUP] Failed to backup to Telegram:", error);
        return false;
    }
}
