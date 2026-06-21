import { Router } from "express";
import { requireAuth, getRequestUserId } from "../middlewares/requireAuth";
import { Job } from "../models/Job";
import { User } from "../models/User";
import { Application } from "../models/Application";
import { CandidateRanking } from "../models/CandidateRanking";
import { isDBConnected } from "../lib/mongodb";
import {
  computeRanking,
  generateJobHash,
  generateCandidateHash,
} from "../lib/rankingEngine";
import { isEnvAdminUserId } from "../lib/envAdmin";
import { getMemRankings, upsertMemRanking, getMemRankingById, updateMemRankingShortlist, getMemJobById, getMemUser, getMemApplicationsByJob, updateMemApplicationStage } from "../lib/memoryDb";

const router = Router();

// ────────────────────────────────────────────────────────────────────────────
// POST /jobs/:jobId/generate-ranking
// Generate or refresh rankings for all applicants of a job
// ────────────────────────────────────────────────────────────────────────────
router.post(
  "/jobs/:jobId/generate-ranking",
  requireAuth,
  async (req, res) => {
    const jobId = req.params.jobId as string;
    const userId = getRequestUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!isDBConnected()) {
      const job = getMemJobById(jobId);
      if (!job) { res.status(404).json({ error: "Job not found" }); return; }
      const memApps = getMemApplicationsByJob(userId, jobId, true).data || [];
      if (memApps.length === 0) { res.json({ generated: 0, cached: 0, total: 0 }); return; }
      
      const jobHash = generateJobHash(job);
      let generated = 0, cached = 0;
      for (const app of memApps) {
         const candidateUser = getMemUser(app.candidateClerkId);
         const candidateHash = generateCandidateHash({
           skills: app.skills || candidateUser?.skills || [],
           experience: app.experience || candidateUser?.experience || "",
           resumeText: app.resumeText || "",
           bio: candidateUser?.bio || "",
         });
         const existing = getMemRankings(jobId).find(r => r.application === app._id);
         if (existing && existing.jobHash === jobHash && existing.candidateHash === candidateHash) { cached++; continue; }
         const rankingResult = await computeRanking({
           jobSkills: job.skills || [], jobExperience: job.experience || "", jobLocation: job.location || "", jobDescription: job.description || "", jobWorkplace: job.workplace || "",
           candidateSkills: app.skills || candidateUser?.skills || [], candidateExperience: app.experience || candidateUser?.experience || "", candidateLocation: candidateUser?.bio || candidateUser?.college || "", candidateResumeText: app.resumeText || "", candidateBio: candidateUser?.bio || "",
         });
         upsertMemRanking(jobId, app._id, {
            candidate: app.candidate, candidateClerkId: app.candidateClerkId,
            skillsScore: rankingResult.skillsScore, experienceScore: rankingResult.experienceScore, locationScore: rankingResult.locationScore, semanticScore: rankingResult.semanticScore, finalScore: rankingResult.finalScore, recommendation: rankingResult.recommendation, matchedSkills: rankingResult.matchedSkills, missingSkills: rankingResult.missingSkills, summary: rankingResult.summary, autoShortlisted: rankingResult.autoShortlisted, jobHash, candidateHash,
         });
         generated++;
      }
      res.json({ generated, cached, total: memApps.length });
      return;
    }

    try {
      // Verify the user is the job recruiter or admin
      const job = await Job.findById(jobId);
      if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
      }

      const user = isEnvAdminUserId(userId)
        ? null
        : await User.findOne({ clerkId: userId }).select("role");
      const isOwner = job.recruiter?.clerkId === userId;
      const isAdmin =
        isEnvAdminUserId(userId) || user?.role === "admin";

      if (!isOwner && !isAdmin) {
        res.status(403).json({
          error: "Forbidden: only the job's recruiter can generate rankings",
        });
        return;
      }

      // Get all applications for this job
      const applications = await Application.find({ job: jobId });
      if (applications.length === 0) {
        res.json({ generated: 0, cached: 0, total: 0 });
        return;
      }

      const jobHash = generateJobHash(job);
      let generated = 0;
      let cached = 0;

      for (const app of applications) {
        // Get candidate user data
        const candidateUser = await User.findById(app.candidate);
        const candidateHash = generateCandidateHash({
          skills: app.skills || candidateUser?.skills || [],
          experience: app.experience || candidateUser?.experience || "",
          resumeText: app.resumeText || "",
          bio: candidateUser?.bio || "",
        });

        // Check if a valid cached ranking exists
        const existing = await CandidateRanking.findOne({
          job: jobId,
          application: app._id,
        });

        if (
          existing &&
          existing.jobHash === jobHash &&
          existing.candidateHash === candidateHash
        ) {
          cached++;
          continue;
        }

        // Compute new ranking
        const candidateLocation =
          candidateUser?.bio || candidateUser?.college || "";

        const rankingResult = await computeRanking({
          jobSkills: job.skills || [],
          jobExperience: job.experience || "",
          jobLocation: job.location || "",
          jobDescription: job.description || "",
          jobWorkplace: job.workplace || "",
          candidateSkills: app.skills || candidateUser?.skills || [],
          candidateExperience:
            app.experience || candidateUser?.experience || "",
          candidateLocation,
          candidateResumeText: app.resumeText || "",
          candidateBio: candidateUser?.bio || "",
        });

        // Upsert ranking document
        await CandidateRanking.findOneAndUpdate(
          { job: jobId, application: app._id },
          {
            $set: {
              candidate: app.candidate,
              candidateClerkId: app.candidateClerkId,
              skillsScore: rankingResult.skillsScore,
              experienceScore: rankingResult.experienceScore,
              locationScore: rankingResult.locationScore,
              semanticScore: rankingResult.semanticScore,
              finalScore: rankingResult.finalScore,
              recommendation: rankingResult.recommendation,
              matchedSkills: rankingResult.matchedSkills,
              missingSkills: rankingResult.missingSkills,
              summary: rankingResult.summary,
              autoShortlisted: rankingResult.autoShortlisted,
              jobHash,
              candidateHash,
            },
          },
          { upsert: true, new: true },
        );

        generated++;
      }

      res.json({
        generated,
        cached,
        total: applications.length,
      });
    } catch (err) {
      console.error("[Ranking] Generation error:", err);
      res.status(500).json({ error: "Failed to generate rankings" });
    }
  },
);

