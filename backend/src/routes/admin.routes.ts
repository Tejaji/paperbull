import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Simple admin authentication middleware
const adminAuth = (req: Request, res: Response, next: any) => {
  const adminKey = req.headers["x-admin-key"];
  
  // In production, use a secure key from environment variables
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  next();
};

// Dashboard Overview
router.get("/dashboard", adminAuth, async (req: Request, res: Response) => {
  try {
    // Total users
    const totalUsers = await prisma.user.count();
    
    // Premium vs Free users
    const premiumUsers = await prisma.user.count({
      where: { role: "premium" },
    });
    const freeUsers = await prisma.user.count({
      where: { role: "free" },
    });
    
    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });
    
    // Total capital deployed (sum of all account balances)
    const accounts = await prisma.account.findMany({
      select: { balance: true },
    });
    const totalCapital = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);
    
    // Active users (users who logged in in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    res.json({
      overview: {
        totalUsers,
        premiumUsers,
        freeUsers,
        recentUsers,
        activeUsers,
        totalCapital,
      },
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
});

// Get all users with details
router.get("/users", adminAuth, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (role && role !== "all") {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { username: { contains: String(search), mode: "insensitive" } },
        { phone: { contains: String(search) } },
        { email: { contains: String(search), mode: "insensitive" } },
      ];
    }
    
    const users = await prisma.user.findMany({
      where,
      include: {
        accounts: true,
      },
      skip,
      take: Number(limit),
      orderBy: { createdAt: "desc" },
    });
    
    const total = await prisma.user.count({ where });
    
    res.json({
      users: users.map((u) => ({
        id: u.id.toString(),
        username: u.username,
        phone: u.phone,
        email: u.email,
        role: u.role,
        balance: u.accounts[0]?.balance.toString() || "0",
        createdAt: u.createdAt,
      })),
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

// Get user details by ID
router.get("/users/:id", adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: BigInt(id) },
      include: {
        accounts: true,
      },
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      id: user.id.toString(),
      username: user.username,
      phone: user.phone,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      account: user.accounts[0]
        ? {
            id: user.accounts[0].id.toString(),
            balance: user.accounts[0].balance.toString(),
          }
        : null,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
});

// Update user role (upgrade/downgrade)
router.patch("/users/:id/role", adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!["free", "premium"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    
    const user = await prisma.user.update({
      where: { id: BigInt(id) },
      data: { role },
    });
    
    // Update account balance based on role
    const newBalance = role === "premium" ? 1000000 : 100000;
    
    await prisma.account.updateMany({
      where: { userId: BigInt(id) },
      data: { balance: newBalance },
    });
    
    res.json({
      success: true,
      message: `User upgraded to ${role}`,
      user: {
        id: user.id.toString(),
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ error: "Failed to update role" });
  }
});

// Get revenue statistics
router.get("/revenue", adminAuth, async (req: Request, res: Response) => {
  try {
    const premiumCount = await prisma.user.count({
      where: { role: "premium" },
    });
    
    const monthlyRevenue = premiumCount * 99;
    const yearlyRevenue = monthlyRevenue * 12;
    
    res.json({
      premiumSubscribers: premiumCount,
      monthlyRevenue,
      yearlyRevenue,
      pricePerUser: 99,
    });
  } catch (error) {
    console.error("Revenue error:", error);
    res.status(500).json({ error: "Failed to get revenue" });
  }
});

// Delete user (with confirmation)
router.delete("/users/:id", adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Delete user's accounts first (foreign key constraint)
    await prisma.account.deleteMany({
      where: { userId: BigInt(id) },
    });
    
    // Delete user
    await prisma.user.delete({
      where: { id: BigInt(id) },
    });
    
    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Get app statistics (growth over time)
router.get("/stats/growth", adminAuth, async (req: Request, res: Response) => {
  try {
    // Users registered per day for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const users = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        createdAt: true,
        role: true,
      },
      orderBy: { createdAt: "asc" },
    });
    
    // Group by date
    const groupedByDate: Record<string, { free: number; premium: number }> = {};
    
    users.forEach((user) => {
      const date = user.createdAt.toISOString().split("T")[0];
      if (!groupedByDate[date]) {
        groupedByDate[date] = { free: 0, premium: 0 };
      }
      groupedByDate[date][user.role as "free" | "premium"]++;
    });
    
    res.json({
      dailyGrowth: Object.entries(groupedByDate).map(([date, counts]) => ({
        date,
        free: counts.free,
        premium: counts.premium,
        total: counts.free + counts.premium,
      })),
    });
  } catch (error) {
    console.error("Growth stats error:", error);
    res.status(500).json({ error: "Failed to get growth stats" });
  }
});
// Get app settings
router.get("/settings", adminAuth, async (req: Request, res: Response) => {
  try {
    let settings = await prisma.appSettings.findFirst();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          premiumPrice: 99,
          freeCapital: 100000,
          premiumCapital: 1000000,
        },
      });
    }
    
    res.json({
      premiumPrice: settings.premiumPrice,
      freeCapital: settings.freeCapital.toString(),
      premiumCapital: settings.premiumCapital.toString(),
      updatedAt: settings.updatedAt,
    });
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ error: "Failed to get settings" });
  }
});

