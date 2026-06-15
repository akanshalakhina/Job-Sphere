import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is required. Load backend/.env or set the variable before running this script.");
  process.exit(1);
}

if (
  process.env.ALLOW_DATABASE_RESET !== "true" ||
  process.env.CONFIRM_DATABASE_RESET !== "DELETE ALL JOBSPHERE DATA"
) {
  console.error(
    "Refusing to clear MongoDB data. This script is disabled by default so client/shared data is not deleted accidentally.",
  );
  console.error(
    "For a deliberate local reset only, set ALLOW_DATABASE_RESET=true and CONFIRM_DATABASE_RESET=\"DELETE ALL JOBSPHERE DATA\".",
  );
  process.exit(1);
}

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(uri, { dbName: "jobsphere" });
  console.log("Connected. Clearing mock collections...");

  const collections = ["jobs", "posts", "opportunities", "interviews", "applications", "users"];
  for (const name of collections) {
    try {
      const result = await mongoose.connection.db.collection(name).deleteMany({});
      console.log(`Cleared collection '${name}': deleted ${result.deletedCount} documents.`);
    } catch (e) {
      console.log(`Collection '${name}' could not be cleared:`, e.message);
    }
  }

  await mongoose.connection.close();
  console.log("Database cleanup complete. Connection closed.");
}

run().catch(err => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
