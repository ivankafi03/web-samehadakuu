-- CreateTable
CREATE TABLE "WithdrawRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "method" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WithdrawRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SystemSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'global',
    "cpmRate" REAL NOT NULL DEFAULT 1.50,
    "watchRate" REAL NOT NULL DEFAULT 0.005,
    "referralRate" REAL NOT NULL DEFAULT 0.01,
    "skimRate" REAL NOT NULL DEFAULT 0.20,
    "minWithdrawal" REAL NOT NULL DEFAULT 50.00,
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "maintenanceMessage" TEXT NOT NULL DEFAULT 'Situs sedang dalam pemeliharaan rutin untuk meningkatkan performa.',
    "registrationBonus" REAL NOT NULL DEFAULT 0.10,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SystemSettings" ("cpmRate", "id", "maintenanceMessage", "maintenanceMode", "minWithdrawal", "referralRate", "registrationBonus", "skimRate", "updatedAt", "watchRate") SELECT "cpmRate", "id", "maintenanceMessage", "maintenanceMode", "minWithdrawal", "referralRate", "registrationBonus", "skimRate", "updatedAt", "watchRate" FROM "SystemSettings";
DROP TABLE "SystemSettings";
ALTER TABLE "new_SystemSettings" RENAME TO "SystemSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
