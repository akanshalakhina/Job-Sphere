import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageSquareCode, Send, X, Bot, Sparkles } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { chatbotMessages, sendChatbotMessage } = useAppState();
  const chatEndRef = useRef(null);
  const minimumLoadingDelay = () => new Promise(resolve => setTimeout(resolve, 700));

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatbotMessages, isTyping]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const text = inputText.trim();
    setInputText('');
    
    setIsTyping(true);
    const minimumDelay = minimumLoadingDelay();
    try {
      await sendChatbotMessage(text);
    } finally {
      await minimumDelay;
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = async (text) => {
    if (isTyping) return;
    setIsTyping(true);
    const minimumDelay = minimumLoadingDelay();
    try {
      await sendChatbotMessage(text);
    } finally {
      await minimumDelay;
      setIsTyping(false);
    }
  };

  const quickPills = [
    "Scan My Resume",
    "Switch to Recruiter Portal",
    "Open Hackathons Page",
    "Search Stripe Job"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[95] pointer-events-none">
      {/* Expanded Chat Box */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.9 }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            className="pointer-events-auto w-80 md:w-96 h-[480px] rounded-3xl border border-slate-200/80 dark:border-navy-800/50 bg-white/95 dark:bg-navy-950/95 backdrop-blur-2xl shadow-3xl flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-navy-800/80 bg-gradient-to-r from-brand-600 to-indigo-600 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    SphereAI Agent
                    <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                  </p>
                  <p className="text-[10px] text-brand-100">Live Recruiting Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar">
              {chatbotMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-navy-900 text-slate-800 dark:text-slate-200 border border-slate-200/40 dark:border-navy-800 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-56 p-3.5 rounded-2xl bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200/20 dark:border-navy-800 rounded-tl-none">
                    <div className="flex items-center justify-between gap-3 text-[10px] font-bold">
                      <span>SphereAI is typing</span>
                      <span className="text-brand-500 dark:text-brand-400">Live</span>
                    </div>
                    <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-brand-500/10">
                      <span className="ai-loading-bar absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-brand-500 via-indigo-500 to-brand-400" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Pills */}
            <div className="px-4 py-2 border-t border-slate-100 dark:border-navy-900 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth flex-shrink-0 bg-slate-50/50 dark:bg-navy-950/40">
              {quickPills.map(pill => (
                <button
                  key={pill}
                  onClick={() => handleQuickQuestion(pill)}
                  disabled={isTyping}
                  className="text-[10px] font-semibold px-2.5 py-1.5 rounded-full border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:border-brand-500 dark:hover:border-brand-400 hover:text-brand-500 transition-all whitespace-nowrap flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pill}
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <form
              onSubmit={handleSubmit}
              className="p-3 border-t border-slate-100 dark:border-navy-900 bg-white/95 dark:bg-navy-950/95 flex gap-2"
            >
              <input
                type="text"
                placeholder="Ask me anything..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isTyping}
                className="flex-1 bg-slate-50/50 dark:bg-navy-900/50 border border-slate-200 dark:border-navy-800 text-xs px-3.5 py-2.5 rounded-xl outline-none text-slate-800 dark:text-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isTyping || !inputText.trim()}
                className="p-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors flex items-center justify-center shadow-md shadow-brand-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto relative p-4 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 hover:scale-105 active:scale-95 transition-all text-white flex items-center justify-center shadow-xl shadow-brand-500/20 group hover:rotate-6"
      >
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-navy-950 animate-pulse" />
        <MessageSquareCode className="w-5 h-5 text-white" />
      </button>
    </div>
  );
};