// Update app settings
router.patch("/settings", adminAuth, async (req: Request, res: Response) => {
  try {
    const { premiumPrice, freeCapital, premiumCapital } = req.body;
    
    // Validate inputs
    if (premiumPrice !== undefined && (premiumPrice < 0 || premiumPrice > 10000)) {
      return res.status(400).json({ error: "Premium price must be between 0 and 10000" });
    }
    
    if (freeCapital !== undefined && (freeCapital < 10000 || freeCapital > 10000000)) {
      return res.status(400).json({ error: "Free capital must be between 10,000 and 1,00,00,000" });
    }
    
    if (premiumCapital !== undefined && (premiumCapital < 10000 || premiumCapital > 100000000)) {
      return res.status(400).json({ error: "Premium capital must be between 10,000 and 10,00,00,000" });
    }
    
    // Get or create settings
    let settings = await prisma.appSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.appSettings.create({
        data: {
          premiumPrice: premiumPrice || 99,
          freeCapital: freeCapital || 100000,
          premiumCapital: premiumCapital || 1000000,
        },
      });
    } else {
      settings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: {
          ...(premiumPrice !== undefined && { premiumPrice }),
          ...(freeCapital !== undefined && { freeCapital }),
          ...(premiumCapital !== undefined && { premiumCapital }),
        },
      });
    }
    
    console.log("Settings updated:", {
      premiumPrice: settings.premiumPrice,
      freeCapital: settings.freeCapital.toString(),
      premiumCapital: settings.premiumCapital.toString(),
    });
    
    res.json({
      success: true,
      message: "Settings updated successfully",
      settings: {
        premiumPrice: settings.premiumPrice,
        freeCapital: settings.freeCapital.toString(),
        premiumCapital: settings.premiumCapital.toString(),
      },
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});
// Get all announcements
router.get("/announcements", adminAuth, async (req: Request, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: "desc" },
    });
    
    res.json({
      announcements: announcements.map((a) => ({
        id: a.id.toString(),
        title: a.title,
        message: a.message,
        targetRole: a.targetRole,
        type: a.type,
        isActive: a.isActive,
        createdAt: a.createdAt,
        expiresAt: a.expiresAt,
      })),
    });
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({ error: "Failed to get announcements" });
  }
});

// Create announcement
router.post("/announcements", adminAuth, async (req: Request, res: Response) => {
  try {
    const { title, message, targetRole, type, expiresAt } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({ error: "Title and message required" });
    }
    
    if (!["all", "premium", "free"].includes(targetRole)) {
      return res.status(400).json({ error: "Invalid target role" });
    }
    
    if (!["info", "warning", "success"].includes(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }
    
    const announcement = await prisma.announcement.create({
      data: {
        title,
        message,
        targetRole,
        type,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });
    
    console.log("Announcement created:", announcement.title);
    
    res.json({
      success: true,
      announcement: {
        id: announcement.id.toString(),
        title: announcement.title,
        message: announcement.message,
        targetRole: announcement.targetRole,
        type: announcement.type,
        isActive: announcement.isActive,
      },
    });
  } catch (error) {
    console.error("Create announcement error:", error);
    res.status(500).json({ error: "Failed to create announcement" });
  }
});

// Toggle announcement active status
router.patch("/announcements/:id/toggle", adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const announcement = await prisma.announcement.findUnique({
      where: { id: BigInt(id) },
    });
    
    if (!announcement) {
      return res.status(404).json({ error: "Announcement not found" });
    }
    
    const updated = await prisma.announcement.update({
      where: { id: BigInt(id) },
      data: { isActive: !announcement.isActive },
    });
    
    res.json({
      success: true,
      isActive: updated.isActive,
    });
  } catch (error) {
    console.error("Toggle announcement error:", error);
    res.status(500).json({ error: "Failed to toggle announcement" });
  }
});

// Delete announcement
router.delete("/announcements/:id", adminAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await prisma.announcement.delete({
      where: { id: BigInt(id) },
    });
    
    res.json({
      success: true,
      message: "Announcement deleted",
    });
  } catch (error) {
    console.error("Delete announcement error:", error);
    res.status(500).json({ error: "Failed to delete announcement" });
  }
});


export default router;
