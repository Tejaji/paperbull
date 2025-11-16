import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest, authenticateToken } from '../middleware/auth.middleware';
import { getQuote } from '../services/quote.service';

const router = Router();
const prisma = new PrismaClient();

router.get('/indices', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const indices = await prisma.index.findMany({
      orderBy: { symbol: 'asc' }
    });
    res.json(indices);
  } catch (error) {
    console.error('Fetch indices error:', error);
    res.status(500).json({ error: 'Failed to fetch indices' });
  }
});

router.get('/option-chain', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { index, expiry } = req.query;

    if (!index) {
      return res.status(400).json({ error: 'Index required' });
    }

    let query: any = {
      indexSymbol: index as string
    };

    if (expiry) {
      query.expiryDate = new Date(expiry as string);
    }

    const contracts = await prisma.optionContract.findMany({
      where: query,
      orderBy: [
        { expiryDate: 'asc' },
        { strike: 'asc' }
      ],
      take: 100
    });

    if (contracts.length === 0) {
      return res.json({ chain: [], message: 'No contracts found. Please run seed script.' });
    }

    const enriched = await Promise.all(
      contracts.map(async (contract) => {
        const quote = await getQuote(contract.tradingSymbol);
        return {
          id: contract.id.toString(),
          tradingSymbol: contract.tradingSymbol,
          strike: parseFloat(contract.strike.toString()),
          optionType: contract.optionType,
          expiryDate: contract.expiryDate,
          lotSize: contract.lotSize,
          ltp: quote?.ltp || 0,
          bid: quote?.bid || 0,
          ask: quote?.ask || 0,
          volume: quote?.volume || 0,
          oi: quote?.oi || 0
        };
      })
    );

    const grouped: any = {};
    enriched.forEach((contract) => {
      const strike = contract.strike.toString();
      if (!grouped[strike]) {
        grouped[strike] = { strike: contract.strike };
      }
      grouped[strike][contract.optionType] = contract;
    });

    res.json({
      chain: Object.values(grouped),
      expiry: contracts[0]?.expiryDate || null
    });
  } catch (error) {
    console.error('Fetch option chain error:', error);
    res.status(500).json({ error: 'Failed to fetch option chain' });
  }
});

export default router;
