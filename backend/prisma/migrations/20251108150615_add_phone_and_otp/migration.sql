/*
  Warnings:

  - The primary key for the `accounts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `baseCapital` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `nickname` on the `accounts` table. All the data in the column will be lost.
  - The `id` column on the `accounts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `indices` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `netLots` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `tradedAt` on the `trades` table. All the data in the column will be lost.
  - The primary key for the `users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `hash` on the `users` table. All the data in the column will be lost.
  - The `id` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `cash_ledger` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[symbol]` on the table `indices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `balance` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `accounts` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `userId` on the `accounts` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `indices` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `option_contracts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `accountId` on the `orders` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `netQty` to the `positions` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `accountId` on the `positions` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `accountId` to the `trades` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `orderId` on the `trades` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `phone` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_userId_fkey";

-- DropForeignKey
ALTER TABLE "cash_ledger" DROP CONSTRAINT "cash_ledger_accountId_fkey";

-- DropForeignKey
ALTER TABLE "option_contracts" DROP CONSTRAINT "option_contracts_indexSymbol_fkey";

-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_accountId_fkey";

-- DropForeignKey
ALTER TABLE "positions" DROP CONSTRAINT "positions_accountId_fkey";

-- DropForeignKey
ALTER TABLE "trades" DROP CONSTRAINT "trades_orderId_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP CONSTRAINT "accounts_pkey",
DROP COLUMN "baseCapital",
DROP COLUMN "nickname",
ADD COLUMN     "balance" DECIMAL(20,2) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "userId",
ADD COLUMN     "userId" BIGINT NOT NULL,
ADD CONSTRAINT "accounts_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "indices" DROP CONSTRAINT "indices_pkey",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD CONSTRAINT "indices_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "option_contracts" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "expiryDate" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "tickSize" DROP NOT NULL,
ALTER COLUMN "tickSize" DROP DEFAULT,
ALTER COLUMN "tickSize" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "orders" DROP CONSTRAINT "orders_pkey",
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
DROP COLUMN "accountId",
ADD COLUMN     "accountId" BIGINT NOT NULL,
ALTER COLUMN "limitPrice" SET DATA TYPE DECIMAL(20,2),
ALTER COLUMN "triggerPrice" SET DATA TYPE DECIMAL(20,2),
ALTER COLUMN "status" SET DEFAULT 'PENDING',
ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "positions" DROP COLUMN "netLots",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "netQty" INTEGER NOT NULL,
ADD COLUMN     "realizedPnL" DECIMAL(20,2) NOT NULL DEFAULT 0,
DROP COLUMN "accountId",
ADD COLUMN     "accountId" BIGINT NOT NULL,
ALTER COLUMN "avgPrice" SET DATA TYPE DECIMAL(20,2);

-- AlterTable
ALTER TABLE "trades" DROP COLUMN "tradedAt",
ADD COLUMN     "accountId" BIGINT NOT NULL,
ADD COLUMN     "executedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fees" DECIMAL(20,2) NOT NULL DEFAULT 0,
DROP COLUMN "orderId",
ADD COLUMN     "orderId" BIGINT NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(20,2);

-- AlterTable
ALTER TABLE "users" DROP CONSTRAINT "users_pkey",
DROP COLUMN "hash",
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "username" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" BIGSERIAL NOT NULL,
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "cash_ledger";

-- CreateTable
CREATE TABLE "otps" (
    "id" BIGSERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "otps_phone_idx" ON "otps"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "indices_symbol_key" ON "indices"("symbol");

-- CreateIndex
CREATE UNIQUE INDEX "positions_accountId_contractId_key" ON "positions"("accountId", "contractId");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
