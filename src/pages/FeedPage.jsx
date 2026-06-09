import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ThumbsUp, MessageSquare, Share2, Send, Star, Sparkles, Plus, Award, UserCheck, Flame } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';

export const FeedPage = () => {
  const { feedPosts, currentUser, addPost, likePost, addCommentToPost } = useAppState();
  const { addToast } = useToast();

  const [postText, setPostText] = useState('');
  const [commentInputs, setCommentInputs] = useState({}); // { [postId]: 'text' }
  const [showComments, setShowComments] = useState({}); // { [postId]: true/false }

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!postText.trim()) return;

    addPost(postText.trim());
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

  // Mock suggested connections list
  const suggestedConnections = [
    { name: "Alisha Sharma", role: "Design Lead at Linear", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150" },
    { name: "Robert Kowalski", role: "Principal Engineer at Google", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150" },
    { name: "Kamil Bednarek", role: "Staff Frontend Vercel", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col lg:flex-row gap-8">
      
      {/* Left Sidebar Mini-Profile info card */}
      <aside className="w-full lg:w-64 flex flex-col gap-6 flex-shrink-0">
        
        {/* User Brief profile card */}
        <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 backdrop-blur-xl rounded-3xl p-5 shadow-sm flex flex-col items-center text-center">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-14 h-14 rounded-full object-cover border border-slate-200 dark:border-navy-850 mb-3 shadow-md"
          />
          <h3 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{currentUser.name}</h3>
          <p className="text-[9.5px] text-slate-450 dark:text-slate-400 mt-1 max-w-[180px] leading-snug">{currentUser.title}</p>
          
          <div className="h-px bg-slate-100 dark:bg-navy-850 w-full my-4" />
          
          <div className="flex flex-col gap-2 w-full text-left">
            <div className="flex justify-between text-[10px] font-semibold text-slate-450">
              <span>Profile Views:</span>
              <span className="text-slate-700 dark:text-slate-200 font-extrabold">240</span>
            </div>
            <div className="flex justify-between text-[10px] font-semibold text-slate-455">
              <span>Post Impressions:</span>
              <span className="text-slate-700 dark:text-slate-200 font-extrabold">1,450</span>
            </div>
          </div>
        </div>

        {/* Popular Tags catalog */}
        <div className="border border-slate-200/50 dark:border-navy-850 bg-white/50 dark:bg-navy-900/30 rounded-3xl p-4 flex flex-col gap-3">
          <h4 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Trending Channels</h4>
          <div className="flex flex-wrap gap-1.5">
            {["#React19", "#GenerativeAI", "#LinearDesign", "#StripeSaaS", "#ATSScans", "#VercelNext"].map(tag => (
              <span key={tag} className="text-[9.5px] font-semibold text-brand-500 hover:underline cursor-pointer">{tag}</span>
            ))}
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
            <div className="flex justify-between items-center border-t border-slate-100 dark:border-navy-850 pt-2 flex-wrap gap-2">
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
                      <img src={post.author.avatar} alt={post.author.name} className="w-10 h-10 rounded-full object-cover border border-slate-200/35" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-850 dark:text-white flex items-center gap-1">
                          {post.author.name}
                          {post.author.isVerified && <span className="w-3.5 h-3.5 bg-brand-500 text-white rounded-full flex items-center justify-center text-[7px] font-bold">✓</span>}
                        </h4>
                        <p className="text-[9px] text-slate-450 dark:text-slate-400">{post.author.title}</p>
                      </div>
                    </div>
                    <span className="text-[9px] text-slate-400 font-medium">{post.time}</span>
                  </div>

                  {/* Post Content */}
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                  <div className="h-px bg-slate-100 dark:bg-navy-850 w-full" />

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
                    <div className="border-t border-slate-100 dark:border-navy-850 pt-4 flex flex-col gap-3">
                      {/* Comments stream */}
                      <div className="flex flex-col gap-2.5 max-h-40 overflow-y-auto no-scrollbar">
                        {post.comments.length > 0 ? (
                          post.comments.map(c => (
                            <div key={c.id} className="p-3 rounded-2xl bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200/20 dark:border-navy-800 text-[10.5px] leading-relaxed flex gap-2">
                              <span className="font-extrabold text-slate-800 dark:text-white flex-shrink-0">{c.author}:</span>
                              <span className="text-slate-600 dark:text-slate-350">{c.text}</span>
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
        
        {/* Sourcing News ticker */}
        <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
            Trending Industry News
          </h4>
          <div className="flex flex-col gap-3">
            {[
              { title: "React 19 Server Actions deep dive", desc: "Why linear workflows are replacing REST", hot: true },
              { title: "Framer Motion View Transitions", desc: "Building Apple-like fluid screens", hot: false },
              { title: "SaaS Placement statistics 2026", desc: "AI-shortlisted placements grew 40%", hot: false }
            ].map((news, i) => (
              <div key={i} className="flex flex-col gap-0.5 group cursor-pointer hover:underline">
                <h5 className="text-[11.5px] font-bold text-slate-800 dark:text-slate-200 leading-snug truncate">
                  {news.hot && <span className="text-rose-500 mr-1">🔥</span>}
                  {news.title}
                </h5>
                <p className="text-[9.5px] text-slate-450 truncate">{news.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested connections list */}
        <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white">People you may know</h4>
          <div className="flex flex-col gap-3.5">
            {suggestedConnections.map((user, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-slate-800 dark:text-white truncate">{user.name}</p>
                    <p className="text-[9px] text-slate-450 truncate leading-none mt-0.5">{user.role}</p>
                  </div>
                </div>

                <button
                  onClick={() => addToast(`Connection request sent to ${user.name}!`, 'success')}
                  className="p-1.5 rounded-lg border border-slate-250 dark:border-navy-800 hover:bg-slate-100 dark:hover:bg-navy-800/40 text-slate-500 hover:text-brand-500 dark:text-slate-350 dark:hover:text-white transition-all flex items-center justify-center flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </aside>

    </div>
  );
};
