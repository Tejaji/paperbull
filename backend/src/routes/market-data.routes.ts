import express from 'express';
import { upstoxService } from '../services/upstox.service';

const router = express.Router();

router.get('/quote', async (req, res) => {
  try {
    const { symbols } = req.query;
    
    if (!symbols || typeof symbols !== 'string') {
      return res.status(400).json({ 
        error: 'symbols parameter required',
        example: '/api/market-data/quote?symbols=NSE_EQ|INE002A01018'
      });
    }

    const symbolArray = symbols.split(',');
    const data = await upstoxService.getMarketQuote(symbolArray);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ 
      error: error.message,
      hint: error.message.includes('Not authenticated') 
        ? 'Visit /auth/upstox/login to authenticate' 
        : undefined
    });
  }
});

router.get('/ltp', async (req, res) => {
  try {
    const { symbols } = req.query;
    
    if (!symbols || typeof symbols !== 'string') {
      return res.status(400).json({ 
        error: 'symbols parameter required',
        example: '/api/market-data/ltp?symbols=NSE_EQ|INE002A01018,NSE_EQ|INE467B01029'
      });
    }

    const symbolArray = symbols.split(',');
    const data = await upstoxService.getLTP(symbolArray);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/option-chain', async (req, res) => {
  try {
    const { instrument_key, expiry_date } = req.query;
    
    if (!instrument_key || !expiry_date) {
      return res.status(400).json({ 
        error: 'instrument_key and expiry_date required',
        example: '/api/market-data/option-chain?instrument_key=NSE_INDEX|Nifty%2050&expiry_date=2025-11-28'
      });
    }

    const data = await upstoxService.getOptionChain(
      instrument_key as string,
      expiry_date as string
    );
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/historical', async (req, res) => {
  try {
    const { instrument_key, interval, from, to } = req.query;
    
    if (!instrument_key || !interval || !from || !to) {
      return res.status(400).json({ 
        error: 'All parameters required',
        example: '/api/market-data/historical?instrument_key=NSE_EQ|INE002A01018&interval=1day&from=2025-11-01&to=2025-11-15'
      });
    }

    const data = await upstoxService.getHistoricalData(
      instrument_key as string,
      interval as string,
      to as string,
      from as string
    );
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
