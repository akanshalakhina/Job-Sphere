import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, User, Terminal, CheckCircle, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';

export const AuthPage = () => {
  const {
    userRole,
    setUserRole,
    currentUser,
    isSignedIn,
    authLoaded,
    login,
    signup
  } = useAppState();

  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    graduationYear: '',
    college: '',
    degree: '',
    skills: '',
    softSkills: '',
    avatar: '',
    resume: '',
    companyName: '',
    industry: '',
    companySize: '',
    logo: '',
    website: '',
    description: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIsLogin(!location.pathname.includes('sign-up'));
    setAuthError('');
    setErrors({});
  }, [location.pathname]);

  useEffect(() => {
    if (authLoaded && isSignedIn && currentUser) {
      if (currentUser.role === 'candidate') {
        navigate('/candidate-dashboard');
      } else if (currentUser.role === 'recruiter') {
        navigate('/recruiter-dashboard');
      } else if (currentUser.role === 'admin') {
        navigate('/admin-dashboard');
      }
    }
  }, [authLoaded, isSignedIn, currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateLoginForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = 'Email or username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignupForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (userRole === 'candidate') {
      if (!formData.graduationYear.trim()) newErrors.graduationYear = 'Graduation year is required';
      if (!formData.college.trim()) newErrors.college = 'College name is required';
      if (!formData.degree.trim()) newErrors.degree = 'Degree is required';
      if (!formData.skills.trim()) newErrors.skills = 'At least one technical skill is required';
    } else if (userRole === 'recruiter') {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
      if (!formData.industry.trim()) newErrors.industry = 'Industry is required';
      if (!formData.companySize.trim()) newErrors.companySize = 'Company size is required';
      if (!formData.description.trim()) newErrors.description = 'Company description is required';
      if (formData.website.trim()) {
        try {
          new URL(formData.website);
        } catch {
          newErrors.website = 'Please enter a valid URL (e.g., https://example.com)';
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setAuthError('');

    if (isLogin) {
      const isValid = validateLoginForm();
      if (!isValid) return;

      setIsSubmitting(true);
      const res = await login(formData.email, formData.password);
      setIsSubmitting(false);

      if (!res.success) {
        setAuthError(res.error || 'Invalid email or password');
      }
    } else {
      const isValid = validateSignupForm();
      if (!isValid) return;

      setIsSubmitting(true);
      const payload = {
        email: formData.email,
        password: formData.password,
        role: userRole,
        name: formData.name,
        graduationYear: formData.graduationYear,
        college: formData.college,
        degree: formData.degree,
        skills: formData.skills,
        softSkills: formData.softSkills,
        avatar: formData.avatar,
        resume: formData.resume,
        companyName: formData.companyName,
        industry: formData.industry,
        companySize: formData.companySize,
        logo: formData.logo,
        website: formData.website,
        description: formData.description,
      };

      const res = await signup(payload);
      setIsSubmitting(false);

      if (!res.success) {
        setAuthError(res.error || 'Failed to sign up');
      }
    }
  };

  const inputClass = (fieldName) =>
    `w-full p-3 bg-slate-50/50 dark:bg-navy-950/40 border ${errors[fieldName] ? 'border-rose-400 dark:border-rose-500' : 'border-slate-200 dark:border-navy-800/50'} rounded-xl focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 text-xs text-slate-800 dark:text-slate-200 outline-none`;

  const labelClass = "text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5";

  const candidateInfo = {
    tag: "Candidate Workspace",
    title: "Elevate Your Career Path",
    description: "Supercharge your job search with deep resume analytics, real-time feedback, AI coaching, and direct applications to leading global tech firms.",
    bullets: [
      "Resume scorecards from uploaded files",
      "Real-time AI Resume feedback & optimization",
      "Opportunity boards, interview prep, and saved roles"
    ],
    mockup: (
      <div className="mt-8 p-5 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl flex items-center justify-between gap-6 hover:scale-[1.02] transition-transform duration-300">
        <div className="flex flex-col gap-2">
          <div className="text-[10px] text-brand-100 font-bold uppercase tracking-wider">Candidate Preview</div>
          <div className="text-lg font-bold">Demo Candidate</div>
          <div className="text-xs text-brand-200">Frontend Role Track</div>
          <div className="flex gap-1.5 mt-1">
            <span className="px-2 py-0.5 rounded bg-white/10 text-[9px] font-semibold">React</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-[9px] font-semibold">TypeScript</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-[9px] font-semibold">Tailwind</span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" className="text-white/10" strokeWidth="4" stroke="currentColor" fill="transparent" />
              <circle cx="32" cy="32" r="28" className="text-emerald-400" strokeWidth="4" strokeDasharray="175" strokeDashoffset="21" strokeLinecap="round" stroke="currentColor" fill="transparent" />
            </svg>
            <span className="absolute text-[10px] font-black text-white">Ready</span>
          </div>
          <span className="text-[8px] text-emerald-300 font-bold uppercase tracking-wider">Upload Resume</span>
        </div>
      </div>
    )
  };

  const recruiterInfo = {
    tag: "Talent Acquisition Engine",
    title: "Find Top Industry Experts",
    description: "Accelerate your hiring cycle using our automated pipeline tracking, smart candidate matching, custom interviews scheduling, and candidate Kanban boards.",
    bullets: [
      "Recruiters Kanban-status pipelines tracking boards",
      "Automated candidate shortlisting & scoring",
      "Instant candidate messaging & scheduling suite"
    ],
    mockup: (
      <div className="mt-8 p-5 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl flex flex-col gap-4 hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-between justify-between border-b border-white/15 pb-2">
          <span className="text-[10px] text-brand-100 font-bold uppercase tracking-wider">Active Pipeline</span>
          <span className="text-[10px] bg-indigo-500 px-2 py-0.5 rounded-full font-bold">5 Open Positions</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2 p-2 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[9px] text-indigo-300 font-bold uppercase">Interviewing (3)</span>
            <div className="p-2 bg-white/5 rounded-lg text-[10px] font-semibold flex flex-col gap-0.5">
              <span>Candidate A</span>
              <span className="text-[8px] text-slate-400">Screening</span>
            </div>
            <div className="p-2 bg-white/5 rounded-lg text-[10px] font-semibold flex flex-col gap-0.5">
              <span>Candidate B</span>
              <span className="text-[8px] text-slate-400">Interview due</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 p-2 bg-white/5 rounded-xl border border-white/10">
            <span className="text-[9px] text-emerald-300 font-bold uppercase">Offered (1)</span>
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-[10px] font-semibold flex flex-col gap-0.5">
              <span>Candidate C</span>
              <span className="text-[8px] text-emerald-300">Offer stage</span>
            </div>
          </div>
        </div>
      </div>
    )
  };

  const adminInfo = {
    tag: "Admin Command Console",
    title: "Control Platform Trust",
    description: "Review job approvals, employer verification, billing readiness, and platform diagnostics from one administrative workspace.",
    bullets: [
      "Approve recruiter job submissions",
      "Manage employer verification states",
      "Audit demo readiness and integration status"
    ],
    mockup: (
      <div className="mt-8 p-5 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl flex flex-col gap-4 hover:scale-[1.02] transition-transform duration-300">
        <div className="flex items-center justify-between border-b border-white/15 pb-3">
          <span className="text-[10px] text-brand-100 font-bold uppercase tracking-wider">Admin Access</span>
          <span className="text-[10px] bg-purple-500 px-2 py-0.5 rounded-full font-bold">Protected</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {['Approvals', 'Verifications', 'Billing', 'Diagnostics'].map(item => (
            <div key={item} className="p-3 bg-white/5 rounded-xl border border-white/10 text-[10px] font-bold">
              {item}
            </div>
          ))}
        </div>
      </div>
    )
  };

  const currentInfo =
    userRole === 'recruiter'
      ? recruiterInfo
      : userRole === 'admin'
        ? adminInfo
        : candidateInfo;

  if (!authLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-navy-950">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-navy-950 transition-colors duration-300">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 z-10 relative bg-white/70 dark:bg-navy-950/40 backdrop-blur-md">
        <div className="max-w-md w-full mx-auto flex flex-col gap-6">
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800 dark:text-white">
              JobSphere<span className="text-brand-500 font-extrabold">.ai</span>
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isLogin ? 'Enter your credentials to enter the JobSphere interface.' : 'Register and choose your portal workspace.'}
            </p>
          </div>

          {/* Workspace role selector */}
          <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Select Workspace Role</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  data-testid="role-candidate"
                  onClick={() => setUserRole('candidate')}
                  className={`p-3 rounded-xl border flex flex-col gap-1 text-left transition-all ${
                    userRole === 'candidate'
                      ? 'border-brand-500 bg-brand-50/10 text-brand-600 dark:text-brand-400 ring-2 ring-brand-500/10'
                      : 'border-slate-200 dark:border-navy-800 bg-white/40 dark:bg-navy-900/40 text-slate-500'
                  }`}
                >
                  <User className="w-4 h-4 mb-1 text-brand-500" />
                  <span className="text-xs font-bold">Candidate</span>
                  <span className="text-[9px] text-slate-400">Search jobs</span>
                </button>

                <button
                  type="button"
                  data-testid="role-recruiter"
                  onClick={() => setUserRole('recruiter')}
                  className={`p-3 rounded-xl border flex flex-col gap-1 text-left transition-all ${
                    userRole === 'recruiter'
                      ? 'border-brand-500 bg-brand-50/10 text-brand-600 dark:text-brand-400 ring-2 ring-brand-500/10'
                      : 'border-slate-200 dark:border-navy-800 bg-white/40 dark:bg-navy-900/40 text-slate-500'
                  }`}
                >
                  <Terminal className="w-4 h-4 mb-1 text-indigo-500" />
                  <span className="text-xs font-bold">Recruiter</span>
                  <span className="text-[9px] text-slate-400">Find talent</span>
                </button>

                <button
                  type="button"
                  data-testid="role-admin"
                  onClick={() => setUserRole('admin')}
                  className={`p-3 rounded-xl border flex flex-col gap-1 text-left transition-all ${
                    userRole === 'admin'
                      ? 'border-brand-500 bg-brand-50/10 text-brand-600 dark:text-brand-400 ring-2 ring-brand-500/10'
                      : 'border-slate-200 dark:border-navy-800 bg-white/40 dark:bg-navy-900/40 text-slate-500'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 mb-1 text-purple-500" />
                  <span className="text-xs font-bold">Admin</span>
                  <span className="text-[9px] text-slate-400">Manage platform</span>
                </button>
              </div>
          </div>

          {authError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-800/50 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {isLogin ? (
              // Login Form
              <>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Email Or Username</label>
                  <input
                    type="text"
                    name="email"
                    value={formData.email ?? ''}
                    onChange={handleChange}
                    placeholder={userRole === 'admin' ? 'admin' : 'you@example.com'}
                    className={inputClass('email')}
                    required
                  />
                  {errors.email && <span className="text-[10px] text-rose-500 font-semibold">{errors.email}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password ?? ''}
                      onChange={handleChange}
                      className={inputClass('password')}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <span className="text-[10px] text-rose-500 font-semibold">{errors.password}</span>}
                </div>
              </>
            ) : (
              // Signup Form
              <>
                {/* Common Fields */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name ?? ''}
                    onChange={handleChange}
                    className={inputClass('name')}
                    required
                  />
                  {errors.name && <span className="text-[10px] text-rose-500 font-semibold">{errors.name}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email ?? ''}
                    onChange={handleChange}
                    className={inputClass('email')}
                    required
                  />
                  {errors.email && <span className="text-[10px] text-rose-500 font-semibold">{errors.email}</span>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password ?? ''}
                      onChange={handleChange}
                      className={inputClass('password')}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <span className="text-[10px] text-rose-500 font-semibold">{errors.password}</span>}
                </div>

                {/* Candidate Specific Fields */}
                {userRole === 'candidate' && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>College</label>
                      <input
                        type="text"
                        name="college"
                        value={formData.college ?? ''}
                        onChange={handleChange}
                        className={inputClass('college')}
                        required
                      />
                      {errors.college && <span className="text-[10px] text-rose-500 font-semibold">{errors.college}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Degree</label>
                        <input
                          type="text"
                          name="degree"
                          value={formData.degree ?? ''}
                          onChange={handleChange}
                          placeholder="e.g. B.Tech, BS"
                          className={inputClass('degree')}
                          required
                        />
                        {errors.degree && <span className="text-[10px] text-rose-500 font-semibold">{errors.degree}</span>}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Graduation Year</label>
                        <input
                          type="text"
                          name="graduationYear"
                          value={formData.graduationYear ?? ''}
                          onChange={handleChange}
                          placeholder="e.g. 2026"
                          className={inputClass('graduationYear')}
                          required
                        />
                        {errors.graduationYear && <span className="text-[10px] text-rose-500 font-semibold">{errors.graduationYear}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Technical Skills (comma-separated)</label>
                      <input
                        type="text"
                        name="skills"
                        value={formData.skills ?? ''}
                        onChange={handleChange}
                        placeholder="React, TypeScript, Python, Node.js"
                        className={inputClass('skills')}
                        required
                      />
                      {errors.skills && <span className="text-[10px] text-rose-500 font-semibold">{errors.skills}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Soft Skills (comma-separated)</label>
                      <input
                        type="text"
                        name="softSkills"
                        value={formData.softSkills ?? ''}
                        onChange={handleChange}
                        placeholder="Communication, Leadership, Problem-solving"
                        className={inputClass('softSkills')}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Profile Avatar Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        name="avatarFile"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData((prev) => ({ ...prev, avatar: reader.result }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className={inputClass('avatar')}
                      />
                      {formData.avatar && (
                        <img src={formData.avatar} alt="Avatar preview" className="mt-2 w-14 h-14 rounded-full object-cover border-2 border-brand-500" />
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Resume File (PDF)</label>
                      <input
                        type="file"
                        accept="application/pdf"
                        name="resumeFile"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFormData((prev) => ({ ...prev, resume: reader.result }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className={inputClass('resume')}
                      />
                      {formData.resume && (
                        <span className="text-[10px] text-emerald-500 font-semibold mt-1">✓ PDF loaded</span>
                      )}
                    </div>
                  </>
                )}

                {/* Recruiter Specific Fields */}
                {userRole === 'recruiter' && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Company Name</label>
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName ?? ''}
                        onChange={handleChange}
                        className={inputClass('companyName')}
                        required
                      />
                      {errors.companyName && <span className="text-[10px] text-rose-500 font-semibold">{errors.companyName}</span>}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Industry</label>
                        <input
                          type="text"
                          name="industry"
                          value={formData.industry ?? ''}
                          onChange={handleChange}
                          placeholder="e.g. Technology, Finance"
                          className={inputClass('industry')}
                          required
                        />
                        {errors.industry && <span className="text-[10px] text-rose-500 font-semibold">{errors.industry}</span>}
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Company Size</label>
                        <select
                          name="companySize"
                          value={formData.companySize ?? ''}
                          onChange={handleChange}
                          className={inputClass('companySize')}
                          required
                        >
                          <option value="">Select Size</option>
                          <option value="1-10">1-10 employees</option>
                          <option value="11-50">11-50 employees</option>
                          <option value="51-200">51-200 employees</option>
                          <option value="201-500">201-500 employees</option>
                          <option value="501+">501+ employees</option>
                        </select>
                        {errors.companySize && <span className="text-[10px] text-rose-500 font-semibold">{errors.companySize}</span>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Company Logo URL</label>
                      <input
                        type="text"
                        name="logo"
                        value={formData.logo ?? ''}
                        onChange={handleChange}
                        placeholder="https://example.com/logo.png"
                        className={inputClass('logo')}
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Website URL</label>
                      <input
                        type="text"
                        name="website"
                        value={formData.website ?? ''}
                        onChange={handleChange}
                        placeholder="https://example.com"
                        className={inputClass('website')}
                      />
                      {errors.website && <span className="text-[10px] text-rose-500 font-semibold">{errors.website}</span>}
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Company Description</label>
                      <textarea
                        name="description"
                        value={formData.description ?? ''}
                        onChange={handleChange}
                        rows={3}
                        className={`${inputClass('description')} resize-none`}
                        required
                      />
                      {errors.description && <span className="text-[10px] text-rose-500 font-semibold">{errors.description}</span>}
                    </div>
                  </>
                )}
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 text-sm font-bold shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all mt-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 mt-2">
            {isLogin ? "Don't have an account?" : 'Already registered?'}{' '}
            <button
              onClick={() => {
                navigate(isLogin ? '/auth/sign-up' : '/auth');
              }}
              className="text-brand-500 hover:underline font-semibold"
            >
              {isLogin ? 'Sign Up' : 'Log In'}
            </button>
          </div>

        </div>
      </div>

      <div className="hidden md:flex flex-1 bg-gradient-to-tr from-brand-600 to-indigo-700 relative overflow-hidden items-center justify-center p-12">
        <div className="glow-mesh glow-purple top-[-10%] right-[-10%] w-[80%] h-[80%] opacity-35" />
        <div className="glow-mesh glow-blue bottom-[-10%] left-[-10%] w-[80%] h-[80%] opacity-35" />

        <div className="max-w-md text-white flex flex-col gap-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold max-w-fit">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            {currentInfo.tag}
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            {currentInfo.title}
          </h2>
          
          <p className="text-sm text-brand-100 leading-relaxed">
            {currentInfo.description}
          </p>

          <div className="flex flex-col gap-4 mt-2">
            {currentInfo.bullets.map((bullet, i) => (
              <div key={i} className="flex items-center gap-3 text-xs font-semibold text-brand-50 bg-white/5 border border-white/10 rounded-2xl p-3.5 backdrop-blur-md">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                {bullet}
              </div>
            ))}
          </div>

          {currentInfo.mockup}
        </div>
      </div>
    </div>
  );
};
