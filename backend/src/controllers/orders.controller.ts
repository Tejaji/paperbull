import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticateToken } from '../middleware/auth.middleware';
import { placeOrder, cancelOrder } from '../services/order.service';

const router = Router();
const prisma = new PrismaClient();

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { accountId, tradingSymbol, side, lots, orderType, limitPrice, triggerPrice } = req.body;

    if (!accountId || !tradingSymbol || !side || !lots) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const order = await placeOrder({
      accountId,
      tradingSymbol,
      side: side.toUpperCase(),
      lots: parseInt(lots),
      orderType: orderType?.toUpperCase() || 'MARKET',
      limitPrice: limitPrice ? parseFloat(limitPrice) : undefined,
      triggerPrice: triggerPrice ? parseFloat(triggerPrice) : undefined
    });

    res.json({ 
      success: true, 
      order: {
        id: order.id,
        status: order.status,
        side: order.side,
        qty: order.qty
      }
    });
  } catch (error: any) {
    console.error('Place order error:', error);
    res.status(400).json({ error: error.message || 'Failed to place order' });
  }
});

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { accountId } = req.query;
    
    if (!accountId) {
      return res.status(400).json({ error: 'Account ID required' });
    }

    const orders = await prisma.order.findMany({
      where: { accountId: accountId as string },
      include: { 
        contract: true,
        trades: true
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const formattedOrders = orders.map(order => ({
      id: order.id,
      tradingSymbol: order.contract.tradingSymbol,
      side: order.side,
      qty: order.qty,
      orderType: order.orderType,
      status: order.status,
      limitPrice: order.limitPrice ? parseFloat(order.limitPrice.toString()) : null,
      createdAt: order.createdAt,
      fills: order.trades.map(trade => ({
        qty: trade.qty,
        price: parseFloat(trade.price.toString()),
        time: trade.tradedAt
      }))
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

router.post('/:id/cancel', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const result = await cancelOrder(req.params.id);
    res.json(result);
  } catch (error: any) {
    console.error('Cancel order error:', error);
    res.status(400).json({ error: error.message || 'Failed to cancel order' });
  }
});

export default router;
