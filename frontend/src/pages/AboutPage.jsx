import React from 'react';
import { Sparkles, Heart, Shield, Globe, Award, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from '../components/ImageWithFallback';

export const AboutPage = () => {
  
  const values = [
    { icon: Heart, title: "Candidate-First", desc: "We build actionable, transparent optimizer tools that empower rather than automate." },
    { icon: Shield, title: "Algorithmic Equity", desc: "No generic black-box filters. Our calculations benchmark qualifications explicitly." },
    { icon: Globe, title: "Connected Sourcing", desc: "Fusing hackathons, social professional feed groups, and recruiter tools." }
  ];

  const milestones = [
    { year: "2024", title: "Inception & Seed funding", desc: "Scaffolded core parser architectures and secured ₹30 Crore seed sourcing rounds." },
    { year: "2025", title: "Smart Analyzer launch", desc: "Released standard drag-and-drop resume scanner modules parsing 400k candidates." },
    { year: "2026", title: "JobSphere Suite evolution", desc: "Unified dashboards into a single world-class interface linking Unstop-challenges." }
  ];

  const team = [
    { name: "Vansh Karnwal", role: "CEO & Software Architect", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150" },
    { name: "Olivia Rhye", role: "VP of Product Interface", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
    { name: "Marcus Vance", role: "Global Director Sourcing AI", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150" }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-16 z-10 relative">
      
      {/* Hero Brand Section */}
      <section className="text-center flex flex-col items-center gap-4 pt-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          Our Mission Sourcing
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 dark:text-white leading-tight">Empowering Global Sourcing</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mt-0.5 leading-relaxed">
          We bridge candidate opportunities and corporate hiring workflows using state-of-the-art AI-scoring pipelines.
        </p>
      </section>

      {/* Core values bento cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {values.map((val, i) => {
          const Icon = val.icon;
          return (
            <div
              key={i}
              className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 backdrop-blur-xl rounded-3xl p-6 shadow-sm flex flex-col gap-4 hover:border-brand-500/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-white mb-1.5">{val.title}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed">{val.desc}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Timeline Section */}
      <section className="flex flex-col gap-10">
        <h3 className="text-xl font-extrabold text-slate-800 dark:text-white text-center">Company Milestones</h3>
        <div className="flex flex-col gap-8 max-w-xl mx-auto w-full relative pl-6 border-l border-slate-200 dark:border-navy-800">
          {milestones.map((ms, idx) => (
            <div key={idx} className="relative flex flex-col gap-1">
              {/* Dot marker */}
              <div className="absolute left-[-29.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-white dark:border-navy-950 shadow" />
              
              <span className="text-[10px] font-bold text-brand-500">{ms.year}</span>
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-white">{ms.title}</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed mt-0.5">{ms.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Executive team profiles */}
      <section className="flex flex-col gap-10">
        <h3 className="text-xl font-extrabold text-slate-800 dark:text-white text-center">Executive Team</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((user, i) => (
            <div
              key={i}
              className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 backdrop-blur-xl rounded-3xl p-5 shadow-sm flex flex-col items-center text-center group"
            >
              <ImageWithFallback src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full object-cover mb-4 border border-slate-200/50 group-hover:scale-105 transition-transform duration-300 shadow-md" type="avatar" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-white">{user.name}</h4>
              <p className="text-[9.5px] text-slate-500 mt-0.5">{user.role}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
