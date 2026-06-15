import { mongoose } from "../lib/mongodb";

const { Schema, model, models } = mongoose;

const UserSchema = new Schema(
  {
    clerkId: { type: String, required: false },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false },
    name: { type: String, default: "" },
    avatar: { type: String, default: "" },
    role: {
      type: String,
      enum: ["candidate", "recruiter", "admin"],
      default: "candidate",
    },
    title: { type: String, default: "" },
    bio: { type: String, default: "" },
    skills: [{ type: String }],
    softSkills: [{ type: String }],
    experience: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    atsScore: { type: Number, default: 0 },
    resumeDetails: { type: Schema.Types.Mixed, default: null },
    profileViews: { type: Number, default: 0 },
    postImpressions: { type: Number, default: 0 },
    viewedTags: [{ type: String }],
    subscriptionTier: {
      type: String,
      enum: ["free", "gold", "platinum", "diamond"],
      default: "free",
    },
    company: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    graduationYear: { type: Schema.Types.Mixed, default: "" },
    college: { type: String, default: "" },
    degree: { type: String, default: "" },
    companyName: { type: String, default: "" },
    industry: { type: String, default: "" },
    companySize: { type: Schema.Types.Mixed, default: "" },
    logo: { type: String, default: "" },
    website: { type: String, default: "" },
    description: { type: String, default: "" },
    onboarded: { type: Boolean, default: false },
    savedJobs: [{ type: Schema.Types.ObjectId, ref: "Job" }],
  },
  { timestamps: true }
);

UserSchema.index({ clerkId: 1 });
UserSchema.index({ skills: 1 });

export const User = models.User || model("User", UserSchema);
