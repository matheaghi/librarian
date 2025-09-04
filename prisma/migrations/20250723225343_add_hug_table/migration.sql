-- CreateTable
CREATE TABLE "Hug" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "hugs" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL
);
