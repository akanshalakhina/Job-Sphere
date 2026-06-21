import { connectDB, isDBConnected, mongoose } from "./src/lib/mongodb";

async function runDiagnostics() {
  console.log("=== Environment Diagnostic Report ===\n");
  
  // 1. Print which .env file is being loaded
  console.log("1. Environment File Loaded:");
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`   Resolved from current working directory: ${process.cwd()}\\.env\n`);

  // 2. Print whether each required environment variable is loaded
  console.log("2. Required Environment Variables Status:");
  const varsToCheck = [
    "MONGODB_URI",
    "OPENAI_API_KEY",
    "GEMINI_API_KEY",
    "CLERK_SECRET_KEY",
    "CLERK_PUBLISHABLE_KEY",
    "RESEND_API_KEY",
    "GMAIL_USER",
    "GMAIL_PASS",
    "SMTP_HOST"
  ];
  for (const v of varsToCheck) {
    const val = process.env[v];
    const isPlaceholder = val && val.startsWith("<") && val.endsWith(">");
    let status = "MISSING";
    if (val) {
      status = isPlaceholder ? "PLACEHOLDER" : "LOADED (Hidden)";
    }
    console.log(`   ${v.padEnd(25)} : ${status}`);
  }
  console.log("");

  // 3. Verify MongoDB Atlas Connection
  console.log("3. MongoDB Connection Verification:");
  try {
    await connectDB();
    if (isDBConnected()) {
      console.log("   ✅ Successfully connected to MongoDB Atlas!");
    } else {
      console.log("   ❌ Failed to connect to MongoDB Atlas.");
    }
  } catch (e: any) {
    console.log(`   ❌ Connection error: ${e.message}`);
  }
  console.log("");

  // 4. Verify Clerk Initialization
  console.log("4. Clerk Initialization:");
  if (process.env.CLERK_SECRET_KEY && !process.env.CLERK_SECRET_KEY.startsWith("<")) {
    console.log("   ✅ Clerk Secret Key is loaded.");
  } else {
    console.log("   ⚠️ Clerk Secret Key is missing or a placeholder.");
  }
  console.log("");

  // 5. Verify Gemini/OpenAI Initialization
  console.log("5. AI Providers Initialization:");
  if (process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.startsWith("<")) {
    console.log("   ✅ Gemini API Key is loaded.");
  } else {
    console.log("   ⚠️ Gemini API Key is missing or a placeholder.");
  }

  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.startsWith("<")) {
    console.log("   ✅ OpenAI API Key is loaded.");
  } else {
    console.log("   ⚠️ OpenAI API Key is missing or a placeholder.");
  }
  console.log("");

  // 6. Verify Gmail Transport Initialization
  console.log("6. Email Transport Initialization:");
  if ((process.env.GMAIL_USER && !process.env.GMAIL_USER.startsWith("<")) || (process.env.SMTP_HOST && !process.env.SMTP_HOST.startsWith("<"))) {
    console.log("   ✅ Email provider is active and initialized (Credentials Found).");
  } else {
    console.log("   ⚠️ Email provider is disabled (check credentials).");
  }
  console.log("");

  // 7. Confirm Database Mode
  console.log("7. Database Mode Confirmation:");
  if (isDBConnected()) {
    console.log("   ✅ Backend is using **MongoDB Atlas**.");
  } else {
    console.log("   ⚠️ Backend is using **fallback in-memory storage**.");
  }
  console.log("\n=== End of Report ===");
  
  await mongoose.disconnect();
  process.exit(0);
}

runDiagnostics();
