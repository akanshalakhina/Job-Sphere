import { mongoose } from "../lib/mongodb";

const { Schema, model, models } = mongoose;

const JobSchema = new Schema(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    logo: { type: String, default: "J" },
    salary: { type: String, default: "" },
    skills: [{ type: String }],
    location: { type: String, default: "" },
    workplace: {
      type: String,
      enum: ["Remote", "Hybrid", "On-site"],
      default: "Hybrid",
    },
    department: { type: String, default: "" },
    experience: { type: String, default: "" },
    description: { type: String, default: "" },
    responsibilities: [{ type: String }],
    recruiter: {
      name: { type: String, default: "" },
      role: { type: String, default: "" },
      avatar: { type: String, default: "" },
      clerkId: { type: String, default: "" },
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    applicants: { type: Number, default: 0 },
    postedBy: { type: Schema.Types.ObjectId, ref: "User" },
    postedTime: { type: String, default: "Just now" },
  },
  { timestamps: true }
);

JobSchema.index({ status: 1, createdAt: -1 });

export const Job = models.Job || model("Job", JobSchema);
