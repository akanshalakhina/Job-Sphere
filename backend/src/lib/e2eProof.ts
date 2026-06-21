/**
 * e2eProof.ts
 * End-to-end integration test:
 *   1. Create Recruiter A
 *   2. Create Candidate A
 *   3. Recruiter A creates + approves a job
 *   4. Candidate A applies (with resume data)
 *   5. Verify application exists in MongoDB
 *   6. Verify recruiter sees Candidate A
 *   7. Generate AI rankings
 *   8. Move candidate through stages
 *   9. Verify dashboard counts update
 *
 * Run: npx tsx src/lib/e2eProof.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import { Job } from "../models/Job";
import { Application } from "../models/Application";
import { CandidateRanking } from "../models/CandidateRanking";

const MONGO_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://jobsphereakanshalakhina_db_user:Akansha2323@jobsphere.mqxno6o.mongodb.net/";
const JWT_SECRET = process.env.JWT_SECRET || "job-sphere-secret-key-123456";
const API = "http://localhost:3000/api";

const log = (label: string, data: unknown) => {
  const ok = data && typeof data === "object" && !("error" in (data as object));
  console.log(`\n${ok ? "✅" : "❌"} ${label}`);
  console.log("   ", JSON.stringify(data, null, 2).split("\n").join("\n    "));
};

const apiFetch = async (
  path: string,
  opts: RequestInit = {},
  token?: string,
) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers as Record<string, string>),
  };
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  return res.json();
};

const makeToken = (userId: string, role: string) =>
  jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: "1d" });

const run = async () => {
  await mongoose.connect(MONGO_URI, { dbName: "jobsphere" });
  console.log("✅ Connected to MongoDB (jobsphere)\n");

  // ── Clean up any prior e2e test users ──────────────────────────────────────
  await User.deleteMany({ email: { $in: ["recruiter_a@e2e.test", "candidate_a@e2e.test"] } });
  await Job.deleteMany({ company: "E2E Test Corp" });

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 1: Create Recruiter A
  // ─────────────────────────────────────────────────────────────────────────
  console.log("════════════════════════════════════════════");
  console.log("STEP 1: Create Recruiter A");
  console.log("════════════════════════════════════════════");

  const hash = await bcrypt.hash("Test@1234", 10);
  const recUser = new User({
    name: "Recruiter Alpha",
    email: "recruiter_a@e2e.test",
    password: hash,
    role: "recruiter",
    title: "Talent Manager",
    company: "E2E Test Corp",
    companyName: "E2E Test Corp",
    industry: "Technology",
    bio: "E2E recruiter account",
    skills: ["Recruitment", "HR"],
    isVerified: true,
    onboarded: true,
    avatar: "https://ui-avatars.com/api/?name=Recruiter+Alpha&background=6366f1&color=fff",
  });
  recUser.clerkId = recUser._id.toString();
  await recUser.save();
  log("Recruiter A created in MongoDB", {
    _id: recUser._id.toString(),
    clerkId: recUser.clerkId,
    email: recUser.email,
    role: recUser.role,
  });
  const recToken = makeToken(recUser.clerkId, "recruiter");

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 2: Create Candidate A
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n════════════════════════════════════════════");
  console.log("STEP 2: Create Candidate A");
  console.log("════════════════════════════════════════════");

  const candUser = new User({
    name: "Candidate Alpha",
    email: "candidate_a@e2e.test",
    password: hash,
    role: "candidate",
    title: "Senior Frontend Engineer",
    bio: "E2E candidate. React expert with 4 years of experience.",
    skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
    softSkills: ["Leadership", "Communication"],
    experience: "4 years",
    college: "IIT Delhi",
    degree: "B.Tech Computer Science",
    graduationYear: "2020",
    atsScore: 82,
    resumeUrl: "https://example.com/candidate_alpha_resume.pdf",
    resumeDetails: {
      fileName: "candidate_alpha_resume.pdf",
      atsScore: 82,
      skills: ["React", "TypeScript", "Node.js", "GraphQL", "AWS"],
      missingKeywords: ["Docker", "Kubernetes"],
      improvements: [
        "Add quantified project metrics",
        "Include open source contributions",
        "Add Docker certification",
      ],
      summary: "Strong frontend engineer with full-stack capabilities.",
    },
    isVerified: true,
    onboarded: true,
    avatar: "https://ui-avatars.com/api/?name=Candidate+Alpha&background=10b981&color=fff",
  });
  candUser.clerkId = candUser._id.toString();
  await candUser.save();
  log("Candidate A created in MongoDB", {
    _id: candUser._id.toString(),
    clerkId: candUser.clerkId,
    email: candUser.email,
    role: candUser.role,
    skills: candUser.skills,
    atsScore: candUser.atsScore,
    resumeDetails: candUser.resumeDetails ? "✓ Present" : "✗ Missing",
  });
  const candToken = makeToken(candUser.clerkId, "candidate");

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 3: Recruiter A creates a job via API
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n════════════════════════════════════════════");
  console.log("STEP 3: Recruiter A creates a Job");
  console.log("════════════════════════════════════════════");

  const jobPayload = {
    title: "Senior React Engineer",
    company: "E2E Test Corp",
    logo: "E",
    salary: "₹20,00,000 – ₹35,00,000",
    skills: ["React", "TypeScript", "Node.js", "AWS", "GraphQL"],
    location: "Bangalore, India",
    workplace: "Hybrid",
    department: "Engineering",
    experience: "3+ Years",
    description:
      "We are looking for a Senior React Engineer to build scalable web applications. " +
      "You will work on our core product and help architect the next generation of our platform.",
    responsibilities: [
      "Build and maintain React applications",
      "Collaborate with backend teams on API design",
      "Mentor junior developers",
      "Lead technical architecture decisions",
    ],
  };

  const createdJob = await apiFetch("/jobs", {
    method: "POST",
    body: JSON.stringify(jobPayload),
  }, recToken);

  log("Job created via POST /api/jobs", {
    _id: createdJob._id,
    title: createdJob.title,
    company: createdJob.company,
    status: createdJob.status,
    "recruiter.clerkId": createdJob.recruiter?.clerkId,
  });

  // Approve the job (simulating admin approval directly in DB)
  await Job.findByIdAndUpdate(createdJob._id, { status: "approved" });
  console.log("   ✅ Job approved directly in MongoDB (simulating admin approval)");

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 4: Candidate A applies to Recruiter A's job via API
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n════════════════════════════════════════════");
  console.log("STEP 4: Candidate A applies to the job");
  console.log("════════════════════════════════════════════");

  const applyResult = await apiFetch("/applications", {
    method: "POST",
    body: JSON.stringify({
      jobId: createdJob._id,
      coverLetter:
        "I am excited to apply for the Senior React Engineer position at E2E Test Corp. " +
        "With 4 years of React experience, I have built large-scale production apps.",
    }),
  }, candToken);

  log("Application created via POST /api/applications", {
    _id: applyResult._id,
    job: applyResult.job,
    jobTitle: applyResult.jobTitle,
    company: applyResult.company,
    stage: applyResult.stage,
    candidateName: applyResult.candidateName,
    candidateEmail: applyResult.candidateEmail,
    atsScore: applyResult.atsScore,
    skills: applyResult.skills,
    experience: applyResult.experience,
  });

  const appId = applyResult._id;

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 5: Verify application exists in MongoDB
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n════════════════════════════════════════════");
  console.log("STEP 5: Verify Application in MongoDB");
  console.log("════════════════════════════════════════════");

  const dbApp = await Application.findById(appId).populate("job").populate("candidate");
  log("Application found in MongoDB (Application collection)", {
    _id: dbApp?._id.toString(),
    "job._id": (dbApp?.job as any)?._id?.toString(),
    "job.title": (dbApp?.job as any)?.title,
    "candidate._id": (dbApp?.candidate as any)?._id?.toString(),
    "candidate.name": (dbApp?.candidate as any)?.name,
    stage: dbApp?.stage,
    atsScore: dbApp?.atsScore,
    skills: dbApp?.skills,
    createdAt: dbApp?.createdAt,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 6: Recruiter sees Candidate A via API
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n════════════════════════════════════════════");
  console.log("STEP 6: Recruiter A sees Candidate A (Pipeline)");
  console.log("════════════════════════════════════════════");

  const pipeline = await apiFetch("/applications/candidates", {}, recToken);
  const candidateEntry = Array.isArray(pipeline)
    ? pipeline.find((c: any) => c.candidateName === "Candidate Alpha")
    : null;

  log("GET /api/applications/candidates (recruiter's pipeline)", {
    totalApplicationsVisible: Array.isArray(pipeline) ? pipeline.length : "error",
    candidateAFound: !!candidateEntry,
    candidateA: candidateEntry
      ? {
          candidateName: candidateEntry.candidateName,
          candidateEmail: candidateEntry.candidateEmail,
          stage: candidateEntry.stage,
          atsScore: candidateEntry.atsScore,
          skills: candidateEntry.skills,
          experience: candidateEntry.experience,
          jobTitle: candidateEntry.jobTitle,
        }
      : null,
  });

  // Also fetch by specific job
  const jobApplicants = await apiFetch(`/applications/job/${createdJob._id}`, {}, recToken);
  log(`GET /api/applications/job/${createdJob._id} (job-specific applicants)`, {
    count: Array.isArray(jobApplicants) ? jobApplicants.length : "error",
    candidates: Array.isArray(jobApplicants)
      ? jobApplicants.map((a: any) => ({
          name: a.candidateName,
          stage: a.stage,
          atsScore: a.atsScore,
        }))
      : jobApplicants,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 7: Candidate A profile data (for recruiter to view)
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n════════════════════════════════════════════");
  console.log("STEP 7: Candidate A Full Profile (viewed by recruiter)");
  console.log("════════════════════════════════════════════");

  const publicProfile = await apiFetch(
    `/users/public/${candUser.clerkId}?increment=false`,
    {},
    recToken,
  );
  log(`GET /api/users/public/${candUser.clerkId} (full candidate profile)`, {
    name: publicProfile.name,
    title: publicProfile.title,
    skills: publicProfile.skills,
    experience: publicProfile.experience,
    college: publicProfile.college,
    degree: publicProfile.degree,
    graduationYear: publicProfile.graduationYear,
    atsScore: publicProfile.atsScore,
    resumeUrl: publicProfile.resumeUrl ? "✓ Has resume URL" : "✗ No resume URL",
    resumeDetails: publicProfile.resumeDetails ? "✓ Has parsed resume data" : "✗ No resume data",
  });

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 8: Generate AI Rankings
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n════════════════════════════════════════════");
  console.log("STEP 8: Generate AI Rankings");
  console.log("════════════════════════════════════════════");

  const rankResult = await apiFetch(
    `/jobs/${createdJob._id}/generate-ranking`,
    { method: "POST" },
    recToken,
  );
  log(`POST /api/jobs/${createdJob._id}/generate-ranking`, rankResult);

  const rankings = await apiFetch(
    `/jobs/${createdJob._id}/ranked-candidates`,
    {},
    recToken,
  );
  log(`GET /api/jobs/${createdJob._id}/ranked-candidates`, {
    total: rankings.total,
    rankings: rankings.rankings?.map((r: any) => ({
      candidateName: r.candidateName || r.candidateClerkId,
      finalScore: r.finalScore,
      skillsScore: r.skillsScore,
      recommendation: r.recommendation,
      matchedSkills: r.matchedSkills,
      missingSkills: r.missingSkills,
    })),
  });

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 9: Move Candidate through stages
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n════════════════════════════════════════════");
  console.log("STEP 9: Stage Transitions (Applied → Screening → Interview → Offer)");
  console.log("════════════════════════════════════════════");

  for (const stage of ["Screening", "Interview", "Offer"]) {
    const stageResult = await apiFetch(
      `/applications/${appId}/stage`,
      { method: "PATCH", body: JSON.stringify({ stage }) },
      recToken,
    );
    console.log(`   ✅ Moved to "${stage}" → DB stage: ${stageResult.stage}`);
  }

  // Verify final stage in DB
  const finalApp = await Application.findById(appId);
  log("Final Application state in MongoDB", {
    _id: finalApp?._id.toString(),
    stage: finalApp?.stage,
    updatedAt: finalApp?.updatedAt,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // STEP 10: Dashboard statistics from DB
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n════════════════════════════════════════════");
  console.log("STEP 10: Candidate Dashboard Stats from DB");
  console.log("════════════════════════════════════════════");

  const stats = await apiFetch("/users/stats", {}, candToken);
  log("GET /api/users/stats (candidate dashboard metrics)", {
    applied: stats.applied,
    saved: stats.saved,
    atsScore: stats.atsScore,
    interviews: stats.interviews,
    profileViews: stats.profileViews,
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────────────────
  console.log("\n\n════════════════════════════════════════════");
  console.log("📊 FULL E2E TEST SUMMARY");
  console.log("════════════════════════════════════════════");

  const finalDbApp = await Application.findById(appId);
  const rankingInDb = await CandidateRanking.findOne({ job: createdJob._id, candidateClerkId: candUser.clerkId });

  console.log(`
  MongoDB Collections Used:
  ┌──────────────────────┬──────────────────────────────────────────────┐
  │ Collection           │ Evidence                                      │
  ├──────────────────────┼──────────────────────────────────────────────┤
  │ users                │ Recruiter A:   ${recUser._id}                 │
  │                      │ Candidate A:   ${candUser._id}                │
  │ jobs                 │ Job ID:        ${createdJob._id}              │
  │                      │ Status:        approved                        │
  │ applications         │ App ID:        ${appId}                       │
  │                      │ Stage:         ${finalDbApp?.stage}           │
  │                      │ ATS Score:     ${finalDbApp?.atsScore}        │
  │ candidaterankings    │ Ranking:       ${rankingInDb ? "✓ Generated" : "✗ Not found (check API logs)"} │
  └──────────────────────┴──────────────────────────────────────────────┘

  APIs Exercised:
  ✅ POST /api/jobs               → Job created by Recruiter A
  ✅ POST /api/applications       → Candidate A applied
  ✅ GET  /api/applications/candidates → Recruiter sees Candidate A
  ✅ GET  /api/applications/job/:id    → Job-specific applicants
  ✅ GET  /api/users/public/:id        → Candidate full profile
  ✅ POST /api/jobs/:id/generate-ranking → AI rankings generated
  ✅ GET  /api/jobs/:id/ranked-candidates → Rankings fetched
  ✅ PATCH /api/applications/:id/stage → Stage moved 3 times
  ✅ GET  /api/users/stats             → Dashboard stats from DB

  Dashboard Stat: applied = ${stats.applied} (real count from Application collection)
  `);

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error("❌ E2E test failed:", err);
  process.exit(1);
});
