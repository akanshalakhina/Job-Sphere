import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, MessageSquare, Share2, Send, Sparkles, Flame } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';

export const FeedPage = () => {
  const { feedPosts, jobs = [], currentUser, userStats, trendingTags, addPost, likePost, addCommentToPost } = useAppState();
  const { addToast } = useToast();

  const [postText, setPostText] = useState('');
  const [commentInputs, setCommentInputs] = useState({}); // { [postId]: 'text' }
  const [showComments, setShowComments] = useState({}); // { [postId]: true/false }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-400 text-sm">Loading your feed...</p>
      </div>
    );
  }

  const formatCount = (value) => new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0);

  const visibleTrendingTags = trendingTags.length > 0
    ? trendingTags
    : [...new Set(feedPosts.flatMap(post => post.hashtags || []))]
        .slice(0, 12)
        .map(tag => ({ tag, posts: 1, signal: 'loaded_posts' }));

  const hiringInsights = [
    {
      title: `${formatCount(jobs.length)} live roles`,
      desc: jobs.length > 0
        ? `Across ${formatCount(new Set(jobs.map(job => job.company).filter(Boolean)).size)} hiring companies`
        : 'Approved jobs will appear here after recruiters publish them.',
      hot: jobs.length > 0,
    },
    {
      title: `${formatCount(visibleTrendingTags.length)} active skill channels`,
      desc: visibleTrendingTags.length > 0
        ? visibleTrendingTags.slice(0, 3).map(item => item.tag).join(', ')
        : 'Hashtag signals build as the community posts.',
      hot: visibleTrendingTags.length > 0,
    },
    {
      title: `${formatCount(feedPosts.length)} community updates`,
      desc: feedPosts.length > 0
        ? 'Posts, comments, and impressions are tracked from the live feed.'
        : 'The feed is ready for the first candidate or recruiter update.',
      hot: false,
    },
  ];

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    const success = await addPost(postText.trim());
    if (!success) {
      addToast('Unable to publish post right now.', 'error');
      return;
    }
    setPostText('');
    addToast('Post published successfully!', 'success');
  };

  const handleLike = (postId) => {
    likePost(postId);
  };

  const handleCommentSubmit = (e, postId) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text || !text.trim()) return;

    addCommentToPost(postId, text.trim());
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    addToast('Comment published!', 'success');
  };

  const toggleComments = (postId) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Suggested connections — static UI chrome (no mock user data)
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col lg:flex-row gap-8">
      
      {/* Left Sidebar Mini-Profile info card */}
      <aside className="w-full lg:w-64 flex flex-col gap-6 flex-shrink-0">
        
        {/* User Brief profile card */}
        <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 backdrop-blur-xl rounded-3xl p-5 shadow-sm flex flex-col items-center text-center">
          <Link to={`/profile/${currentUser.clerkId || currentUser._id}`} className="flex flex-col items-center">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-14 h-14 rounded-full object-cover border border-slate-200 dark:border-navy-800 mb-3 shadow-md"
            />
            <h3 className="text-xs font-bold text-slate-800 dark:text-white hover:text-brand-500 leading-tight transition-colors">{currentUser.name}</h3>
          </Link>
          <p className="text-[9.5px] text-slate-500 dark:text-slate-400 mt-1 max-w-[180px] leading-snug">{currentUser.title}</p>
          
          <div className="h-px bg-slate-100 dark:bg-navy-800 w-full my-4" />
          
          <div className="flex flex-col gap-2 w-full text-left">
            <div className="flex justify-between text-[10px] font-semibold text-slate-500">
              <span>Profile Views:</span>
              <span className="text-slate-700 dark:text-slate-200 font-extrabold">
                {formatCount(userStats?.profileViews || currentUser.profileViews)}
              </span>
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-500">
              <span>Post Impressions:</span>
              <span className="text-slate-700 dark:text-slate-200 font-extrabold">
                {formatCount(userStats?.postImpressions || currentUser.postImpressions)}
              </span>
            </div>
          </div>
        </div>

        {/* Popular Tags catalog */}
        <div className="border border-slate-200/50 dark:border-navy-800 bg-white/50 dark:bg-navy-900/30 rounded-3xl p-4 flex flex-col gap-3">
          <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Trending Channels</h4>
          <div className="flex flex-wrap gap-1.5">
            {visibleTrendingTags.length > 0 ? (
              visibleTrendingTags.map(({ tag, posts, mlWeight }) => (
                <span
                  key={tag}
                  title={`${posts || 0} posts${mlWeight ? ` · ML weight ${mlWeight}` : ''}`}
                  className="text-[9.5px] font-semibold text-brand-500 hover:underline cursor-pointer"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-[9.5px] font-semibold text-slate-400">No hashtag signals yet</span>
            )}
          </div>
        </div>

      </aside>

      {/* Middle Feed Stream */}
      <div className="flex-grow flex flex-col gap-6 max-w-2xl w-full">
        
        {/* Create Post Card */}
        <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 backdrop-blur-xl rounded-3xl p-4 shadow-sm flex gap-3">
          <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-slate-200/30" />
          <form onSubmit={handlePostSubmit} className="flex-1 flex flex-col gap-3">
            <textarea
              placeholder="Share what is happening, projects updates, or job listings..."
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              rows="3"
              className="w-full bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/60 rounded-2xl p-3 text-xs text-slate-800 dark:text-slate-200 outline-none resize-none focus:border-brand-500"
              required
            />
            <div className="flex justify-between items-center border-t border-slate-100 dark:border-navy-800 pt-2 flex-wrap gap-2">
              <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
                SphereAI posting formats
              </span>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/10 transition-colors flex items-center gap-1"
              >
                Publish Post
              </button>
            </div>
          </form>
        </div>

        {/* Posts Stream */}
        <div className="flex flex-col gap-4">
          {feedPosts.length === 0 && (
            <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-10 text-center">
              <p className="text-slate-400 text-sm font-medium">No posts yet. Be the first to share something!</p>
            </div>
          )}
          <AnimatePresence>
            {feedPosts.map(post => {
              const showCommentBox = showComments[post.id];
              const commentInput = commentInputs[post.id] || '';

              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 backdrop-blur-xl rounded-3xl p-5 shadow-sm flex flex-col gap-4 relative"
                >
                  {/* Post Author info header */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-3">
                      <Link to={`/profile/${post.author.clerkId}`} className="flex-shrink-0">
                        <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover border border-slate-200/35" />
                      </Link>
                      <div>
                        <Link to={`/profile/${post.author.clerkId}`} className="text-xs font-bold text-slate-800 dark:text-white hover:text-brand-500 flex items-center gap-1 transition-colors">
                          <span>{post.author.name}</span>
                          {post.author.isVerified && <span className="w-3.5 h-3.5 bg-brand-500 text-white rounded-full flex items-center justify-center text-[7px] font-bold">✓</span>}
                        </Link>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400">{post.author.title}</p>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium">{post.time}</span>
                  </div>

                  {/* Post Content */}
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  {post.hashtags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {post.hashtags.map(tag => (
                        <span key={tag} className="text-[9px] font-bold text-brand-500 bg-brand-500/10 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="h-px bg-slate-100 dark:bg-navy-800 w-full" />

                  {/* Interaction buttons panel */}
                  <div className="flex items-center gap-6 text-slate-400 text-xs font-bold select-none">
                    <button
                      onClick={() => handleLike(post.id)}
                      className={`flex items-center gap-1.5 hover:text-brand-500 transition-colors ${
                        post.userHasLiked ? 'text-brand-500' : ''
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${post.userHasLiked ? 'fill-current' : ''}`} />
                      <span>{post.likesCount}</span>
                    </button>

                    <button
                      onClick={() => toggleComments(post.id)}
                      className={`flex items-center gap-1.5 hover:text-brand-500 transition-colors ${
                        showCommentBox ? 'text-brand-500 font-semibold' : ''
                      }`}
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.comments.length}</span>
                    </button>

                    <button
                      onClick={() => addToast('Post link copied!', 'success')}
                      className="flex items-center gap-1.5 hover:text-brand-500 transition-colors ml-auto"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Share</span>
                    </button>
                  </div>

                  {/* Comments Drawer Expansion */}
                  {showCommentBox && (
                    <div className="border-t border-slate-100 dark:border-navy-800 pt-4 flex flex-col gap-3">
                      {/* Comments stream */}
                      <div className="flex flex-col gap-2.5 max-h-40 overflow-y-auto no-scrollbar">
                        {post.comments.length > 0 ? (
                          post.comments.map((c, idx) => (
                            <div key={c._id || idx} className="p-3 rounded-2xl bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200/20 dark:border-navy-800 text-[10.5px] leading-relaxed flex gap-2">
                              <span className="font-extrabold text-slate-800 dark:text-white flex-shrink-0">{c.author}:</span>
                              <span className="text-slate-600 dark:text-slate-300">{c.text || c.content}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-[10px] text-slate-400 italic text-center py-2">No comments yet. Write the first!</p>
                        )}
                      </div>

                      {/* Comment Input form */}
                      <form
                        onSubmit={(e) => handleCommentSubmit(e, post.id)}
                        className="flex gap-2 bg-slate-50/50 dark:bg-navy-950/40 p-2 border border-slate-200 dark:border-navy-800 rounded-xl"
                      >
                        <input
                          type="text"
                          placeholder="Write a comment..."
                          value={commentInput}
                          onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                          className="flex-grow bg-transparent text-[11px] px-2 outline-none text-slate-800 dark:text-slate-200 placeholder-slate-400"
                          required
                        />
                        <button
                          type="submit"
                          className="p-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </form>
                    </div>
                  )}

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

      </div>

      {/* Right Sidebar Suggested Connections */}
      <aside className="w-full lg:w-80 flex flex-col gap-6 flex-shrink-0">
        
        {/* Platform hiring insights */}
        <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
            Hiring Insights
          </h4>
          <div className="flex flex-col gap-3">
            {hiringInsights.map((news, i) => (
              <div key={i} className="flex flex-col gap-0.5 group cursor-pointer hover:underline">
                <h5 className="text-[11.5px] font-bold text-slate-800 dark:text-slate-200 leading-snug truncate">
                  {news.hot && <span className="text-rose-500 mr-1">🔥</span>}
                  {news.title}
                </h5>
                <p className="text-[9.5px] text-slate-500 truncate">{news.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Profile visibility signals */}
        <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">Profile Visibility</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50/70 dark:bg-navy-950/40 border border-slate-200/50 dark:border-navy-800 p-3">
              <p className="text-[9px] uppercase font-bold text-slate-400">Views</p>
              <p className="text-base font-extrabold text-slate-800 dark:text-white">{formatCount(userStats?.profileViews || currentUser.profileViews)}</p>
            </div>
            <div className="rounded-2xl bg-slate-50/70 dark:bg-navy-950/40 border border-slate-200/50 dark:border-navy-800 p-3">
              <p className="text-[9px] uppercase font-bold text-slate-400">Impressions</p>
              <p className="text-base font-extrabold text-slate-800 dark:text-white">{formatCount(userStats?.postImpressions || currentUser.postImpressions)}</p>
            </div>
          </div>
          <Link
            to={`/profile/${currentUser.clerkId || currentUser._id}`}
            className="text-[10px] font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            View public profile
          </Link>
        </div>

      </aside>

    </div>
  );
};
