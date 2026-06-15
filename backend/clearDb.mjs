import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is required. Load backend/.env or set the variable before running this script.");
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
