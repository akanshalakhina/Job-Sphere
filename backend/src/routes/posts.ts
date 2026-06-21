import { Router } from "express";
import { requireAuth, getRequestUserId } from "../middlewares/requireAuth";
import { Post } from "../models/Post";
import { User } from "../models/User";
import { isDBConnected } from "../lib/mongodb";
import { getMemPosts, createMemPost, toggleMemPostLike, addMemPostComment, getMemTrendingTags } from "../lib/memoryDb";

const router = Router();

const extractHashtags = (content: string): string[] => {
  const matches = content.match(/#[A-Za-z0-9_]+/g) || [];
  return [...new Set(matches.map((tag) => tag.toLowerCase()))];
};

router.get("/posts", async (req, res) => {
  if (!isDBConnected()) {
    res.json([]);
    return;
  }
  try {
    const postDocs = await Post.find().sort({ createdAt: -1 }).limit(30);
    const posts = postDocs.map((post: any) => post.toObject());
    const postIds = posts.map((post: any) => post._id);
    const authorImpressions = new Map<string, number>();

    for (const post of posts) {
      const authorId = post.author?.clerkId;
      if (authorId) {
        authorImpressions.set(authorId, (authorImpressions.get(authorId) || 0) + 1);
      }
    }

    if (postIds.length > 0) {
      await Post.updateMany({ _id: { $in: postIds } }, { $inc: { impressions: 1 } });
    }
    if (authorImpressions.size > 0) {
      await User.bulkWrite(
        [...authorImpressions.entries()].map(([clerkId, count]) => ({
          updateOne: {
            filter: { clerkId },
            update: { $inc: { postImpressions: count } },
          },
        })),
      );
    }

    res.json(
      posts.map((post: any) => ({
        ...post,
        impressions: (post.impressions || 0) + 1,
      })),
    );
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

router.get("/posts/trending-tags", async (_req, res) => {
  if (!isDBConnected()) {
    res.json([]);
    return;
  }

  try {
    const tags = await Post.aggregate([
      { $unwind: "$hashtags" },
      {
        $group: {
          _id: "$hashtags",
          posts: { $sum: 1 },
          impressions: { $sum: "$impressions" },
        },
      },
      { $sort: { posts: -1, impressions: -1 } },
      { $limit: 12 },
    ]);

    res.json(
      tags.map((tag: any) => ({
        tag: tag._id,
        posts: tag.posts,
        impressions: tag.impressions,
        mlWeight: Number((tag.posts * 1.5 + tag.impressions * 0.1).toFixed(2)),
        signal: "post_hashtag_frequency",
      })),
    );
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch trending tags" });
  }
});

router.post("/posts", requireAuth, async (req, res) => {
  if (!isDBConnected()) {
    const user = { name: "Mock User", avatar: "", clerkId: req.body.userId || "mock_user", isVerified: false };
    const post = createMemPost({ _id: "post_" + Date.now(), author: user, content: req.body.content, media: req.body.media || "", hashtags: extractHashtags(req.body.content), impressions: 0, likes: [], likesCount: 0, comments: [], time: "Just now" });
    res.status(201).json(post);
    return;
  }
  const userId = getRequestUserId(req);
  const { content, media } = req.body;
  if (!content?.trim()) {
    res.status(400).json({ error: "Content is required" });
    return;
  }
  try {
    const user = await User.findOne({ clerkId: userId });
    const hashtags = extractHashtags(content);
    const post = await Post.create({
      author: {
        name: user?.name || "Anonymous",
        title: user?.title || "",
        avatar: user?.avatar || "",
        clerkId: userId,
        isVerified: user?.isVerified || false,
      },
      content,
      media: media || "",
      hashtags,
      impressions: 0,
      likes: [],
      likesCount: 0,
      comments: [],
      time: "Just now",
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to create post" });
  }
});

router.post("/posts/:id/like", requireAuth, async (req, res) => {
  if (!isDBConnected()) {
    const resLike = toggleMemPostLike(req.params.id as string, getRequestUserId(req) as string);
    if (!resLike) { res.status(404).json({ error: "Post not found" }); return; }
    res.json(resLike);
    return;
  }
  const userId = getRequestUserId(req);
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    const hasLiked = post.likes.includes(userId as never);
    if (hasLiked) {
      post.likes = post.likes.filter((id: any) => id !== userId) as never;
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.likes.push(userId as never);
      post.likesCount += 1;
    }
    await post.save();
    res.json({ liked: !hasLiked, likesCount: post.likesCount });
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

router.post("/posts/:id/comment", requireAuth, async (req, res) => {
  if (!isDBConnected()) {
    const resComm = addMemPostComment(req.params.id as string, { author: "Mock User", authorAvatar: "", content: req.body.content, time: "Just now" });
    if (!resComm) { res.status(404).json({ error: "Post not found" }); return; }
    res.json(resComm);
    return;
  }
  const userId = getRequestUserId(req);
  const { content } = req.body;
  if (!content?.trim()) {
    res.status(400).json({ error: "Comment content is required" });
    return;
  }
  try {
    const user = await User.findOne({ clerkId: userId });
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            author: user?.name || "Anonymous",
            authorAvatar: user?.avatar || "",
            content,
            time: "Just now",
          },
        },
      },
      { new: true }
    );
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment" });
  }
});

export default router;
