/**
 * completeSeed.ts
 * Full end-to-end seed script that creates realistic data and connects
 * all dashboard flows (recruiter pipeline, candidate tracking, AI rankings)
 *
 * Run: npx tsx src/lib/completeSeed.ts
 *
 * Demo accounts created:
 *   Recruiter: recruiter1@stripe.com / Demo@1234
 *   Candidate: candidate1@gmail.com  / Demo@1234
 *   Admin:     admin / adminpass (env-based, unchanged)
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";
import { Job } from "../models/Job";
import { Application } from "../models/Application";
import { Interview } from "../models/Interview";
import { Offer } from "../models/Offer";
import { Course } from "../models/Course";
import { Notification } from "../models/Notification";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://jobsphereakanshalakhina_db_user:Akansha2323@jobsphere.mqxno6o.mongodb.net/";

const connectDB = async () => {
  await mongoose.connect(MONGODB_URI, { dbName: "jobsphere" });
  console.log("✅ MongoDB Connected (db: jobsphere)");
};

// ─── helpers ────────────────────────────────────────────────────────────────
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// ─── data pools ─────────────────────────────────────────────────────────────
const FIRST_NAMES = [
  "Arjun","Priya","Rahul","Ananya","Vikram","Sneha","Rohan","Neha",
  "Karan","Pooja","Amit","Divya","Sanjay","Kritika","Aditya","Meera",
  "Ravi","Simran","Suresh","Anjali","Dev","Riya","Kunal","Ishaan","Nisha",
  "Vivek","Tanvi","Manish","Swati","Akash","Kavya","Nikhil","Shreya",
  "Rajesh","Ankita","Gaurav","Pallavi","Harsh","Deepika","Mohit",
  "James","Emma","Liam","Olivia","Noah","Ava","William","Sophia",
  "Lucas","Isabella","Mason","Mia","Ethan","Amelia","Oliver"
];
const LAST_NAMES = [
  "Sharma","Verma","Patel","Gupta","Kumar","Singh","Mehta","Joshi",
  "Nair","Reddy","Iyer","Pillai","Chopra","Bose","Chatterjee",
  "Smith","Johnson","Williams","Brown","Jones","Garcia","Miller",
  "Davis","Rodriguez","Martinez","Hernandez","Lopez","Wilson","Thomas"
];
const COMPANIES = [
  "Stripe","Google","Vercel","Linear","Supabase","Razorpay",
  "Microsoft","Amazon","Flipkart","Infosys","Wipro","TCS",
  "Swiggy","Zomato","PhonePe"
];
const JOB_TITLES = [
  "Senior Frontend Engineer","Backend Developer","Full Stack Developer",
  "Product Manager","UI/UX Designer","DevOps Engineer","Data Scientist",
  "Machine Learning Engineer","Mobile Developer","QA Engineer",
  "Cloud Architect","Security Engineer","Site Reliability Engineer",
  "Platform Engineer","Engineering Manager"
];
const ALL_SKILLS = [
  "React","Node.js","Python","AWS","Docker","TypeScript","Figma",
  "SQL","MongoDB","GraphQL","Next.js","Redis","Kubernetes","Go",
  "System Design","Java","Spring Boot","Flutter","CI/CD","Terraform"
];
const LOCATIONS = [
  "Bangalore, India","Mumbai, India","Hyderabad, India","Pune, India",
  "Remote","New Delhi, India","Chennai, India","Noida, India"
];
const WORKPLACES: ("Remote"|"Hybrid"|"On-site")[] = ["Remote","Hybrid","On-site"];
const DEPARTMENTS = ["Engineering","Product","Design","Data","Operations"];
const STAGES = ["Applied","Screening","Interview","Offer","Rejected"] as const;

const DEMO_PASSWORD = "Demo@1234";

// ─── main ────────────────────────────────────────────────────────────────────
const run = async () => {
  const HASH = await bcrypt.hash(DEMO_PASSWORD, 10);
  await connectDB();

  // ── wipe slate ──────────────────────────────────────────────────────────
  console.log("🗑️  Clearing old seed data...");
  await User.deleteMany({ role: { $in: ["candidate","recruiter"] } });
  await Job.deleteMany({});
  await Application.deleteMany({});
  await Interview.deleteMany({});
  await Offer.deleteMany({});
  await Course.deleteMany({});
  await Notification.deleteMany({});

  // ── recruiters ─────────────────────────────────────────────────────────
  console.log("👔 Creating 10 Recruiters...");
  const recruiterDocs: any[] = [];

  const recruiterData = [
    { name: "Priya Sharma",    company: "Stripe",     industry: "Fintech" },
    { name: "Rahul Mehta",     company: "Google",     industry: "Technology" },
    { name: "Ananya Verma",    company: "Vercel",     industry: "Cloud" },
    { name: "Vikram Patel",    company: "Linear",     industry: "SaaS" },
    { name: "Sneha Gupta",     company: "Supabase",   industry: "Dev Tools" },
    { name: "Karan Reddy",     company: "Razorpay",   industry: "Fintech" },
    { name: "Pooja Iyer",      company: "Microsoft",  industry: "Technology" },
    { name: "Aditya Kumar",    company: "Amazon",     industry: "E-Commerce" },
    { name: "Meera Chopra",    company: "Flipkart",   industry: "E-Commerce" },
    { name: "Ravi Nair",       company: "Swiggy",     industry: "FoodTech" },
  ];

  for (let i = 0; i < recruiterData.length; i++) {
    const { name, company, industry } = recruiterData[i];
    const slug = name.toLowerCase().replace(/\s+/, ".");
    const email = i === 0 ? "recruiter1@stripe.com" : `${slug}@${company.toLowerCase()}.com`;

    const rec = new User({
      name,
      email,
      password: HASH,
      role: "recruiter",
      title: "Talent Acquisition Manager",
      bio: `${industry} talent leader helping build world-class teams at ${company}.`,
      skills: ["Recruitment","Talent Acquisition","HR"],
      company,
      companyName: company,
      industry,
      companySize: pick(["100-500","500-1000","1000-5000","10000+"]),
      website: `https://www.${company.toLowerCase()}.com`,
      description: `${company} is a leading company in the ${industry} space.`,
      isVerified: true,
      onboarded: true,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&bold=true&size=128`,
    });
    rec.clerkId = rec._id.toString();
    await rec.save();
    recruiterDocs.push(rec);
    if (i === 0) {
      console.log(`   ✅ Demo Recruiter: ${email} / ${DEMO_PASSWORD}`);
    }
  }

  // ── candidates ─────────────────────────────────────────────────────────
  console.log("🎓 Creating 50 Candidates...");
  const candidateDocs: any[] = [];

  for (let i = 0; i < 50; i++) {
    const fn = pick(FIRST_NAMES);
    const ln = pick(LAST_NAMES);
    const name = `${fn} ${ln}`;
    const slug = `${fn.toLowerCase()}.${ln.toLowerCase()}${i}`;
    const email = i === 0 ? "candidate1@gmail.com" : `${slug}@gmail.com`;
    const numSkills = rand(3, 6);
    const skillSet: string[] = [];
    const skillPool = [...ALL_SKILLS];
    for (let k = 0; k < numSkills; k++) {
      const idx = Math.floor(Math.random() * skillPool.length);
      skillSet.push(skillPool.splice(idx, 1)[0]);
    }
    const expYears = rand(0, 8);

    const cand = new User({
      name,
      email,
      password: HASH,
      role: "candidate",
      title: pick(JOB_TITLES),
      bio: `Passionate ${pick(["software engineer","developer","designer","data scientist"])} with ${expYears} years of experience. Seeking exciting new challenges.`,
      skills: skillSet,
      softSkills: pick([["Leadership","Communication"],["Teamwork","Problem Solving"],["Creativity","Time Management"]]),
      experience: `${expYears} year${expYears !== 1 ? "s" : ""}`,
      college: pick(["IIT Delhi","IIT Bombay","BITS Pilani","NIT Trichy","VIT","DTU","IIIT Hyderabad","Mumbai University"]),
      degree: pick(["B.Tech Computer Science","B.E. Information Technology","MCA","M.Tech","BSc Computer Science"]),
      graduationYear: String(rand(2018, 2025)),
      atsScore: rand(55, 95),
      isVerified: true,
      onboarded: true,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff&bold=true&size=128`,
    });
    cand.clerkId = cand._id.toString();
    await cand.save();
    candidateDocs.push(cand);
    if (i === 0) {
      console.log(`   ✅ Demo Candidate: ${email} / ${DEMO_PASSWORD}`);
    }
  }

  // ── jobs ───────────────────────────────────────────────────────────────
  console.log("💼 Creating 20 Jobs...");
  const jobDocs: any[] = [];

  // Ensure one job per recruiter at minimum, extras random
  const jobAssignments = [
    ...recruiterDocs.slice(0, 10), // one per recruiter
    ...Array.from({length: 10}, () => pick(recruiterDocs)) // 10 more random
  ];

  for (let i = 0; i < 20; i++) {
    const rec = jobAssignments[i];
    const title = pick(JOB_TITLES);
    const skillCount = rand(3, 5);
    const jobSkills: string[] = [];
    const pool = [...ALL_SKILLS];
    for (let k = 0; k < skillCount; k++) {
      const idx = Math.floor(Math.random() * pool.length);
      jobSkills.push(pool.splice(idx, 1)[0]);
    }

    const loc = pick(LOCATIONS);
    const wp = pick(WORKPLACES);
    const minSal = rand(10, 25);
    const maxSal = minSal + rand(5, 20);
    const expMin = rand(1, 4);

    const job = new Job({
      title,
      company: rec.company,
      logo: rec.company.substring(0, 1).toUpperCase(),
      salary: `₹${minSal},00,000 – ₹${maxSal},00,000`,
      skills: jobSkills,
      location: loc,
      workplace: wp,
      department: pick(DEPARTMENTS),
      experience: `${expMin}+ Years`,
      description: `We are looking for a talented ${title} to join our growing team at ${rec.company}. You will be working on cutting-edge products that impact millions of users. This is a ${wp} role based out of ${loc}.\n\nRequired skills: ${jobSkills.join(", ")}. You will collaborate with cross-functional teams and help shape the technical direction of our platform.`,
      responsibilities: [
        `Design and implement scalable ${title.toLowerCase()} solutions`,
        "Collaborate with product and design teams to deliver features",
        "Write clean, maintainable, well-tested code",
        "Participate in code reviews and mentor junior engineers",
        "Contribute to technical roadmap and architectural decisions"
      ],
      recruiter: {
        name: rec.name,
        role: "Talent Acquisition Manager",
        avatar: rec.avatar,
        clerkId: rec.clerkId, // ← CRITICAL: this enables auth-gated pipeline view
      },
      postedBy: rec._id,
      status: "approved", // ← visible in Jobs listing immediately
      applicants: rand(5, 80),
      postedTime: `${rand(1, 21)} days ago`,
    });
    await job.save();
    jobDocs.push(job);
  }

  // ── applications ───────────────────────────────────────────────────────
  console.log("📋 Creating 100 Applications...");
  let appCount = 0;
  let attempts = 0;
  const usedPairs = new Set<string>();

  while (appCount < 100 && attempts < 500) {
    attempts++;
    const cand = pick(candidateDocs);
    const job = pick(jobDocs);
    const pairKey = `${cand._id}-${job._id}`;

    if (usedPairs.has(pairKey)) continue;
    usedPairs.add(pairKey);

    const stage = pick([...STAGES]);
    const matchedSkills = (cand.skills || []).filter((s: string) =>
      (job.skills || []).map((js: string) => js.toLowerCase()).includes(s.toLowerCase())
    );
    const atsScore = job.skills.length > 0
      ? Math.min(99, Math.round((matchedSkills.length / job.skills.length) * 100) + rand(0, 20))
      : rand(50, 85);

    const app = new Application({
      job: job._id,
      jobTitle: job.title,
      company: job.company,
      candidate: cand._id,
      candidateClerkId: cand.clerkId,
      candidateName: cand.name,
      candidateEmail: cand.email,
      candidateAvatar: cand.avatar,
      resumeUrl: "",
      atsScore: Math.min(atsScore, 99),
      skills: cand.skills || [],
      experience: cand.experience || "0 years",
      coverLetter: `I am very excited to apply for the ${job.title} role at ${job.company}. With my background in ${(cand.skills || []).slice(0,2).join(" and ")}, I believe I can make a significant contribution to your team.`,
      stage,
    });
    await app.save();
    appCount++;

    // Create interviews for Interview-stage applications
    if (stage === "Interview") {
      const interviewDate = new Date(Date.now() + rand(1, 10) * 24 * 60 * 60 * 1000);
      try {
        await new Interview({
          candidateName: cand.name,
          candidateAvatar: cand.avatar,
          candidateClerkId: cand.clerkId,
          jobTitle: job.title,
          company: job.company,
          recruiterClerkId: job.recruiter.clerkId,
          date: interviewDate.toISOString().split("T")[0],
          time: `${pick(["09","10","11","14","15","16"])}:00`,
          type: pick(["Technical","HR","Managerial"]) as "Technical"|"HR"|"Managerial",
          status: "scheduled",
          notes: `Interview scheduled for ${cand.name} for ${job.title} position.`,
          rounds: [
            { name: "Round 1 – Technical Screen", status: "scheduled", order: 1 },
            { name: "Round 2 – System Design", status: "locked", order: 2 },
          ],
        }).save();
      } catch (_) { /* skip duplicate interviews */ }
    }
  }

  console.log(`   ✅ Created ${appCount} applications`);

  // ── offers ─────────────────────────────────────────────────────────────
  console.log("🎁 Creating Offers...");
  await Offer.insertMany([
    {
      title: "Diwali Hiring Offer",
      description: "Premium Plan ₹5000 → ₹4000. 20% OFF on all recruiter plans!",
      discountPercentage: 20,
      applicablePlan: "Premium",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      title: "Year-End Special",
      description: "Get Diamond Plan at 30% off. Limited time offer!",
      discountPercentage: 30,
      applicablePlan: "Diamond",
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ]);

  // ── courses ────────────────────────────────────────────────────────────
  console.log("📚 Creating Courses...");
  await Course.insertMany([
    { title: "AI/ML Masterclass 2025", platform: "Coursera",      targetSkill: "AI/ML",          url: "https://coursera.org",          discountCode: "JOBSPHERE20" },
    { title: "GenAI for Engineers",    platform: "Great Learning", targetSkill: "GenAI",          url: "https://mygreatlearning.com",   discountCode: "GL10" },
    { title: "Advanced React Patterns",platform: "Udemy",          targetSkill: "React",          url: "https://udemy.com",             discountCode: "REACT50" },
    { title: "Next.js 14 Deep Dive",   platform: "Udemy",          targetSkill: "Next.js",        url: "https://udemy.com",             discountCode: "NEXT30" },
    { title: "AWS Solutions Architect",platform: "Coursera",       targetSkill: "AWS",            url: "https://coursera.org",          discountCode: "AWS25" },
    { title: "Python for Data Science",platform: "Great Learning", targetSkill: "Python",         url: "https://mygreatlearning.com",   discountCode: "" },
    { title: "Docker & Kubernetes",    platform: "Udemy",          targetSkill: "Docker",         url: "https://udemy.com",             discountCode: "DEVOPS40" },
    { title: "TypeScript Masterclass", platform: "Udemy",          targetSkill: "TypeScript",     url: "https://udemy.com",             discountCode: "TS30" },
  ]);

  // ── notifications ──────────────────────────────────────────────────────
  console.log("🔔 Creating Notifications...");
  await Notification.insertMany([
    { targetRole: "All",       title: "🎉 Diwali Offer – 20% OFF",         message: "Premium plan discounted for the festive season. Upgrade now!",   type: "banner" },
    { targetRole: "Recruiter", title: "5 New Applications",                message: "You have 5 new applications for Senior Frontend Engineer.",       type: "popup" },
    { targetRole: "Recruiter", title: "3 Candidates Shortlisted",          message: "AI ranked 3 top candidates for your open roles.",                 type: "popup" },
    { targetRole: "Recruiter", title: "Interview Scheduled",               message: "Arjun Sharma's interview is scheduled for tomorrow at 10:00 AM.", type: "popup" },
    { targetRole: "Candidate", title: "Application Viewed",                message: "A recruiter at Stripe viewed your application!",                  type: "popup" },
    { targetRole: "Candidate", title: "New Job Matches",                   message: "8 new jobs match your profile. Apply now!",                       type: "popup" },
    { targetRole: "Candidate", title: "Profile Strength Tip",              message: "Add your GitHub to improve your profile match score by 12%.",      type: "banner" },
  ]);

  console.log("\n🌱 ─────────────────────────────────────────────────────────");
  console.log("✅  SEED COMPLETE");
  console.log("─────────────────────────────────────────────────────────");
  console.log("   Recruiters: 10  (with login credentials)");
  console.log("   Candidates: 50  (with login credentials)");
  console.log("   Jobs:       20  (status: approved, visible immediately)");
  console.log(`   Applications: ${appCount} (spread across all pipeline stages)`);
  console.log("─────────────────────────────────────────────────────────");
  console.log("🔑 DEMO LOGIN ACCOUNTS:");
  console.log("   Recruiter → recruiter1@stripe.com  / Demo@1234");
  console.log("   Candidate → candidate1@gmail.com   / Demo@1234");
  console.log("   Admin     → admin                  / adminpass");
  console.log("─────────────────────────────────────────────────────────\n");

  process.exit(0);
};

run().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
