import mongoose from "mongoose";
import { User } from "../models/User";
import { Job } from "../models/Job";
import { Application } from "../models/Application";
import { Interview } from "../models/Interview";
import { Offer } from "../models/Offer";
import { Course } from "../models/Course";
import { Notification } from "../models/Notification";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://jobsphereakanshalakhina_db_user:Akansha2323@jobsphere.mqxno6o.mongodb.net/";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Connected for Full Seed.");
  } catch (error) {
    console.error("MongoDB Connection Error", error);
    process.exit(1);
  }
};

const firstNames = ["James", "Emma", "Liam", "Olivia", "Noah", "Ava", "William", "Sophia", "Lucas", "Isabella", "Mason", "Mia", "Ethan", "Amelia", "Oliver", "Harper", "Elijah", "Evelyn", "Aiden", "Abigail"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];
const companies = ["Stripe", "Google", "Vercel", "Linear", "Supabase", "Razorpay", "Microsoft", "Amazon", "Apple", "Meta"];
const jobTitles = ["Senior Frontend Engineer", "Backend Developer", "Product Manager", "UI/UX Designer", "DevOps Engineer", "Data Scientist", "Machine Learning Engineer", "Full Stack Developer", "Mobile Developer", "QA Engineer"];
const skills = ["React", "Node.js", "Python", "AWS", "Docker", "TypeScript", "Figma", "SQL", "MongoDB", "GraphQL"];

