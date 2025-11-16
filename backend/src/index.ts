import dotenv from "dotenv";
import path from "path";
import paymentRoutes from "./routes/payment.routes";
import adminRoutes from "./routes/admin.routes";
import publicRoutes from "./routes/public.routes";
// Load environment variables FIRST
dotenv.config({ path: path.join(__dirname, "../.env.local") });

import express, { Application, Request, Response } from "express";
import cors from "cors";

// Import routes - CORRECTED IMPORTS
import authRoutes from "./routes/auth.routes";  // Phone/OTP auth
import marketRoutes from "./routes/market.routes";  // Mock market data
import paperTradingRoutes from "./routes/paper-trading.routes";  // Paper trading

const app: Application = express();

// Middleware
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/public", publicRoutes);
// Health check
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "PaperBull API - Virtual Trading Platform",
    version: "1.0.0",
    status: "operational"
  });
});

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
  });
});

// API Routes - CORRECTED
app.use("/api/auth", authRoutes);  // Phone/OTP login
app.use("/api/market", marketRoutes);  // Mock market data
app.use("/api/paper-trading", paperTradingRoutes);  // Paper trading orders/portfolio
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    availableRoutes: [
      "POST /api/auth/send-otp",
      "POST /api/auth/verify-otp",
      "POST /api/auth/register",
      "GET /api/market/option-chain",
      "GET /api/market/status",
      "POST /api/paper-trading/order",
      "GET /api/paper-trading/portfolio",
    ],
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error("Server Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: err.message,
  });
});

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("=".repeat(70));
  console.log("✅ PaperBull Backend Server Started");
  console.log("=".repeat(70));
  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`❤️  Health: http://localhost:${PORT}/health`);
  console.log("=".repeat(70));
  console.log("📱 Auth Routes:");
  console.log("   POST /api/auth/send-otp");
  console.log("   POST /api/auth/verify-otp");
  console.log("   POST /api/auth/register");
  console.log("=".repeat(70));
  console.log("📊 Market Routes:");
  console.log("   GET /api/market/option-chain");
  console.log("   GET /api/market/status");
  console.log("=".repeat(70));
  console.log("💰 Trading Routes:");
  console.log("   POST /api/paper-trading/order");
  console.log("   GET /api/paper-trading/portfolio");
  console.log("=".repeat(70));
});

export default app;
