import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const redis = new Redis(process.env.REDIS_URL!);

export interface PositionPnL {
  contractId: bigint;
  tradingSymbol: string;
  netLots: number;
  netUnits: number;
  avgPrice: number;
  ltp: number;
  mtm: number;
}

export interface AccountPnL {
  accountId: string;
  positions: PositionPnL[];
  totalMtm: number;
  realizedPnL: number;
  fees: number;
  netPnL: number;
  capitalUsed: number;
  capitalLeft: number;
}

export async function calculatePositionMTM(
  netLots: number,
  lotSize: number,
  avgPrice: number,
  ltp: number
): Promise<{ units: number; mtm: number }> {
  const units = netLots * lotSize;
  const mtm = units * (ltp - avgPrice);
  return { units, mtm };
}

export async function getAccountPnL(accountId: string): Promise<AccountPnL> {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    include: {
      positions: {
        include: {
          contract: true
        }
      }
    }
  });

  if (!account) {
    throw new Error('Account not found');
  }

  const positionPnLs: PositionPnL[] = [];
  let totalMtm = 0;

  for (const position of account.positions) {
    const ltp = await redis.get(`ltp:${position.contract.tradingSymbol}`);
    const currentLtp = ltp ? parseFloat(ltp) : parseFloat(position.avgPrice.toString());
    
    const { units, mtm } = await calculatePositionMTM(
      position.netLots,
      position.contract.lotSize,
      parseFloat(position.avgPrice.toString()),
      currentLtp
    );

    positionPnLs.push({
      contractId: position.contractId,
      tradingSymbol: position.contract.tradingSymbol,
      netLots: position.netLots,
      netUnits: units,
      avgPrice: parseFloat(position.avgPrice.toString()),
      ltp: currentLtp,
      mtm
    });

    totalMtm += mtm;
  }

  const ledgerEntries = await prisma.cashLedger.findMany({
    where: { accountId }
  });

  let realizedPnL = 0;
  let fees = 0;
  let capitalUsed = parseFloat(account.baseCapital.toString());

  ledgerEntries.forEach(entry => {
    const amount = parseFloat(entry.amount.toString());
    if (entry.type === 'CREDIT') {
      realizedPnL += amount;
    } else if (entry.type === 'DEBIT') {
      if (entry.reason?.includes('FEE')) {
        fees += amount;
      } else {
        capitalUsed -= amount;
      }
    }
  });

  const netPnL = totalMtm + realizedPnL - fees;
  const capitalLeft = capitalUsed + realizedPnL + totalMtm;

  return {
    accountId,
    positions: positionPnLs,
    totalMtm,
    realizedPnL,
    fees,
    netPnL,
    capitalUsed,
    capitalLeft
  };
}

export async function broadcastPnL(accountId: string): Promise<void> {
  const pnl = await getAccountPnL(accountId);
  await redis.publish(`pnl:${accountId}`, JSON.stringify(pnl));
}
