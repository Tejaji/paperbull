import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = express.Router();
const prisma = new PrismaClient();

// Get active announcements for a specific user role
router.get("/announcements", async (req: Request, res: Response) => {
  try {
    const { role } = req.query;
    
    const now = new Date();
    
    const announcements = await prisma.announcement.findMany({
      where: {
        isActive: true,
        OR: [
          { targetRole: "all" },
          { targetRole: role as string },
        ],
        AND: [
          {
            OR: [
              { expiresAt: null },
              { expiresAt: { gt: now } },
            ],
          },
        ],
      },
      orderBy: { createdAt: "desc" },
    });
    
    res.json({
      announcements: announcements.map((a) => ({
        id: a.id.toString(),
        title: a.title,
        message: a.message,
        type: a.type,
        createdAt: a.createdAt,
      })),
    });
  } catch (error) {
    console.error("Get announcements error:", error);
    res.status(500).json({ error: "Failed to get announcements" });
  }
});

export default router;
