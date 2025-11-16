import express from 'express';

const router = express.Router();

// Route 1: Option chain data (fixes your first 404 error)
router.get('/option-chain', async (req, res) => {
  try {
    const { index } = req.query;
    
    if (!index) {
      return res.status(400).json({ 
        error: 'Index parameter is required',
        message: 'Please provide an index (e.g., NIFTY, BANKNIFTY)' 
      });
    }

    console.log(`📊 Fetching option chain for: ${index}`);

    const basePrice = index === 'NIFTY' ? 19850 : 45200;
    const strikeInterval = index === 'NIFTY' ? 50 : 100;
    const numberOfStrikes = 21;
    
    const chain = [];
    const startStrike = basePrice - (Math.floor(numberOfStrikes / 2) * strikeInterval);

    for (let i = 0; i < numberOfStrikes; i++) {
      const strike = startStrike + (i * strikeInterval);
      
      chain.push({
        strike: strike,
        CE: {
          tradingSymbol: `${index}${strike}CE`,
          strike: strike,
          optionType: 'CE',
          ltp: Math.random() * 200 + 50,
          bid: Math.random() * 190 + 45,
          ask: Math.random() * 210 + 55,
          volume: Math.floor(Math.random() * 500000) + 50000,
          oi: Math.floor(Math.random() * 5000000) + 500000,
          lotSize: index === 'NIFTY' ? 50 : 25,
          changePercent: (Math.random() - 0.5) * 20
        },
        PE: {
          tradingSymbol: `${index}${strike}PE`,
          strike: strike,
          optionType: 'PE',
          ltp: Math.random() * 200 + 50,
          bid: Math.random() * 190 + 45,
          ask: Math.random() * 210 + 55,
          volume: Math.floor(Math.random() * 500000) + 50000,
          oi: Math.floor(Math.random() * 5000000) + 500000,
          lotSize: index === 'NIFTY' ? 50 : 25,
          changePercent: (Math.random() - 0.5) * 20
        }
      });
    }

    const response = {
      index: index,
      chain: chain,
      timestamp: new Date().toISOString(),
      underlyingPrice: basePrice,
      success: true
    };

    console.log(`✅ Returning ${chain.length} strikes for ${index}`);
    res.json(response);

  } catch (error) {
    console.error('❌ Error fetching option chain:', error);
    res.status(500).json({ 
      error: 'Failed to fetch option chain data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Route 2: Market status
router.get('/status', async (req, res) => {
  try {
    res.json({
      marketStatus: 'OPEN',
      currentTime: new Date().toISOString(),
      tradingHours: {
        open: '09:15',
        close: '15:30'
      }
    });
  } catch (error) {
    console.error('Error fetching market status:', error);
    res.status(500).json({ error: 'Failed to fetch market status' });
  }
});

export default router;
