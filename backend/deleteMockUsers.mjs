import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is required. Load backend/.env or set the variable before running this script.");
  process.exit(1);
}

if (process.env.ALLOW_MOCK_USER_DELETE !== "true") {
  console.error(
    "Refusing to delete MongoDB users. This script is disabled by default so client/shared users are not removed accidentally.",
  );
  console.error("For a deliberate local cleanup only, set ALLOW_MOCK_USER_DELETE=true.");
  process.exit(1);
}

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri, { dbName: "jobsphere" });
  console.log("Connected. Deleting mock users...");
  const result = await mongoose.connection.db.collection('users').deleteMany({
    clerkId: { $in: ['candidate_new_id', 'recruiter_new_id', 'candidate_new_id_2', 'recruiter_new_id_2'] }
  });
  console.log(`Deleted ${result.deletedCount} users.`);
  await mongoose.connection.close();
  console.log("Connection closed.");
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