// ────────────────────────────────────────────────────────────────────────────
// GET /jobs/:jobId/ranked-candidates
// Retrieve ranked candidates with filtering and sorting
// ────────────────────────────────────────────────────────────────────────────
router.get(
  "/jobs/:jobId/ranked-candidates",
  requireAuth,
  async (req, res) => {
    const jobId = req.params.jobId as string;
    const userId = getRequestUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!isDBConnected()) {
      let rankings = getMemRankings(jobId);
      const { recommendation, minScore, skill, sort, limit, page } = req.query;
      if (recommendation) rankings = rankings.filter(r => r.recommendation === recommendation);
      if (minScore) rankings = rankings.filter(r => r.finalScore >= Number(minScore));
      if (skill) rankings = rankings.filter(r => (r.matchedSkills || []).includes(String(skill)));
      
      const sortField = String(sort || "finalScore");
      rankings.sort((a, b) => (b[sortField] || 0) - (a[sortField] || 0));
      
      const pageNum = Math.max(1, Number(page) || 1);
      const limitNum = Math.min(100, Math.max(1, Number(limit) || 50));
      const skip = (pageNum - 1) * limitNum;
      
      const total = rankings.length;
      const paginated = rankings.slice(skip, skip + limitNum);
      
      const memApps = getMemApplicationsByJob(userId, jobId, true).data || [];
      const enriched = paginated.map((r, idx) => {
         const app = memApps.find((a:any) => a._id === r.application) || {};
         return {
            ...r, rank: skip + idx + 1,
            candidateName: app.candidateName || "Unknown",
            candidateEmail: app.candidateEmail || "",
            candidateAvatar: app.candidateAvatar || "",
            candidateSkills: app.skills || [],
            candidateExperience: app.experience || "",
            stage: app.stage || "Applied",
            resumeUrl: app.resumeUrl || "",
            atsScore: app.atsScore || 0,
         };
      });
      
      res.json({ rankings: enriched, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) });
      return;
    }

    try {
      // Verify the user is the job recruiter or admin
      const job = await Job.findById(jobId).select("recruiter");
      if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
      }

      const user = isEnvAdminUserId(userId)
        ? null
        : await User.findOne({ clerkId: userId }).select("role");
      const isOwner = job.recruiter?.clerkId === userId;
      const isAdmin =
        isEnvAdminUserId(userId) || user?.role === "admin";

      if (!isOwner && !isAdmin) {
        res.status(403).json({
          error: "Forbidden: only the job's recruiter can view rankings",
        });
        return;
      }

      // Build query filters
      const filter: Record<string, unknown> = { job: jobId };

      const { recommendation, minScore, skill, sort, limit, page } =
        req.query;

      if (recommendation) {
        filter.recommendation = recommendation;
      }
      if (minScore) {
        filter.finalScore = { $gte: Number(minScore) };
      }
      if (skill) {
        filter.matchedSkills = { $in: [String(skill)] };
      }

      // Sort options
      const sortField = String(sort || "finalScore");
      const validSorts = [
        "finalScore",
        "skillsScore",
        "experienceScore",
        "locationScore",
        "semanticScore",
      ];
      const sortKey = validSorts.includes(sortField)
        ? sortField
        : "finalScore";
      const sortOpt: Record<string, 1 | -1> = { [sortKey]: -1 };

      // Pagination
      const pageNum = Math.max(1, Number(page) || 1);
      const limitNum = Math.min(100, Math.max(1, Number(limit) || 50));
      const skip = (pageNum - 1) * limitNum;

      const [rankings, total] = await Promise.all([
        CandidateRanking.find(filter)
          .sort(sortOpt)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        CandidateRanking.countDocuments(filter),
      ]);

      // Enrich with application data
      const applicationIds = rankings.map((r) => r.application);
      const applications = await Application.find({
        _id: { $in: applicationIds },
      })
        .select(
          "candidateName candidateEmail candidateAvatar skills experience stage resumeUrl atsScore",
        )
        .lean();

      const appMap = new Map(
        applications.map((a) => [String(a._id), a]),
      );

      const enriched = rankings.map((r, idx) => {
        const app = appMap.get(String(r.application)) || {};
        return {
          ...r,
          rank: skip + idx + 1,
          candidateName:
            (app as Record<string, unknown>).candidateName || "Unknown",
          candidateEmail: (app as Record<string, unknown>).candidateEmail || "",
          candidateAvatar:
            (app as Record<string, unknown>).candidateAvatar || "",
          candidateSkills: (app as Record<string, unknown>).skills || [],
          candidateExperience:
            (app as Record<string, unknown>).experience || "",
          stage: (app as Record<string, unknown>).stage || "Applied",
          resumeUrl: (app as Record<string, unknown>).resumeUrl || "",
          atsScore: (app as Record<string, unknown>).atsScore || 0,
        };
      });

      res.json({
        rankings: enriched,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      });
    } catch (err) {
      console.error("[Ranking] Fetch error:", err);
      res.status(500).json({ error: "Failed to fetch rankings" });
    }
  },
);

