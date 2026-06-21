import fs from "fs";
import path from "path";

async function investigate() {
  console.log("=== Environment Investigation ===\n");
  
  // 1 & 2 & 6: Current working directory and .env absolute path
  const cwd = process.cwd();
  console.log(`Current Working Directory: ${cwd}`);
  const envPath = path.join(cwd, ".env");
  console.log(`Expected .env file absolute path: ${envPath}`);
  
  if (fs.existsSync(envPath)) {
    console.log(`File exists at absolute path: Yes`);
  } else {
    console.log(`File exists at absolute path: No`);
  }
  
  console.log("\n3. Variables Defined Status:");
  const varsToCheck = [
    "MONGODB_URI",
    "OPENAI_API_KEY",
    "GEMINI_API_KEY",
    "CLERK_SECRET_KEY",
    "CLERK_PUBLISHABLE_KEY",
    "RESEND_API_KEY",
    "GMAIL_USER"
  ];
  
  for (const v of varsToCheck) {
    const val = process.env[v];
    let loaded = "No";
    if (val !== undefined && val !== "") {
      loaded = "Yes";
      if (val.startsWith("<") && val.endsWith(">")) {
        loaded += ` (But value is a literal placeholder string: '${val}')`;
      }
    }
    console.log(`   * ${v}: Loaded = ${loaded}`);
  }

  // 7. MongoDB Information
  console.log("\nMongoDB Details:");
  const uri = process.env.MONGODB_URI;
  if (uri) {
    // extract username from mongodb+srv://username:password@cluster...
    const match = uri.match(/mongodb\+srv:\/\/([^:]+):/);
    if (match && match[1]) {
      console.log(`   Exact Username being used: ${match[1]}`);
    } else {
      console.log(`   Could not parse username from URI.`);
    }
  } else {
    console.log("   MONGODB_URI is not loaded.");
  }
}

investigate();
