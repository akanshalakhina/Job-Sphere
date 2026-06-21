import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Users, Star, Sparkles, Award, Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';

export const OpportunitiesPage = () => {
  const { opportunities, registerForOpportunity } = useAppState();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('all'); // 'all', 'hackathon', 'internship', 'competition', 'mentorship', 'workshop'

  const tabs = [
    { id: 'all', label: 'All Sourcing' },
    { id: 'internship', label: 'Internships' },
    { id: 'hackathon', label: 'Hackathons' },
    { id: 'competition', label: 'Competitions' },
    { id: 'mentorship', label: 'Mentorship' },
    { id: 'workshop', label: 'Workshops' }
  ];

  const filteredOpps = opportunities.filter(opp => {
    if (activeTab === 'all') return true;
    return opp.type === activeTab;
  });

  const handleRegister = async (oppId, title) => {
    const success = await registerForOpportunity(oppId, title);
    if (success) {
      addToast(`Successfully registered for ${title}!`, 'success');
    } else {
      addToast(`Already registered or login required.`, 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-8 z-10 relative">
      
      {/* Headings */}
      <div className="text-center flex flex-col items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
          <Award className="w-3.5 h-3.5" />
          Unstop Sourcing Platform
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 dark:text-white leading-tight">Student Opportunities</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mt-0.5 leading-relaxed">
          Participate in premier technical challenges, webinars, and mentorship courses sponsored by leading tech companies.
        </p>
      </div>

      {/* Tab Switchers */}
      <div className="flex border-b border-slate-200 dark:border-navy-800 gap-1 overflow-x-auto no-scrollbar scroll-smooth">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-xs font-bold transition-all relative border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'text-brand-500 border-brand-500 font-extrabold'
                : 'text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOpps.length === 0 && (
          <div className="col-span-full border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-14 text-center">
            <p className="text-slate-400 text-sm font-medium">No opportunities available yet. Check back soon!</p>
          </div>
        )}
        <AnimatePresence mode="popLayout">
          {filteredOpps.map(opp => (
            <motion.div
              key={opp.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 250 }}
              className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 backdrop-blur-xl rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-brand-500/30 dark:hover:border-brand-400/30 hover:scale-[1.01] transition-all duration-300 relative group"
            >
              
              {/* Highlight gradient banner */}
              <div className={`h-24 bg-gradient-to-tr ${opp.bannerColor} relative p-4 flex flex-col justify-between text-white`}>
                <div className="glow-mesh glow-purple top-0 right-0 w-24 h-24 opacity-35" />
                <span className="text-[9px] uppercase font-extrabold tracking-widest px-2 py-0.5 rounded bg-white/20 border border-white/10 max-w-fit">{opp.type}</span>
                <h4 className="text-xs font-bold text-white truncate drop-shadow-sm">{opp.title}</h4>
              </div>

              {/* Card Details Body */}
              <div className="p-5 flex flex-col gap-4 flex-1 justify-between">
                
                {/* Organizer details */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Organizer</p>
                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[180px] mt-0.5">{opp.organizer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Incentive</p>
                    <p className="text-xs font-extrabold text-brand-500 truncate mt-0.5">{opp.prize}</p>
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-navy-800 w-full" />

                {/* Sourcing skills requirements */}
                <div className="flex flex-col gap-1.5">
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Required competencies</p>
                  <div className="flex flex-wrap gap-1.5">
                    {opp.skills.map(s => (
                      <span key={s} className="text-[8.5px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-950 text-slate-500 dark:text-slate-400 border border-slate-200/20">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-slate-100 dark:bg-navy-800 w-full" />

                {/* Bottom Registration details & CTA */}
                <div className="flex items-center justify-between gap-4 mt-2">
                  <div className="flex items-center gap-3 text-[9px] font-bold text-slate-500 dark:text-slate-500">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-400" /> {opp.registered} Sourced</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {opp.daysLeft}d left</span>
                  </div>

                  <button
                    onClick={() => handleRegister(opp.id || opp._id, opp.title)}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-md shadow-brand-500/10 hover:scale-[1.02] transition-all"
                  >
                    Register
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
};
