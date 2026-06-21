import { Router, type IRouter } from "express";
import { Offer } from "../models/Offer";

const router: IRouter = Router();

// Get active promotional offers
router.get("/offers/active", async (req, res) => {
  try {
    const now = new Date();
    // Find offers that are active and not expired
    const activeOffers = await Offer.find({
      isActive: true,
      expiresAt: { $gt: now },
    }).sort({ createdAt: -1 });

    res.json(activeOffers);
  } catch (error) {
    console.error("Error fetching active offers:", error);
    res.status(500).json({ error: "Failed to fetch offers" });
  }
});

export default router;
