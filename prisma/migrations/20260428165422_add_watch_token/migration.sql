-- CreateTable
CREATE TABLE "WatchToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "issuedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedAt" DATETIME
);

-- CreateIndex
CREATE UNIQUE INDEX "WatchToken_token_key" ON "WatchToken"("token");

-- CreateIndex
CREATE INDEX "WatchToken_userId_videoId_idx" ON "WatchToken"("userId", "videoId");
