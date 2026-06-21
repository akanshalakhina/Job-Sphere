import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  recipientId?: string; // If empty, it's a global notification for the targetRole
  targetRole: "Candidate" | "Recruiter" | "All";
  title: string;
  message: string;
  type: "popup" | "banner" | "inbox";
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: String, required: false },
    targetRole: { type: String, enum: ["Candidate", "Recruiter", "All"], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["popup", "banner", "inbox"], default: "inbox" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>("Notification", NotificationSchema);
