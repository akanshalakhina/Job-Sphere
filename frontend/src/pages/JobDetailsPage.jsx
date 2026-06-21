import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { MapPin, DollarSign, Calendar, Sparkles, Star, ChevronLeft, ArrowRight, UserCheck, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';
import { ImageWithFallback } from '../components/ImageWithFallback';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, appliedJobIds, savedJobIds, applyToJob, toggleSaveJob } = useAppState();
  const { addToast } = useToast();

  const job = useMemo(() => {
    return jobs.find(j => j.id === id);
  }, [jobs, id]);

  const applied = job ? appliedJobIds.includes(job.id) : false;
  const saved = job ? savedJobIds.includes(job.id) : false;

  const handleApply = () => {
    if (!job) return;
    const success = applyToJob(job.id);
    if (success) {
      addToast(`Successfully applied for ${job.title}!`, 'success');
    } else {
      addToast(`You already applied to this role.`, 'info');
    }
  };

  const handleBookmark = () => {
    if (!job) return;
    toggleSaveJob(job.id);
    addToast(saved ? 'Removed from saved jobs' : 'Job bookmarked successfully!', 'success');
  };

  // Filter similar jobs (excluding current job)
  const similarJobs = job ? jobs.filter(j => j.id !== job.id).slice(0, 2) : [];

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-navy-800 flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Job Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">This position may have been removed or is no longer available.</p>
        <button onClick={() => navigate('/jobs')} className="mt-2 px-6 py-3 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-colors">
          Browse All Jobs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-6">
      
      {/* Back button */}
      <button
        onClick={() => navigate('/jobs')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-brand-500 transition-colors w-fit"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Jobs Board
      </button>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Column Details */}
        <div className="flex-1 flex flex-col gap-6 w-full">
          
          {/* Main Job Banner */}
          <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-start justify-between gap-6">
            <div className="flex gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-navy-950 flex items-center justify-center font-extrabold text-2xl text-brand-500 border border-slate-200/40 dark:border-navy-800 flex-shrink-0">
                {job.logo}
              </div>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white leading-tight">{job.title}</h2>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-bold flex items-center gap-2">
                  <span>{job.company}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold text-slate-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}</span>
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-navy-950 text-slate-500 dark:text-slate-400">{job.experience}</span>
                  <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-navy-950 text-slate-500 dark:text-slate-400">{job.department}</span>
                  <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">{job.postedTime}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
              <button
                onClick={handleBookmark}
                className={`flex-1 md:flex-initial p-3 rounded-xl border transition-colors flex items-center justify-center ${
                  saved
                    ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                    : 'border-slate-200 dark:border-navy-800 hover:bg-slate-100 dark:hover:bg-navy-800 text-slate-400'
                }`}
              >
                <Star className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
              </button>

              <button
                onClick={handleApply}
                className={`flex-[3] md:flex-initial px-6 py-3 rounded-xl text-xs font-bold shadow-md transition-all ${
                  applied
                    ? 'bg-slate-100 dark:bg-navy-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-navy-800 shadow-none cursor-default'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/10'
                }`}
                disabled={applied}
              >
                {applied ? 'Applied' : 'Apply Instantly'}
              </button>
            </div>
          </div>

          {/* Description Section */}
          <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Opportunity Description</h3>
              <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed">{job.description}</p>
            </div>

            <div className="h-px bg-slate-100 dark:bg-navy-800 w-full" />

            {/* Responsibilities list */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Key Responsibilities</h3>
              <ul className="flex flex-col gap-2.5">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex gap-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed items-start">
                    <CheckCircle2 className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" />
                    {resp}
                  </li>
                ))}
              </ul>
            </div>

            <div className="h-px bg-slate-100 dark:bg-navy-800 w-full" />

            {/* Required Skills tags */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider">Skills Sourced</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map(s => (
                  <span
                    key={s}
                    className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100/50 dark:bg-navy-950/50 text-slate-600 dark:text-slate-300 border border-slate-200/25 dark:border-navy-800"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recruiter profile panel card */}
          {job.recruiter && (
          <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Assigned Recruiter</h3>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <ImageWithFallback src={job.recruiter.avatar} alt={job.recruiter.name || 'Recruiter'} className="w-12 h-12 rounded-full object-cover" type="avatar" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                    {job.recruiter.name || 'Recruiter'}
                    <UserCheck className="w-3.5 h-3.5 text-brand-500" />
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{job.recruiter.role}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => addToast(`Messaged ${job.recruiter.name || 'Recruiter'}!`, 'success')}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-navy-800 hover:bg-slate-100 dark:hover:bg-navy-800/40 text-slate-500 dark:text-slate-300 transition-all flex items-center gap-1.5 text-[10px] font-semibold"
                >
                  <Mail className="w-3.5 h-3.5 text-brand-500" />
                  Send message
                </button>
              </div>
            </div>
          </div>
          )}

        </div>

        {/* Right Sticky Sidebar Column */}
        <aside className="w-full lg:w-80 flex flex-col gap-6 flex-shrink-0 lg:sticky lg:top-24">
          
          {/* AI Match Gauge Card */}
          <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex flex-col items-center text-center gap-4">
            <div className="w-full text-left">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                AI Sourcing Score
                <Sparkles className="w-3.5 h-3.5 text-brand-500 animate-pulse" />
              </h4>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="48" stroke="currentColor" className="text-slate-100 dark:text-navy-800" strokeWidth="6" fill="transparent" />
                <circle cx="56" cy="56" r="48" stroke="currentColor" className="text-brand-500" strokeWidth="8" fill="transparent"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - job.aiMatch / 100)}
                />
              </svg>
              <span className="absolute text-xl font-extrabold text-slate-800 dark:text-white">{job.aiMatch}%</span>
            </div>

            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Stellar Sourcing Compatibility</p>
              <p className="text-[9.5px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Your skills align exceptionally well with Stripe's required parameters. Add Next.js to your resume to reach a perfect score!
              </p>
            </div>
          </div>

          {/* Quick Metrics details */}
          <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Position Overview</h4>
            
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Compensation:</span>
                <span className="text-slate-800 dark:text-slate-200 flex items-center gap-0.5"><DollarSign className="w-3.5 h-3.5 text-slate-500" /> {job.salary}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Experience:</span>
                <span className="text-slate-800 dark:text-slate-200">{job.experience}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Department:</span>
                <span className="text-slate-800 dark:text-slate-200">{job.department}</span>
              </div>
            </div>
          </div>

          {/* Similar Jobs Shortcuts */}
          <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 rounded-3xl p-5 shadow-sm flex flex-col gap-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Alternative Jobs</h4>
            <div className="flex flex-col gap-3">
              {similarJobs.map(sj => (
                <Link
                  key={sj.id}
                  to={`/jobs/${sj.id}`}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100/50 dark:hover:bg-navy-950/40 transition-colors group"
                >
                  <div className="w-8 h-8 rounded bg-slate-100 dark:bg-navy-950 flex items-center justify-center font-extrabold text-xs text-brand-500 flex-shrink-0">
                    {sj.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-800 dark:text-white truncate group-hover:text-brand-500 transition-colors">{sj.title}</p>
                    <p className="text-[9px] text-slate-500 truncate">{sj.company} • {sj.location}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
};