// ────────────────────────────────────────────────────────────────────────────
// GET /jobs/:jobId/top-candidates
// Quick access to top 10 candidates
// ────────────────────────────────────────────────────────────────────────────
router.get(
  "/jobs/:jobId/top-candidates",
  requireAuth,
  async (req, res) => {
    const jobId = req.params.jobId as string;
    const userId = getRequestUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!isDBConnected()) {
      let rankings = getMemRankings(jobId).sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0)).slice(0, 10);
      const memApps = getMemApplicationsByJob(userId, jobId, true).data || [];
      const enriched = rankings.map((r, idx) => {
         const app = memApps.find((a:any) => a._id === r.application) || {};
         return {
            ...r, rank: idx + 1,
            candidateName: app.candidateName || "Unknown",
            candidateEmail: app.candidateEmail || "",
            candidateAvatar: app.candidateAvatar || "",
            candidateSkills: app.skills || [],
            stage: app.stage || "Applied",
         };
      });
      res.json(enriched);
      return;
    }

    try {
      const job = await Job.findById(jobId).select("recruiter");
      if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
      }

      const user = isEnvAdminUserId(userId)
        ? null
        : await User.findOne({ clerkId: userId }).select("role");
      const isOwner = job.recruiter?.clerkId === userId;
      const isAdmin =
        isEnvAdminUserId(userId) || user?.role === "admin";

      if (!isOwner && !isAdmin) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const rankings = await CandidateRanking.find({ job: jobId })
        .sort({ finalScore: -1 })
        .limit(10)
        .lean();

      const applicationIds = rankings.map((r) => r.application);
      const applications = await Application.find({
        _id: { $in: applicationIds },
      })
        .select("candidateName candidateEmail candidateAvatar skills experience stage")
        .lean();

      const appMap = new Map(
        applications.map((a) => [String(a._id), a]),
      );

      const enriched = rankings.map((r, idx) => {
        const app = appMap.get(String(r.application)) || {};
        return {
          ...r,
          rank: idx + 1,
          candidateName:
            (app as Record<string, unknown>).candidateName || "Unknown",
          candidateEmail: (app as Record<string, unknown>).candidateEmail || "",
          candidateAvatar:
            (app as Record<string, unknown>).candidateAvatar || "",
          candidateSkills: (app as Record<string, unknown>).skills || [],
          stage: (app as Record<string, unknown>).stage || "Applied",
        };
      });

      res.json(enriched);
    } catch (err) {
      console.error("[Ranking] Top candidates error:", err);
      res.status(500).json({ error: "Failed to fetch top candidates" });
    }
  },
);

