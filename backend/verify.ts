import { connectDB, isDBConnected, mongoose } from "./src/lib/mongodb";
import { User } from "./src/models/User";
import { Job } from "./src/models/Job";

async function run() {
  await connectDB();
  if (!isDBConnected()) {
    console.error("Failed to connect to MongoDB");
    process.exit(1);
  }

  try {
    // 1. Create a test candidate
    const candidateId = `cand_${Date.now()}`;
    const candidate = await User.create({
      clerkId: candidateId,
      email: `test_candidate_${Date.now()}@example.com`,
      role: "candidate",
      name: "Test Candidate",
      onboarded: true,
      skills: ["React", "Node.js"],
      experience: "2 years",
    });
    console.log("Created Test Candidate:", candidate.email);

    // 2. Create a test recruiter
    const recruiterId = `rec_${Date.now()}`;
    const recruiter = await User.create({
      clerkId: recruiterId,
      email: `test_recruiter_${Date.now()}@example.com`,
      role: "recruiter",
      name: "Test Recruiter",
      companyName: "Acme Corp",
      onboarded: true,
    });
    console.log("Created Test Recruiter:", recruiter.email);

    // 3. Create a test job
    const job = await Job.create({
      title: "Test Software Engineer",
      company: "Acme Corp",
      location: "Remote",
      salary: "$100k - $120k",
      type: "Full-time",
      department: "Engineering",
      workplace: "Remote",
      experience: "Entry Level",
      skills: ["React", "Node.js"],
      description: "A test job for testing MongoDB Atlas persistence.",
      recruiter: {
        name: recruiter.name,
        role: "Technical Recruiter",
        clerkId: recruiter.clerkId,
      },
      status: "approved",
    });
    console.log("Created Test Job:", job.title);

    console.log("\n--- Verification ---");
    const candCount = await User.countDocuments({ email: candidate.email });
    const recCount = await User.countDocuments({ email: recruiter.email });
    const jobCount = await Job.countDocuments({ title: "Test Software Engineer" });

    console.log(`Candidate count in DB: ${candCount}`);
    console.log(`Recruiter count in DB: ${recCount}`);
    console.log(`Job count in DB:       ${jobCount}`);
    console.log("Records saved successfully in MongoDB Atlas.");

  } catch (err) {
    console.error("Error creating records:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  }
}

run();
