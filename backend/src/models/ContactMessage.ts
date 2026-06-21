import { mongoose } from "../lib/mongodb";

const { Schema, model, models } = mongoose;

const ContactMessageSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["support", "business"],
      default: "support",
      index: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, index: true },
    message: { type: String, required: true },
    companyName: { type: String, default: "" },
    sourcingNeeds: { type: String, default: "" },
    emailStatus: {
      provider: { type: String, default: "disabled" },
      sent: { type: Boolean, default: false },
      id: { type: String, default: "" },
      error: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

export const ContactMessage =
  models.ContactMessage || model("ContactMessage", ContactMessageSchema);