const randomChoice = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const generateRealisticSeed = async () => {
  await connectDB();

  console.log("Clearing existing data...");
  await User.deleteMany({ role: { $in: ["candidate", "recruiter"] } });
  await Job.deleteMany({});
  await Application.deleteMany({});
  await Interview.deleteMany({});
  
  // Keep the Diwali Offer and Courses since we added them recently
  await Offer.deleteMany({ title: { $ne: "Diwali Hiring Offer" } });
  await Course.deleteMany({ title: { $nin: ["AI/ML Masterclass", "GenAI for Engineers", "Advanced React", "Next.js 14 Deep Dive", "AWS Solutions Architect"] } });

  console.log("Generating 10 Recruiters...");
  const recruiters = [];
  for (let i = 0; i < 10; i++) {
    const fn = randomChoice(firstNames);
    const ln = randomChoice(lastNames);
    const r = new User({
      clerkId: `rec_${i}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@${randomChoice(companies).toLowerCase()}.com`,
      role: "recruiter",
      firstName: fn,
      lastName: ln,
      company: randomChoice(companies),
      isVerified: true,
      bio: "Talent Acquisition Lead",
      avatar: `https://ui-avatars.com/api/?name=${fn}+${ln}&background=random`
    });
    await r.save();
    recruiters.push(r);
  }

  console.log("Generating 20 Candidates...");
  const candidates = [];
  for (let i = 0; i < 20; i++) {
    const fn = randomChoice(firstNames);
    const ln = randomChoice(lastNames);
    const c = new User({
      clerkId: `cand_${i}`,
      email: `${fn.toLowerCase()}.${ln.toLowerCase()}@gmail.com`,
      role: "candidate",
      firstName: fn,
      lastName: ln,
      isVerified: true,
      bio: "Passionate software engineer looking for new opportunities.",
      skills: [randomChoice(skills), randomChoice(skills), randomChoice(skills)],
      avatar: `https://ui-avatars.com/api/?name=${fn}+${ln}&background=random`
    });
    await c.save();
    candidates.push(c);
  }

  console.log("Generating 15 Jobs...");
  const jobs = [];
  for (let i = 0; i < 15; i++) {
    const rec = randomChoice(recruiters);
    const title = randomChoice(jobTitles);
    const j = new Job({
      title: title,
      company: rec.company,
      logo: rec.company ? rec.company.substring(0, 1) : "C",
      salary: `₹${randomInt(10, 30)},00,000 - ₹${randomInt(31, 50)},00,000`,
      skills: [randomChoice(skills), randomChoice(skills)],
      location: "Remote",
      workplace: "Remote",
      department: "Engineering",
      experience: `${randomInt(1, 5)}+ Years`,
      description: `We are looking for a talented ${title} to join our team at ${rec.company}.`,
      responsibilities: ["Develop features", "Review code", "Write tests"],
      recruiter: {
        name: `${rec.firstName} ${rec.lastName}`,
        role: "Recruiter",
        avatar: rec.avatar
      },
      status: "approved",
      applicants: randomInt(10, 100),
      postedTime: `${randomInt(1, 14)} days ago`,
      recruiterId: rec._id
    });
    await j.save();
    jobs.push(j);
  }

  console.log("Generating 50 Applications...");
  const statuses = ["Applied", "Screening", "Interview", "Offer", "Rejected"];
  for (let i = 0; i < 50; i++) {
    const cand = randomChoice(candidates);
    const job = randomChoice(jobs);
    const status = randomChoice(statuses);
    
    // Check if application already exists for this job+cand to avoid uniqueness error
    const existing = await Application.findOne({ job: job._id, candidate: cand._id });
    if (existing) continue;

    const app = new Application({
      job: job._id,
      candidate: cand._id,
      candidateClerkId: cand.clerkId,
      stage: status,
      atsScore: randomInt(60, 99),
      candidateName: `${cand.firstName} ${cand.lastName}`,
      candidateEmail: cand.email,
      candidateAvatar: cand.avatar,
      jobTitle: job.title,
      company: job.company
    });
    await app.save();

    if (status === "Interview") {
      const interviewDate = new Date(Date.now() + randomInt(1, 5) * 24 * 60 * 60 * 1000);
      const interview = new Interview({
        candidateName: `${cand.firstName} ${cand.lastName}`,
        candidateAvatar: cand.avatar,
        candidateClerkId: cand.clerkId,
        jobTitle: job.title,
        company: job.company,
        recruiterClerkId: recruiters.find(r => r._id.toString() === job.recruiterId?.toString())?.clerkId || recruiters[0].clerkId,
        date: interviewDate.toISOString().split("T")[0],
        time: "10:00 AM",
        type: "Technical",
        status: "scheduled",
        notes: "Discuss React and System Design",
        rounds: [{ name: "Technical Round 1", status: "scheduled", order: 1 }]
      });
      await interview.save();
    }
  }

  console.log("Ensuring Offers, Courses and Notifications exist...");
  
  // Offers
  const offerExists = await Offer.findOne({ title: "Diwali Hiring Offer" });
  if (!offerExists) {
    await new Offer({
      title: "Diwali Hiring Offer",
      description: "Premium Plan ₹5000 → ₹4000. 20% OFF",
      discountPercentage: 20,
      applicablePlan: "Premium",
      expiresAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      isActive: true
    }).save();
  }

  // Courses
  const coursesCount = await Course.countDocuments();
  if (coursesCount === 0) {
    await Course.insertMany([
      { title: "AI/ML Masterclass", platform: "Coursera", targetSkill: "AI/ML", url: "https://coursera.org" },
      { title: "GenAI for Engineers", platform: "Great Learning", targetSkill: "GenAI", url: "https://mygreatlearning.com" },
      { title: "Advanced React", platform: "Udemy", targetSkill: "React", url: "https://udemy.com" },
      { title: "Next.js 14 Deep Dive", platform: "Udemy", targetSkill: "Next.js", url: "https://udemy.com" },
      { title: "AWS Solutions Architect", platform: "Coursera", targetSkill: "AWS", url: "https://coursera.org" }
    ]);
  }

  // Notifications
  const notifCount = await Notification.countDocuments();
  if (notifCount === 0) {
    await Notification.insertMany([
      { targetRole: "All", title: "New Festival Discount Available", message: "Get 20% OFF on Premium Plans this Diwali!", type: "banner" },
      { targetRole: "Recruiter", title: "5 New Applications", message: "You have received 5 new applications for Senior Frontend Engineer.", type: "popup" },
      { targetRole: "Recruiter", title: "3 Candidates Shortlisted", message: "AI has successfully shortlisted 3 candidates for your recent job posting.", type: "popup" },
    ]);
  }

  console.log("Database seeded successfully!");
  process.exit(0);
};

generateRealisticSeed();
