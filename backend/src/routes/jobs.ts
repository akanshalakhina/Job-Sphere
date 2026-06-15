import { Router } from "express";
import { requireAuth, requireDbRole, getRequestUserId } from "../middlewares/requireAuth";
import { Job } from "../models/Job";
import { User } from "../models/User";
import { isDBConnected } from "../lib/mongodb";
import {
  getMemJobs,
  getMemJobById,
  createMemJob,
  updateMemJob,
  deleteMemJob,
  toggleSaveJob,
  getSavedJobStatus,
  getMemUser,
} from "../lib/memoryDb";

const router = Router();
const paramToString = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

router.get("/jobs", async (req, res) => {
  if (!isDBConnected()) {
    const jobs = getMemJobs(req.query);
    res.json(jobs);
    return;
  }
  const { search, department, workplace, experience, location, minSalary, sort } = req.query;
  const filter: Record<string, unknown> = { status: "approved" };

  if (search) {
    const re = new RegExp(String(search), "i");
    filter.$or = [{ title: re }, { company: re }, { skills: re }];
  }
  if (department && department !== "All Departments") {
    filter.department = department;
  }
  if (workplace && workplace !== "All Types") {
    filter.workplace = workplace;
  }
  if (experience && experience !== "Any Experience") {
    filter.experience = experience;
  }
  if (location && location !== "Any Location") {
    filter.location = new RegExp(String(location), "i");
  }
  
  let sortOpt: Record<string, 1 | -1> = { createdAt: -1 };
  if (sort === "oldest") sortOpt = { createdAt: 1 };
  if (sort === "applicants") sortOpt = { applicants: -1 };
  if (sort === "salary") sortOpt = { salaryNum: -1 }; // Assumes we sort by a numeric salary field if we had one. For now keeping it simple.

  try {
    const jobs = await Job.find(filter).sort(sortOpt).limit(50);
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

router.get("/jobs/:id", async (req, res) => {
  const jobId = paramToString(req.params.id);
  if (!isDBConnected()) {
    const job = getMemJobById(jobId);
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    res.json(job);
    return;
  }
  try {
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch job" });
  }
});

router.post("/jobs", requireAuth, async (req, res) => {
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!isDBConnected()) {
    const memUser = getMemUser(userId);
    if (!memUser || (memUser.role !== "recruiter" && memUser.role !== "admin")) {
      res.status(403).json({ error: "Only recruiters can post jobs" });
      return;
    }
    const job = createMemJob(req.body, userId, memUser);
    res.status(201).json(job);
    return;
  }

  const recruiterUser = await User.findOne({ clerkId: userId });
  if (!recruiterUser || (recruiterUser.role !== "recruiter" && recruiterUser.role !== "admin")) {
    res.status(403).json({ error: "Only recruiters can post jobs" });
    return;
  }
  try {
    const job = await Job.create({
      ...req.body,
      status: "pending",
      postedBy: recruiterUser._id,
      recruiter: {
        name: recruiterUser.name || req.body.recruiterName || "",
        role: recruiterUser.title || req.body.recruiterRole || "",
        avatar: recruiterUser.avatar || "",
        clerkId: userId,
      },
      postedTime: "Just now",
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to create job" });
  }
});

router.patch("/jobs/:id", requireAuth, async (req, res) => {
  const jobId = paramToString(req.params.id);
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!isDBConnected()) {
    const memUser = getMemUser(userId);
    const isAdmin = memUser?.role === "admin";
    const job = updateMemJob(jobId, userId, req.body, isAdmin);
    if (!job) {
      res.status(403).json({ error: "Forbidden or Job not found" });
      return;
    }
    res.json(job);
    return;
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    const user = await User.findOne({ clerkId: userId }).select("role");
    const isOwner = job.recruiter?.clerkId === userId;
    const isAdmin = user?.role === "admin";
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: "Forbidden: not the job owner" });
      return;
    }

    // Allowlist mutable fields — owners cannot touch status, postedBy, or recruiter identity
    const ownerAllowed = [
      "title", "description", "location", "salary", "skills",
      "department", "workplace", "experience", "benefits", "requirements",
    ];
    const adminAllowed = [...ownerAllowed, "status"];
    const allowedFields = isAdmin ? adminAllowed : ownerAllowed;

    const update: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }

    const updated = await Job.findByIdAndUpdate(
      jobId,
      { $set: update },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update job" });
  }
});

router.delete("/jobs/:id", requireAuth, async (req, res) => {
  const jobId = paramToString(req.params.id);
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!isDBConnected()) {
    const memUser = getMemUser(userId);
    const isAdmin = memUser?.role === "admin";
    const success = deleteMemJob(jobId, userId, isAdmin);
    if (!success) {
      res.status(403).json({ error: "Forbidden or Job not found" });
      return;
    }
    res.json({ success: true });
    return;
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    const user = await User.findOne({ clerkId: userId }).select("role");
    const isOwner = job.recruiter?.clerkId === userId;
    const isAdmin = user?.role === "admin";
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: "Forbidden: not the job owner" });
      return;
    }
    await Job.findByIdAndDelete(jobId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete job" });
  }
});

router.post("/jobs/:id/save", requireAuth, async (req, res) => {
  const jobId = paramToString(req.params.id);
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!isDBConnected()) {
    const result = toggleSaveJob(userId, jobId);
    if (!result) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(result);
    return;
  }

  try {
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const jobObjectId = jobId as unknown;
    const isSaved = user.savedJobs.includes(jobObjectId as never);
    if (isSaved) {
      user.savedJobs = user.savedJobs.filter(
        (jid: any) => jid.toString() !== jobId
      ) as never;
    } else {
      user.savedJobs.push(jobId as never);
    }
    await user.save();
    res.json({ saved: !isSaved, savedJobs: user.savedJobs });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle save" });
  }
});

router.get("/jobs/:id/saved-status", requireAuth, async (req, res) => {
  const jobId = paramToString(req.params.id);
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!isDBConnected()) {
    const status = getSavedJobStatus(userId, jobId);
    res.json(status);
    return;
  }

  try {
    const user = await User.findOne({ clerkId: userId });
    const saved = user?.savedJobs?.some(
      (jid: any) => jid.toString() === jobId
    ) ?? false;
    res.json({ saved });
  } catch (err) {
    res.json({ saved: false });
  }
});

export default router;
