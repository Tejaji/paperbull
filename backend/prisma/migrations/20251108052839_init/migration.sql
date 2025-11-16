-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'free',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL DEFAULT 'Default',
    "baseCapital" DECIMAL(14,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "indices" (
    "symbol" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "lotSize" INTEGER NOT NULL,

    CONSTRAINT "indices_pkey" PRIMARY KEY ("symbol")
);

-- CreateTable
CREATE TABLE "option_contracts" (
    "id" BIGSERIAL NOT NULL,
    "indexSymbol" TEXT NOT NULL,
    "expiryDate" DATE NOT NULL,
    "strike" DECIMAL(10,2) NOT NULL,
    "optionType" TEXT NOT NULL,
    "tradingSymbol" TEXT NOT NULL,
    "tickSize" DECIMAL(8,2) NOT NULL DEFAULT 0.05,
    "lotSize" INTEGER NOT NULL,

    CONSTRAINT "option_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "contractId" BIGINT NOT NULL,
    "side" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "orderType" TEXT NOT NULL,
    "limitPrice" DECIMAL(10,2),
    "triggerPrice" DECIMAL(10,2),
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trades" (
    "id" BIGSERIAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "contractId" BIGINT NOT NULL,
    "side" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "tradedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" BIGSERIAL NOT NULL,
    "accountId" TEXT NOT NULL,
    "contractId" BIGINT NOT NULL,
    "netLots" INTEGER NOT NULL,
    "avgPrice" DECIMAL(10,2) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_ledger" (
    "id" BIGSERIAL NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "reason" TEXT,
    "refId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "option_contracts_tradingSymbol_key" ON "option_contracts"("tradingSymbol");

-- CreateIndex
CREATE UNIQUE INDEX "positions_accountId_contractId_key" ON "positions"("accountId", "contractId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "option_contracts" ADD CONSTRAINT "option_contracts_indexSymbol_fkey" FOREIGN KEY ("indexSymbol") REFERENCES "indices"("symbol") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "option_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trades" ADD CONSTRAINT "trades_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "option_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "option_contracts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_ledger" ADD CONSTRAINT "cash_ledger_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
