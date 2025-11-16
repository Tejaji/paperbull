import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const router = express.Router();
const prisma = new PrismaClient();

// Store OTPs in memory (in production, use Redis)
const otpStore = new Map<string, { otp: string; expiresAt: Date }>();

// Send OTP
router.post("/send-otp", async (req: Request, res: Response) => {
  try {
    const { phone } = req.body;

    console.log("Send OTP request for:", phone);

    if (!phone || phone.length !== 10) {
      return res.status(400).json({ error: "Invalid phone number" });
    }

    const user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      console.log("User not found, needs registration");
      return res.status(404).json({ 
        error: "User not found",
        needsRegistration: true 
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    otpStore.set(phone, { otp, expiresAt });

    console.log(`🔐 OTP for ${phone}: ${otp}`);

    res.json({ 
      success: true, 
      message: "OTP sent successfully",
      otp: process.env.NODE_ENV === "development" ? otp : undefined
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Verify OTP and Login
router.post("/verify-otp", async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    console.log("Verify OTP request:", { phone, otp });

    const storedOTP = otpStore.get(phone);
    
    if (!storedOTP) {
      console.log("OTP not found for phone:", phone);
      return res.status(400).json({ error: "OTP expired or not found. Please request a new OTP." });
    }

    if (storedOTP.expiresAt < new Date()) {
      console.log("OTP expired for phone:", phone);
      otpStore.delete(phone);
      return res.status(400).json({ error: "OTP expired. Please request a new OTP." });
    }

    if (storedOTP.otp !== otp) {
      console.log("Invalid OTP. Expected:", storedOTP.otp, "Got:", otp);
      return res.status(400).json({ error: "Invalid OTP" });
    }

    console.log("OTP verified successfully");

    otpStore.delete(phone);

    const user = await prisma.user.findUnique({
      where: { phone },
      include: { accounts: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const token = jwt.sign(
      { userId: user.id.toString() },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "7d" }
    );

    console.log("Login successful for user:", user.username);

    res.json({
      token,
      user: {
        id: user.id.toString(),
        phone: user.phone,
        username: user.username,
        role: user.role,
      },
      account: user.accounts[0]
        ? {
            id: user.accounts[0].id.toString(),
            balance: user.accounts[0].balance.toString(),
          }
        : null,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// Register new user
// Register new user
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { phone, username, role } = req.body;

    console.log("Register request:", { phone, username, role });

    if (!phone || !username) {
      return res.status(400).json({ error: "Phone and name required" });
    }

    const existing = await prisma.user.findUnique({ where: { phone } });
    if (existing) {
      return res.status(400).json({ error: "User already registered" });
    }

    // Get settings for initial capital
    let settings = await prisma.appSettings.findFirst();
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          premiumPrice: 99,
          freeCapital: 100000,
          premiumCapital: 1000000,
        },
      });
    }

    const initialCapital = role === "premium" 
      ? Number(settings.premiumCapital) 
      : Number(settings.freeCapital);

    const user = await prisma.user.create({
      data: {
        phone,
        username,
        email: `${phone}@paperbull.com`,
        role: role || "free",
      },
    });

    await prisma.account.create({
      data: {
        userId: user.id,
        balance: initialCapital,
      },
    });

    console.log("User registered successfully:", username);

    res.json({
      success: true,
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});


export default router;  // ← MAKE SURE THIS LINE IS AT THE END
