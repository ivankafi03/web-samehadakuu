-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "balanceWatch" REAL NOT NULL DEFAULT 0,
    "balanceReferral" REAL NOT NULL DEFAULT 0,
    "registrationIp" TEXT,
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "isSuspended" BOOLEAN NOT NULL DEFAULT false,
    "referredById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("balanceReferral", "balanceWatch", "createdAt", "email", "flagReason", "id", "image", "isFlagged", "name", "password", "referredById", "registrationIp", "role", "updatedAt") SELECT "balanceReferral", "balanceWatch", "createdAt", "email", "flagReason", "id", "image", "isFlagged", "name", "password", "referredById", "registrationIp", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
