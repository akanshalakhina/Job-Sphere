import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ENV_ADMIN_USER_ID, getEnvAdminProfile, isEnvAdminLogin } from "../lib/envAdmin";
import { User } from "../models/User";
import { JWT_SECRET } from "../middlewares/requireAuth";

const router = Router();

const sanitizeUser = (user: any) => {
  const userJson = typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete userJson.password;
  return userJson;
};

// POST /api/auth/signup
router.post("/auth/signup", async (req: Request, res: Response): Promise<void> => {
  const { email, password, role, name, ...rest } = req.body;
  if (!email || !password || !role) {
    res.status(400).json({ error: "Email, password, and role are required" });
    return;
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ error: "A user with this email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Parse technical and soft skills into arrays if provided as strings
    let technicalSkills: string[] = [];
    if (rest.skills) {
      technicalSkills = typeof rest.skills === "string" 
        ? rest.skills.split(",").map((s: string) => s.trim()).filter(Boolean) 
        : rest.skills;
    }

    let softSkillsList: string[] = [];
    if (rest.softSkills) {
      softSkillsList = typeof rest.softSkills === "string"
        ? rest.softSkills.split(",").map((s: string) => s.trim()).filter(Boolean)
        : rest.softSkills;
    }

    // Map resume input to resumeUrl in User schema
    const resumeUrl = rest.resume || rest.resumeUrl || "";

    const user = new User({
      email,
      password: hashedPassword,
      role,
      name: name || "Anonymous User",
      onboarded: true,
      skills: technicalSkills,
      softSkills: softSkillsList,
      resumeUrl,
      // Pass other fields
      graduationYear: rest.graduationYear || "",
      college: rest.college || "",
      degree: rest.degree || "",
      avatar: rest.avatar || "",
      companyName: rest.companyName || "",
      industry: rest.industry || "",
      companySize: rest.companySize || "",
      logo: rest.logo || "",
      website: rest.website || "",
      description: rest.description || "",
    });

    user.clerkId = user._id.toString();
    await user.save();

    const token = jwt.sign({ userId: user.clerkId, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Failed to sign up" });
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email/username and password are required" });
    return;
  }

  try {
    if (isEnvAdminLogin(email, password)) {
      const token = jwt.sign({ userId: ENV_ADMIN_USER_ID, role: "admin" }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token, user: getEnvAdminProfile() });
      return;
    }

    const user = await User.findOne({ email });
    if (!user || !user.password) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Ensure clerkId matches standard _id format
    if (!user.clerkId) {
      user.clerkId = user._id.toString();
      await user.save();
    }

    const token = jwt.sign({ userId: user.clerkId, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Failed to log in" });
  }
});

export default router;
