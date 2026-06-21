import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected) return;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("[MongoDB] MONGODB_URI not set — running without database");
    return;
  }

  try {
    await mongoose.connect(uri, { dbName: "jobsphere" });
    isConnected = true;
    console.log("[MongoDB] Connected successfully");
  } catch (err) {
    console.error("[MongoDB] Connection failed:", err);
  }
};

export const isDBConnected = (): boolean => isConnected;

export { mongoose };