// ────────────────────────────────────────────────────────────────────────────
// PATCH /jobs/:jobId/rankings/:rankingId/shortlist
// Accept or reject auto-shortlist suggestion
// ────────────────────────────────────────────────────────────────────────────
router.patch(
  "/jobs/:jobId/rankings/:rankingId/shortlist",
  requireAuth,
  async (req, res) => {
    const jobId = req.params.jobId as string;
    const rankingId = req.params.rankingId as string;
    const userId = getRequestUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    if (!isDBConnected()) {
      const { accepted } = req.body;
      const ranking = updateMemRankingShortlist(rankingId, accepted);
      if (!ranking) { res.status(404).json({ error: "Ranking not found" }); return; }
      if (accepted) {
         updateMemApplicationStage(ranking.application, userId, "Screening", true);
      }
      res.json({ success: true, shortlistAccepted: accepted, applicationStage: accepted ? "Screening" : undefined });
      return;
    }

    const { accepted } = req.body;
    if (typeof accepted !== "boolean") {
      res.status(400).json({ error: "accepted must be a boolean" });
      return;
    }

    try {
      const job = await Job.findById(jobId).select("recruiter");
      if (!job) {
        res.status(404).json({ error: "Job not found" });
        return;
      }

      const user = isEnvAdminUserId(userId)
        ? null
        : await User.findOne({ clerkId: userId }).select("role");
      const isOwner = job.recruiter?.clerkId === userId;
      const isAdmin =
        isEnvAdminUserId(userId) || user?.role === "admin";

      if (!isOwner && !isAdmin) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      const ranking = await CandidateRanking.findById(rankingId);
      if (!ranking || String(ranking.job) !== jobId) {
        res.status(404).json({ error: "Ranking not found" });
        return;
      }

      ranking.shortlistAccepted = accepted;
      await ranking.save();

      // If accepted, advance the application to Screening
      if (accepted) {
        await Application.findByIdAndUpdate(ranking.application, {
          $set: { stage: "Screening" },
        });
      }

      res.json({
        success: true,
        shortlistAccepted: accepted,
        applicationStage: accepted ? "Screening" : undefined,
      });
    } catch (err) {
      console.error("[Ranking] Shortlist error:", err);
      res.status(500).json({ error: "Failed to update shortlist" });
    }
  },
);

export default router;
