/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `accounts` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `indices` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `indices` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `option_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `tickSize` on the `option_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `option_contracts` table. All the data in the column will be lost.
  - You are about to drop the column `contractId` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `limitPrice` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `netQty` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `realizedPnL` on the `positions` table. All the data in the column will be lost.
  - You are about to drop the column `accountId` on the `trades` table. All the data in the column will be lost.
  - You are about to drop the column `executedAt` on the `trades` table. All the data in the column will be lost.
  - You are about to drop the column `fees` on the `trades` table. All the data in the column will be lost.
  - You are about to drop the column `side` on the `trades` table. All the data in the column will be lost.
  - Added the required column `tradingSymbol` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `qty` to the `positions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "orders" DROP CONSTRAINT "orders_contractId_fkey";

-- DropForeignKey
ALTER TABLE "trades" DROP CONSTRAINT "trades_accountId_fkey";

-- AlterTable
ALTER TABLE "accounts" DROP COLUMN "updatedAt",
ALTER COLUMN "balance" SET DEFAULT 100000,
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "indices" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "option_contracts" DROP COLUMN "createdAt",
DROP COLUMN "tickSize",
DROP COLUMN "updatedAt",
ALTER COLUMN "expiryDate" SET DATA TYPE TEXT,
ALTER COLUMN "strike" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "contractId",
DROP COLUMN "limitPrice",
DROP COLUMN "updatedAt",
ADD COLUMN     "avgPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "filledQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "price" DECIMAL(65,30),
ADD COLUMN     "tradingSymbol" TEXT NOT NULL,
ALTER COLUMN "triggerPrice" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "status" DROP DEFAULT;

-- AlterTable
ALTER TABLE "positions" DROP COLUMN "netQty",
DROP COLUMN "realizedPnL",
ADD COLUMN     "qty" INTEGER NOT NULL,
ALTER COLUMN "avgPrice" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "trades" DROP COLUMN "accountId",
DROP COLUMN "executedAt",
DROP COLUMN "fees",
DROP COLUMN "side",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);
