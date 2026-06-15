import { Router, type Request } from "express";
import { getRequestUserId, requireDbRole } from "../middlewares/requireAuth";
import { isEnvAdminUserId } from "../lib/envAdmin";
import { Job } from "../models/Job";
import { User } from "../models/User";
import { Application } from "../models/Application";
import { Post } from "../models/Post";
import { isDBConnected } from "../lib/mongodb";

const router = Router();
const adminOnly = requireDbRole("admin");

const isEnvAdminRequest = (req: Request): boolean =>
  isEnvAdminUserId(getRequestUserId(req));

router.get("/admin/pending-jobs", adminOnly, async (req, res) => {
  if (isEnvAdminRequest(req)) {
    res.json([]);
    return;
  }
  if (!isDBConnected()) {
    res.json([]);
    return;
  }
  try {
    const jobs = await Job.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pending jobs" });
  }
});

router.post("/admin/jobs/:id/approve", adminOnly, async (req, res) => {
  if (!isDBConnected()) {
    res.status(503).json({ error: "Database not connected" });
    return;
  }
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "approved" } },
      { new: true }
    );
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to approve job" });
  }
});

router.post("/admin/jobs/:id/reject", adminOnly, async (req, res) => {
  if (!isDBConnected()) {
    res.status(503).json({ error: "Database not connected" });
    return;
  }
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: { status: "rejected" } },
      { new: true }
    );
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to reject job" });
  }
});

router.get("/admin/stats", adminOnly, async (req, res) => {
  if (isEnvAdminRequest(req)) {
    res.json({
      totalUsers: 0,
      totalJobs: 0,
      totalApplications: 0,
      totalPosts: 0,
      pendingJobs: 0,
    });
    return;
  }
  if (!isDBConnected()) {
    res.json({
      totalUsers: 0,
      totalJobs: 0,
      totalApplications: 0,
      totalPosts: 0,
      pendingJobs: 0,
    });
    return;
  }
  try {
    const [totalUsers, totalJobs, totalApplications, totalPosts, pendingJobs] =
      await Promise.all([
        User.countDocuments(),
        Job.countDocuments({ status: "approved" }),
        Application.countDocuments(),
        Post.countDocuments(),
        Job.countDocuments({ status: "pending" }),
      ]);
    res.json({ totalUsers, totalJobs, totalApplications, totalPosts, pendingJobs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

router.get("/admin/companies", adminOnly, async (req, res) => {
  if (isEnvAdminRequest(req)) {
    res.json({ companies: [] });
    return;
  }
  if (!isDBConnected()) {
    res.json([]);
    return;
  }
  try {
    const companies = await User.distinct("company", {
      role: "recruiter",
      company: { $ne: "" },
    });
    const verified = await User.find({ isVerified: true }).distinct("company");
    res.json({
      companies: companies.map((c: string) => ({
        name: c,
        verified: verified.includes(c),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch companies" });
  }
});

router.patch("/admin/companies/verify", adminOnly, async (req, res) => {
  if (!isDBConnected()) {
    res.status(503).json({ error: "Database not connected" });
    return;
  }
  const { company, verified } = req.body;
  try {
    await User.updateMany(
      { company, role: "recruiter" },
      { $set: { isVerified: verified } }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to update company verification" });
  }
});

export default router;
