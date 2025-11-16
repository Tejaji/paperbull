import express from 'express';

const router = express.Router();

// In-memory storage (replace with database in production)
let portfolio = {
  balance: 1000000, // ₹10 lakh starting capital
  positions: [] as any[],
  orders: [] as any[]
};

// Get portfolio
router.get('/portfolio', (req, res) => {
  try {
    const totalPnL = portfolio.positions.reduce((sum, pos) => {
      return sum + (pos.quantity * (pos.currentPrice - pos.avgPrice));
    }, 0);

    res.json({
      balance: portfolio.balance,
      positions: portfolio.positions,
      totalPnL,
      totalValue: portfolio.balance + totalPnL
    });
  } catch (error: any) {
    console.error('Portfolio error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Place order - THIS IS THE FIX
router.post('/order', (req, res) => {
  try {
    console.log('Received order:', req.body);

    const { symbol, quantity, price, side, type } = req.body;

    // Validate input
    if (!symbol || !quantity || !price || !side) {
      return res.status(400).json({ 
        error: 'Missing required fields: symbol, quantity, price, side' 
      });
    }

    // Create order object
    const order = {
      id: `ORDER_${Date.now()}`,
      symbol,
      quantity,
      price,
      side,
      type: type || 'MARKET',
      status: 'COMPLETED',
      timestamp: new Date().toISOString()
    };

    // Calculate order value
    const orderValue = quantity * price;

    // Check if user has enough balance for BUY orders
    if (side === 'BUY' && orderValue > portfolio.balance) {
      return res.status(400).json({ 
        error: 'Insufficient balance',
        required: orderValue,
        available: portfolio.balance
      });
    }

    // Update balance
    if (side === 'BUY') {
      portfolio.balance -= orderValue;
    } else if (side === 'SELL') {
      portfolio.balance += orderValue;
    }

    // Update positions
    const existingPositionIndex = portfolio.positions.findIndex(
      pos => pos.symbol === symbol
    );

    if (existingPositionIndex >= 0) {
      // Update existing position
      const pos = portfolio.positions[existingPositionIndex];
      
      if (side === 'BUY') {
        const totalQty = pos.quantity + quantity;
        pos.avgPrice = ((pos.avgPrice * pos.quantity) + (price * quantity)) / totalQty;
        pos.quantity = totalQty;
      } else if (side === 'SELL') {
        pos.quantity -= quantity;
        
        // Remove position if quantity becomes zero
        if (pos.quantity <= 0) {
          portfolio.positions.splice(existingPositionIndex, 1);
        }
      }
    } else if (side === 'BUY') {
      // Create new position
      portfolio.positions.push({
        symbol,
        quantity,
        avgPrice: price,
        currentPrice: price,
        pnl: 0
      });
    }

    // Add to orders history
    portfolio.orders.push(order);

    console.log('✅ Order placed successfully:', order);
    console.log('📊 Updated portfolio:', {
      balance: portfolio.balance,
      positions: portfolio.positions.length
    });

    res.json({
      success: true,
      order,
      portfolio: {
        balance: portfolio.balance,
        positions: portfolio.positions
      }
    });
  } catch (error: any) {
    console.error('❌ Order placement error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Get orders
router.get('/orders', (req, res) => {
  try {
    res.json({
      orders: portfolio.orders
    });
  } catch (error: any) {
    console.error('Orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get positions
router.get('/positions', (req, res) => {
  try {
    res.json({
      positions: portfolio.positions
    });
  } catch (error: any) {
    console.error('Positions error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reset portfolio (for testing)
router.post('/reset', (req, res) => {
  try {
    portfolio = {
      balance: 1000000,
      positions: [],
      orders: []
    };
    
    res.json({ 
      success: true,
      message: 'Portfolio reset to ₹10,00,000',
      portfolio 
    });
  } catch (error: any) {
    console.error('Reset error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
