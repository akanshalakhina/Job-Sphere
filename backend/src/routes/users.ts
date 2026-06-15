import { Router } from "express";
import { requireAuth, getRequestUserId } from "../middlewares/requireAuth";
import { User } from "../models/User";
import { Application } from "../models/Application";
import { isDBConnected } from "../lib/mongodb";
import { getMemUser, syncMemUser, updateMemUser, getMemUserStats, clearMemUser } from "../lib/memoryDb";
import { getEnvAdminProfile, isEnvAdminUserId } from "../lib/envAdmin";

const router = Router();

router.post("/users/sync", requireAuth, async (req, res) => {
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (isEnvAdminUserId(userId)) {
    res.json(getEnvAdminProfile());
    return;
  }

  if (!isDBConnected()) {
    const memUser = syncMemUser(userId, req.body);
    res.json(memUser);
    return;
  }
  const { name, email, avatar, role } = req.body;

  // Role is only set on first insert and is restricted to candidate/recruiter.
  // Admin role must be assigned by an existing admin — never by self.
  // Once a role is set, it cannot be changed (Requirement 2).
  const allowedRoles = ["candidate", "recruiter"];
  const safeRole = allowedRoles.includes(role) ? role : "candidate";

  try {
    const existing = await User.findOne({ clerkId: userId });
    if (existing && existing.role) {
      // Role already set — prevent changes; keep existing role
      const user = await User.findOneAndUpdate(
        { clerkId: userId },
        {
          $set: {
            ...(name && { name }),
            ...(email && { email }),
            ...(avatar && { avatar }),
          },
        },
        { new: true }
      );
      res.json(user);
    } else {
      const user = await User.findOneAndUpdate(
        { clerkId: userId },
        {
          $setOnInsert: { clerkId: userId, role: safeRole },
          $set: {
            ...(name && { name }),
            ...(email && { email }),
            ...(avatar && { avatar }),
          },
        },
        { upsert: true, new: true }
      );
      res.json(user);
    }
  } catch (err) {
    res.status(500).json({ error: "Failed to sync user" });
  }
});

router.get("/users/me", requireAuth, async (req, res) => {
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (isEnvAdminUserId(userId)) {
    res.json(getEnvAdminProfile());
    return;
  }

  if (!isDBConnected()) {
    const memUser = getMemUser(userId);
    if (!memUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(memUser);
    return;
  }
  try {
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.get("/users/public/:clerkId", async (req, res) => {
  const { clerkId } = req.params;
  const shouldIncrement = req.query.increment !== "false";

  if (!isDBConnected()) {
    const memUser = getMemUser(clerkId);
    if (!memUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (shouldIncrement) {
      memUser.profileViews = (memUser.profileViews || 0) + 1;
    }
    const { password: _password, ...publicUser } = memUser;
    res.json(publicUser);
    return;
  }

  try {
    const update = shouldIncrement ? { $inc: { profileViews: 1 } } : {};
    const user = await User.findOneAndUpdate({ clerkId }, update, { new: true })
      .select("-password")
      .lean();
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch public profile" });
  }
});

router.patch("/users/me", requireAuth, async (req, res) => {
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!isDBConnected()) {
    const memUser = updateMemUser(userId, req.body);
    if (!memUser) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(memUser);
    return;
  }
  const allowed = [
    "name", "title", "bio", "skills", "softSkills", "experience",
    "company", "avatar", "subscriptionTier",
    "graduationYear", "college", "degree", "companyName",
    "industry", "companySize", "logo", "website",
    "description", "onboarded", "resume", "resumeUrl"
  ];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) update[key] = req.body[key];
  }

  // Special field mappings:
  // 1. skills (string or array)
  if (req.body.skills !== undefined) {
    if (typeof req.body.skills === "string") {
      update.skills = req.body.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
    } else if (Array.isArray(req.body.skills)) {
      update.skills = req.body.skills;
    }
  }

  // 1.5. softSkills (string or array)
  if (req.body.softSkills !== undefined) {
    if (typeof req.body.softSkills === "string") {
      update.softSkills = req.body.softSkills.split(",").map((s: string) => s.trim()).filter(Boolean);
    } else if (Array.isArray(req.body.softSkills)) {
      update.softSkills = req.body.softSkills;
    }
  }

  // 2. resume -> resumeUrl
  if (req.body.resume !== undefined) {
    update.resumeUrl = req.body.resume;
  }

  // 3. companyName -> company (as well as companyName)
  if (req.body.companyName !== undefined) {
    update.companyName = req.body.companyName;
    update.company = req.body.companyName;
  }

  // 4. description -> bio (as well as description)
  if (req.body.description !== undefined) {
    update.description = req.body.description;
    update.bio = req.body.description;
  }

  try {
    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      { $set: update },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

router.get("/users/stats", requireAuth, async (req, res) => {
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (isEnvAdminUserId(userId)) {
    res.json({
      applied: 0,
      saved: 0,
      atsScore: 0,
      interviews: 0,
      profileViews: 0,
      postImpressions: 0,
    });
    return;
  }

  if (!isDBConnected()) {
    const stats = getMemUserStats(userId);
    res.json(stats);
    return;
  }
  try {
    const user = await User.findOne({ clerkId: userId });
    const applicationCount = await Application.countDocuments({
      candidateClerkId: userId,
    });
    const interviewCount = await Application.countDocuments({
      candidateClerkId: userId,
      stage: "Interview",
    });
    res.json({
      applied: applicationCount,
      saved: user?.savedJobs?.length ?? 0,
      atsScore: user?.atsScore ?? 0,
      interviews: interviewCount,
      profileViews: user?.profileViews ?? 0,
      postImpressions: user?.postImpressions ?? 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.post("/users/upload", requireAuth, async (req, res) => {
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { fileType, fileData } = req.body;
  if (!fileType || !fileData) {
    res.status(400).json({ error: "fileType and fileData are required" });
    return;
  }

  const allowedTypes = ["avatar", "logo", "resume"];
  if (!allowedTypes.includes(fileType)) {
    res.status(400).json({ error: "Invalid file type" });
    return;
  }

  const filePath = `/uploads/${userId}/${fileType}_${Date.now()}`;
  const updateField = fileType === "resume" ? "resumeUrl" : fileType;

  if (isDBConnected()) {
    try {
      await User.findOneAndUpdate(
        { clerkId: userId },
        { $set: { [updateField]: fileData } },
        { new: true }
      );
    } catch (err) {
      res.status(500).json({ error: "Failed to save file" });
      return;
    }
  }

  res.json({ url: fileData, path: filePath });
});

router.delete("/test/reset-user/:userId", async (req, res) => {
  const { userId } = req.params;
  clearMemUser(userId);
  if (isDBConnected()) {
    try {
      await User.deleteOne({ clerkId: userId });
      await Application.deleteMany({ candidateClerkId: userId });
    } catch (err) {
      console.error("Failed to delete user in test reset endpoint:", err);
    }
  }
  res.sendStatus(200);
});

export default router;
