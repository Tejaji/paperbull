-- CreateTable
CREATE TABLE "AppSettings" (
    "id" BIGSERIAL NOT NULL,
    "premiumPrice" INTEGER NOT NULL DEFAULT 99,
    "freeCapital" DECIMAL(65,30) NOT NULL DEFAULT 100000,
    "premiumCapital" DECIMAL(65,30) NOT NULL DEFAULT 1000000,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);
