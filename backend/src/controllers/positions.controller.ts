import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticateToken } from '../middleware/auth.middleware';
import { getAccountPnL } from '../services/pnl.service';

const router = Router();
const prisma = new PrismaClient();

router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { accountId } = req.query;
    
    if (!accountId) {
      return res.status(400).json({ error: 'Account ID required' });
    }

    const positions = await prisma.position.findMany({
      where: { accountId: accountId as string },
      include: { contract: true }
    });

    const formattedPositions = positions.map(pos => ({
      id: pos.id.toString(),
      tradingSymbol: pos.contract.tradingSymbol,
      optionType: pos.contract.optionType,
      strike: parseFloat(pos.contract.strike.toString()),
      netLots: pos.netLots,
      avgPrice: parseFloat(pos.avgPrice.toString()),
      lotSize: pos.contract.lotSize
    }));

    res.json(formattedPositions);
  } catch (error) {
    console.error('Fetch positions error:', error);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
});

router.get('/pnl', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { accountId } = req.query;
    
    if (!accountId) {
      return res.status(400).json({ error: 'Account ID required' });
    }

    const pnl = await getAccountPnL(accountId as string);
    
    const formatted = {
      ...pnl,
      positions: pnl.positions.map(p => ({
        ...p,
        contractId: p.contractId.toString()
      }))
    };

    res.json(formatted);
  } catch (error: any) {
    console.error('Fetch PnL error:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch P&L' });
  }
});

export default router;
