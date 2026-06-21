import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Briefcase, FileCode, MessageSquare, Compass, Sun, Moon, Sparkles, PieChart, ShieldAlert } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAppState } from '../context/AppStateContext';

export const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { toggleTheme, isDark } = useTheme();
  const { userRole, setUserRole } = useAppState();
  const inputRef = useRef(null);

  // Toggle layout on Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Autofocus input
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const commands = [
    { name: 'Navigate: Opportunities Hub', desc: 'Unstop hackathons, internships, events', icon: Compass, action: () => navigate('/opportunities') },
    { name: 'Navigate: Jobs Catalog', desc: 'LinkedIn/Naukri styled modern job postings', icon: Briefcase, action: () => navigate('/jobs') },
    { name: 'Navigate: AI Resume Analyzer', desc: 'State-of-the-art interactive ATS analyzer', icon: FileCode, action: () => navigate('/analyzer') },
    { name: 'Navigate: Community News Feed', desc: 'LinkedIn interactive feed, likes, posts', icon: MessageSquare, action: () => navigate('/feed') },
    {
      name: 'Workspace: Candidate Portal',
      desc: 'ATS score summaries, schedules, recommendations',
      icon: PieChart,
      action: () => { setUserRole('candidate'); navigate('/candidate-dashboard'); }
    },
    {
      name: 'Workspace: Recruiter Suite',
      desc: 'Pipeline boards, candidates filters, calendars',
      icon: Sparkles,
      action: () => { setUserRole('recruiter'); navigate('/recruiter-dashboard'); }
    },
    { name: 'Interface: Toggle Dark/Light Mode', desc: 'Switch app UI theme color scheme', icon: isDark ? Sun : Moon, action: () => toggleTheme() },
  ];

  const filteredCommands = commands.filter(cmd =>
    cmd.name.toLowerCase().includes(query.toLowerCase()) ||
    cmd.desc.toLowerCase().includes(query.toLowerCase())
  );

  const handleCommandClick = (action) => {
    action();
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating badge helper */}
      <div className="fixed top-20 right-6 z-40 hidden lg:block">
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs font-semibold px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/60 backdrop-blur-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-all shadow-md flex items-center gap-1.5"
        >
          <Search className="w-3.5 h-3.5" />
          Quick Actions
          <kbd className="bg-slate-100 dark:bg-navy-800 text-[10px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-navy-700 font-mono select-none">⌘K</kbd>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/40 dark:bg-navy-950/70 backdrop-blur-md"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="relative w-full max-w-lg rounded-3xl border border-slate-200/80 dark:border-navy-800/50 bg-white/95 dark:bg-navy-950/95 backdrop-blur-2xl shadow-3xl overflow-hidden p-4 flex flex-col gap-3"
            >
              {/* Search Bar */}
              <div className="flex items-center gap-3 px-3 py-2 border-b border-slate-100 dark:border-navy-800">
                <Search className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Type a command or query..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 dark:text-slate-100 outline-none placeholder-slate-400 dark:placeholder-slate-500"
                />
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-[10px] font-bold text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-navy-800 rounded px-1.5 py-0.5"
                >
                  ESC
                </button>
              </div>

              {/* Commands Catalog */}
              <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1 no-scrollbar">
                {filteredCommands.length > 0 ? (
                  filteredCommands.map((cmd, index) => {
                    const Icon = cmd.icon;
                    return (
                      <button
                        key={cmd.name}
                        onClick={() => handleCommandClick(cmd.action)}
                        className="w-full flex items-center gap-3 p-3 rounded-2xl text-left hover:bg-slate-100/70 dark:hover:bg-navy-900/60 transition-colors group"
                      >
                        <div className="p-2 rounded-xl bg-slate-100 dark:bg-navy-900 group-hover:bg-brand-500/10 transition-colors flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-brand-500 dark:group-hover:text-brand-400 transition-colors" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{cmd.name}</p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate">{cmd.desc}</p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">No commands found</p>
                    <p className="text-xs text-slate-400 mt-1">Try searching for 'Opportunities', 'Workspace', or 'Theme'</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
