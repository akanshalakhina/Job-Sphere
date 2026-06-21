import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Briefcase, FileCode, PieChart } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export const DockNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole } = useAppState();

  const activePath = location.pathname;

  const menuItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Briefcase, label: 'Jobs', path: '/jobs' },
    { icon: FileCode, label: 'AI Analyzer', path: '/analyzer' },
    {
      icon: PieChart,
      label: userRole === 'candidate' ? 'Dashboard' : 'Recruiter',
      path: userRole === 'candidate' ? '/candidate-dashboard' : '/recruiter-dashboard'
    }
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] pointer-events-none w-full max-w-lg px-4 hidden md:block">
      <div className="pointer-events-auto flex items-center justify-between gap-2 p-2 border border-slate-200/50 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/60 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-slate-200/10 dark:shadow-black/40">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = activePath === item.path;

          return (
            <div key={item.path} className="relative group flex flex-col items-center">
              {/* Tooltip */}
              <div className="absolute bottom-14 scale-0 group-hover:scale-100 origin-bottom transition-all duration-200 pointer-events-none z-50">
                <div className="bg-slate-900 dark:bg-navy-950 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap border border-slate-700/35">
                  {item.label}
                </div>
              </div>

              {/* Icon button */}
              <button
                onClick={() => navigate(item.path)}
                className="relative p-3.5 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeDockBubble"
                    className="absolute inset-0 bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/30 rounded-2xl"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 transition-colors duration-300 relative z-10 ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-slate-400 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
