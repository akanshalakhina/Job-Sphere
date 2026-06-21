import { mongoose } from "../lib/mongodb";

const { Schema, model, models } = mongoose;

const CommentSchema = new Schema(
  {
    author: { type: String, required: true },
    authorAvatar: { type: String, default: "" },
    content: { type: String, required: true },
    time: { type: String, default: "Just now" },
  },
  { timestamps: true }
);

const PostSchema = new Schema(
  {
    author: {
      name: { type: String, required: true },
      title: { type: String, default: "" },
      avatar: { type: String, default: "" },
      clerkId: { type: String, default: "" },
      isVerified: { type: Boolean, default: false },
    },
    content: { type: String, required: true },
    media: { type: String, default: "" },
    hashtags: [{ type: String, index: true }],
    impressions: { type: Number, default: 0 },
    likes: [{ type: String }],
    likesCount: { type: Number, default: 0 },
    comments: [CommentSchema],
    time: { type: String, default: "Just now" },
  },
  { timestamps: true }
);

PostSchema.index({ hashtags: 1, createdAt: -1 });
PostSchema.index({ "author.clerkId": 1, createdAt: -1 });

export const Post = models.Post || model("Post", PostSchema);
