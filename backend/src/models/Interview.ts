import { mongoose } from "../lib/mongodb";

const { Schema, model, models } = mongoose;

const InterviewRoundSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["completed", "active", "locked", "scheduled", "cancelled"],
      default: "scheduled",
    },
    order: { type: Number, default: 1 },
    coachPrompt: { type: String, default: "" },
  },
  { _id: true },
);

const InterviewSchema = new Schema(
  {
    candidateName: { type: String, required: true },
    candidateAvatar: { type: String, default: "" },
    candidateClerkId: { type: String, default: "" },
    jobTitle: { type: String, required: true },
    company: { type: String, default: "" },
    recruiterClerkId: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    type: {
      type: String,
      enum: ["Technical", "HR", "Managerial", "Final"],
      default: "Technical",
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    rounds: [InterviewRoundSchema],
    calendar: {
      provider: { type: String, default: "disabled" },
      status: {
        type: String,
        enum: ["synced", "skipped", "failed"],
        default: "skipped",
      },
      eventId: { type: String, default: "" },
      eventUrl: { type: String, default: "" },
      syncedAt: { type: String, default: "" },
      error: { type: String, default: "" },
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

InterviewSchema.index({ candidateClerkId: 1, date: 1 });
InterviewSchema.index({ recruiterClerkId: 1, date: 1 });

export const Interview =
  models.Interview || model("Interview", InterviewSchema);
