import { PrismaClient } from '@prisma/client';
import { getLTP } from './quote.service';
import { calculateFees, roundToTick } from '../utils/helpers';
import { broadcastPnL } from './pnl.service';

const prisma = new PrismaClient();

export interface PlaceOrderParams {
  accountId: string;
  tradingSymbol: string;
  side: 'BUY' | 'SELL';
  lots: number;
  orderType: 'MARKET' | 'LIMIT' | 'SL' | 'SLM';
  limitPrice?: number;
  triggerPrice?: number;
}

export async function placeOrder(params: PlaceOrderParams) {
  const contract = await prisma.optionContract.findUnique({
    where: { tradingSymbol: params.tradingSymbol }
  });

  if (!contract) {
    throw new Error('Contract not found');
  }

  const order = await prisma.order.create({
    data: {
      accountId: params.accountId,
      contractId: contract.id,
      side: params.side,
      qty: params.lots,
      orderType: params.orderType,
      limitPrice: params.limitPrice,
      triggerPrice: params.triggerPrice,
      status: 'OPEN'
    }
  });

  await attemptFill(order.id);
  return order;
}

export async function attemptFill(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { contract: true }
  });

  if (!order || order.status !== 'OPEN') {
    return;
  }

  const ltp = await getLTP(order.contract.tradingSymbol);
  if (!ltp) {
    return;
  }

  let fillPrice: number | null = null;

  if (order.orderType === 'MARKET') {
    fillPrice = ltp;
  } else if (order.orderType === 'LIMIT' && order.limitPrice) {
    const limit = parseFloat(order.limitPrice.toString());
    if (
      (order.side === 'BUY' && ltp <= limit) ||
      (order.side === 'SELL' && ltp >= limit)
    ) {
      fillPrice = limit;
    }
  }

  if (fillPrice) {
    await executeFill(order.id, order.qty, roundToTick(fillPrice));
  }
}

async function executeFill(orderId: string, lots: number, price: number) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { contract: true, account: true }
  });

  if (!order) return;

  const units = lots * order.contract.lotSize;
  const premium = price * units;
  const fees = calculateFees(price, units);

  await prisma.trade.create({
    data: {
      orderId: order.id,
      contractId: order.contractId,
      side: order.side,
      qty: lots,
      price
    }
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'FILLED' }
  });

  const existingPosition = await prisma.position.findUnique({
    where: {
      accountId_contractId: {
        accountId: order.accountId,
        contractId: order.contractId
      }
    }
  });

  if (existingPosition) {
    const currentNetLots = existingPosition.netLots;
    const currentAvgPrice = parseFloat(existingPosition.avgPrice.toString());
    const currentValue = currentNetLots * order.contract.lotSize * currentAvgPrice;

    const newLots = order.side === 'BUY' ? lots : -lots;
    const newNetLots = currentNetLots + newLots;

    if (newNetLots === 0) {
      await prisma.position.delete({
        where: { id: existingPosition.id }
      });

      const realizedPnL = (price - currentAvgPrice) * Math.abs(currentNetLots) * order.contract.lotSize;
      await prisma.cashLedger.create({
        data: {
          accountId: order.accountId,
          type: realizedPnL >= 0 ? 'CREDIT' : 'DEBIT',
          amount: Math.abs(realizedPnL),
          reason: 'REALIZED_PNL',
          refId: orderId
        }
      });
    } else {
      const newValue = currentValue + (newLots * order.contract.lotSize * price);
      const newAvgPrice = newValue / (newNetLots * order.contract.lotSize);

      await prisma.position.update({
        where: { id: existingPosition.id },
        data: {
          netLots: newNetLots,
          avgPrice: newAvgPrice
        }
      });
    }
  } else {
    await prisma.position.create({
      data: {
        accountId: order.accountId,
        contractId: order.contractId,
        netLots: order.side === 'BUY' ? lots : -lots,
        avgPrice: price
      }
    });
  }

  await prisma.cashLedger.create({
    data: {
      accountId: order.accountId,
      type: 'DEBIT',
      amount: fees,
      reason: 'TRADING_FEES',
      refId: orderId
    }
  });

  await prisma.cashLedger.create({
    data: {
      accountId: order.accountId,
      type: order.side === 'BUY' ? 'DEBIT' : 'CREDIT',
      amount: premium,
      reason: 'TRADE',
      refId: orderId
    }
  });

  await broadcastPnL(order.accountId);
}

export async function cancelOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order || order.status !== 'OPEN') {
    throw new Error('Cannot cancel order');
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'CANCELLED' }
  });

  return { success: true };
}
