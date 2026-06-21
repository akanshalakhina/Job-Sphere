import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "../models/User";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://jobsphereakanshalakhina_db_user:Akansha2323@jobsphere.mqxno6o.mongodb.net/";

const run = async () => {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected");

  const u = await User.findOne({ email: "recruiter1@stripe.com" });
  console.log("User found:", !!u);
  if (u) {
    console.log("clerkId:", u.clerkId);
    console.log("password present:", !!u.password);
    console.log("password starts:", u.password?.substring(0, 7));
    const match = await bcrypt.compare("Demo@1234", u.password || "");
    console.log("bcrypt match Demo@1234:", match);
  }

  process.exit(0);
};

run().catch(console.error);
