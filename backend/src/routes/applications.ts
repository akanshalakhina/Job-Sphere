import { Router } from "express";
import multer from "multer";
import { requireAuth, getRequestUserId } from "../middlewares/requireAuth";
import { Application } from "../models/Application";
import { Job } from "../models/Job";
import { User } from "../models/User";
import { isEnvAdminUserId } from "../lib/envAdmin";
import { isDBConnected } from "../lib/mongodb";
import {
  createMemApplication,
  getMemApplicationsMy,
  checkMemApplication,
  getMemApplicationsByJob,
  getMemApplicationsCandidates,
  updateMemApplicationStage,
  getMemUser,
} from "../lib/memoryDb";

const router = Router();
const upload = multer({ 
  storage: multer.memoryStorage(), 
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are allowed"));
    }
  },
});
const paramToString = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

router.post("/applications", requireAuth, upload.single("resume"), async (req, res) => {
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (isEnvAdminUserId(userId)) {
    res.status(403).json({ error: "Admin accounts cannot apply to jobs" });
    return;
  }

  if (!isDBConnected()) {
    const result = createMemApplication(userId, req.body);
    if (result.error) {
      res.status(result.status || 500).json({ error: result.error });
      return;
    }
    res.status(result.status || 201).json(result.data);
    return;
  }
  const { jobId, coverLetter } = req.body;

  try {
    const [user, job] = await Promise.all([
      User.findOne({ clerkId: userId }),
      Job.findById(jobId),
    ]);

    if (!user || !job) {
      res.status(404).json({ error: "User or job not found" });
      return;
    }

    if (user.role !== "candidate") {
      res.status(403).json({ error: "Only candidates can apply to jobs" });
      return;
    }

    const existing = await Application.findOne({
      job: jobId,
      candidateClerkId: userId,
    });
    if (existing) {
      res.status(409).json({ error: "Already applied to this job" });
      return;
    }

    // Calculate dynamic ATS Score based on job skills overlap
    let calculatedAtsScore = 0;
    const applicantSkills = user.skills || [];
    const jobSkills = job.skills || [];
    
    if (jobSkills.length > 0) {
      const applicantSkillsUpper = applicantSkills.map((s: string) => s.toUpperCase());
      const matchedSkills = jobSkills.filter((skill: string) => 
        applicantSkillsUpper.includes(skill.toUpperCase())
      );
      calculatedAtsScore = Math.min(100, Math.round((matchedSkills.length / jobSkills.length) * 100));
    } else {
      calculatedAtsScore = user.atsScore || 60; // fallback if no job skills
    }

    const application = await Application.create({
      job: jobId,
      jobTitle: job.title,
      company: job.company,
      candidate: user._id,
      candidateClerkId: userId,
      candidateName: user.name,
      candidateEmail: user.email,
      candidateAvatar: user.avatar,
      resumeUrl: user.resumeUrl || "",
      atsScore: calculatedAtsScore,
      skills: applicantSkills,
      experience: user.experience || "",
      coverLetter: coverLetter || "",
      stage: "Applied",
    });

    await Job.findByIdAndUpdate(jobId, { $inc: { applicants: 1 } });

    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ error: "Failed to apply" });
  }
});

router.get("/applications/my", requireAuth, async (req, res) => {
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (isEnvAdminUserId(userId)) {
    res.json([]);
    return;
  }

  if (!isDBConnected()) {
    const applications = getMemApplicationsMy(userId);
    res.json(applications);
    return;
  }
  try {
    const applications = await Application.find({
      candidateClerkId: userId,
    })
      .populate("job")
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

router.get("/applications/check/:jobId", requireAuth, async (req, res) => {
  const jobId = paramToString(req.params.jobId);
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!isDBConnected()) {
    const status = checkMemApplication(userId, jobId);
    res.json(status);
    return;
  }
  try {
    const existing = await Application.findOne({
      job: jobId,
      candidateClerkId: userId,
    });
    res.json({ applied: !!existing, application: existing });
  } catch (err) {
    res.json({ applied: false });
  }
});

router.get("/applications/job/:jobId", requireAuth, async (req, res) => {
  const jobId = paramToString(req.params.jobId);
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!isDBConnected()) {
    const memUser = getMemUser(userId);
    const isAdmin = memUser?.role === "admin";
    const result = getMemApplicationsByJob(userId, jobId, isAdmin);
    if (result.error) {
      res.status(result.status || 500).json({ error: result.error });
      return;
    }
    res.json(result.data);
    return;
  }
  try {
    const user = await User.findOne({ clerkId: userId }).select("role");
    const job = await Job.findById(jobId).select("recruiter");
    if (!job) {
      res.status(404).json({ error: "Job not found" });
      return;
    }
    const isOwner = job.recruiter?.clerkId === userId;
    const isAdmin = user?.role === "admin";
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: "Forbidden: only the job's recruiter can view applicants" });
      return;
    }
    const applications = await Application.find({ job: jobId }).sort(
      { atsScore: -1, createdAt: -1 } // Sort by ATS Score descending for ranking/leaderboard
    );
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

router.get("/applications/candidates", requireAuth, async (req, res) => {
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (isEnvAdminUserId(userId)) {
    res.json([]);
    return;
  }

  if (!isDBConnected()) {
    const memUser = getMemUser(userId);
    const isAdmin = memUser?.role === "admin";
    const result = getMemApplicationsCandidates(userId, isAdmin);
    if (result.error) {
      res.status(result.status || 500).json({ error: result.error });
      return;
    }
    res.json(result.data);
    return;
  }
  try {
    const user = await User.findOne({ clerkId: userId }).select("role");
    if (!user || (user.role !== "recruiter" && user.role !== "admin")) {
      res.status(403).json({ error: "Forbidden: recruiters only" });
      return;
    }
    const recruiterJobs = await Job.find({ "recruiter.clerkId": userId });
    const jobIds = recruiterJobs.map((j) => j._id);
    const applications = await Application.find({ job: { $in: jobIds } }).sort({
      createdAt: -1,
    });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch candidates" });
  }
});

router.patch("/applications/:id/stage", requireAuth, async (req, res) => {
  const applicationId = paramToString(req.params.id);
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { stage } = req.body;
  const validStages = ["Applied", "Screening", "Interview", "Offer", "Rejected"];
  if (!validStages.includes(stage)) {
    res.status(400).json({ error: "Invalid stage" });
    return;
  }

  if (!isDBConnected()) {
    const memUser = getMemUser(userId);
    const isAdmin = memUser?.role === "admin";
    const result = updateMemApplicationStage(applicationId, userId, stage, isAdmin);
    if (result.error) {
      res.status(result.status || 500).json({ error: result.error });
      return;
    }
    res.json(result.data);
    return;
  }
  try {
    const application = await Application.findById(applicationId).select("job");
    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }
    const [user, job] = await Promise.all([
      User.findOne({ clerkId: userId }).select("role"),
      Job.findById(application.job).select("recruiter"),
    ]);
    const isOwner = job?.recruiter?.clerkId === userId;
    const isAdmin = user?.role === "admin";
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: "Forbidden: only the job's recruiter can update candidate stage" });
      return;
    }
    const updated = await Application.findByIdAndUpdate(
      applicationId,
      { $set: { stage } },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update stage" });
  }
});

export default router;
