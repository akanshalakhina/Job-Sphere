import { Router, type IRouter } from "express";
import { Notification } from "../models/Notification";

const router: IRouter = Router();

// Get notifications for a user based on role and ID
router.get("/notifications", async (req, res) => {
  try {
    const { role, userId } = req.query;
    
    // We want notifications that either match the user directly OR are global for their role / All
    const query = {
      $or: [
        { recipientId: userId },
        { recipientId: { $exists: false }, targetRole: { $in: [role, "All"] } },
        { recipientId: null, targetRole: { $in: [role, "All"] } },
      ],
    };

    const notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark notification as read
router.patch("/notifications/:id/read", async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!notification) {
      res.status(404).json({ error: "Notification not found" });
      return;
    }
    res.json(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    res.status(500).json({ error: "Failed to update notification" });
  }
});

export default router;
