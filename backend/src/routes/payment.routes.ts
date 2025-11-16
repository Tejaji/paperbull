import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Store verified payments (in production, use database)
const verifiedPayments = new Set<string>();

// Verify payment (manual verification for now)
router.post("/verify", async (req: Request, res: Response) => {
  try {
    const { phone, transactionId, amount } = req.body;

    console.log("Payment verification request:", { phone, transactionId, amount });

    if (!transactionId || transactionId.length < 12) {
      return res.status(400).json({ error: "Invalid transaction ID" });
    }

    // Check if already verified
    if (verifiedPayments.has(transactionId)) {
      return res.status(400).json({ error: "Transaction already verified" });
    }

    // In production: Verify with payment gateway API
    // For now: Manual verification (approve all for testing)
    
    // Mark as verified
    verifiedPayments.add(transactionId);

    // Log payment in database
    console.log(`✅ Payment verified: ${transactionId} for phone: ${phone}`);

    res.json({
      success: true,
      message: "Payment verified successfully",
      transactionId,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

// Get payment status
router.get("/status/:transactionId", async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const verified = verifiedPayments.has(transactionId);

    res.json({
      verified,
      transactionId,
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({ error: "Failed to check status" });
  }
});

export default router;
