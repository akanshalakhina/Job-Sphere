import { mongoose } from "../lib/mongodb";

const { Schema, model, models } = mongoose;

const OpportunitySchema = new Schema(
  {
    type: {
      type: String,
      enum: ["hackathon", "internship", "competition", "mentorship"],
      required: true,
    },
    title: { type: String, required: true },
    organizer: { type: String, default: "" },
    bannerColor: { type: String, default: "from-brand-500 to-indigo-600" },
    prize: { type: String, default: "" },
    daysLeft: { type: Number, default: 30 },
    status: { type: String, enum: ["open", "closed"], default: "open" },
    skills: [{ type: String }],
    registered: { type: Number, default: 0 },
    description: { type: String, default: "" },
    registeredUsers: [{ type: String }],
  },
  { timestamps: true }
);

export const Opportunity =
  models.Opportunity || model("Opportunity", OpportunitySchema);
