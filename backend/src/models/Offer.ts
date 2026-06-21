import mongoose, { Schema, Document } from "mongoose";

export interface IOffer extends Document {
  title: string;
  description: string;
  discountPercentage: number;
  applicablePlan: string; // e.g., "Basic Plan", "Premium Plan", "All"
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    discountPercentage: { type: Number, required: true },
    applicablePlan: { type: String, default: "All" },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Offer = mongoose.model<IOffer>("Offer", OfferSchema);
