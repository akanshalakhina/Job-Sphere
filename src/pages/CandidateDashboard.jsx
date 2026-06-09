import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { 
  Briefcase, FileCode, CheckCircle, Clock, Calendar, Sparkles, BookOpen, 
  ChevronRight, User, Settings, Star, Award, Map, Trophy, ArrowUpRight, 
  Trash2, Mail, Phone, Link2, Plus, FileText, AlertCircle, PlusCircle, HelpCircle
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';
import { TRENDING_SKILLS, ROADMAPS, CERTIFICATIONS } from '../data/mockData';

export const CandidateDashboard = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const state = useAppState() || {};
  const { 
    currentUser = {}, appliedJobIds = [], savedJobIds = [], jobs = [], interviews = [], 
    resumeBuilderData = {}, saveResumeBuilderData = () => {}, toggleSaveJob = () => {}, applyToJob = () => {} 
  } = state;

  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'builder', 'ats', 'upskill', 'interviews', 'saves'
  
  // Resume Builder local states synced with global context
  const [personal, setPersonal] = useState(resumeBuilderData?.personal || { name: '', email: '', phone: '', linkedin: '', github: '', portfolio: '' });
  const [education, setEducation] = useState(resumeBuilderData?.education || { degree: '', college: '', cgpa: '', gradYear: '' });
  const [techSkills, setTechSkills] = useState(resumeBuilderData?.skills?.technical?.join(', ') || '');
  const [frameworks, setFrameworks] = useState(resumeBuilderData?.skills?.frameworks?.join(', ') || '');
  const [experience, setExperience] = useState(resumeBuilderData?.experience || []);
  const [certifications, setCertifications] = useState(resumeBuilderData?.certifications || []);
  const [achievements, setAchievements] = useState(resumeBuilderData?.achievements || []);
  
  // Roadmap local select track
  const [selectedTrack, setSelectedTrack] = useState('frontend'); // 'frontend', 'ai'

  // Application statistics chart data
  const chartData = [
    { name: 'Jan', applications: 2 },
    { name: 'Feb', applications: 5 },
    { name: 'Mar', applications: 8 },
    { name: 'Apr', applications: 12 },
    { name: 'May', applications: 18 },
  ];

  const resumeDetails = currentUser.resumeDetails;
  const atsScore = resumeDetails ? resumeDetails.atsScore : 88;

  // Recommended jobs based on matching skills
  const recommendedJobs = jobs.filter(j => j.aiMatch >= 80).slice(0, 3);
  const appliedJobs = jobs.filter(j => appliedJobIds.includes(j.id));
  const savedJobs = jobs.filter(j => savedJobIds.includes(j.id));

  // Dynamic profile completion score
  const calculateProfileScore = () => {
    let score = 30; // base score for account registration
    if (currentUser.resumeUploaded || currentUser.resumeDetails) score += 25;
    if (experience.length > 0) score += 15;
    if (certifications.length > 0) score += 15;
    if (achievements.length > 0) score += 15;
    return score;
  };

  const handleSyncBuilder = (e) => {
    e.preventDefault();
    const updatedData = {
      personal,
      education,
      skills: {
        technical: techSkills.split(',').map(s => s.trim()).filter(Boolean),
        soft: resumeBuilderData?.skills?.soft || [],
        tools: resumeBuilderData?.skills?.tools || [],
        frameworks: frameworks.split(',').map(s => s.trim()).filter(Boolean)
      },
      experience,
      certifications,
      achievements
    };
    saveResumeBuilderData(updatedData);
    addToast("Resume data synced and compiled! ATS analysis updated.", "success");
  };

  const handleQuickAddKeyword = (keyword) => {
    // Append keyword directly to technical skills
    setTechSkills(prev => prev ? `${prev}, ${keyword}` : keyword);
    addToast(`Added '${keyword}' to your technical skills. Recompile to update ATS Score!`, 'info');
  };

  const handleAddExperienceField = () => {
    setExperience(prev => [...prev, { role: "New Position", company: "Company", duration: "June 2026 - Present", desc: "Responsibility details here." }]);
  };

  const handlePrintResume = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-8 z-10 relative">
      
      {/* Overview Headings */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="text-left">
          <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white">Student Command Center</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Review resume alignments, upskill through custom courses, and navigate pending interview stages.</p>
        </div>

        {/* Tab Selection */}
        <div className="border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 rounded-2xl p-1 flex flex-wrap gap-1 w-full md:w-auto">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'builder', label: 'AI Resume Builder' },
            { id: 'ats', label: 'AI ATS Match' },
            { id: 'upskill', label: 'Upskilling Hub' },
            { id: 'interviews', label: 'Interview Tracker' },
            { id: 'saves', label: `Saved & Applied (${savedJobs.length}/${appliedJobs.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 md:flex-initial px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow'
                  : 'text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Tab Panels */}
      <AnimatePresence mode="wait">
        
        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="flex flex-col lg:flex-row gap-8 items-start"
          >
            {/* Left sidebar profile metrics */}
            <aside className="w-full lg:w-64 flex flex-col gap-6 flex-shrink-0">
              
              {/* Profile completeness card */}
              <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 backdrop-blur-xl rounded-3xl p-5 shadow-sm flex flex-col items-center text-center">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-brand-500 shadow-lg mb-3"
                />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white leading-tight">{currentUser.name}</h3>
                <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1 leading-snug">{currentUser.title}</p>
                
                <div className="h-px bg-slate-100 dark:bg-navy-850 w-full my-4" />
                
                <div className="flex flex-col gap-2 w-full text-left">
                  <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-450 uppercase tracking-wider">
                    <span>Profile Complete</span>
                    <span className="text-brand-500 font-extrabold">{calculateProfileScore()}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-navy-850 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: `${calculateProfileScore()}%` }} />
                  </div>
                </div>
              </div>

              {/* Achievements Badges Card */}
              <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 backdrop-blur-xl rounded-3xl p-5 shadow-sm text-left flex flex-col gap-3">
                <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  Unlocked Badges
                </h4>
                <div className="grid grid-cols-3 gap-3 mt-1">
                  {[
                    { name: "ATS Pioneer", icon: FileCode, unlocked: calculateProfileScore() >= 55, color: "text-blue-500 bg-blue-500/10" },
                    { name: "Cert Ace", icon: Award, unlocked: certifications.length > 0, color: "text-purple-500 bg-purple-500/10" },
                    { name: "Winner", icon: Star, unlocked: achievements.length > 0, color: "text-amber-500 bg-amber-500/10" }
                  ].map((badge, idx) => {
                    const Icon = badge.icon;
                    return (
                      <div 
                        key={idx} 
                        className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                          badge.unlocked 
                            ? 'border-brand-500/20 bg-brand-500/5' 
                            : 'border-slate-200 dark:border-navy-850 opacity-40 filter grayscale'
                        }`}
                        title={badge.name}
                      >
                        <div className={`p-2 rounded-lg ${badge.color} mb-1`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[7.5px] font-bold text-slate-500 truncate max-w-full">{badge.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Main Stats panel */}
            <div className="flex-1 flex flex-col gap-6 w-full text-left">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-brand-500/10 text-brand-600">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-slate-800 dark:text-white">{appliedJobIds.length}</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-semibold">Active Submissions</p>
                  </div>
                </div>

                <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-slate-800 dark:text-white">{interviews.length}</p>
                    <p className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-semibold">Scheduled Rounds</p>
                  </div>
                </div>

                <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-555">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold text-slate-800 dark:text-white">{atsScore}%</p>
                    <p className="text-[10px] text-slate-455 dark:text-slate-400 uppercase font-semibold">AI ATS Metric Score</p>
                  </div>
                </div>
              </div>

              {/* Area graph / Recommended opens */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Application Statistics</h4>
                    <p className="text-[10px] text-slate-400">Timeline of candidate applications compiled monthly</p>
                  </div>
                  <div className="h-44 w-full text-xs font-semibold">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b6beb" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b6beb" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ background: '#0b0f19', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                        <Area type="monotone" dataKey="applications" stroke="#3b6beb" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Sourcing interview timeline */}
                <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex flex-col justify-between gap-4">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    Interview Calendar
                  </h4>
                  
                  <div className="flex flex-col gap-3 flex-grow overflow-y-auto max-h-[160px] no-scrollbar">
                    {interviews.map(int => (
                      <div key={int.id} className="p-3 rounded-xl border border-slate-100 dark:border-navy-850 bg-slate-50/50 dark:bg-navy-950/40 text-[10.5px]">
                        <div className="flex justify-between items-start font-bold text-slate-800 dark:text-white">
                          <span>{int.role}</span>
                          <span className="text-[9px] text-brand-500 bg-brand-500/10 px-1.5 py-0.5 rounded">{int.status}</span>
                        </div>
                        <p className="text-slate-500 mt-1">Interviewer: <span className="font-bold text-slate-700 dark:text-slate-350">{int.candidateName}</span></p>
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-navy-900 font-bold text-slate-400 text-[8.5px]">
                          <span>📅 {int.date}</span>
                          <span>⏰ {int.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => setActiveTab('interviews')}
                    className="w-full py-2 rounded-xl bg-slate-100 dark:bg-navy-850 hover:bg-slate-200 text-[10px] font-bold text-center text-slate-700 dark:text-slate-300"
                  >
                    Open Tracker Details
                  </button>
                </div>
              </div>

              {/* Recommended listings */}
              <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                    AI Sourced Opportunities Match
                    <span className="text-[9px] font-bold px-2.5 py-0.5 rounded bg-brand-500/10 text-brand-500">96% Accuracy</span>
                  </h4>
                  <Link to="/jobs" className="text-xs font-bold text-brand-500 hover:underline flex items-center gap-0.5">Explore All <ChevronRight className="w-3.5 h-3.5" /></Link>
                </div>

                <div className="flex flex-col gap-3">
                  {recommendedJobs.map(job => (
                    <div
                      key={job.id}
                      onClick={() => navigate(`/jobs/${job.id}`)}
                      className="border border-slate-100 dark:border-navy-850 bg-white/50 dark:bg-navy-950/40 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-brand-500/30 dark:hover:border-brand-400/30 hover:scale-[1.005] cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-850 flex items-center justify-center font-bold text-sm text-brand-500">{job.logo}</div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{job.title}</h5>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{job.company} • <span className="text-slate-400">{job.location}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex gap-1">
                          {job.skills.slice(0, 3).map(s => (
                            <span key={s} className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-900 text-slate-500 dark:text-slate-400">{s}</span>
                          ))}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{job.salary}</span>
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/10">
                            <Star className="w-3 h-3 fill-current" /> {job.aiMatch}% Match
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI RESUME BUILDER PANEL */}
        {activeTab === 'builder' && (
          <motion.div
            key="builder"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left"
          >
            {/* Input Form Fields left */}
            <div className="lg:col-span-7 border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-brand-500" />
                  Interactive Resume Details
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Fill out your professional credentials to dynamically compile a print-ready resume template.</p>
              </div>

              <form onSubmit={handleSyncBuilder} className="flex flex-col gap-5">
                
                {/* Personal Info */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-[11px] uppercase font-bold text-indigo-500 tracking-wider">1. Personal Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Full Name" 
                      value={personal.name} 
                      onChange={(e) => setPersonal({...personal, name: e.target.value})} 
                      className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500" 
                    />
                    <input 
                      type="email" 
                      placeholder="Email" 
                      value={personal.email} 
                      onChange={(e) => setPersonal({...personal, email: e.target.value})} 
                      className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500" 
                    />
                    <input 
                      type="text" 
                      placeholder="Phone" 
                      value={personal.phone} 
                      onChange={(e) => setPersonal({...personal, phone: e.target.value})} 
                      className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500" 
                    />
                    <input 
                      type="text" 
                      placeholder="Portfolio Site" 
                      value={personal.portfolio} 
                      onChange={(e) => setPersonal({...personal, portfolio: e.target.value})} 
                      className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500" 
                    />
                  </div>
                </div>

                {/* Education */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-[11px] uppercase font-bold text-indigo-500 tracking-wider">2. Education Credentials</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                      type="text" 
                      placeholder="Degree / Course" 
                      value={education.degree} 
                      onChange={(e) => setEducation({...education, degree: e.target.value})} 
                      className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500" 
                    />
                    <input 
                      type="text" 
                      placeholder="College / University" 
                      value={education.college} 
                      onChange={(e) => setEducation({...education, college: e.target.value})} 
                      className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500" 
                    />
                    <input 
                      type="text" 
                      placeholder="CGPA / Grade" 
                      value={education.cgpa} 
                      onChange={(e) => setEducation({...education, cgpa: e.target.value})} 
                      className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500" 
                    />
                    <input 
                      type="text" 
                      placeholder="Graduation Year" 
                      value={education.gradYear} 
                      onChange={(e) => setEducation({...education, gradYear: e.target.value})} 
                      className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500" 
                    />
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-[11px] uppercase font-bold text-indigo-500 tracking-wider">3. Sourcing Core Skills</h4>
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Technical Skills (Comma separated)</label>
                      <input 
                        type="text" 
                        placeholder="React, JavaScript, Git, AWS" 
                        value={techSkills} 
                        onChange={(e) => setTechSkills(e.target.value)} 
                        className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500" 
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] uppercase font-bold text-slate-400">Frameworks / Styling (Comma separated)</label>
                      <input 
                        type="text" 
                        placeholder="TailwindCSS, Express, Vite, Node.js" 
                        value={frameworks} 
                        onChange={(e) => setFrameworks(e.target.value)} 
                        className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500" 
                      />
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <div className="flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[11px] uppercase font-bold text-indigo-500 tracking-wider">4. Work & Internships</h4>
                    <button 
                      type="button" 
                      onClick={handleAddExperienceField}
                      className="text-[9px] uppercase font-extrabold text-brand-500 hover:underline flex items-center gap-0.5"
                    >
                      <PlusCircle className="w-3.5 h-3.5" /> Add Experience
                    </button>
                  </div>
                  {experience.map((exp, i) => (
                    <div key={i} className="p-4 rounded-2xl border border-slate-150 dark:border-navy-850 bg-slate-50/20 dark:bg-navy-950/20 flex flex-col gap-3">
                      <div className="grid grid-cols-2 gap-4">
                        <input 
                          type="text" 
                          placeholder="Position Role" 
                          value={exp.role} 
                          onChange={(e) => {
                            const newExp = [...experience];
                            newExp[i].role = e.target.value;
                            setExperience(newExp);
                          }} 
                          className="p-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500" 
                        />
                        <input 
                          type="text" 
                          placeholder="Company" 
                          value={exp.company} 
                          onChange={(e) => {
                            const newExp = [...experience];
                            newExp[i].company = e.target.value;
                            setExperience(newExp);
                          }} 
                          className="p-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500" 
                        />
                      </div>
                      <textarea 
                        rows={2} 
                        placeholder="Key responsibilities and achievements details..." 
                        value={exp.desc} 
                        onChange={(e) => {
                          const newExp = [...experience];
                          newExp[i].desc = e.target.value;
                          setExperience(newExp);
                        }} 
                        className="p-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500 resize-none" 
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  Sync & Compile Resume Profile
                </button>
              </form>
            </div>

            {/* Standard Professional Resume Print Preview right */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">A4 Standard Print Preview</span>
                <button 
                  onClick={handlePrintResume}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 hover:bg-slate-100 text-[10px] font-bold text-slate-700 dark:text-slate-350 shadow flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5 text-brand-500" /> Print / PDF Download
                </button>
              </div>

              {/* High fidelity resume canvas print sheet */}
              <div id="resume-sheet" className="w-full border border-slate-250 dark:border-navy-800 bg-white text-slate-900 p-6 md:p-8 shadow-2xl rounded-2xl flex flex-col gap-6 text-left relative font-serif aspect-[1/1.4] overflow-y-auto no-scrollbar select-text">
                {/* Header personal details */}
                <div className="text-center flex flex-col items-center gap-1 border-b pb-4 border-slate-200">
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">{personal.name || "YOUR NAME"}</h2>
                  <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[9.5px] text-slate-500 font-sans font-medium">
                    {personal.email && <span className="flex items-center gap-0.5"><Mail className="w-3 h-3" /> {personal.email}</span>}
                    {personal.phone && <span className="flex items-center gap-0.5"><Phone className="w-3 h-3" /> {personal.phone}</span>}
                    {personal.portfolio && <span className="flex items-center gap-0.5"><Link2 className="w-3 h-3" /> {personal.portfolio}</span>}
                  </div>
                </div>

                {/* Education section */}
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b pb-0.5 border-slate-200 font-sans">Education Details</h4>
                  <div className="flex justify-between items-start text-[10.5px]">
                    <div>
                      <p className="font-extrabold">{education.college || "Stanford University"}</p>
                      <p className="italic text-slate-600 mt-0.5">{education.degree || "Bachelor of Science"}</p>
                    </div>
                    <div className="text-right text-slate-500">
                      <p className="font-bold">Graduation: {education.gradYear || "2026"}</p>
                      <p className="font-semibold text-slate-600">CGPA: {education.cgpa || "3.91"}</p>
                    </div>
                  </div>
                </div>

                {/* Skills section */}
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b pb-0.5 border-slate-200 font-sans">Competencies Matrix</h4>
                  <div className="text-[10px] leading-relaxed flex flex-col gap-1">
                    <p><span className="font-bold">Technical Skills:</span> {techSkills || "React, JavaScript"}</p>
                    <p><span className="font-bold">Frameworks & Tools:</span> {frameworks || "TailwindCSS, Node.js"}</p>
                  </div>
                </div>

                {/* Experience section */}
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b pb-0.5 border-slate-200 font-sans">Work History</h4>
                  <div className="flex flex-col gap-4">
                    {experience.map((exp, idx) => (
                      <div key={idx} className="flex flex-col text-[10.5px]">
                        <div className="flex justify-between items-start">
                          <p className="font-extrabold">{exp.role}</p>
                          <span className="text-slate-500 font-semibold">{exp.duration}</span>
                        </div>
                        <p className="text-[9.5px] italic text-brand-650 font-sans font-bold">{exp.company}</p>
                        <p className="text-[9.5px] text-slate-655 mt-1 leading-relaxed font-sans">{exp.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certifications section */}
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b pb-0.5 border-slate-200 font-sans">Certifications</h4>
                  <ul className="list-disc pl-4 text-[10px] text-slate-700 flex flex-col gap-1 font-sans">
                    {certifications.map((c, i) => (
                      <li key={i}><span className="font-bold">{c.name}</span> — issued by {c.issuer || "AWS"} ({c.year || "2026"})</li>
                    ))}
                  </ul>
                </div>

                {/* Achievements section */}
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 border-b pb-0.5 border-slate-200 font-sans">Achievements</h4>
                  <ul className="list-disc pl-4 text-[10px] text-slate-700 flex flex-col gap-1 font-sans">
                    {achievements.map((ach, i) => (
                      <li key={i}><span className="font-bold">{ach.name}</span>: {ach.details}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* AI ATS MATCH ENGINE PANEL */}
        {activeTab === 'ats' && (
          <motion.div
            key="ats"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-left"
          >
            {/* ATS circular meters card */}
            <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between items-center text-center gap-6">
              <div className="w-full text-left">
                <h4 className="text-sm font-bold text-slate-850 dark:text-white flex items-center gap-1.5">
                  ATS Scorecard Breakdown
                  <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Overall parsing compatibility match rating</p>
              </div>

              {/* Score visual meter */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="72" cy="72" r="62" stroke="currentColor" className="text-slate-100 dark:text-navy-850" strokeWidth="8" fill="transparent" />
                  <circle cx="72" cy="72" r="62" stroke="currentColor" className="text-brand-500 animate-laser" strokeWidth="10" fill="transparent"
                    strokeDasharray={2 * Math.PI * 62}
                    strokeDashoffset={2 * Math.PI * 62 * (1 - atsScore / 100)}
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-black text-slate-850 dark:text-white">{atsScore}%</span>
                  <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mt-0.5">Compatibility</p>
                </div>
              </div>

              <div className="flex flex-col gap-3 w-full text-left mt-2">
                {[
                  { name: "Technical Skills Fit", score: Math.min(atsScore + 4, 98), color: "bg-blue-500" },
                  { name: "Industry Relevancy Matrix", score: Math.min(atsScore - 6, 92), color: "bg-indigo-500" },
                  { name: "Formatting Alignment Check", score: 95, color: "bg-cyan-500" }
                ].map((crit, idx) => (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-700 dark:text-slate-350">
                      <span>{crit.name}</span>
                      <span>{crit.score}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-navy-850 rounded-full overflow-hidden">
                      <div className={`h-full ${crit.color}`} style={{ width: `${crit.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Keyword gap and certification actions */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Sourcing Keyword gap checks */}
              <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-855 dark:text-white flex items-center gap-1.5">
                    <AlertCircle className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
                    Technical Keyword Gap Analysis
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Crucial missing keywords requested by leading tech sponsors like Stripe and Google</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {[
                    { word: "TypeScript", desc: "Requested in 4 Stripe openings. Essential for dashboard architectures.", exists: techSkills.toLowerCase().includes('typescript') },
                    { word: "Next.js", desc: "Crucial for Vercel developer relations and frontend frameworks.", exists: frameworks.toLowerCase().includes('next.js') },
                    { word: "Docker", desc: "Required for senior backend core infrastructure roles.", exists: techSkills.toLowerCase().includes('docker') }
                  ].map(kw => (
                    <div 
                      key={kw.word}
                      className={`p-4 rounded-2xl border flex flex-col justify-between gap-3 shadow-inner ${
                        kw.exists 
                          ? 'border-emerald-250 bg-emerald-500/5' 
                          : 'border-rose-250 bg-rose-500/5'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-850 dark:text-white">{kw.word}</span>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            kw.exists ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                          }`}>{kw.exists ? 'Found' : 'Missing'}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-snug">{kw.desc}</p>
                      </div>

                      {!kw.exists && (
                        <button
                          onClick={() => handleQuickAddKeyword(kw.word)}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-navy-950 text-white text-[10px] font-bold flex items-center gap-0.5 max-w-fit hover:scale-102 active:scale-98 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5 text-brand-500" /> Add to Resume
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended certifications center */}
              <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-slate-850 dark:text-white">Suggested Certifications</h4>
                    <p className="text-[10px] text-slate-400">Bridge your gap score with verified IIT and industry certificates</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('upskill')}
                    className="text-xs font-bold text-brand-500 hover:underline flex items-center gap-0.5"
                  >
                    View All Paths <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
                  {CERTIFICATIONS.slice(0, 2).map(cert => (
                    <div key={cert.id} className="p-4 rounded-2xl border border-slate-150 dark:border-navy-850 bg-slate-50/30 dark:bg-navy-900/30 flex justify-between items-center gap-4">
                      <div>
                        <span className="text-[8.5px] font-extrabold uppercase bg-brand-500/10 text-brand-500 px-2 py-0.5 rounded-full">{cert.provider}</span>
                        <h5 className="text-xs font-bold text-slate-850 dark:text-white mt-1.5 leading-tight">{cert.name}</h5>
                        <p className="text-[9.5px] text-slate-500 mt-1">Time: {cert.duration} • Level: {cert.level}</p>
                      </div>
                      <button
                        onClick={() => {
                          setCertifications(prev => [...prev, { name: cert.name, issuer: cert.provider, year: "2026" }]);
                          addToast(`Enrolled in ${cert.name}! Added to your resume achievements.`, 'success');
                        }}
                        className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-bold shadow-sm"
                      >
                        Enroll
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* STUDENT UPSKILLING CENTER */}
        {activeTab === 'upskill' && (
          <motion.div
            key="upskill"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left"
          >
            {/* Left Roadmaps Column */}
            <div className="lg:col-span-8 border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
              
              {/* Track Selector */}
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-navy-850 pb-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Map className="w-4.5 h-4.5 text-indigo-500" />
                    AI Career Roadmaps
                  </h4>
                  <p className="text-[10px] text-slate-400">Step-by-step career path guides</p>
                </div>

                <div className="border border-slate-200 dark:border-navy-800 p-0.5 rounded-xl flex gap-1 bg-slate-50 dark:bg-navy-950">
                  <button 
                    onClick={() => setSelectedTrack('frontend')}
                    className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg transition-all ${
                      selectedTrack === 'frontend' ? 'bg-brand-500 text-white' : 'text-slate-500'
                    }`}
                  >
                    Frontend Dev
                  </button>
                  <button 
                    onClick={() => setSelectedTrack('ai')}
                    className={`px-3 py-1.5 text-[10.5px] font-bold rounded-lg transition-all ${
                      selectedTrack === 'ai' ? 'bg-brand-500 text-white' : 'text-slate-500'
                    }`}
                  >
                    AI Engineer
                  </button>
                </div>
              </div>

              {/* Roadmap step sequence */}
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">{ROADMAPS[selectedTrack].title}</h3>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{ROADMAPS[selectedTrack].description}</p>
                </div>

                <div className="relative pl-6 border-l-2 border-slate-150 dark:border-navy-850 flex flex-col gap-6 ml-2 select-none">
                  {ROADMAPS[selectedTrack].steps.map((step, idx) => (
                    <div key={step.id} className="relative">
                      {/* Ring connector indicator */}
                      <span className={`absolute left-0 transform -translate-x-[31px] top-1 w-4 h-4 rounded-full border-2 flex items-center justify-center font-bold text-[8px] bg-white ${
                        step.completed 
                          ? 'border-brand-500 text-brand-500 bg-brand-50' 
                          : 'border-slate-300 text-slate-400 dark:border-navy-800'
                      }`}>
                        {step.completed ? "✓" : idx + 1}
                      </span>

                      <div>
                        <div className="flex justify-between items-center">
                          <h5 className={`text-xs font-bold ${step.completed ? 'text-slate-800 dark:text-slate-200' : 'text-slate-450 dark:text-slate-500'}`}>{step.title}</h5>
                          <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded ${
                            step.completed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-navy-850 text-slate-400'
                          }`}>{step.completed ? 'Completed' : 'Pending'}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 leading-snug">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Certs and trending skills */}
            <div className="lg:col-span-4 flex flex-col gap-6 w-full">
              
              {/* Trending skills list */}
              <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
                <h4 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-500" />
                  Trending Skills
                </h4>
                <div className="flex flex-col gap-3">
                  {TRENDING_SKILLS.slice(0, 4).map(skill => (
                    <div key={skill.id} className="flex justify-between items-center border-b border-slate-100 dark:border-navy-850/50 pb-2.5">
                      <div>
                        <h5 className="text-[11px] font-bold text-slate-800 dark:text-white">{skill.name}</h5>
                        <div className="flex items-center gap-2 mt-0.5 text-[8.5px] font-bold text-slate-400">
                          <span className="text-emerald-555">▲ +{skill.growth}%</span>
                          <span>Pay: {skill.salary}</span>
                        </div>
                      </div>
                      <span className="text-[9px] font-extrabold uppercase text-slate-500 bg-slate-100 dark:bg-navy-850 px-2 py-0.5 rounded">{skill.demand}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress weekly goal checker */}
              <div className="border border-slate-200/60 dark:border-navy-800/40 bg-gradient-to-br from-slate-900 to-navy-950 text-white rounded-3xl p-5 shadow-lg flex flex-col gap-4">
                <div>
                  <h5 className="text-[11px] font-extrabold uppercase text-brand-400 tracking-wider">Weekly Sourcing Goal</h5>
                  <p className="text-base font-extrabold mt-1">Enroll & Learn AWS Basics</p>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                  <span>Goal Completion</span>
                  <span>4 / 5 steps complete</span>
                </div>
                <div className="w-full h-2 bg-navy-900 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: '80%' }} />
                </div>
                <button
                  onClick={() => {
                    setCertifications(prev => [...prev, { name: "AWS Sourcing Core", issuer: "AWS", year: "2026" }]);
                    addToast("AWS Goal Completed! Badge unlocked.", "success");
                  }}
                  className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold mt-1"
                >
                  Complete Weekly Goal
                </button>
              </div>

            </div>
          </motion.div>
        )}

        {/* INTERVIEW TRACKER KANBAN PIPELINE */}
        {activeTab === 'interviews' && (
          <motion.div
            key="interviews"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col gap-6 text-left"
          >
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Clock className="w-5 h-5 text-indigo-500" />
                Sourcing Placement Rounds pipeline
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Visualize your candidate routing steps across the pending recruitment stages.</p>
            </div>

            {/* Stages horizontal timeline pipeline */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4">
              {[
                { stage: "HR Screening", desc: "Introduce personal interests & alignment details.", completed: true, status: "Cleared" },
                { stage: "Technical Challenge", desc: "Build React dashboard component with charts.", completed: true, status: "Cleared" },
                { stage: "System Design", desc: "Diagram distributed MLOps gateway routing.", completed: false, status: "Active Round", active: true },
                { stage: "Placement Offer", desc: "Negotiate MRR salaries and benefits packages.", completed: false, status: "Locked" }
              ].map((round, idx) => (
                <div 
                  key={idx}
                  className={`border rounded-2xl p-4 flex flex-col justify-between gap-4 transition-all relative overflow-hidden ${
                    round.active 
                      ? 'border-brand-500 bg-brand-500/5 ring-1 ring-brand-500/10' 
                      : round.completed 
                      ? 'border-emerald-250 bg-emerald-500/5' 
                      : 'border-slate-200 dark:border-navy-850 opacity-55'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase font-bold text-slate-400">Round 0{idx + 1}</span>
                    <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded ${
                      round.active ? 'bg-brand-500 text-white' :
                      round.completed ? 'bg-emerald-500/10 text-emerald-500' :
                      'bg-slate-100 dark:bg-navy-850 text-slate-400'
                    }`}>{round.status}</span>
                  </div>

                  <div>
                    <h5 className="text-xs font-bold text-slate-850 dark:text-white leading-tight">{round.stage}</h5>
                    <p className="text-[10px] text-slate-500 mt-1 leading-snug">{round.desc}</p>
                  </div>

                  {round.active && (
                    <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/10 flex flex-col gap-2 mt-1">
                      <p className="text-[9px] font-extrabold uppercase text-slate-700 dark:text-slate-350">AI Coach Question Tips</p>
                      <p className="text-[10px] text-brand-650 dark:text-brand-400 italic leading-snug">"How would you optimize Apple-grade frontend LCP latency metrics inside Next.js App Router?"</p>
                      <button 
                        onClick={() => addToast("Starting AI Mock Interview Simulator...", "success")}
                        className="w-full py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-[9px] font-bold"
                      >
                        Practice with AI Coach
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* SAVES & APPLICATIONS */}
        {activeTab === 'saves' && (
          <motion.div
            key="saves"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start text-left"
          >
            {/* Applied jobs list */}
            <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-850 dark:text-white">Active Submissions ({appliedJobs.length})</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Verify your active job application tracking details</p>
              </div>

              <div className="flex flex-col gap-3">
                {appliedJobs.length > 0 ? (
                  appliedJobs.map(job => (
                    <div key={job.id} className="p-4 rounded-2xl border border-slate-150 dark:border-navy-850 bg-slate-50/20 dark:bg-navy-900/20 flex justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center font-bold text-brand-500 text-sm">{job.logo}</div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{job.title}</h5>
                          <p className="text-[9.5px] text-slate-500 mt-0.5">{job.company} • <span className="text-slate-450 font-bold">{job.salary}</span></p>
                        </div>
                      </div>

                      <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">Sourced Match</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-xs text-slate-400">No active applications. Try applying to listings from the Jobs Board!</div>
                )}
              </div>
            </div>

            {/* Saved jobs list */}
            <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-855 dark:text-white">Saved Openings ({savedJobs.length})</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Apply later or delete listings from your clipboard</p>
              </div>

              <div className="flex flex-col gap-3">
                {savedJobs.length > 0 ? (
                  savedJobs.map(job => (
                    <div key={job.id} className="p-4 rounded-2xl border border-slate-150 dark:border-navy-850 bg-slate-50/20 dark:bg-navy-900/20 flex justify-between items-center gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center font-bold text-brand-500 text-sm">{job.logo}</div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{job.title}</h5>
                          <p className="text-[9.5px] text-slate-500 mt-0.5">{job.company} • <span className="text-slate-450 font-bold">{job.salary}</span></p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            toggleSaveJob(job.id);
                            addToast(`Deleted ${job.title} from saved jobs.`, 'info');
                          }}
                          className="p-2 rounded-xl border border-rose-200 hover:bg-rose-500/10 text-rose-500"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            applyToJob(job.id);
                            addToast(`Applied for ${job.title}! Sourced candidate profile.`, 'success');
                          }}
                          className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-bold"
                        >
                          Apply Now
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-xs text-slate-400">No saved job listings in your queue.</div>
                )}
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};
