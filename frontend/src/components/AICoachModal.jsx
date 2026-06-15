import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, Bot, Sparkles } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export const AICoachModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { id: 'msg-1', sender: 'ai', text: 'Hi! I am your AI Interview Coach. I can help you practice for technical interviews, behavioral questions, and system design. What role are you preparing for?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const { apiFetch } = useAppState();
  const minimumLoadingDelay = () => new Promise(resolve => setTimeout(resolve, 700));

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg = { id: `user-${Date.now()}`, sender: 'user', text: inputText.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    const minimumDelay = minimumLoadingDelay();

    try {
      const history = messages.map(m => ({ sender: m.sender, text: m.text }));
      const res = await apiFetch('/api/ai-coach', {
        method: 'POST',
        body: JSON.stringify({ message: userMsg.text, history }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg = { id: `ai-${Date.now()}`, sender: 'ai', text: data.reply };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const fallbackText = generateMockCoachResponse(userMsg.text);
        setMessages(prev => [...prev, { id: `ai-${Date.now()}`, sender: 'ai', text: fallbackText }]);
      }
    } catch {
      const fallbackText = generateMockCoachResponse(userMsg.text);
      setMessages(prev => [...prev, { id: `ai-${Date.now()}`, sender: 'ai', text: fallbackText }]);
    } finally {
      await minimumDelay;
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <motion.div
            data-testid="ai-coach-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg rounded-3xl border border-slate-200/80 dark:border-navy-800/50 bg-white/95 dark:bg-navy-950/95 backdrop-blur-2xl shadow-3xl flex flex-col overflow-hidden"
          >
            <div className="p-4 border-b border-slate-100 dark:border-navy-800/80 bg-gradient-to-r from-brand-600 to-indigo-600 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold flex items-center gap-1.5">
                    AI Interview Coach
                    <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                  </p>
                  <p className="text-[10px] text-brand-100">Mock Interview Practice</p>
                </div>
              </div>
              <button
                data-testid="close-modal-btn"
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 no-scrollbar max-h-96">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  data-testid={msg.sender === 'user' ? 'chat-message-user' : 'chat-message-ai'}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-none'
                        : 'bg-slate-100 dark:bg-navy-900 text-slate-800 dark:text-slate-200 border border-slate-200/40 dark:border-navy-800 rounded-tl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="w-60 p-3.5 rounded-2xl bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-300 border border-slate-200/20 dark:border-navy-800 rounded-tl-none">
                    <div className="flex items-center justify-between gap-3 text-[10px] font-bold">
                      <span>AI Coach is preparing feedback</span>
                      <span className="text-brand-500 dark:text-brand-400">Thinking</span>
                    </div>
                    <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-brand-500/10">
                      <span className="ai-loading-bar absolute inset-y-0 left-0 w-1/2 rounded-full bg-gradient-to-r from-brand-500 via-indigo-500 to-brand-400" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="p-3 border-t border-slate-100 dark:border-navy-900 bg-white/95 dark:bg-navy-950/95 flex gap-2">
              <input
                data-testid="ai-coach-chat-input"
                type="text"
                placeholder="Type your interview response or question..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isLoading}
                className="flex-1 bg-slate-50/50 dark:bg-navy-900/50 border border-slate-200 dark:border-navy-800 text-xs px-3.5 py-2.5 rounded-xl outline-none text-slate-800 dark:text-slate-200 focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 disabled:opacity-50"
              />
              <button
                data-testid="ai-coach-send-btn"
                type="submit"
                disabled={isLoading || !inputText.trim()}
                className="p-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors flex items-center justify-center shadow-md shadow-brand-500/10 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const generateMockCoachResponse = (text) => {
  const query = text.toLowerCase();
  if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
    return "Hello! I'm your AI Interview Coach. I can help you practice for technical interviews, behavioral questions, and system design rounds. What role are you preparing for?";
  }
  if (query.includes("behavioral") || query.includes("tell me about yourself")) {
    return "Great question! When answering 'Tell me about yourself', structure your response as: 1) Current role and key responsibilities, 2) Past experience that led you here, 3) What you're looking for next. Keep it under 2 minutes. Want to practice your response?";
  }
  if (query.includes("technical") || query.includes("coding") || query.includes("leetcode")) {
    return "For technical interviews, focus on: 1) Understanding the problem before coding, 2) Communicating your approach clearly, 3) Optimizing time and space complexity. Common topics include arrays, graphs, dynamic programming, and system design. What specific topic would you like to practice?";
  }
  if (query.includes("system design")) {
    return "For system design interviews, follow this framework: 1) Clarify requirements and constraints, 2) Estimate scale (traffic, storage), 3) Design high-level components, 4) Dive into key components, 5) Identify bottlenecks and trade-offs. Want to try designing a specific system like a URL shortener or chat application?";
  }
  if (query.includes("feedback") || query.includes("improve")) {
    return "Here are common interview improvement areas: 1) Practice thinking out loud - interviewers want to understand your thought process, 2) Use the STAR method (Situation, Task, Action, Result) for behavioral questions, 3) Ask clarifying questions before diving into solutions, 4) Review data structures and algorithms fundamentals.";
  }
  return "I'm here to help you ace your interviews! Try asking about: behavioral questions, technical prep, system design, or say 'practice' to start a mock interview session. What would you like to work on?";
};
