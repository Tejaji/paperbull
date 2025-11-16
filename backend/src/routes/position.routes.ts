import express from 'express';
import { upstoxService } from '../services/upstox.service';

const router = express.Router();

// Get all positions
router.get('/', async (req, res) => {
  try {
    const positions = await upstoxService.getPositions();
    res.json(positions);
  } catch (error: any) {
    res.status(500).json({ 
      error: 'Failed to fetch positions',
      message: error.message 
    });
  }
});

export default router;
