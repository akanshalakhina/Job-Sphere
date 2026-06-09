import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Eye, EyeOff, User, Terminal, CheckCircle, ShieldCheck } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';

export const AuthPage = () => {
  const { userRole, setUserRole, setCurrentUser } = useAppState();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleAuth = (e) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) {
      addToast('Please complete all form fields', 'error');
      return;
    }

    // Set mock user profile parameters
    setCurrentUser(prev => ({
      ...prev,
      name: isLogin ? (userRole === 'candidate' ? 'Vansh Karnwal' : userRole === 'recruiter' ? 'Olivia Rhye' : 'Site Administrator') : name,
      email: email,
      avatar: userRole === 'candidate' 
        ? 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'
        : userRole === 'recruiter'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        : 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
    }));

    addToast(isLogin ? 'Successfully Authenticated!' : 'Registration Completed!', 'success');

    // Route appropriately
    if (userRole === 'candidate') {
      navigate('/candidate-dashboard');
    } else if (userRole === 'recruiter') {
      navigate('/recruiter-dashboard');
    } else if (userRole === 'admin') {
      navigate('/admin-dashboard');
    }
  };

  const triggerGoogleLogin = () => {
    addToast('Authenticated with Google OAuth', 'success');
    setCurrentUser(prev => ({
      ...prev,
      name: userRole === 'candidate' ? 'Vansh Karnwal' : userRole === 'recruiter' ? 'Olivia Rhye' : 'Site Administrator',
      email: userRole === 'candidate' ? 'vansh.karnwal@gmail.com' : userRole === 'recruiter' ? 'olivia.rhye@stripe.com' : 'admin@hiresphere.ai'
    }));

    if (userRole === 'candidate') {
      navigate('/candidate-dashboard');
    } else if (userRole === 'recruiter') {
      navigate('/recruiter-dashboard');
    } else if (userRole === 'admin') {
      navigate('/admin-dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-navy-950 transition-colors duration-300">
      {/* Left Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 z-10 relative bg-white/70 dark:bg-navy-950/40 backdrop-blur-md">
        <div className="max-w-md w-full mx-auto flex flex-col gap-6">
          
          {/* Logo Brand Header */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-850 dark:text-white">
              JobSphere<span className="text-brand-500 font-extrabold">.ai</span>
            </span>
          </div>

          {/* Form Headline */}
          <div>
            <h2 className="text-2xl font-extrabold text-slate-850 dark:text-white">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Enter your credentials to enter the JobSphere interface.
            </p>
          </div>

          {/* Role selection tab buttons */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Workspace Role</label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setUserRole('candidate')}
                className={`p-3 rounded-xl border flex flex-col gap-1 text-left transition-all ${
                  userRole === 'candidate'
                    ? 'border-brand-500 bg-brand-50/10 text-brand-650 dark:text-brand-400 ring-2 ring-brand-500/10'
                    : 'border-slate-200 dark:border-navy-800 bg-white/40 dark:bg-navy-900/40 text-slate-500'
                }`}
              >
                <User className="w-4 h-4 mb-1 text-brand-500" />
                <span className="text-xs font-bold">Candidate</span>
                <span className="text-[9px] text-slate-400">Search jobs</span>
              </button>

              <button
                type="button"
                onClick={() => setUserRole('recruiter')}
                className={`p-3 rounded-xl border flex flex-col gap-1 text-left transition-all ${
                  userRole === 'recruiter'
                    ? 'border-brand-500 bg-brand-50/10 text-brand-650 dark:text-brand-400 ring-2 ring-brand-500/10'
                    : 'border-slate-200 dark:border-navy-800 bg-white/40 dark:bg-navy-900/40 text-slate-500'
                }`}
              >
                <Terminal className="w-4 h-4 mb-1 text-indigo-500" />
                <span className="text-xs font-bold">Recruiter</span>
                <span className="text-[9px] text-slate-400">Find talent</span>
              </button>

              <button
                type="button"
                onClick={() => setUserRole('admin')}
                className={`p-3 rounded-xl border flex flex-col gap-1 text-left transition-all ${
                  userRole === 'admin'
                    ? 'border-brand-500 bg-brand-50/10 text-brand-650 dark:text-brand-400 ring-2 ring-brand-500/10'
                    : 'border-slate-200 dark:border-navy-800 bg-white/40 dark:bg-navy-900/40 text-slate-500'
                }`}
              >
                <ShieldCheck className="w-4 h-4 mb-1 text-purple-500" />
                <span className="text-xs font-bold">Admin</span>
                <span className="text-[9px] text-slate-400">Manage site</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-navy-850"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase font-semibold">Or continue with</span>
            <div className="flex-grow border-t border-slate-200 dark:border-navy-850"></div>
          </div>

          {/* Social login option */}
          <button
            type="button"
            onClick={triggerGoogleLogin}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-navy-800 bg-white/60 dark:bg-navy-900/40 hover:bg-slate-100 dark:hover:bg-navy-800 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4 text-brand-500 fill-current" viewBox="0 0 24 24">
              <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.445-2.89-6.445-6.445s2.89-6.445 6.445-6.445c1.55 0 2.97.55 4.09 1.455l3.057-3.057C18.99 1.995 15.82 1 12.24 1 5.48 1 0 6.48 0 13.24s5.48 12.24 12.24 12.24c6.88 0 12.24-5.36 12.24-12.24 0-.81-.07-1.6-.2-2.385H12.24z"/>
            </svg>
            Google Identity
          </button>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-navy-850"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase font-semibold">Credentials</span>
            <div className="flex-grow border-t border-slate-200 dark:border-navy-850"></div>
          </div>

          {/* Main Auth Form */}
          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            {!isLogin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-xs text-slate-800 dark:text-slate-200 outline-none"
                  required
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</label>
              <input
                type="email"
                placeholder="you@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-xs text-slate-800 dark:text-slate-200 outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Password</label>
                {isLogin && <a href="#" className="text-[10px] text-brand-500 hover:underline">Forgot password?</a>}
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/50 rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-xs text-slate-800 dark:text-slate-200 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-250 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-xl bg-brand-650 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          {/* Toggle Switcher */}
          <div className="text-center text-xs text-slate-500 mt-2">
            {isLogin ? "Don't have an account?" : 'Already registered?'}{' '}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-500 hover:underline font-semibold"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>

        </div>
      </div>

      {/* Right Visual Panel */}
      <div className="hidden md:flex flex-1 bg-gradient-to-tr from-brand-600 to-indigo-700 relative overflow-hidden items-center justify-center p-12">
        <div className="glow-mesh glow-purple top-[-10%] right-[-10%] w-[80%] h-[80%] opacity-35" />
        <div className="glow-mesh glow-blue bottom-[-10%] left-[-10%] w-[80%] h-[80%] opacity-35" />

        <div className="max-w-md text-white flex flex-col gap-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold max-w-fit">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Artificial Sourcing Matrix
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            Matching Talent to Global Enterprise
          </h2>
          
          <p className="text-sm text-brand-100 leading-relaxed">
            Fusing advanced resume scoring, instant interactive portfolios scanning, and recruiters tracking boards to accelerate professional placement times.
          </p>

          <div className="flex flex-col gap-4 mt-6">
            {[
              "State-of-the-art Circular ATS rating meters",
              "Recruiters Kanban-status pipelines tracking boards",
              "Unstop hackathons, mentorship programs & Webinars"
            ].map((bullet, i) => (
              <div key={i} className="flex items-center gap-3 text-xs font-semibold text-brand-50 bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {bullet}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
