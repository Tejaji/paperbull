import express from 'express';
import { upstoxService } from '../services/upstox.service';

const router = express.Router();

// Place a new order
router.post('/place', async (req, res) => {
  try {
    const orderData = req.body;
    const result = await upstoxService.placeOrder(orderData);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to place order',
      message: error.message 
    });
  }
});

// Get all orders
router.get('/', async (req, res) => {
  try {
    const orders = await upstoxService.getOrders();
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to fetch orders',
      message: error.message 
    });
  }
});

export default router;
