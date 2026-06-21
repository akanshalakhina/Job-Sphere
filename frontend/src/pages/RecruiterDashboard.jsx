import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  Users, FileCode, CheckCircle, Calendar, Plus, Mail, ChevronRight, 
  Check, Trash2, ArrowRight, ShieldCheck, Landmark, Edit3, Sparkles, AlertCircle,
  Sliders, Award, Filter, Search, Brain, Zap, TrendingUp, Star, ThumbsUp,
  ThumbsDown, Target, BarChart3, Loader2, RefreshCw, ChevronDown, X
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';
import { ImageWithFallback } from '../components/ImageWithFallback';
import OfferBanner from '../components/OfferBanner';
import CandidateProfileModal from '../components/CandidateProfileModal';

export const RecruiterDashboard = () => {
  const { 
    candidates, interviews, updateCandidateStage, 
    scheduleInterview, addPendingJob, verifiedCompanies, currentUser,
    jobs, generateRanking, fetchRankedCandidates, handleShortlistDecision
  } = useAppState();
  const { addToast } = useToast();

  // Profile modal state
  const [profileCandidate, setProfileCandidate] = useState(null);

  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline', 'shortlist', 'rankings', 'schedule', 'postjob', 'branding'
  
  // Schedule state
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [role, setRole] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Post Job State
  const [jobTitle, setJobTitle] = useState('');
  const [jobSalary, setJobSalary] = useState('₹13,00,000 - ₹16,00,000');
  const [jobLocation, setJobLocation] = useState('Remote (Hybrid)');
  const [jobDept, setJobDept] = useState('Engineering');
  const [jobExp, setJobExp] = useState('3+ Years');
  const [jobSkills, setJobSkills] = useState('React, TypeScript, TailwindCSS');
  const [jobDesc, setJobDesc] = useState('We are seeking an expert developer to scale our core UI platforms.');

  // Branding Profile states
  const [companyName, setCompanyName] = useState(() => currentUser?.companyName || currentUser?.company || 'Stripe');
  const [companySize, setCompanySize] = useState(() => currentUser?.companySize || '10,000+ employees');
  const [companyWebsite, setCompanyWebsite] = useState(() => currentUser?.website || 'stripe.com');
  const [companyDesc, setCompanyDesc] = useState(() => currentUser?.description || currentUser?.bio || 'Stripe is a financial infrastructure platform for the internet.');
  const [companyBenefits, setCompanyBenefits] = useState('Full medical insurance, Remote setups stipend, 401(k) matching.');

  React.useEffect(() => {
    if (currentUser) {
      if (currentUser.companyName || currentUser.company) {
        setCompanyName(currentUser.companyName || currentUser.company);
      }
      if (currentUser.companySize) {
        setCompanySize(currentUser.companySize);
      }
      if (currentUser.website) {
        setCompanyWebsite(currentUser.website);
      }
      if (currentUser.description || currentUser.bio) {
        setCompanyDesc(currentUser.description || currentUser.bio);
      }
    }
  }, [currentUser]);

  // Comparison State
  const [compareIds, setCompareIds] = useState([]); // holds selected candidate IDs for comparison (max 2)

  // Advanced Shortlist Filter & Leaderboard States
  const [filterQuery, setFilterQuery] = useState('');
  const [minAtsScore, setMinAtsScore] = useState(50);
  const [filterRole, setFilterRole] = useState('All');
  const [filterExp, setFilterExp] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'leaderboard'

  const availableRoles = useMemo(() => {
    return ['All', ...new Set(candidates.map(c => c.appliedFor))];
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(cand => {
      const query = filterQuery.toLowerCase().trim();
      const matchesQuery = !query || 
        cand.name.toLowerCase().includes(query) ||
        cand.title.toLowerCase().includes(query) ||
        cand.skills.some(s => s.toLowerCase().includes(query));

      const matchesScore = cand.atsScore >= minAtsScore;
      const matchesRole = filterRole === 'All' || cand.appliedFor === filterRole;

      let matchesExp = true;
      if (filterExp !== 'All') {
        const expNum = parseInt(cand.experience) || 0;
        if (filterExp === '1-3 Years') {
          matchesExp = expNum >= 1 && expNum <= 3;
        } else if (filterExp === '4-6 Years') {
          matchesExp = expNum >= 4 && expNum <= 6;
        } else if (filterExp === '7+ Years') {
          matchesExp = expNum >= 7;
        }
      }

      return matchesQuery && matchesScore && matchesRole && matchesExp;
    });
  }, [candidates, filterQuery, minAtsScore, filterRole, filterExp]);

  const leaderboardCandidates = useMemo(() => {
    return [...filteredCandidates].sort((a, b) => b.atsScore - a.atsScore);
  }, [filteredCandidates]);

  // Sourcing stats
  const totalApplicants = candidates.length;
  const interviewingCount = candidates.filter(c => c.stage === 'Interviewing').length;
  const offeredCount = candidates.filter(c => c.stage === 'Offered').length;

  const columns = ['Applied', 'Screening', 'Interview', 'Offered'];

  const chartData = useMemo(() => {
    const skillCounts = new Map();

    candidates.forEach(candidate => {
      (candidate.skills || []).forEach(skill => {
        const key = String(skill).trim();
        if (!key) return;
        skillCounts.set(key, (skillCounts.get(key) || 0) + 1);
      });
    });

    const rows = Array.from(skillCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, volume]) => ({ name, volume }));

    return rows.length > 0 ? rows : [{ name: 'No data', volume: 0 }];
  }, [candidates]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    const selectedCandidate = candidates.find(c => c.id === selectedCandidateId);
    if (!selectedCandidate || !role || !date || !time) {
      addToast('Please complete all form fields.', 'error');
      return;
    }
    const result = await scheduleInterview({
      candidateName: selectedCandidate.name,
      candidateAvatar: selectedCandidate.avatar,
      candidateClerkId: selectedCandidate.candidateClerkId || selectedCandidate.clerkId || '',
      jobTitle: role,
      company: selectedCandidate.company || companyName || currentUser?.companyName || currentUser?.company || '',
      date,
      time,
      type: 'Technical',
      notes: `Scheduled from recruiter dashboard for ${selectedCandidate.appliedFor || role}.`,
    });

    if (!result?.success) {
      addToast(result?.error || 'Unable to schedule interview.', 'error');
      return;
    }
    addToast(`Interview scheduled with ${selectedCandidate.name}!`, 'success');
    
    setSelectedCandidateId('');
    setRole('');
    setDate('');
    setTime('');
    setActiveTab('pipeline');
  };

  const handlePostJobSubmit = async (e) => {
    e.preventDefault();
    if (!jobTitle || !jobSkills || !jobDesc) {
      addToast("Please fill all job fields.", "error");
      return;
    }

    const packagedJob = {
      title: jobTitle,
      company: companyName,
      logo: companyName.charAt(0),
      salary: jobSalary,
      skills: jobSkills.split(',').map(s => s.trim()).filter(Boolean),
      location: jobLocation,
      department: jobDept,
      experience: jobExp,
      description: jobDesc,
      responsibilities: ["Lead platform features designs", "Optimize load metrics"],
      recruiter: {
        name: currentUser?.name || "Recruiter",
        role: `Talent Sourcing at ${companyName}`,
        avatar: currentUser?.avatar || ""
      }
    };

    const result = await addPendingJob(packagedJob);
    if (!result?.success) {
      addToast(result?.error || "Unable to submit job opening.", "error");
      return;
    }

    addToast("Job opening sent to Admin Queue! Status: Awaiting Approval", "success");

    // Reset post fields
    setJobTitle('');
    setJobDesc('');
    setActiveTab('pipeline');
  };

  const handleAdvance = (candId, currentStage) => {
    const idx = columns.indexOf(currentStage);
    if (idx < columns.length - 1) {
      const nextStage = columns[idx + 1];
      updateCandidateStage(candId, nextStage);
      addToast(`Candidate advanced to ${nextStage}`, 'success');
    }
  };

  const handleDemote = (candId, currentStage) => {
    const idx = columns.indexOf(currentStage);
    if (idx > 0) {
      const prevStage = columns[idx - 1];
      updateCandidateStage(candId, prevStage);
      addToast(`Candidate demoted to ${prevStage}`, 'info');
    }
  };

  const toggleCompare = (id) => {
    setCompareIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(cId => cId !== id);
      }
      if (prev.length >= 2) {
        addToast("You can only compare a maximum of 2 applicants side-by-side.", "info");
        return prev;
      }
      return [...prev, id];
    });
  };

  const isCompanyVerified = verifiedCompanies.includes(companyName);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-8 z-10 relative">
      
      {/* Headings */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 text-left">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
            Recruiter Management Suite
            {isCompanyVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[9px] font-black border border-emerald-500/15">
                <ShieldCheck className="w-3 h-3" /> Verified Partner
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Welcome back, <span className="font-bold">{currentUser?.name || "Recruiter"}</span> of <span className="font-bold">{companyName || currentUser?.companyName || currentUser?.company}</span>. Evaluate corporate applicants, schedule interviews, and organize Kanban pipeline stages.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="w-full overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-navy-800 pb-2">
          <div className="flex flex-nowrap items-center gap-2 min-w-max">
          {[
            { id: 'pipeline', label: 'Pipeline Board' },
            { id: 'shortlist', label: 'Candidate Grid' },
            { id: 'rankings', label: '✨ AI Rankings', highlight: true },
            { id: 'schedule', label: 'Book Interview' },
            { id: 'postjob', label: 'Post an Opening' },
            { id: 'branding', label: 'Employer Branding' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? tab.highlight ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-brand-500 text-white shadow'
                  : tab.highlight ? 'text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 font-extrabold' : 'text-slate-600 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-navy-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
          </div>
        </div>
      </div>

      <OfferBanner userRole="recruiter" />

      {/* Recruiter Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Total Sourced", value: totalApplicants, icon: Users, color: "bg-brand-500/10 text-brand-600" },
          { label: "Active Interviews", value: interviewingCount, icon: Calendar, color: "bg-indigo-500/10 text-indigo-500" },
          { label: "Offers Extended", value: offeredCount, icon: CheckCircle, color: "bg-emerald-500/10 text-emerald-500" },
          { label: "Avg ATS Match", value: candidates.length > 0 ? `${Math.round(candidates.reduce((sum, c) => sum + (c.atsScore || 0), 0) / candidates.length)}%` : '—', icon: FileCode, color: "bg-amber-500/10 text-amber-500" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex items-center gap-4 text-left">
              <div className={`p-3.5 rounded-2xl ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-800 dark:text-white">{stat.value}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold tracking-wider">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Tab components */}
      {activeTab === 'pipeline' && (
        <div className="flex flex-col gap-8">
          {/* Kanban Board columns */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4 items-start select-none">
            {columns.map(colName => {
              const colCandidates = candidates.filter(c => c.stage === colName);
              return (
                <div
                  key={colName}
                  className="flex-1 min-w-[220px] border border-slate-200/60 dark:border-navy-800 bg-slate-100/50 dark:bg-navy-900/30 rounded-2xl p-4 flex flex-col gap-4 text-left"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/55 dark:border-navy-800 pb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{colName}</span>
                    <span className="text-[10px] font-bold bg-slate-200 dark:bg-navy-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-400">{colCandidates.length}</span>
                  </div>

                  <div className="flex flex-col gap-3 min-h-[160px]">
                    {colCandidates.map(cand => (
                      <div
                        key={cand.id}
                        className="border border-slate-200 dark:border-navy-800/80 bg-white dark:bg-navy-950 p-3.5 rounded-xl shadow-sm flex flex-col gap-2 relative overflow-hidden group"
                      >
                        {/* Color accent bar */}
                        <div className="absolute top-0 right-0 h-1 bg-gradient-to-r from-brand-500 to-indigo-500 w-full" />
                        
                        <div className="flex items-center gap-2">
                          <ImageWithFallback src={cand.avatar} alt={cand.name} className="w-8 h-8 rounded-full object-cover" type="avatar" />
                          <div className="min-w-0">
                            <h5 className="text-[11px] font-bold text-slate-800 dark:text-white truncate leading-none">{cand.name}</h5>
                            <p className="text-[9px] text-slate-500 mt-0.5 truncate">{cand.title}</p>
                          </div>
                        </div>

                        <p className="text-[8.5px] text-slate-400">Position: <span className="text-slate-600 dark:text-slate-300 font-bold truncate">{cand.appliedFor}</span></p>

                        {/* Skills mini-pills */}
                        {cand.skills?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {cand.skills.slice(0, 3).map(s => (
                              <span key={s} className="text-[7.5px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-500 font-bold">{s}</span>
                            ))}
                            {cand.skills.length > 3 && <span className="text-[7.5px] text-slate-400">+{cand.skills.length - 3}</span>}
                          </div>
                        )}

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-navy-900 text-[10px] font-semibold">
                          <span className="text-brand-500 font-extrabold">{cand.atsScore}% ATS</span>
                          
                          <div className="flex gap-1.5 opacity-85 group-hover:opacity-100 transition-opacity">
                            {columns.indexOf(colName) > 0 && (
                              <button
                                onClick={() => handleDemote(cand.id, colName)}
                                className="w-4 h-4 rounded bg-slate-100 dark:bg-navy-800 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 text-[9px] flex items-center justify-center font-bold"
                                title="Move back"
                              >
                                ‹
                              </button>
                            )}
                            {columns.indexOf(colName) < columns.length - 1 && (
                              <button
                                onClick={() => handleAdvance(cand.id, colName)}
                                className="w-4 h-4 rounded bg-slate-100 dark:bg-navy-800 hover:bg-brand-500/10 hover:text-brand-500 text-slate-400 text-[9px] flex items-center justify-center font-bold"
                                title="Advance stage"
                              >
                                ›
                              </button>
                            )}
                          </div>
                        </div>

                        {/* View Profile button */}
                        <button
                          onClick={() => setProfileCandidate(cand)}
                          className="w-full mt-2 py-1.5 rounded-lg bg-slate-50 dark:bg-navy-900 hover:bg-brand-500 hover:text-white text-slate-500 dark:text-slate-400 text-[9px] font-extrabold uppercase tracking-wide border border-slate-200 dark:border-navy-800 transition-all"
                        >
                          View Full Profile
                        </button>
                      </div>
                    ))}
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'shortlist' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-left">
          
          {/* Advanced Filters Panel - Spans 3 columns */}
          <div className="lg:col-span-3 border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 backdrop-blur-xl rounded-3xl p-5 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 w-full flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by name, title, skills..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/60 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500"
                />
              </div>

              {/* Min ATS Score Slider */}
              <div className="flex flex-col gap-1 min-w-[150px]">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                  <span>Min ATS Score</span>
                  <span className="text-brand-500 font-extrabold">{minAtsScore}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={minAtsScore}
                  onChange={(e) => setMinAtsScore(Number(e.target.value))}
                  className="w-full accent-brand-500 h-1.5 bg-slate-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Target Role Dropdown */}
              <div className="flex flex-col gap-1 min-w-[140px]">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Target Role</span>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="p-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs font-semibold rounded-xl outline-none text-slate-700 dark:text-slate-200 focus:border-brand-500"
                >
                  {availableRoles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>

              {/* Experience Dropdown */}
              <div className="flex flex-col gap-1 min-w-[120px]">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Experience</span>
                <select
                  value={filterExp}
                  onChange={(e) => setFilterExp(e.target.value)}
                  className="p-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs font-semibold rounded-xl outline-none text-slate-700 dark:text-slate-200 focus:border-brand-500"
                >
                  <option value="All">All Experiences</option>
                  <option value="1-3 Years">1-3 Years</option>
                  <option value="4-6 Years">4-6 Years</option>
                  <option value="7+ Years">7+ Years</option>
                </select>
              </div>
            </div>

            {/* View Mode Toggle Buttons */}
            <div className="flex bg-slate-100 dark:bg-navy-950 p-1 rounded-xl self-stretch md:self-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-navy-900 text-brand-500 shadow-sm'
                    : 'text-slate-600 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Grid Pool
              </button>
              <button
                onClick={() => setViewMode('leaderboard')}
                className={`px-3 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  viewMode === 'leaderboard'
                    ? 'bg-white dark:bg-navy-900 text-brand-500 shadow-sm'
                    : 'text-slate-600 dark:text-slate-500 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                ATS Leaderboard
              </button>
            </div>
          </div>

          {/* Main shortlist Grid Table or Leaderboard View */}
          <div className="lg:col-span-2 flex flex-col gap-4 w-full">
            {viewMode === 'grid' ? (
              <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider">Shortlisted Candidates Pool ({filteredCandidates.length})</h4>
                  {compareIds.length > 0 && (
                    <span className="text-[10px] font-bold text-indigo-500 animate-pulse">{compareIds.length} candidate(s) selected for comparison</span>
                  )}
                </div>
                {filteredCandidates.length > 0 ? (
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-navy-800 pb-3">
                        <th className="text-[10px] uppercase font-bold text-slate-500 tracking-wider p-3">Compare</th>
                        <th className="text-[10px] uppercase font-bold text-slate-500 tracking-wider p-3">Applicant Name</th>
                        <th className="text-[10px] uppercase font-bold text-slate-500 tracking-wider p-3">Target Role</th>
                        <th className="text-[10px] uppercase font-bold text-slate-500 tracking-wider p-3 text-center">ATS Rating</th>
                        <th className="text-[10px] uppercase font-bold text-slate-500 tracking-wider p-3 text-center">Pipeline State</th>
                        <th className="text-[10px] uppercase font-bold text-slate-500 tracking-wider p-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCandidates.map(cand => (
                        <tr key={cand.id} className="border-b border-slate-100/50 dark:border-navy-800 hover:bg-slate-50/50 dark:hover:bg-navy-950/20 transition-all">
                          <td className="p-3 text-center">
                            <input 
                              type="checkbox" 
                              checked={compareIds.includes(cand.id)}
                              onChange={() => toggleCompare(cand.id)}
                              className="cursor-pointer h-4 w-4 rounded accent-brand-500" 
                            />
                          </td>
                          <td className="p-3 flex items-center gap-3">
                            <ImageWithFallback src={cand.avatar} alt={cand.name} className="w-9 h-9 rounded-full object-cover" type="avatar" />
                            <div>
                              <p className="text-xs font-bold text-slate-800 dark:text-white leading-none">{cand.name}</p>
                              <p className="text-[9px] text-slate-500 mt-1">{cand.email}</p>
                            </div>
                          </td>
                          <td className="p-3 text-xs font-bold text-slate-700 dark:text-slate-300">{cand.appliedFor}</td>
                          <td className="p-3 text-xs font-extrabold text-brand-500 text-center">{cand.atsScore}%</td>
                          <td className="p-3 text-center">
                            <span className="text-[9px] font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 px-2 py-0.5 rounded-full">{cand.stage}</span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setProfileCandidate(cand)}
                                className="text-[10px] font-bold text-brand-500 hover:underline flex items-center gap-0.5"
                              >
                                View Profile <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-10 text-center text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    No candidates match the specified filter criteria.
                  </div>
                )}
              </div>
            ) : (
              /* ATS Leaderboard View */
              <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4 w-full">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h4 className="text-xs uppercase font-extrabold text-slate-500 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                      ATS Talent Leaderboard ({leaderboardCandidates.length})
                    </h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Top qualified candidates ranked by resume skills criteria alignment</p>
                  </div>
                </div>

                {leaderboardCandidates.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {leaderboardCandidates.map((cand, idx) => {
                      const rank = idx + 1;
                      const isCompareChecked = compareIds.includes(cand.id);

                      // Color coding for score
                      let scoreColor = "bg-brand-500 text-brand-500";
                      let scoreText = "Good Match";
                      if (cand.atsScore >= 90) {
                        scoreColor = "bg-emerald-500 text-emerald-500";
                        scoreText = "Outstanding Match";
                      } else if (cand.atsScore >= 80) {
                        scoreColor = "bg-amber-500 text-amber-500";
                        scoreText = "Strong Match";
                      }

                      return (
                        <div
                          key={cand.id}
                          className={`border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:scale-[1.005] ${
                            rank === 1
                              ? 'bg-gradient-to-r from-amber-500/5 via-transparent to-transparent border-amber-500/30 dark:border-amber-500/20 shadow-md'
                              : rank === 2
                              ? 'bg-gradient-to-r from-slate-400/5 via-transparent to-transparent border-slate-400/30 dark:border-slate-400/20'
                              : rank === 3
                               ? 'bg-gradient-to-r from-amber-700/5 via-transparent to-transparent border-amber-700/30 dark:border-amber-700/20'
                              : 'bg-white/40 dark:bg-navy-950/20 border-slate-200/70 dark:border-navy-800'
                          }`}
                        >
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            {/* Rank Indicator */}
                            <div className="flex-shrink-0">
                              {rank === 1 ? (
                                <div className="w-7 h-7 rounded-full bg-amber-500 text-white flex items-center justify-center font-black text-xs shadow-md shadow-amber-500/20">
                                  🥇
                                </div>
                              ) : rank === 2 ? (
                                <div className="w-7 h-7 rounded-full bg-slate-400 text-white flex items-center justify-center font-black text-xs shadow-md shadow-slate-400/20">
                                  🥈
                                </div>
                              ) : rank === 3 ? (
                                <div className="w-7 h-7 rounded-full bg-amber-700 text-white flex items-center justify-center font-black text-xs shadow-md shadow-amber-700/20">
                                  🥉
                                </div>
                              ) : (
                                <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-xs border border-slate-200 dark:border-navy-700">
                                  #{rank}
                                </div>
                              )}
                            </div>

                            {/* Candidate Info */}
                            <ImageWithFallback src={cand.avatar} alt={cand.name} className="w-10 h-10 rounded-full object-cover border-2 border-slate-100 dark:border-navy-800" type="avatar" />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs font-bold text-slate-800 dark:text-white leading-none">{cand.name}</h5>
                                <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase ${
                                  cand.stage === 'Offered'
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : 'bg-brand-500/10 text-brand-500'
                                }`}>
                                  {cand.stage}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-500 mt-1 truncate">{cand.title} • <span className="font-semibold text-slate-600 dark:text-slate-300">{cand.experience} Exp</span></p>
                              <p className="text-[9px] text-slate-400 mt-0.5">Role: <span className="font-bold">{cand.appliedFor}</span></p>
                            </div>
                          </div>

                          {/* ATS Score & Progress Bar */}
                          <div className="flex flex-col gap-1 w-full sm:w-36 flex-shrink-0">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-brand-500 font-extrabold">{cand.atsScore}% Score</span>
                              <span className="text-slate-400 text-[8.5px]">{scoreText}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-navy-800 rounded-full overflow-hidden">
                              <div className={`h-full ${scoreColor.split(' ')[0]} rounded-full`} style={{ width: `${cand.atsScore}%` }} />
                            </div>
                          </div>

                          {/* Compare checkbox & Actions */}
                          <div className="flex items-center gap-3.5 self-end sm:self-auto">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={isCompareChecked}
                                onChange={() => toggleCompare(cand.id)}
                                className="cursor-pointer h-3.5 w-3.5 rounded accent-brand-500" 
                              />
                              <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">Compare</span>
                            </label>
                            <button
                              onClick={() => addToast(`Messaged ${cand.name}!`, 'success')}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-brand-500 hover:text-white text-[10px] font-extrabold text-slate-700 dark:text-slate-200 transition-all"
                            >
                              Message
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-10 text-center text-xs text-slate-500 dark:text-slate-400 font-semibold">
                    No candidates match the specified leaderboard criteria.
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 w-full">
            {/* Competence chart */}
            <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Competencies Sourced</h4>
                <p className="text-[10px] text-slate-400">Top skills aggregated from the current candidate pool</p>
              </div>
              <div className="h-44 w-full text-xs font-semibold mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#0b0f19', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                    <Bar dataKey="volume" fill="#3b6beb" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* AI Side-by-Side Candidate Comparison View */}
          {compareIds.length === 2 && (
            <div className="lg:col-span-3 border border-indigo-200 dark:border-navy-800/80 bg-gradient-to-tr from-brand-500/5 to-indigo-500/5 dark:from-brand-500/10 dark:to-indigo-500/10 rounded-3xl p-6 shadow-lg flex flex-col gap-6 w-full">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
                    AI Applicant Comparison Sourcing
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Dual-profile analytics match review</p>
                </div>
                <button 
                  onClick={() => setCompareIds([])}
                  className="text-[9px] uppercase font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear Compare
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 dark:border-navy-800">
                {compareIds.map((candId, idx) => {
                  const candidate = candidates.find(c => c.id === candId);
                  if (!candidate) return null;
                  return (
                    <div key={candidate.id} className="p-4 rounded-2xl border border-slate-200 dark:border-navy-800 bg-white/70 dark:bg-navy-950/40 flex flex-col gap-4">
                      <div className="flex items-center gap-3">
                        <ImageWithFallback src={candidate.avatar} alt={candidate.name} className="w-10 h-10 rounded-full object-cover border-2 border-brand-500" type="avatar" />
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Applicant #{idx + 1}</span>
                          <h5 className="text-xs font-bold text-slate-800 dark:text-white mt-0.5 leading-none">{candidate.name}</h5>
                          <p className="text-[9.5px] text-slate-500 mt-1">{candidate.title}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[10.5px]">
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900/50">
                          <span className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">ATS Score</span>
                          <p className="text-base font-extrabold text-brand-500 mt-0.5">{candidate.atsScore}% Match</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-900/50">
                          <span className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Experience</span>
                          <p className="text-base font-extrabold text-slate-800 dark:text-slate-200 mt-0.5">{candidate.experience}</p>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <span className="text-[9px] uppercase font-bold text-slate-400">Core Competencies Sourced</span>
                        <div className="flex flex-wrap gap-1">
                          {candidate.skills.map(s => (
                            <span key={s} className="text-[8.5px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-900 text-slate-500 dark:text-slate-400">{s}</span>
                          ))}
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-[9.5px] leading-relaxed text-slate-600 dark:text-slate-300">
                        <span className="font-bold flex items-center gap-1 mb-1 text-indigo-600 dark:text-indigo-400">📝 Sourcing Review</span>
                        Highly compatible for <span className="font-bold">{candidate.appliedFor}</span> roles. Good structural alignment indicators in PDF scan metrics.
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Candidate Profile Modal */}
      {profileCandidate && (
        <CandidateProfileModal
          candidate={profileCandidate}
          onClose={() => setProfileCandidate(null)}
          onAdvance={columns.indexOf(profileCandidate.stage) < columns.length - 1 ? () => { handleAdvance(profileCandidate.id, profileCandidate.stage); setProfileCandidate(null); } : null}
          onDemote={columns.indexOf(profileCandidate.stage) > 0 ? () => { handleDemote(profileCandidate.id, profileCandidate.stage); setProfileCandidate(null); } : null}
          stages={columns}
        />
      )}

      {activeTab === 'rankings' && <AIRankingsTab
        jobs={jobs}
        currentUser={currentUser}
        generateRanking={generateRanking}
        fetchRankedCandidates={fetchRankedCandidates}
        handleShortlistDecision={handleShortlistDecision}
        addToast={addToast}
      />}

      {activeTab === 'schedule' && (
        <div className="max-w-xl mx-auto w-full border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 text-left">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-brand-500" />
              Schedule Candidate Interview
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">Scheduling an interview registers it dynamically in the Candidate Schedule timeline.</p>
          </div>

          <form onSubmit={handleScheduleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Candidate Name</label>
              <select
                value={selectedCandidateId}
                onChange={(e) => {
                  const id = e.target.value;
                  setSelectedCandidateId(id);
                  const selected = candidates.find(c => c.id === id);
                  if (selected?.appliedFor && !role) {
                    setRole(selected.appliedFor);
                  }
                }}
                className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl outline-none text-xs text-slate-700 dark:text-slate-200 focus:border-brand-500"
                required
              >
                <option value="">Select Candidate...</option>
                {candidates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Interview Position</label>
              <input
                type="text"
                placeholder="e.g. Senior UX Engineer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Time</label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all mt-2"
            >
              Schedule Sourcing Interview
            </button>
          </form>
        </div>
      )}

      {/* POST AN OPENING TAB FORM */}
      {activeTab === 'postjob' && (
        <div className="max-w-xl mx-auto w-full border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 text-left">
          <div>
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Plus className="w-5 h-5 text-indigo-500" />
              Post a New Job Opening
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 text-amber-500">
              <AlertCircle className="w-3.5 h-3.5" /> Note: Job submissions must be reviewed and approved by Admin before going live.
            </p>
          </div>

          <form onSubmit={handlePostJobSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Position Title</label>
              <input
                type="text"
                placeholder="e.g. Lead Frontend Engineer"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500 focus:ring-1"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Salary Range</label>
                <input
                  type="text"
                  placeholder="e.g. ₹13,00,000 - ₹16,00,000"
                  value={jobSalary}
                  onChange={(e) => setJobSalary(e.target.value)}
                  className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Location / Style</label>
                <input
                  type="text"
                  placeholder="e.g. Remote, San Francisco, CA"
                  value={jobLocation}
                  onChange={(e) => setJobLocation(e.target.value)}
                  className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Department</label>
                <input
                  type="text"
                  placeholder="e.g. Engineering"
                  value={jobDept}
                  onChange={(e) => setJobDept(e.target.value)}
                  className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Experience Level</label>
                <input
                  type="text"
                  placeholder="e.g. 3+ Years"
                  value={jobExp}
                  onChange={(e) => setJobExp(e.target.value)}
                  className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Required Skills (Comma separated)</label>
              <input
                type="text"
                placeholder="React, TypeScript, TailwindCSS"
                value={jobSkills}
                onChange={(e) => setJobSkills(e.target.value)}
                className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Job Description Details</label>
              <textarea
                rows={3}
                placeholder="Write a clear summary of responsibilities, requirements, and tech guidelines..."
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all mt-2"
            >
              Post Sourcing Opening for Admin Approval
            </button>
          </form>
        </div>
      )}

      {/* EMPLOYER BRANDING TAB PANEL */}
      {activeTab === 'branding' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
          
          {/* Editor Form left */}
          <div className="lg:col-span-7 border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-brand-500" />
                Customize Employer Sourcing Branding
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Customize your brand details, team benefits, and corporate descriptions.</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); addToast("Company branding updated successfully!", "success"); }} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Employer Name</label>
                  <input 
                    type="text" 
                    value={companyName} 
                    onChange={(e) => setCompanyName(e.target.value)} 
                    className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Company Size</label>
                  <input 
                    type="text" 
                    value={companySize} 
                    onChange={(e) => setCompanySize(e.target.value)} 
                    className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Company Sourcing Website</label>
                <input 
                  type="text" 
                  value={companyWebsite} 
                  onChange={(e) => setCompanyWebsite(e.target.value)} 
                  className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500" 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Brand Vision Description</label>
                <textarea 
                  rows={2} 
                  value={companyDesc} 
                  onChange={(e) => setCompanyDesc(e.target.value)} 
                  className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500 resize-none" 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] uppercase font-bold text-slate-400">Corporate Employee Benefits</label>
                <textarea 
                  rows={2} 
                  value={companyBenefits} 
                  onChange={(e) => setCompanyBenefits(e.target.value)} 
                  className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800 rounded-xl text-xs text-slate-700 dark:text-slate-200 outline-none focus:border-brand-500 resize-none" 
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-slate-900 dark:bg-navy-950 text-white text-xs font-bold shadow-sm"
              >
                Save Employer Profile Changes
              </button>
            </form>
          </div>

          {/* Sourcing card right */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Public Profile Card</span>
            
            <div className="border border-slate-200/80 dark:border-navy-800 bg-white dark:bg-navy-950 p-6 shadow-2xl rounded-3xl flex flex-col gap-6 relative overflow-hidden">
              {/* verification shield decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5 select-none translate-x-8 -translate-y-8">
                <ShieldCheck className="w-full h-full" />
              </div>
              
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-navy-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 font-black text-2xl flex items-center justify-center">
                    {companyName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-800 dark:text-white leading-tight">{companyName}</h3>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{companyWebsite} • <span className="font-semibold">{companySize}</span></p>
                  </div>
                </div>

                {isCompanyVerified ? (
                  <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/15 text-[9.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Verified Sourcing Partner
                  </span>
                ) : (
                  <span className="bg-slate-200 dark:bg-navy-900 text-slate-500 text-[9.5px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-500" /> Pending Verification
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Employer Vision</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-300 leading-relaxed font-sans">{companyDesc}</p>
                </div>
                <div className="flex flex-col gap-0.5 mt-2">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Staff Benefits</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-300 leading-relaxed font-sans">{companyBenefits}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// AI Rankings Tab — Extracted Component
// ────────────────────────────────────────────────────────────────────────────

const RECOMMENDATION_STYLES = {
  'Highly Recommended': {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    icon: '🔥',
  },
  'Recommended': {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
    icon: '⭐',
  },
  'Potential Match': {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
    icon: '💡',
  },
  'Low Match': {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    text: 'text-red-500 dark:text-red-400',
    dot: 'bg-red-500',
    icon: '⚠️',
  },
};

const ScoreBar = ({ label, score, color }) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between items-center text-[9px] font-bold">
      <span className="text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</span>
      <span className={`font-extrabold ${color}`}>{score}%</span>
    </div>
    <div className="w-full h-1.5 bg-slate-100 dark:bg-navy-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${
          score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-blue-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-400'
        }`}
        style={{ width: `${score}%` }}
      />
    </div>
  </div>
);

const AIRankingsTab = ({ jobs, currentUser, generateRanking, fetchRankedCandidates, handleShortlistDecision, addToast }) => {
  const [selectedJobId, setSelectedJobId] = useState('');
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [filterRec, setFilterRec] = useState('');
  const [filterMinScore, setFilterMinScore] = useState(0);
  const [sortBy, setSortBy] = useState('finalScore');
  const [expandedCard, setExpandedCard] = useState(null);

  // Get recruiter's own jobs
  const recruiterJobs = useMemo(() => {
    if (!currentUser) return jobs;
    return jobs.filter(j =>
      j.recruiter?.clerkId === currentUser.clerkId ||
      j.recruiter?.clerkId === currentUser._id ||
      j.postedBy === currentUser._id
    );
  }, [jobs, currentUser]);

  const loadRankings = useCallback(async (jobId, filters = {}) => {
    if (!jobId) return;
    setLoading(true);
    try {
      const data = await fetchRankedCandidates(jobId, {
        sort: filters.sort || sortBy,
        recommendation: filters.recommendation || filterRec || undefined,
        minScore: (filters.minScore ?? filterMinScore) || undefined,
      });
      setRankings(data.rankings || []);
      setTotalResults(data.total || 0);
    } finally {
      setLoading(false);
    }
  }, [fetchRankedCandidates, sortBy, filterRec, filterMinScore]);

  const handleJobSelect = useCallback((jobId) => {
    setSelectedJobId(jobId);
    setRankings([]);
    setTotalResults(0);
    if (jobId) {
      loadRankings(jobId);
    }
  }, [loadRankings]);

  const handleGenerate = useCallback(async () => {
    if (!selectedJobId) {
      addToast('Please select a job first.', 'error');
      return;
    }
    setGenerating(true);
    try {
      const result = await generateRanking(selectedJobId);
      if (result.success) {
        addToast(`Rankings generated! ${result.generated} new, ${result.cached} cached.`, 'success');
        await loadRankings(selectedJobId);
      } else {
        addToast(result.error || 'Failed to generate rankings.', 'error');
      }
    } finally {
      setGenerating(false);
    }
  }, [selectedJobId, generateRanking, loadRankings, addToast]);

  const handleShortlist = useCallback(async (rankingId, accepted) => {
    const result = await handleShortlistDecision(selectedJobId, rankingId, accepted);
    if (result.success) {
      addToast(accepted ? 'Candidate shortlisted!' : 'Shortlist suggestion rejected.', accepted ? 'success' : 'info');
      setRankings(prev => prev.map(r =>
        r._id === rankingId ? { ...r, shortlistAccepted: accepted, stage: accepted ? 'Screening' : r.stage } : r
      ));
    } else {
      addToast(result.error || 'Action failed.', 'error');
    }
  }, [selectedJobId, handleShortlistDecision, addToast]);

  // Reload when filters change
  useEffect(() => {
    if (selectedJobId) {
      loadRankings(selectedJobId);
    }
  }, [sortBy, filterRec, filterMinScore]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedJob = recruiterJobs.find(j => (j._id || j.id) === selectedJobId);

  return (
    <div className="flex flex-col gap-6 text-left">
      {/* Header Section */}
      <div className="border border-indigo-200/60 dark:border-indigo-500/20 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10 backdrop-blur-xl rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
                AI Candidate Ranking Engine
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold uppercase tracking-wider">AI Powered</span>
              </h3>
              <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-0.5">
                Multi-dimensional analysis: Skills (40%) • Experience (25%) • Location (15%) • Semantic Match (20%)
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            {/* Job Selector */}
            <div className="flex flex-col gap-1 flex-1 min-w-[220px]">
              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Select Job Posting</span>
              <select
                value={selectedJobId}
                onChange={(e) => handleJobSelect(e.target.value)}
                className="p-2.5 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs font-semibold rounded-xl outline-none text-slate-700 dark:text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
              >
                <option value="">Choose a job...</option>
                {(recruiterJobs.length > 0 ? recruiterJobs : jobs).map(j => (
                  <option key={j._id || j.id} value={j._id || j.id}>
                    {j.title} — {j.company}
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!selectedJobId || generating}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all self-end ${
                generating
                  ? 'bg-slate-200 dark:bg-navy-800 text-slate-400 cursor-not-allowed'
                  : selectedJobId
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              {generating ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
              ) : (
                <><Zap className="w-4 h-4" /> Generate Rankings</>
              )}
            </button>
          </div>
        </div>

        {/* Selected Job Info */}
        {selectedJob && (
          <div className="mt-4 pt-4 border-t border-indigo-200/30 dark:border-indigo-500/10 flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-bold text-slate-500 uppercase">Active Job:</span>
            <span className="text-xs font-bold text-slate-800 dark:text-white">{selectedJob.title}</span>
            <span className="text-[10px] text-slate-400">at {selectedJob.company}</span>
            {selectedJob.skills?.length > 0 && (
              <div className="flex flex-wrap gap-1 ml-2">
                {selectedJob.skills.slice(0, 5).map(s => (
                  <span key={s} className="text-[8.5px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">{s}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filters Bar */}
      {selectedJobId && (
        <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 backdrop-blur-xl rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Sort */}
          <div className="flex flex-col gap-1 min-w-[150px]">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Sort By</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="p-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs font-semibold rounded-lg outline-none text-slate-700 dark:text-slate-200 focus:border-indigo-500"
            >
              <option value="finalScore">Overall Score</option>
              <option value="skillsScore">Skills Score</option>
              <option value="experienceScore">Experience Score</option>
              <option value="locationScore">Location Score</option>
              <option value="semanticScore">Semantic Score</option>
            </select>
          </div>

          {/* Recommendation Filter */}
          <div className="flex flex-col gap-1 min-w-[180px]">
            <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Recommendation</span>
            <select
              value={filterRec}
              onChange={(e) => setFilterRec(e.target.value)}
              className="p-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs font-semibold rounded-lg outline-none text-slate-700 dark:text-slate-200 focus:border-indigo-500"
            >
              <option value="">All Levels</option>
              <option value="Highly Recommended">🔥 Highly Recommended</option>
              <option value="Recommended">⭐ Recommended</option>
              <option value="Potential Match">💡 Potential Match</option>
              <option value="Low Match">⚠️ Low Match</option>
            </select>
          </div>

          {/* Min Score */}
          <div className="flex flex-col gap-1 min-w-[140px]">
            <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Min Score</span>
              <span className="text-indigo-500 font-extrabold">{filterMinScore}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={filterMinScore}
              onChange={(e) => setFilterMinScore(Number(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-100 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Results count */}
          <div className="flex items-center gap-2 ml-auto text-[10px] font-bold text-slate-500">
            <Target className="w-3.5 h-3.5 text-indigo-500" />
            <span>{totalResults} candidate{totalResults !== 1 ? 's' : ''} ranked</span>
          </div>

          {/* Refresh */}
          <button
            onClick={() => loadRankings(selectedJobId)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-indigo-500/10 text-slate-500 hover:text-indigo-500 transition-all"
            title="Refresh rankings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Rankings List */}
      {loading ? (
        <div className="flex items-center justify-center py-20 gap-3">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Loading rankings...</span>
        </div>
      ) : rankings.length > 0 ? (
        <div className="flex flex-col gap-4">
          {rankings.map((r) => {
            const recStyle = RECOMMENDATION_STYLES[r.recommendation] || RECOMMENDATION_STYLES['Low Match'];
            const isExpanded = expandedCard === r._id;
            const rank = r.rank || 1;

            return (
              <div
                key={r._id}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg ${
                  rank === 1
                    ? 'border-amber-400/40 dark:border-amber-500/30 bg-gradient-to-r from-amber-500/5 via-white/70 to-white/70 dark:from-amber-500/10 dark:via-navy-900/40 dark:to-navy-900/40 shadow-md shadow-amber-500/10'
                    : rank === 2
                    ? 'border-slate-300/50 dark:border-slate-500/30 bg-gradient-to-r from-slate-300/10 via-white/70 to-white/70 dark:from-slate-400/10 dark:via-navy-900/40 dark:to-navy-900/40'
                    : rank === 3
                    ? 'border-amber-600/30 dark:border-amber-700/20 bg-gradient-to-r from-amber-700/5 via-white/70 to-white/70 dark:from-amber-700/10 dark:via-navy-900/40 dark:to-navy-900/40'
                    : 'border-slate-200/70 dark:border-navy-800 bg-white/70 dark:bg-navy-900/40'
                }`}
              >
                {/* Main Row */}
                <div
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedCard(isExpanded ? null : r._id)}
                >
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    {rank === 1 ? (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-amber-500/30">🥇</div>
                    ) : rank === 2 ? (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-300 to-slate-500 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-slate-400/30">🥈</div>
                    ) : rank === 3 ? (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-amber-700/30">🥉</div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 flex items-center justify-center font-extrabold text-sm border border-slate-200 dark:border-navy-700">#{rank}</div>
                    )}
                  </div>

                  {/* Candidate Info */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <ImageWithFallback src={r.candidateAvatar} alt={r.candidateName} className="w-11 h-11 rounded-xl object-cover border-2 border-slate-100 dark:border-navy-800" type="avatar" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h5 className="text-sm font-bold text-slate-800 dark:text-white leading-none">{r.candidateName}</h5>
                        <span className={`text-[8px] px-2 py-0.5 rounded-full font-black uppercase border ${recStyle.bg} ${recStyle.border} ${recStyle.text}`}>
                          {recStyle.icon} {r.recommendation}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 truncate">
                        {r.candidateExperience || 'N/A'} experience • Stage: <span className="font-semibold text-slate-600 dark:text-slate-300">{r.stage}</span>
                      </p>
                    </div>
                  </div>

                  {/* Match Percentage — Big */}
                  <div className="flex-shrink-0 text-center px-4">
                    <div className={`text-2xl font-black ${
                      r.finalScore > 85 ? 'text-emerald-500' : r.finalScore >= 70 ? 'text-blue-500' : r.finalScore >= 50 ? 'text-amber-500' : 'text-red-400'
                    }`}>
                      {r.finalScore}%
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">Match</p>
                  </div>

                  {/* Score Breakdowns — Mini */}
                  <div className="flex-shrink-0 w-full sm:w-44 flex flex-col gap-1.5">
                    <ScoreBar label="Skills" score={r.skillsScore} color="text-indigo-500" />
                    <ScoreBar label="Experience" score={r.experienceScore} color="text-purple-500" />
                    <ScoreBar label="Location" score={r.locationScore} color="text-cyan-500" />
                    <ScoreBar label="Semantic" score={r.semanticScore} color="text-pink-500" />
                  </div>

                  {/* Auto-Shortlist Actions */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    {r.autoShortlisted && r.shortlistAccepted === null && (
                      <>
                        <span className="text-[8px] font-bold text-amber-500 uppercase flex items-center gap-1">
                          <Star className="w-3 h-3" /> Auto-Suggested
                        </span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleShortlist(r._id, true); }}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 transition-all hover:scale-105 active:scale-95 shadow-sm"
                          >
                            <ThumbsUp className="w-3 h-3" /> Accept
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleShortlist(r._id, false); }}
                            className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-navy-800 hover:bg-red-500/10 text-slate-600 dark:text-slate-300 hover:text-red-500 text-[10px] font-bold flex items-center gap-1 transition-all"
                          >
                            <ThumbsDown className="w-3 h-3" /> Reject
                          </button>
                        </div>
                      </>
                    )}
                    {r.shortlistAccepted === true && (
                      <span className="text-[9px] font-bold text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg">
                        <Check className="w-3 h-3" /> Shortlisted
                      </span>
                    )}
                    {r.shortlistAccepted === false && (
                      <span className="text-[9px] font-bold text-slate-400 flex items-center gap-1">
                        <X className="w-3 h-3" /> Passed
                      </span>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-slate-100 dark:border-navy-800/50 flex flex-col gap-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      {/* Strengths */}
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <h6 className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Strengths
                        </h6>
                        <div className="flex flex-wrap gap-1.5">
                          {(r.matchedSkills || []).length > 0 ? r.matchedSkills.map(s => (
                            <span key={s} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                              ✔ {s}
                            </span>
                          )) : (
                            <span className="text-[9px] text-slate-400">No matched skills data</span>
                          )}
                        </div>
                      </div>

                      {/* Missing Skills */}
                      <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                        <h6 className="text-[10px] uppercase font-bold text-red-500 dark:text-red-400 mb-2 flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Missing Skills
                        </h6>
                        <div className="flex flex-wrap gap-1.5">
                          {(r.missingSkills || []).length > 0 ? r.missingSkills.map(s => (
                            <span key={s} className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 dark:text-red-400 flex items-center gap-0.5">
                              ✖ {s}
                            </span>
                          )) : (
                            <span className="text-[9px] text-slate-400 italic">All required skills matched!</span>
                          )}
                        </div>
                      </div>

                      {/* AI Recommendation */}
                      <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                        <h6 className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> AI Recommendation
                        </h6>
                        <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                          {r.summary || 'No analysis available.'}
                        </p>
                      </div>
                    </div>

                    {/* Detailed Score Grid */}
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: 'Skills Match', score: r.skillsScore, weight: '40%', color: 'from-indigo-500 to-blue-500' },
                        { label: 'Experience', score: r.experienceScore, weight: '25%', color: 'from-purple-500 to-pink-500' },
                        { label: 'Location', score: r.locationScore, weight: '15%', color: 'from-cyan-500 to-teal-500' },
                        { label: 'Semantic', score: r.semanticScore, weight: '20%', color: 'from-pink-500 to-rose-500' },
                      ].map((dim) => (
                        <div key={dim.label} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-950/40 border border-slate-200/50 dark:border-navy-800/50 text-center">
                          <div className={`text-lg font-black bg-gradient-to-r ${dim.color} bg-clip-text text-transparent`}>
                            {dim.score}
                          </div>
                          <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">{dim.label}</p>
                          <p className="text-[8px] text-slate-400 mt-0.5">Weight: {dim.weight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : selectedJobId ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
            <Brain className="w-10 h-10 text-indigo-400" />
          </div>
          <div className="text-center">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">No Rankings Generated Yet</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
              Click "Generate Rankings" to analyze all applicants using our AI-powered multi-dimensional scoring engine.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            Generate Rankings Now
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-navy-800/50">
            <BarChart3 className="w-10 h-10 text-slate-400" />
          </div>
          <div className="text-center">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">Select a Job Posting</h4>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm">
              Choose a job from the dropdown above to view AI-powered candidate rankings with detailed score breakdowns.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
