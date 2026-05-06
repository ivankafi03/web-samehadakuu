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
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SystemSettings" ("cpmRate", "id", "minWithdrawal", "referralRate", "skimRate", "updatedAt", "watchRate") SELECT "cpmRate", "id", "minWithdrawal", "referralRate", "skimRate", "updatedAt", "watchRate" FROM "SystemSettings";
DROP TABLE "SystemSettings";
ALTER TABLE "new_SystemSettings" RENAME TO "SystemSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
