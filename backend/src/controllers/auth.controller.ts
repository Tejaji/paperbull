import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { CAPITAL } from '../config/constants';

const router = Router();
const prisma = new PrismaClient();

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        hash,
        role: 'free'
      }
    });

    const account = await prisma.account.create({
      data: {
        userId: user.id,
        nickname: 'Default',
        baseCapital: CAPITAL.free
      }
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.json({ 
      token, 
      user: { id: user.id, email: user.email, role: user.role },
      account: { id: account.id, capital: CAPITAL.free }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ 
      where: { email },
      include: { accounts: true }
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    res.json({ 
      token, 
      user: { id: user.id, email: user.email, role: user.role },
      account: user.accounts[0] ? { id: user.accounts[0].id, capital: user.accounts[0].baseCapital } : null
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
