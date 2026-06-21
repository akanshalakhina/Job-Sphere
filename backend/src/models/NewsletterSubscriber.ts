import { mongoose } from "../lib/mongodb";

const { Schema, model, models } = mongoose;

const NewsletterSubscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    source: { type: String, default: "footer" },
    status: {
      type: String,
      enum: ["subscribed", "unsubscribed"],
      default: "subscribed",
      index: true,
    },
    emailStatus: {
      provider: { type: String, default: "disabled" },
      sent: { type: Boolean, default: false },
      id: { type: String, default: "" },
      error: { type: String, default: "" },
    },
  },
  { timestamps: true },
);

export const NewsletterSubscriber =
  models.NewsletterSubscriber ||
  model("NewsletterSubscriber", NewsletterSubscriberSchema);
