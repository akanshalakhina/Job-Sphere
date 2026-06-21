import { mongoose } from "../lib/mongodb";

const { Schema, model, models } = mongoose;

const CandidateRankingSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    application: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      required: true,
    },
    candidate: { type: Schema.Types.ObjectId, ref: "User", required: true },
    candidateClerkId: { type: String, default: "" },

    // Individual dimension scores (0–100)
    skillsScore: { type: Number, default: 0 },
    experienceScore: { type: Number, default: 0 },
    locationScore: { type: Number, default: 0 },
    semanticScore: { type: Number, default: 0 },

    // Final composite score
    finalScore: { type: Number, default: 0 },

    // Recommendation label
    recommendation: {
      type: String,
      enum: [
        "Highly Recommended",
        "Recommended",
        "Potential Match",
        "Low Match",
      ],
      default: "Low Match",
    },

    // Explainability data
    matchedSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    summary: { type: String, default: "" },

    // Auto-shortlist suggestion
    autoShortlisted: { type: Boolean, default: false },
    shortlistAccepted: { type: Schema.Types.Mixed, default: null },

    // Cache invalidation hashes
    jobHash: { type: String, default: "" },
    candidateHash: { type: String, default: "" },
  },
  { timestamps: true },
);

// Compound unique index: one ranking per application per job
CandidateRankingSchema.index({ job: 1, application: 1 }, { unique: true });

// For ranked retrieval queries
CandidateRankingSchema.index({ job: 1, finalScore: -1 });

// For filtering by recommendation level
CandidateRankingSchema.index({ job: 1, recommendation: 1 });

export const CandidateRanking =
  models.CandidateRanking ||
  model("CandidateRanking", CandidateRankingSchema);
