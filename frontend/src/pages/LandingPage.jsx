import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Zap, Target, LineChart, Award, ChevronDown, 
  CheckCircle2, Bot, Star, Play, Check
} from 'lucide-react';
import { TESTIMONIALS, FAQS, COMPANYS } from '../data/mockData';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { setUserRole } = useAppState();

  const [activeFaq, setActiveFaq] = useState(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [showDemoVideo, setShowDemoVideo] = useState(false);

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const handleQuickLogin = (role) => {
    setUserRole(role);
    addToast(`Selected ${role === 'candidate' ? 'Student' : role === 'recruiter' ? 'Recruiter' : 'Admin'} Portal. Please sign in to proceed!`, 'info');
    navigate('/auth');
  };

  const handlePlanInquiry = (plan) => {
    addToast(`${plan.name} packaging noted. Billing checkout is not connected yet.`, 'info');
    navigate('/contact');
  };

  const pricingPlans = [
    {
      tier: 'gold',
      name: 'Gold Plan',
      price: 1599,
      badge: 'Starter',
      color: 'border-slate-200 dark:border-navy-800 bg-white/40 dark:bg-navy-900/40',
      textColor: 'text-slate-800 dark:text-white',
      accentColor: 'text-amber-500',
      bullets: [
        "Basic AI Resume Analysis",
        "Interactive ATS Score meter",
        "10 Job Applications / month",
        "Standard support response time"
      ]
    },
    {
      tier: 'platinum',
      name: 'Platinum Plan',
      price: 2999,
      badge: 'Popular',
      color: 'border-brand-500 bg-gradient-to-br from-brand-50/50 to-indigo-50/50 dark:from-brand-950/30 dark:to-indigo-950/30',
      textColor: 'text-slate-800 dark:text-white',
      accentColor: 'text-brand-600',
      bullets: [
        "Everything in Gold",
        "Unlimited Job Applications",
        "AI Interview Coach Access",
        "Priority candidate listings",
        "Advanced analytics dashboard"
      ]
    },
    {
      tier: 'diamond',
      name: 'Diamond Plan',
      price: 4999,
      badge: 'Enterprise',
      color: 'border-cyan-200 dark:border-cyan-800/40 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/30 dark:to-blue-950/30',
      textColor: 'text-slate-800 dark:text-white',
      accentColor: 'text-cyan-600',
      bullets: [
        "Everything in Platinum",
        "Dedicated account manager",
        "Custom branding options",
        "API access for integrations",
        "White-label recruiting portal",
        "24/7 priority support"
      ]
    }
  ];

  return (
    <div className="flex flex-col gap-24 py-6 overflow-hidden">
      
      {/* ABOVE THE FOLD SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-8 z-10 relative">
        <div className="glow-mesh glow-blue top-[-20%] left-[-20%] w-[60%] h-[60%] opacity-15" />
        
        {/* Left Intro Panel */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left items-start">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/5 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold"
          >
            <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
            HireSphere AI: The Next-Gen Sourcing Ecosystem
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] text-slate-800 dark:text-white"
          >
            Match Talent. <br />
            Bridge Gaps.{' '}
            <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-cyan-500 bg-clip-text text-transparent">
              Hire Better.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed"
          >
            A high-performance AI job portal for candidate profiles, recruiter pipelines, resume analysis, interview tracking, and career roadmaps. Built to demo the core hiring workflow without overstating external integrations.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4 mt-2"
          >
            <button
              onClick={() => navigate('/jobs')}
              className="px-7 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Explore Job Board
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDemoVideo(true)}
              className="px-7 py-3.5 rounded-2xl border border-slate-200 dark:border-navy-800 bg-white/40 dark:bg-navy-900/40 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Play className="w-4 h-4 text-brand-500 fill-current" />
              Watch Demo video
            </button>
          </motion.div>

          {/* Quick value lists */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-[11px] font-bold text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1.5">✔️ AI Resume Screening</div>
            <div className="flex items-center gap-1.5">✔️ Circular ATS Metering</div>
            <div className="flex items-center gap-1.5">✔️ Skill Roadmaps Sourcing</div>
            <div className="flex items-center gap-1.5">✔️ Kanban Recruiter Pipelines</div>
          </div>
        </div>

        {/* Right Auth Glassmorphic Card */}
        <div className="lg:col-span-5 relative w-full flex items-center justify-center">
          <div className="glow-mesh glow-purple bottom-[-20%] right-[-20%] w-[60%] h-[60%] opacity-15" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-sm rounded-3xl border border-slate-200/80 dark:border-navy-800 bg-white/70 dark:bg-navy-900/30 backdrop-blur-2xl p-6 shadow-2xl flex flex-col gap-6 relative"
          >
            {/* Ribbon */}
            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-brand-600 text-white text-[9px] uppercase font-black px-2.5 py-1 rounded-full shadow">
              One-Click Entry
            </div>

            <div className="text-left">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">Unified Portal Login</h3>
              <p className="text-[10px] text-slate-500 mt-1 leading-snug">Click any workspace profile to instantly authenticate. No boring credentials registration required.</p>
            </div>

            <div className="flex flex-col gap-3">
              {[
                { role: 'candidate', label: 'Student / Candidate Portal', desc: 'Build resumes, upskill, track jobs', color: 'border-blue-200 hover:border-blue-500 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600' },
                { role: 'recruiter', label: 'Recruiter Management Suite', desc: 'Post openings, compare talent, drag Kanban', color: 'border-emerald-200 hover:border-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600' },
                { role: 'admin', label: 'Admin Command Console', desc: 'Approve jobs, verify partners, audit compute', color: 'border-purple-200 hover:border-purple-500 bg-purple-500/5 hover:purple-500/10 text-purple-600' }
              ].map(opt => (
                <button
                  key={opt.role}
                  onClick={() => handleQuickLogin(opt.role)}
                  className={`w-full p-3.5 rounded-2xl border text-left flex flex-col gap-0.5 transition-all hover:scale-[1.01] hover:shadow-md ${opt.color}`}
                >
                  <span className="text-[11px] font-bold tracking-tight">{opt.label}</span>
                  <span className="text-[9px] text-slate-500 truncate">{opt.desc}</span>
                </button>
              ))}
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-100 dark:border-navy-800"></div>
              <span className="flex-shrink mx-3 text-[9px] text-slate-400 uppercase font-semibold">Security Assured</span>
              <div className="flex-grow border-t border-slate-100 dark:border-navy-800"></div>
            </div>

            <div className="text-center">
              <Link to="/auth" className="text-xs font-bold text-brand-500 hover:underline">Or configure custom accounts credentials →</Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* COMPANYS TRUST PILOT */}
      <section className="border-y border-slate-200/50 dark:border-navy-800/40 py-10 bg-slate-100/30 dark:bg-navy-950/20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Empowering candidates hired at</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {COMPANYS.map((company, idx) => (
              <div key={idx} className="flex items-center gap-2 text-slate-500 dark:text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                <span className="text-xl md:text-2xl font-bold font-mono">{company.logo}</span>
                <span className="text-xs font-semibold tracking-wider">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DYNAMIC scanner interactive visual */}
      <section className="max-w-5xl mx-auto px-4 w-full z-10">
        <div className="border border-slate-200/60 dark:border-navy-800 bg-slate-100/50 dark:bg-navy-900/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
          <div className="glow-mesh glow-indigo top-0 left-0 w-60 h-60 opacity-10" />
          
          <div className="flex-1 flex flex-col gap-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">Interactive Scanner preview</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Experience the futuristic neon glow scan immediately. Drop your PDF in the candidate analyzer to calculate your exact corporate keyword density, formatting structure, and circular ATS scoring compatibility instantly.
            </p>
            <div className="flex flex-col gap-2.5 mt-2">
              {[
                "Circular dynamic ATS Score gauges meters",
                "Extraction of high-impact corporate tech keywords",
                "Real-time circular progress scanner indicators"
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Resume scan preview card */}
          <div className="w-full md:w-80 h-56 rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            {/* Scanning line effect */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent animate-laser shadow-lg shadow-brand-500/55" />
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-900 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-rose-500 flex items-center justify-center text-[8px] font-bold text-white">PDF</div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">candidate_resume.pdf</span>
              </div>
              <span className="text-[9px] font-bold text-brand-500 animate-pulse bg-brand-500/10 px-2 py-0.5 rounded">Screening Active</span>
            </div>

            <div className="flex-1 py-4 flex flex-col justify-center gap-2 text-left">
              <div className="h-2.5 bg-slate-100 dark:bg-navy-900 rounded-full w-3/4 animate-pulse" />
              <div className="h-2.5 bg-slate-100 dark:bg-navy-900 rounded-full w-5/6 animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="h-2.5 bg-slate-100 dark:bg-navy-900 rounded-full w-1/2 animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 dark:border-navy-900 pt-2 text-[9px] font-semibold text-slate-400">
              <span>Checking skills, projects, and formatting...</span>
              <span className="text-brand-500 font-extrabold animate-pulse">Scan Ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO GRID VALUE FEATURES */}
      <section className="max-w-7xl mx-auto px-4 w-full flex flex-col gap-12">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">What Our Platform Does</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">A beautiful, integrated suite replacing single-use dashboard tools.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            {
              title: "AI Resume Screening",
              desc: "High-performance parser mapping experience, education, and skills parameters against strict ATS templates.",
              icon: Zap, color: "from-blue-500/10 to-indigo-500/10 text-blue-500", span: "md:col-span-1"
            },
            {
              title: "ATS Score breakdown",
              desc: "Uncover missing high-impact industry keywords and get direct suggestions to double recruiter search impressions.",
              icon: Target, color: "from-purple-500/10 to-pink-500/10 text-purple-500", span: "md:col-span-1"
            },
            {
              title: "Kanban Sourcing pipelines",
              desc: "Recruiters view applicants ranked by compatibility, and slide them across stage boards with real-time statistics.",
              icon: LineChart, color: "from-emerald-500/10 to-teal-500/10 text-emerald-500", span: "md:col-span-1"
            },
            {
              title: "Interactive Roadmaps Center",
              desc: "Bridge skill gaps by entering custom step-by-step career path guidelines (Frontend, AI Engineering) with certification curricula.",
              icon: Award, color: "from-amber-500/10 to-orange-500/10 text-amber-500", span: "md:col-span-2"
            },
            {
              title: "Career Assistant Agent",
              desc: "Polished chatbot widget giving immediate feedback on missing tech keywords and nearby challenge pools.",
              icon: Bot, color: "from-cyan-500/10 to-blue-500/10 text-cyan-500", span: "md:col-span-1"
            }
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className={`${feat.span} border border-slate-200/60 dark:border-navy-800/40 bg-white/50 dark:bg-navy-900/30 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-brand-500/40 dark:hover:border-brand-400/40 transition-all duration-350`}
              >
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${feat.color} flex items-center justify-center mb-6`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-2">{feat.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* USE CASE SHOWCASE SECTION */}
      <section className="max-w-7xl mx-auto px-4 w-full flex flex-col gap-12 z-10 relative">
        <div className="text-center max-w-2xl mx-auto flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            Platform Features
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">Everything You Need to Succeed</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Powerful tools for candidates, recruiters, and administrators</p>
        </div>

        {/* Feature Showcase Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
          
          {/* Feature 1: AI Resume Analyzer */}
          <div className="border border-slate-200/60 dark:border-navy-800/40 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-lg">
                <Target className="w-7 h-7" />
              </div>
              <span className="text-[9px] font-black px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 uppercase tracking-wider">For Candidates</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-3">AI Resume Analyzer</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Upload your resume and get instant ATS scoring with AI-powered insights. Identify missing keywords, formatting issues, and get personalized suggestions to improve your visibility to recruiters.
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                "Circular ATS score visualization",
                "Keyword density analysis",
                "Format optimization tips",
                "Industry-specific recommendations"
              ].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Feature 2: AI Interview Coach */}
          <div className="border border-slate-200/60 dark:border-navy-800/40 bg-gradient-to-br from-purple-500/5 to-pink-500/5 dark:from-purple-500/10 dark:to-pink-500/10 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
                <Bot className="w-7 h-7" />
              </div>
              <span className="text-[9px] font-black px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 uppercase tracking-wider">For Candidates</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-3">AI Interview Coach</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Practice mock interviews with our AI-powered coach. Get real-time feedback on your answers, learn best practices, and build confidence for technical and behavioral interviews.
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                "Technical interview practice",
                "Behavioral question coaching",
                "System design guidance",
                "Real-time AI feedback"
              ].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Feature 3: Job Board & Applications */}
          <div className="border border-slate-200/60 dark:border-navy-800/40 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 dark:from-emerald-500/10 dark:to-teal-500/10 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
                <Zap className="w-7 h-7" />
              </div>
              <span className="text-[9px] font-black px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">For Everyone</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-3">Smart Job Matching</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Browse thousands of job listings with intelligent filtering. AI-powered matching shows you roles that fit your skills and experience. Track applications and manage your job search in one place.
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                "AI-powered job recommendations",
                "One-click application tracking",
                "Save jobs for later review",
                "Company profile insights"
              ].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Feature 4: Recruiter Dashboard */}
          <div className="border border-slate-200/60 dark:border-navy-800/40 bg-gradient-to-br from-amber-500/5 to-orange-500/5 dark:from-amber-500/10 dark:to-orange-500/10 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <LineChart className="w-7 h-7" />
              </div>
              <span className="text-[9px] font-black px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 uppercase tracking-wider">For Recruiters</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-3">Recruitment Pipeline</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Manage your entire hiring process with Kanban-style boards. Track candidates through each stage, schedule interviews, and collaborate with your team. Real-time analytics show hiring metrics.
            </p>
            <div className="flex flex-col gap-2.5">
              {[
                "Kanban pipeline management",
                "Candidate ranking by fit score",
                "Interview scheduling tools",
                "Team collaboration features"
              ].map(f => (
                <div key={f} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Feature 5: Career Roadmaps */}
          <div className="border border-slate-200/60 dark:border-navy-800/40 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 dark:from-cyan-500/10 dark:to-blue-500/10 rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 lg:col-span-2">
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-white shadow-lg">
                <Award className="w-7 h-7" />
              </div>
              <span className="text-[9px] font-black px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">For Candidates</span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-800 dark:text-white mb-3">Personalized Career Roadmaps</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Bridge skill gaps with step-by-step career path guidance. Get personalized learning roadmaps for Frontend, Backend, AI Engineering, Data Science, and more. Track your progress and earn certifications along the way.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2.5">
                {[
                  "Custom learning pathways",
                  "Skill gap identification",
                  "Certification recommendations"
                ].map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    {f}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  "Progress tracking dashboard",
                  "Industry-specific curricula",
                  "Integration with learning platforms"
                ].map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* DEMO VIDEO MODAL DIALOG */}
      <AnimatePresence>
        {showDemoVideo && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDemoVideo(false)}
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-navy-800 bg-black p-2 shadow-3xl z-10 relative flex flex-col"
            >
              {/* Product walkthrough preview */}
              <div className="aspect-video bg-navy-950/90 rounded-2xl flex flex-col items-center justify-center gap-6 relative overflow-hidden group">
                <div className="absolute top-4 right-4 z-10">
                  <button 
                    onClick={() => setShowDemoVideo(false)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all"
                  >
                    Close Player
                  </button>
                </div>
                
                {/* Visual pulse glow behind button */}
                <div className="absolute w-40 h-40 rounded-full bg-brand-500/10 animate-ping" />
                <button className="relative w-20 h-20 rounded-full bg-brand-600 flex items-center justify-center text-white shadow-xl hover:scale-105 active:scale-95 transition-all">
                  <Play className="w-8 h-8 fill-current ml-1" />
                </button>
                
                <div className="flex flex-col gap-2 z-10">
                  <h4 className="text-sm sm:text-base font-black text-white">JobSphere AI Walkthrough</h4>
                  <p className="text-[10px] sm:text-xs text-slate-400">See how resume builder calculations and recruiter Kanban pipelines coordinate in real time.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* TESTIMONIALS Carousel */}
      <section className="max-w-7xl mx-auto px-4 w-full flex flex-col gap-12">
        <div className="text-center">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">Demo User Stories</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Sample candidate and recruiter stories for the demo build. Replace with client-approved references before launch.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {TESTIMONIALS.map((test) => (
            <div
              key={test.id}
              className="border border-slate-200/50 dark:border-navy-800 bg-white dark:bg-navy-900/40 rounded-3xl p-6 flex flex-col justify-between shadow-md hover:scale-[1.01] transition-transform"
            >
              <div className="flex gap-1 mb-4 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs italic text-slate-600 dark:text-slate-300 leading-relaxed mb-6">"{test.text}"</p>
              <div className="flex items-center gap-3">
                <img src={test.avatar} alt={test.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{test.name}</p>
                  <p className="text-[9.5px] text-slate-500 dark:text-slate-400">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING PLANS SECTION */}
      <section className="max-w-7xl mx-auto px-4 w-full flex flex-col gap-12">
        <div className="text-center flex flex-col gap-4">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-800 dark:text-white">
            Choose Your Growth Package
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Product packaging for discussion. Live billing is intentionally disabled until a payment provider is connected.
          </p>
          
          {/* Annual/Monthly Toggle */}
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className={`text-xs font-semibold ${!isAnnual ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-14 h-7 rounded-full border-2 border-brand-500/30 bg-slate-100 dark:bg-navy-900 transition-colors"
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-brand-600 shadow-lg transition-transform ${isAnnual ? 'translate-x-7' : 'translate-x-0.5'}`} />
            </button>
            <span className={`text-xs font-semibold ${isAnnual ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'}`}>
              Annual <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <div
              key={plan.tier}
              className={`${plan.color} border-2 rounded-3xl p-6 flex flex-col gap-6 shadow-lg hover:scale-[1.02] transition-all relative overflow-hidden`}
            >
              {plan.badge === 'Popular' && (
                <div className="absolute top-0 right-0 bg-brand-600 text-white text-[9px] font-bold px-3 py-1 rounded-bl-xl">
                  MOST POPULAR
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <h3 className={`text-xl font-extrabold ${plan.textColor}`}>{plan.name}</h3>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-900 ${plan.accentColor} uppercase tracking-wider`}>
                    {plan.badge}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-black ${plan.accentColor}`}>
                    ₹{isAnnual ? Math.round(plan.price * 12 * 0.8) : plan.price}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    /{isAnnual ? 'year' : 'month'}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {plan.bullets.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2.5">
                    <Check className={`w-4 h-4 ${plan.accentColor} flex-shrink-0 mt-0.5`} />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{bullet}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handlePlanInquiry(plan)}
                className={`mt-auto w-full py-3 rounded-xl text-xs font-bold transition-all ${
                  plan.badge === 'Popular'
                    ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/20'
                    : 'border-2 border-slate-200 dark:border-navy-800 bg-white/50 dark:bg-navy-900/50 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-navy-800'
                }`}
              >
                Request Plan Setup
              </button>
            </div>
          ))}
        </div>

        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Billing checkout is not connected in this demo. Connect a payment provider before accepting payments.
          </p>
        </div>
      </section>
      {/* FAQS Collapsible accordion */}
      <section className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-800 dark:text-white">Common Inquiries</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Clear answers regarding scanner privacy, recruiter modes, and pricing packages.</p>
        </div>

        <div className="flex flex-col gap-3 text-left">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-200/60 dark:border-navy-800/40 bg-white/40 dark:bg-navy-900/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-5 text-left text-xs font-bold text-slate-800 dark:text-slate-200"
              >
                {faq.question}
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-350 ${activeFaq === idx ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === idx && (
                <div className="px-5 pb-5 pt-1 text-xs text-slate-500 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-navy-800">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
