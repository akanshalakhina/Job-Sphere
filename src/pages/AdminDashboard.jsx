import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { 
  ShieldCheck, Users, Briefcase, IndianRupee, Activity, Sparkles, CheckCircle2, 
  XCircle, Clock, ShieldAlert, Cpu, HardDrive, RefreshCw, Star, Landmark
} from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';

export const AdminDashboard = () => {
  const { 
    pendingJobs, approveJob, rejectJob, 
    verifiedCompanies, toggleCompanyVerification, 
    jobs, candidates 
  } = useAppState();
  const { addToast } = useToast();
  
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'revenue', 'approvals', 'verification', 'monitoring'
  const [activeLoad, setActiveLoad] = useState(68); // Simulated load slider
  const [systemLogs, setSystemLogs] = useState([
    { time: "20:50:12", status: "success", text: "AI matching engine completed scanning resume_vansh.pdf with score 88%" },
    { time: "20:48:45", status: "info", text: "Recruiter Olivia Rhye posted a new Senior Product Architect position" },
    { time: "20:42:01", status: "success", text: "Stripe company account verified successfully" },
    { time: "20:30:15", status: "warning", text: "AI Gateway usage peaked at 89% throttle limit" }
  ]);

  // Sourcing stats
  const totalStudents = candidates.length;
  const activeSponsors = verifiedCompanies.length;
  const approvedJobsCount = jobs.length;
  
  // Recharts Mock Billing Data
  const revenueData = [
    { month: 'Jan', gold: 102000, platinum: 204000, diamond: 323000 },
    { month: 'Feb', gold: 127500, platinum: 238000, diamond: 357000 },
    { month: 'Mar', gold: 153000, platinum: 297500, diamond: 433500 },
    { month: 'Apr', gold: 204000, platinum: 348500, diamond: 527000 },
    { month: 'May', gold: 263500, platinum: 476000, diamond: 714000 }
  ];

  // Pie chart for tier distribution
  const tierDistribution = [
    { name: 'Gold Tier', value: 120, color: '#e2b53e' },
    { name: 'Platinum Tier', value: 245, color: '#6366f1' },
    { name: 'Diamond Tier', value: 92, color: '#06b6d4' }
  ];

  const handleApprove = (id, title) => {
    approveJob(id);
    addToast(`Approved Job: ${title}! Added to active listings.`, 'success');
  };

  const handleReject = (id, title) => {
    rejectJob(id);
    addToast(`Rejected Job: ${title}`, 'info');
  };

  const triggerClearLogs = () => {
    setSystemLogs([]);
    addToast("System event logs cleared.", "info");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-8 z-10 relative">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-indigo-500" />
            Admin Command Console
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Monitor overall systems health, review recruiter listings, manage verification checkmarks, and track revenue models.</p>
        </div>

        {/* Tab switchers */}
        <div className="border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 rounded-2xl p-1 flex flex-wrap gap-1 w-full sm:w-auto">
          {[
            { id: 'overview', label: 'Platform Stats' },
            { id: 'revenue', label: 'Revenue & SaaS' },
            { id: 'approvals', label: `Pending Approvals (${pendingJobs.length})` },
            { id: 'verification', label: 'Verifications' },
            { id: 'monitoring', label: 'AI Monitoring' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-brand-600 to-indigo-650 text-white shadow'
                  : 'text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Admin stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {[
          { label: "Active Talent Pool", value: totalStudents, icon: Users, color: "from-blue-500/10 to-indigo-500/10 text-blue-500" },
          { label: "Verified Employers", value: activeSponsors, icon: ShieldCheck, color: "from-emerald-500/10 to-teal-500/10 text-emerald-555" },
          { label: "Live Listings", value: approvedJobsCount, icon: Briefcase, color: "from-purple-500/10 to-pink-500/10 text-purple-500" },
          { label: "MRR Growth", value: "₹14,53,500", icon: IndianRupee, color: "from-amber-500/10 to-orange-500/10 text-amber-500" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-slate-800 dark:text-white">{stat.value}</p>
                <p className="text-[10px] text-slate-450 dark:text-slate-400 uppercase font-semibold tracking-wider">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab contents */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* System Status Dashboard */}
            <div className="lg:col-span-2 border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  Systems Live Diagnostics
                </h4>
                <p className="text-[10.5px] text-slate-400">Active performance benchmarks of platform subsystems</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { title: "AI Model Accuracy", value: "97.4%", desc: "Match rating precision score", status: "Optimal" },
                  { title: "ATS Parser Latency", value: "320ms", desc: "Average PDF processing time", status: "Sub-Second" },
                  { title: "Live Gateways", value: "100%", desc: "Cloud networks uptime metrics", status: "Online" }
                ].map((diag, i) => (
                  <div key={i} className="p-4 rounded-2xl border border-slate-150 dark:border-navy-850 bg-slate-50/50 dark:bg-navy-950/40 flex flex-col gap-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{diag.title}</p>
                    <p className="text-xl font-extrabold text-slate-800 dark:text-white">{diag.value}</p>
                    <div className="flex justify-between items-center mt-2 border-t border-slate-200/30 dark:border-navy-900 pt-2 text-[9px] font-bold">
                      <span className="text-slate-400">{diag.desc}</span>
                      <span className="text-emerald-555 px-1.5 py-0.5 rounded bg-emerald-500/10">{diag.status}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Console log simulation */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <h5 className="text-xs font-bold text-slate-700 dark:text-slate-200">Terminal Sourcing Pipeline Logs</h5>
                  <button 
                    onClick={triggerClearLogs}
                    className="text-[9px] uppercase font-bold text-rose-500 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Clear Console
                  </button>
                </div>
                <div className="h-44 font-mono text-[10.5px] p-4 bg-slate-900 text-slate-300 rounded-2xl overflow-y-auto flex flex-col gap-2 shadow-inner border border-slate-800">
                  {systemLogs.length > 0 ? (
                    systemLogs.map((log, idx) => (
                      <div key={idx} className="flex gap-2">
                        <span className="text-indigo-400 font-semibold">[{log.time}]</span>
                        <span className={`font-bold uppercase text-[9px] px-1.5 rounded ${
                          log.status === 'success' ? 'bg-emerald-500/15 text-emerald-400' :
                          log.status === 'warning' ? 'bg-amber-500/15 text-amber-400' :
                          'bg-blue-500/15 text-blue-400'
                        }`}>{log.status}</span>
                        <span className="text-slate-200 truncate">{log.text}</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-500">Console is idle. Standing by...</div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Side panel */}
            <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                    Platform Settings
                    <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
                  </h4>
                  <p className="text-[10px] text-slate-400">Configure global matching guidelines</p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-700 dark:text-slate-350">
                      <span>Simulated Gateway Throttle</span>
                      <span className="text-indigo-500 font-extrabold">{activeLoad}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={activeLoad}
                      onChange={(e) => setActiveLoad(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-navy-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>

                  <div className="h-px bg-slate-150 dark:bg-navy-850" />

                  <div className="flex flex-col gap-2.5">
                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Subsystem Triggers</p>
                    {[
                      { name: "Global Recruiter Approvals Mode", active: true },
                      { name: "Circular Resume Score Matching", active: true },
                      { name: "Unstop Hackathon Registrations", active: false }
                    ].map((tog, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">{tog.name}</span>
                        <div className={`w-8 h-4.5 rounded-full p-0.5 cursor-pointer transition-colors ${tog.active ? 'bg-brand-600' : 'bg-slate-200 dark:bg-navy-800'}`}>
                          <div className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${tog.active ? 'translate-x-3.5' : ''}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-slate-150 dark:border-navy-850 bg-slate-50/50 dark:bg-navy-950/40 rounded-2xl p-4 flex flex-col gap-2">
                <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1"><Landmark className="w-3.5 h-3.5 text-brand-500" /> Platform Total Funds</h5>
                <p className="text-2xl font-extrabold text-slate-850 dark:text-white">₹71,67,200.00</p>
                <span className="text-[9px] font-bold text-emerald-555 flex items-center gap-0.5">▲ +18.4% MRR Growth rate</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Revenue SaaS metrics */}
        {activeTab === 'revenue' && (
          <motion.div
            key="revenue"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Monthly subscription revenue chart */}
            <div className="lg:col-span-2 border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">SaaS Monthly Subscription Models</h4>
                <p className="text-[10px] text-slate-400">Total monthly revenue generated split across Gold, Platinum, and Diamond tiers</p>
              </div>
              <div className="h-64 w-full text-xs font-semibold mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e2b53e" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#e2b53e" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPlat" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorDiamond" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: '#0b0f19', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="gold" stroke="#e2b53e" strokeWidth={2} fillOpacity={1} fill="url(#colorGold)" />
                    <Area type="monotone" dataKey="platinum" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorPlat)" />
                    <Area type="monotone" dataKey="diamond" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorDiamond)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex gap-4 items-center justify-center text-[10px] font-bold mt-2">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#e2b53e] rounded-full" /> Gold Plan</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#6366f1] rounded-full" /> Platinum Plan</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#06b6d4] rounded-full" /> Diamond Plan</span>
              </div>
            </div>

            {/* Distribution metrics */}
            <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Active Tier Distributions</h4>
                <p className="text-[10px] text-slate-400">Total active users on recurring payment models</p>
              </div>

              <div className="h-44 w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={tierDistribution} innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                      {tierDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center">
                  <p className="text-lg font-extrabold text-slate-850 dark:text-white">457</p>
                  <p className="text-[9px] uppercase text-slate-400 font-bold">Subscribers</p>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {tierDistribution.map((entry, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs font-semibold">
                    <span className="flex items-center gap-2 text-slate-700 dark:text-slate-350">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                      {entry.name}
                    </span>
                    <span className="text-slate-850 dark:text-white font-extrabold">{entry.value} members</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Job approvals queue */}
        {activeTab === 'approvals' && (
          <motion.div
            key="approvals"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col gap-6"
          >
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Recruiter Postings Approval System</h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">
                Protect candidate screening indices. Inspect newly posted jobs to approve or reject them before listing them publicly.
              </p>
            </div>

            {pendingJobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingJobs.map(job => (
                  <div 
                    key={job.id} 
                    className="border border-slate-200 dark:border-navy-850 bg-white/60 dark:bg-navy-900/40 rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden group shadow-sm"
                  >
                    <div className="absolute top-0 right-0 h-1 bg-indigo-500 w-full" />
                    
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-navy-800 flex items-center justify-center font-extrabold text-brand-600 text-lg">
                          {job.logo}
                        </div>
                        <div>
                          <h5 className="text-xs font-bold text-slate-850 dark:text-white leading-tight">{job.title}</h5>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{job.company} • <span className="font-semibold">{job.location}</span></p>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold text-slate-500 bg-slate-100 dark:bg-navy-800 px-2 py-0.5 rounded-full">{job.experience}</span>
                    </div>

                    <p className="text-[11px] text-slate-550 dark:text-slate-400 leading-relaxed truncate-3-lines">{job.description}</p>

                    <div className="h-px bg-slate-150 dark:bg-navy-850" />

                    <div className="flex flex-wrap gap-1.5">
                      {job.skills.map(s => (
                        <span key={s} className="text-[8.5px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-navy-950 text-slate-500 dark:text-slate-400 border border-slate-200/20">{s}</span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between gap-4 mt-2 border-t border-slate-200/30 dark:border-navy-800/40 pt-3">
                      <div className="flex items-center gap-2">
                        <img src={job.recruiter?.avatar} alt={job.recruiter?.name} className="w-6.5 h-6.5 rounded-full object-cover" />
                        <div>
                          <p className="text-[9.5px] font-bold text-slate-800 dark:text-slate-200 leading-none">{job.recruiter?.name}</p>
                          <p className="text-[8.5px] text-slate-450 dark:text-slate-400 mt-0.5">Recruiter</p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(job.id, job.title)}
                          className="px-3.5 py-2 rounded-xl border border-rose-200 hover:bg-rose-500/10 text-rose-500 text-[10px] font-bold flex items-center gap-1 shadow-sm transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Reject
                        </button>
                        <button
                          onClick={() => handleApprove(job.id, job.title)}
                          className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-bold flex items-center gap-1 shadow shadow-brand-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" /> Approve Live
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center border border-dashed border-slate-250 dark:border-navy-800/80 rounded-3xl bg-slate-50/20 dark:bg-navy-950/10">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
                <div>
                  <p className="text-sm font-bold text-slate-800 dark:text-white">Approvals Queue Cleared</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">No recruiter job submissions are currently awaiting inspection.</p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Verifications center */}
        {activeTab === 'verification' && (
          <motion.div
            key="verification"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col gap-6"
          >
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">Employer Verification Center</h4>
              <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-0.5">Toggle verification badges dynamically for employer profiles to build student trust.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-navy-800 pb-3">
                    <th className="text-[10px] uppercase font-bold text-slate-450 tracking-wider p-3">Employer / Company</th>
                    <th className="text-[10px] uppercase font-bold text-slate-455 tracking-wider p-3">Live Jobs Sourced</th>
                    <th className="text-[10px] uppercase font-bold text-slate-450 tracking-wider p-3 text-center">Status</th>
                    <th className="text-[10px] uppercase font-bold text-slate-455 tracking-wider p-3 text-center">Verification Badge</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Stripe", logo: "S", jobsCount: 3, verified: verifiedCompanies.includes("Stripe") },
                    { name: "Linear", logo: "L", jobsCount: 2, verified: verifiedCompanies.includes("Linear") },
                    { name: "Google", logo: "G", jobsCount: 5, verified: verifiedCompanies.includes("Google") },
                    { name: "Netflix", logo: "N", jobsCount: 1, verified: verifiedCompanies.includes("Netflix") },
                    { name: "Vercel", logo: "V", jobsCount: 4, verified: verifiedCompanies.includes("Vercel") },
                    { name: "Meta", logo: "M", jobsCount: 2, verified: verifiedCompanies.includes("Meta") }
                  ].map((company, idx) => (
                    <tr key={idx} className="border-b border-slate-100/50 dark:border-navy-850 hover:bg-slate-50/50 dark:hover:bg-navy-950/20 transition-all">
                      <td className="p-3 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-navy-850 flex items-center justify-center font-bold text-brand-600 text-sm">{company.logo}</div>
                        <span className="text-xs font-bold text-slate-850 dark:text-white">{company.name}</span>
                      </td>
                      <td className="p-3 text-xs font-semibold text-slate-650 dark:text-slate-400">{company.jobsCount} live positions</td>
                      <td className="p-3 text-center">
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                          company.verified 
                            ? 'bg-emerald-500/10 text-emerald-500' 
                            : 'bg-slate-200 dark:bg-navy-800 text-slate-500'
                        }`}>{company.verified ? 'Verified Employer' : 'Pending Verification'}</span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => {
                            toggleCompanyVerification(company.name);
                            addToast(`${company.verified ? 'Revoked' : 'Granted'} verification for ${company.name}!`, 'info');
                          }}
                          className={`px-3 py-1 rounded-xl text-[10px] font-bold border transition-colors ${
                            company.verified 
                              ? 'border-rose-200 text-rose-500 hover:bg-rose-500/10' 
                              : 'border-brand-500 text-brand-500 hover:bg-brand-500/10'
                          }`}
                        >
                          {company.verified ? 'Revoke Status' : 'Grant Verification'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* AI Performance Monitoring */}
        {activeTab === 'monitoring' && (
          <motion.div
            key="monitoring"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* System hardware widgets */}
            <div className="lg:col-span-2 border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                  <Cpu className="w-5 h-5 text-indigo-500" />
                  AI Compute Nodes (Dynamic Diagnostics)
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">Real-time status of distributed model inference servers</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[
                  { label: "GPU Core Clusters", status: "Healthy", rate: 42, icon: Cpu, loadColor: "bg-indigo-500" },
                  { label: "Model VRAM Pools", status: "Optimal", rate: 58, icon: HardDrive, loadColor: "bg-cyan-500" }
                ].map((node, i) => (
                  <div key={i} className="p-5 border border-slate-150 dark:border-navy-850 bg-slate-50/50 dark:bg-navy-950/40 rounded-2xl flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <node.icon className="w-4.5 h-4.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-750 dark:text-slate-200">{node.label}</span>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-555 bg-emerald-500/10 px-2 py-0.5 rounded-full">{node.status}</span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400">
                        <span>Cluster load capacity</span>
                        <span className="text-slate-755 dark:text-white font-extrabold">{node.rate}% capacity</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-navy-800 rounded-full overflow-hidden">
                        <div className={`h-full ${node.loadColor} rounded-full`} style={{ width: `${node.rate}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Security parameters */}
              <div className="flex flex-col gap-3.5">
                <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5"><ShieldAlert className="w-4 h-4 text-rose-500" /> AI Safety & Compliance Logs</h5>
                <div className="p-4 rounded-2xl border border-rose-100 dark:border-rose-950/20 bg-rose-50/20 dark:bg-rose-950/5 flex flex-col gap-2 text-[10.5px] leading-relaxed text-slate-550 dark:text-slate-350">
                  <div className="flex items-start gap-2">
                    <span className="text-rose-500 font-bold">● PENDING REVIEW:</span>
                    <span>Candidate Vansh Karnwal's resume successfully bypassed mock filtering rules (ATS: 88%) with verified standard professional criteria.</span>
                  </div>
                  <div className="flex items-start gap-2 border-t border-rose-200/20 dark:border-rose-900/20 pt-2">
                    <span className="text-rose-500 font-bold">● CLOUD AUDIT:</span>
                    <span>Corporate job approval checks compiled 0 safety flags. Encryption filters remain at full 256-bit capabilities.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Accuracies split card */}
            <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">Subsystem Accuracy</h4>
                <p className="text-[10px] text-slate-400">Benchmarked success rates of AI sub-modules</p>
              </div>

              <div className="flex flex-col gap-4">
                {[
                  { name: "ATS Metric Scanner", score: 98 },
                  { name: "Semantic Keyword Match", score: 96 },
                  { name: "Sourcing Recommendation API", score: 92 },
                  { name: "Interview Coach Prompting", score: 95 }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-[10.5px] font-bold text-slate-700 dark:text-slate-300">
                      <span>{item.name}</span>
                      <span className="text-brand-500">{item.score}% Accuracy</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-navy-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-500 rounded-full animate-laser" style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl border border-indigo-150 dark:border-indigo-950/20 bg-indigo-50/10 dark:bg-indigo-950/10 text-[9.5px] font-bold text-indigo-550 dark:text-indigo-400 text-center leading-relaxed">
                Platform matches are backed by double-blind AI verification rules for 100% fair and audit-compliant recruitment paths.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
