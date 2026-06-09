import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, ArrowRight, Zap, Target, LineChart, Award, ChevronDown, 
  CheckCircle2, Bot, Star, Play, ShieldCheck, Mail, Check, CreditCard, Laptop
} from 'lucide-react';
import { TESTIMONIALS, FAQS, COMPANYS } from '../data/mockData';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { userRole, setUserRole, setCurrentUser, subscriptionTier, upgradeSubscription } = useAppState();

  const [activeFaq, setActiveFaq] = useState(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [checkoutPlan, setCheckoutPlan] = useState(null); // Modal for Razorpay checkout
  const [showDemoVideo, setShowDemoVideo] = useState(false);

  const toggleFaq = (idx) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const handleQuickLogin = (role) => {
    setUserRole(role);
    addToast(`Selected ${role === 'candidate' ? 'Student' : role === 'recruiter' ? 'Recruiter' : 'Admin'} Portal. Please sign in to proceed!`, 'info');
    navigate('/auth');
  };

  const handleCheckoutSubmit = (e) => {
    e.preventDefault();
    upgradeSubscription(checkoutPlan.tier);
    addToast(`Payment Approved! Successfully subscribed to ${checkoutPlan.name}!`, 'success');
    setCheckoutPlan(null);
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
        "20 Job Applications / Month",
        "Basic Upskill Recommendations",
        "Standard Sourcing Support"
      ]
    },
    {
      tier: 'platinum',
      name: 'Platinum Plan',
      price: 3999,
      badge: 'Popular',
      color: 'border-brand-500 bg-gradient-to-tr from-brand-500/5 to-indigo-500/5 dark:from-brand-500/10 dark:to-indigo-500/10 scale-105 ring-2 ring-brand-500/20',
      textColor: 'text-slate-855 dark:text-white',
      accentColor: 'text-brand-500',
      bullets: [
        "Everything in Gold Included",
        "Unlimited Jobs Applications",
        "Advanced AI Resume Parsing",
        "AI Skill Gap Detection & Roadmap",
        "Certification Course Mapping",
        "Standard Sourcing Pipeline Match"
      ]
    },
    {
      tier: 'diamond',
      name: 'Diamond Plan',
      price: 7999,
      badge: 'Premium',
      color: 'border-cyan-500 bg-gradient-to-tr from-cyan-500/5 to-blue-500/5 dark:from-cyan-500/10 dark:to-blue-500/10',
      textColor: 'text-slate-855 dark:text-white',
      accentColor: 'text-cyan-500',
      bullets: [
        "Everything in Platinum Included",
        "Priority Recruiter Visibility",
        "AI Mock Interview Coach",
        "1-on-1 Personalized Career Mentor",
        "Early Access to Hackathons & Events",
        "Premium Company Exclusive Pool",
        "Advanced Sourcing Analytics"
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
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-500/30 bg-brand-500/5 dark:bg-brand-500/10 text-brand-650 dark:text-brand-400 text-xs font-bold"
          >
            <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
            HireSphere AI: The Next-Gen Sourcing Ecosystem
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] text-slate-850 dark:text-white"
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
            A high-performance AI ecosystem blending LinkedIn networks, Naukri jobs searches, Unstop hackathons, and Stripe-quality recruiter metrics pipelines. Scan resumes instantly, compute circular ATS fits, and upskill through interactive career roadmaps.
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
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4 text-[11px] font-bold text-slate-400 dark:text-slate-550">
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
            className="w-full max-w-sm rounded-3xl border border-slate-200/80 dark:border-navy-850 bg-white/70 dark:bg-navy-900/30 backdrop-blur-2xl p-6 shadow-2xl flex flex-col gap-6 relative"
          >
            {/* Ribbon */}
            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-brand-600 text-white text-[9px] uppercase font-black px-2.5 py-1 rounded-full shadow">
              One-Click Entry
            </div>

            <div className="text-left">
              <h3 className="text-base font-extrabold text-slate-850 dark:text-white">Unified Portal Login</h3>
              <p className="text-[10px] text-slate-450 mt-1 leading-snug">Click any workspace profile to instantly authenticate. No boring credentials registration required.</p>
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
                  <span className="text-[9px] text-slate-450 truncate">{opt.desc}</span>
                </button>
              ))}
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-150 dark:border-navy-850"></div>
              <span className="flex-shrink mx-3 text-[9px] text-slate-400 uppercase font-semibold">Security Assured</span>
              <div className="flex-grow border-t border-slate-150 dark:border-navy-850"></div>
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
              <div key={idx} className="flex items-center gap-2 text-slate-450 dark:text-slate-500 hover:text-brand-500 dark:hover:text-brand-400 transition-colors">
                <span className="text-xl md:text-2xl font-bold font-mono">{company.logo}</span>
                <span className="text-xs font-semibold tracking-wider">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DYNAMIC scanner interactive visual */}
      <section className="max-w-5xl mx-auto px-4 w-full z-10">
        <div className="border border-slate-250/60 dark:border-navy-850 bg-slate-100/50 dark:bg-navy-900/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
          <div className="glow-mesh glow-indigo top-0 left-0 w-60 h-60 opacity-10" />
          
          <div className="flex-1 flex flex-col gap-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center text-brand-600">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-850 dark:text-white leading-tight">Interactive Scanner preview</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Experience the futuristic neon glow scan immediately. Drop your PDF in the candidate analyzer to calculate your exact corporate keyword density, formatting structure, and circular ATS scoring compatibility instantly.
            </p>
            <div className="flex flex-col gap-2.5 mt-2">
              {[
                "Circular dynamic ATS Score gauges meters",
                "Extraction of high-impact corporate tech keywords",
                "Real-time circular progress scanner indicators"
              ].map(f => (
                <div key={f} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-350">
                  <CheckCircle2 className="w-4 h-4 text-emerald-555" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Simulated scan line PDF card */}
          <div className="w-full md:w-80 h-56 rounded-2xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 p-4 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            {/* Scanning line effect */}
            <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent animate-laser shadow-lg shadow-brand-500/55" />
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-900 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-rose-500 flex items-center justify-center text-[8px] font-bold text-white">PDF</div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">vansh_resume_2026.pdf</span>
              </div>
              <span className="text-[9px] font-bold text-brand-500 animate-pulse bg-brand-500/10 px-2 py-0.5 rounded">Screening Active</span>
            </div>

            <div className="flex-1 py-4 flex flex-col justify-center gap-2 text-left">
              <div className="h-2.5 bg-slate-100 dark:bg-navy-900 rounded-full w-3/4 animate-pulse" />
              <div className="h-2.5 bg-slate-100 dark:bg-navy-900 rounded-full w-5/6 animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="h-2.5 bg-slate-100 dark:bg-navy-900 rounded-full w-1/2 animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>

            <div className="flex items-center justify-between border-t border-slate-150 dark:border-navy-900 pt-2 text-[9px] font-semibold text-slate-400">
              <span>Checking TypeScript, Go, React...</span>
              <span className="text-brand-500 font-extrabold animate-pulse">88% ATS Score</span>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO GRID VALUE FEATURES */}
      <section className="max-w-7xl mx-auto px-4 w-full flex flex-col gap-12">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-850 dark:text-white">What Our Platform Does</h2>
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
              icon: LineChart, color: "from-emerald-500/10 to-teal-500/10 text-emerald-555", span: "md:col-span-1"
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
                  <h4 className="text-sm font-bold text-slate-850 dark:text-white mb-2">{feat.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RAZORPAY SUBSCRIPTION PLANS SECTION */}
      <section className="max-w-7xl mx-auto px-4 w-full flex flex-col gap-12 z-10 relative">
        <div className="text-center max-w-xl mx-auto flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-bold mx-auto">
            <CreditCard className="w-3.5 h-3.5" />
            Razorpay-Ready Plans
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-850 dark:text-white">Premium Sourcing Membership</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Unlock advanced career mentors, mock AI interviews, and unlimited job submissions</p>
          
          {/* Toggle switcher */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <span className={`text-xs font-bold ${!isAnnual ? 'text-brand-500' : 'text-slate-400'}`}>Monthly</span>
            <button 
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-12 h-6.5 rounded-full p-1 bg-brand-600 cursor-pointer flex items-center"
            >
              <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${isAnnual ? 'translate-x-5.5' : ''}`} />
            </button>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${isAnnual ? 'text-brand-500' : 'text-slate-400'}`}>
              Annual
              <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full text-[9px] font-black">Save 20%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-6 text-left">
          {pricingPlans.map(plan => {
            const displayPrice = isAnnual ? Math.floor(plan.price * 0.8) : plan.price;
            const isCurrent = subscriptionTier === plan.tier;
            
            return (
              <div
                key={plan.tier}
                className={`border rounded-3xl p-6 md:p-8 flex flex-col justify-between gap-8 transition-all duration-350 shadow-lg ${plan.color}`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-slate-100 dark:bg-navy-850 text-slate-500 uppercase tracking-wider">{plan.badge}</span>
                    {isCurrent && (
                      <span className="bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active Plan
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <h3 className={`text-lg font-bold ${plan.textColor}`}>{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-3xl sm:text-4xl font-extrabold text-slate-855 dark:text-white">₹{displayPrice}</span>
                      <span className="text-xs text-slate-400">/ {isAnnual ? 'year' : 'month'}</span>
                    </div>
                  </div>

                  <div className="h-px bg-slate-150 dark:bg-navy-850" />

                  {/* Bullet features */}
                  <ul className="flex flex-col gap-3 text-xs font-semibold text-slate-600 dark:text-slate-350">
                    {plan.bullets.map((b, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4.5 h-4.5 text-emerald-555 flex-shrink-0 mt-0.5" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    if (isCurrent) {
                      addToast("You are already on this tier membership!", "info");
                    } else {
                      setCheckoutPlan({ ...plan, price: displayPrice });
                    }
                  }}
                  className={`w-full py-3.5 rounded-2xl font-bold text-xs shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] ${
                    isCurrent 
                      ? 'bg-slate-200 dark:bg-navy-800 text-slate-500 cursor-default' 
                      : 'bg-brand-650 hover:bg-brand-700 text-white shadow-brand-500/10'
                  }`}
                >
                  {isCurrent ? 'Current Plan Tier' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* RAZORPAY MOCK CHECKOUT DIALOG */}
      <AnimatePresence>
        {checkoutPlan && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCheckoutPlan(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 20 }}
              className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-950 p-6 shadow-3xl z-10 relative flex flex-col gap-6 text-left"
            >
              {/* Razorpay Brand Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-900 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow">
                    R
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-850 dark:text-white">Razorpay Secure Sourcing Gateway</h4>
                    <p className="text-[9px] text-slate-400">Merchant Account ID: mid_hsai2026</p>
                  </div>
                </div>
                <button
                  onClick={() => setCheckoutPlan(null)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-655"
                >
                  Cancel
                </button>
              </div>

              {/* Billing Item Details */}
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-navy-900/40 border border-slate-150 dark:border-navy-850 flex justify-between items-center">
                <div>
                  <p className="text-[9px] uppercase font-bold text-slate-400">Selected plan tier</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{checkoutPlan.name}</p>
                  <p className="text-[9.5px] text-slate-450 dark:text-slate-400 leading-snug">Includes full AI scans, roadmaps & coach features unlocked.</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] uppercase font-bold text-slate-400">Total charge</p>
                  <p className="text-xl font-extrabold text-indigo-500 mt-0.5">₹{checkoutPlan.price}</p>
                  <p className="text-[8px] text-slate-400">/{isAnnual ? 'yearly' : 'monthly'}</p>
                </div>
              </div>

              {/* Secure Credit Card Payment Form */}
              <form onSubmit={handleCheckoutSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Name on Card</label>
                  <input 
                    type="text" 
                    defaultValue="Vansh Karnwal" 
                    className="p-3 bg-slate-50/50 dark:bg-navy-900/40 border border-slate-200 dark:border-navy-800 rounded-xl outline-none text-xs text-slate-700 dark:text-slate-200 focus:border-brand-500" 
                    required 
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold text-slate-400">Credit Card Number</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="4111 2222 3333 4444" 
                      className="w-full p-3 bg-slate-50/50 dark:bg-navy-900/40 border border-slate-200 dark:border-navy-800 rounded-xl outline-none text-xs text-slate-700 dark:text-slate-200 focus:border-brand-500" 
                      required 
                    />
                    <CreditCard className="absolute right-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400">Expiration Date</label>
                    <input 
                      type="text" 
                      placeholder="12/28" 
                      className="p-3 bg-slate-50/50 dark:bg-navy-900/40 border border-slate-200 dark:border-navy-800 rounded-xl outline-none text-xs text-slate-700 dark:text-slate-200 focus:border-brand-500" 
                      required 
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-slate-400">CVV Security Code</label>
                    <input 
                      type="text" 
                      placeholder="382" 
                      className="p-3 bg-slate-50/50 dark:bg-navy-900/40 border border-slate-200 dark:border-navy-800 rounded-xl outline-none text-xs text-slate-700 dark:text-slate-200 focus:border-brand-500" 
                      required 
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-1.5 mt-2"
                >
                  <ShieldCheck className="w-4 h-4 text-white animate-pulse" />
                  Pay Mock Sourcing Fee of ₹{checkoutPlan.price}
                </button>
              </form>

              <div className="text-center text-[9px] text-slate-450 leading-relaxed font-bold border-t border-slate-100 dark:border-navy-900 pt-3 flex items-center justify-center gap-1.5">
                🔒 Full 256-Bit SSL Encryption. Secured Mock Transaction Engine.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
              {/* Simulated Demo Workspace Video Player */}
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
                  <h4 className="text-sm sm:text-base font-black text-white">HireSphere AI Walkthrough Walkthrough</h4>
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
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-850 dark:text-white">Validated by Success</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Hear from candidates, developers, and recruiters using our platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {TESTIMONIALS.map((test) => (
            <div
              key={test.id}
              className="border border-slate-200/50 dark:border-navy-850 bg-white dark:bg-navy-900/40 rounded-3xl p-6 flex flex-col justify-between shadow-md hover:scale-[1.01] transition-transform"
            >
              <div className="flex gap-1 mb-4 text-amber-400">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-xs italic text-slate-650 dark:text-slate-350 leading-relaxed mb-6">"{test.text}"</p>
              <div className="flex items-center gap-3">
                <img src={test.avatar} alt={test.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-xs font-bold text-slate-850 dark:text-white">{test.name}</p>
                  <p className="text-[9.5px] text-slate-450 dark:text-slate-400">{test.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQS Collapsible accordion */}
      <section className="max-w-3xl mx-auto px-4 w-full flex flex-col gap-8">
        <div className="text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-850 dark:text-white">Common Inquiries</h2>
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
                <div className="px-5 pb-5 pt-1 text-xs text-slate-500 dark:text-slate-350 leading-relaxed border-t border-slate-100 dark:border-navy-850">
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
