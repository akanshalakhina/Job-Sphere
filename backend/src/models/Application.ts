import { mongoose } from "../lib/mongodb";

const { Schema, model, models } = mongoose;

const ApplicationSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    jobTitle: { type: String, default: "" },
    company: { type: String, default: "" },
    candidate: { type: Schema.Types.ObjectId, ref: "User", required: true },
    candidateClerkId: { type: String, required: true },
    candidateName: { type: String, default: "" },
    candidateEmail: { type: String, default: "" },
    candidateAvatar: { type: String, default: "" },
    resumeUrl: { type: String, default: "" },
    resumeText: { type: String, default: "" },
    atsScore: { type: Number, default: 0 },
    stage: {
      type: String,
      enum: ["Applied", "Screening", "Interview", "Offer", "Rejected"],
      default: "Applied",
    },
    coverLetter: { type: String, default: "" },
    skills: [{ type: String }],
    experience: { type: String, default: "" },
  },
  { timestamps: true }
);

ApplicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
ApplicationSchema.index({ candidateClerkId: 1 });
ApplicationSchema.index({ job: 1, stage: 1 });

export const Application =
  models.Application || model("Application", ApplicationSchema);
