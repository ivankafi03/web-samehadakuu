-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global',
    "cpmRate" REAL NOT NULL DEFAULT 1.50,
    "watchRate" REAL NOT NULL DEFAULT 0.005,
    "referralRate" REAL NOT NULL DEFAULT 0.01,
    "skimRate" REAL NOT NULL DEFAULT 0.20,
    "minWithdrawal" REAL NOT NULL DEFAULT 5.00,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT NOT NULL DEFAULT 'Situs sedang dalam pemeliharaan rutin untuk meningkatkan performa.',
    "registrationBonus" REAL NOT NULL DEFAULT 0.10,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SystemSettings" ("cpmRate", "id", "maintenanceMessage", "maintenanceMode", "minWithdrawal", "referralRate", "skimRate", "updatedAt", "watchRate") SELECT "cpmRate", "id", "maintenanceMessage", "maintenanceMode", "minWithdrawal", "referralRate", "skimRate", "updatedAt", "watchRate" FROM "SystemSettings";
DROP TABLE "SystemSettings";
ALTER TABLE "new_SystemSettings" RENAME TO "SystemSettings";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "image" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "balanceWatch" REAL NOT NULL DEFAULT 0,
    "balanceReferral" REAL NOT NULL DEFAULT 0,
    "referredById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_referredById_fkey" FOREIGN KEY ("referredById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("balanceReferral", "balanceWatch", "createdAt", "email", "id", "image", "name", "password", "role", "updatedAt") SELECT "balanceReferral", "balanceWatch", "createdAt", "email", "id", "image", "name", "password", "role", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
