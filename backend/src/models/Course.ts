import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
  title: string;
  platform: string; // e.g., Udemy, Coursera
  targetSkill: string; // e.g., "React", "AI/ML", "Data Science"
  discountCode?: string;
  url: string;
  isActive: boolean;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    platform: { type: String, required: true },
    targetSkill: { type: String, required: true },
    discountCode: { type: String, required: false },
    url: { type: String, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Course = mongoose.model<ICourse>("Course", CourseSchema);
