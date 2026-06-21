import React, { useState, useEffect } from 'react';
import { X, FileText, Briefcase, GraduationCap, MapPin, Star, Code2, FolderKanban, ExternalLink, Download, Award, CheckCircle, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from './ImageWithFallback';

// Fetches full candidate profile from the backend
const fetchCandidateProfile = async (clerkId) => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/users/public/${clerkId}?increment=false`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

// Stage pill color
const stagePill = (stage) => {
  const map = {
    Applied: 'bg-sky-500/10 text-sky-500',
    Screening: 'bg-amber-500/10 text-amber-500',
    Interview: 'bg-indigo-500/10 text-indigo-500',
    Interviewing: 'bg-indigo-500/10 text-indigo-500',
    Offer: 'bg-emerald-500/10 text-emerald-500',
    Offered: 'bg-emerald-500/10 text-emerald-500',
    Rejected: 'bg-rose-500/10 text-rose-500',
  };
  return map[stage] || 'bg-slate-500/10 text-slate-500';
};

// ATS score color
const atsColor = (score) => {
  if (score >= 85) return 'text-emerald-500';
  if (score >= 70) return 'text-amber-500';
  return 'text-rose-500';
};

export default function CandidateProfileModal({ candidate, onClose, onAdvance, onDemote, stages }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // candidate.candidateClerkId is the User.clerkId
  const clerkId = candidate?.candidateClerkId || candidate?.clerkId;

  useEffect(() => {
    if (!clerkId) { setLoading(false); return; }
    fetchCandidateProfile(clerkId).then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, [clerkId]);

  // Merge the application record data with full profile data
  const merged = {
    name: profile?.name || candidate?.name || 'Unknown',
    email: profile?.email || candidate?.email || candidate?.candidateEmail || '',
    avatar: profile?.avatar || candidate?.avatar || candidate?.candidateAvatar || '',
    title: profile?.title || candidate?.title || '',
    bio: profile?.bio || profile?.description || '',
    skills: profile?.skills?.length ? profile.skills : (candidate?.skills || []),
    softSkills: profile?.softSkills || [],
    experience: profile?.experience || candidate?.experience || '',
    college: profile?.college || '',
    degree: profile?.degree || '',
    graduationYear: profile?.graduationYear || '',
    location: profile?.location || '',
    atsScore: candidate?.atsScore ?? profile?.atsScore ?? 0,
    resumeUrl: candidate?.resumeUrl || profile?.resumeUrl || '',
    resumeDetails: profile?.resumeDetails || null,
    projects: profile?.projects || [],
    stage: candidate?.stage || 'Applied',
    appliedFor: candidate?.appliedFor || candidate?.jobTitle || '',
    company: candidate?.company || '',
  };

  const stages_ = stages || ['Applied', 'Screening', 'Interview', 'Offered'];
  const currentIdx = stages_.indexOf(merged.stage === 'Offered' ? 'Offered' : merged.stage === 'Interviewing' ? 'Interview' : merged.stage);
  const canAdvance = currentIdx < stages_.length - 1;
  const canDemote = currentIdx > 0;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-navy-950 rounded-3xl shadow-2xl border border-slate-200 dark:border-navy-800 flex flex-col">

        {/* Header */}
        <div className="flex items-start gap-4 p-6 border-b border-slate-100 dark:border-navy-800 sticky top-0 bg-white dark:bg-navy-950 z-10 rounded-t-3xl">
          <ImageWithFallback
            src={merged.avatar}
            alt={merged.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/30 flex-shrink-0"
            type="avatar"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-white leading-tight">{merged.name}</h2>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${stagePill(merged.stage)}`}>
                {merged.stage}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{merged.title}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{merged.email}</p>
            {merged.appliedFor && (
              <p className="text-[10px] text-brand-500 font-semibold mt-1">
                Applied for: <span className="font-bold">{merged.appliedFor}</span>
                {merged.company && <span className="text-slate-400"> @ {merged.company}</span>}
              </p>
            )}
          </div>

          {/* ATS Score */}
          <div className="flex-shrink-0 text-center">
            <div className={`text-2xl font-black ${atsColor(merged.atsScore)}`}>{merged.atsScore}%</div>
            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">ATS Score</div>
          </div>

          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-xl bg-slate-100 dark:bg-navy-800 hover:bg-rose-500/10 hover:text-rose-500 text-slate-400 flex items-center justify-center transition-all ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            <span className="ml-3 text-sm text-slate-500">Loading profile…</span>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-6">

            {/* Pipeline Stage Stepper */}
            <div className="bg-slate-50 dark:bg-navy-900/40 rounded-2xl p-4 border border-slate-100 dark:border-navy-800">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Hiring Pipeline Stage</p>
              <div className="flex items-center gap-1 flex-wrap">
                {stages_.map((s, i) => {
                  const isActive = s === merged.stage || (s === 'Interview' && merged.stage === 'Interviewing') || (s === 'Offered' && merged.stage === 'Offer');
                  const isPast = i < currentIdx;
                  return (
                    <React.Fragment key={s}>
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${
                        isActive ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20' :
                        isPast ? 'bg-emerald-500/10 text-emerald-500' :
                        'bg-slate-100 dark:bg-navy-800 text-slate-400'
                      }`}>
                        {isPast && <CheckCircle className="w-3 h-3" />}
                        {s}
                      </div>
                      {i < stages_.length - 1 && <div className={`h-0.5 w-4 rounded ${isPast || isActive ? 'bg-brand-500/40' : 'bg-slate-200 dark:bg-navy-800'}`} />}
                    </React.Fragment>
                  );
                })}
              </div>
              <div className="flex gap-2 mt-3">
                {onDemote && canDemote && (
                  <button
                    onClick={() => { onDemote(); onClose(); }}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-navy-800 hover:bg-rose-500/10 hover:text-rose-500 text-slate-600 text-[10px] font-bold transition-all"
                  >
                    ← Move Back
                  </button>
                )}
                {onAdvance && canAdvance && (
                  <button
                    onClick={() => { onAdvance(); onClose(); }}
                    className="px-3 py-1.5 rounded-lg bg-brand-500 text-white hover:bg-brand-600 text-[10px] font-bold transition-all shadow-sm"
                  >
                    Advance to {stages_[currentIdx + 1]} →
                  </button>
                )}
              </div>
            </div>

            {/* Bio */}
            {merged.bio && (
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">About</p>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{merged.bio}</p>
              </div>
            )}

            {/* Skills */}
            {(merged.skills.length > 0 || merged.softSkills.length > 0) && (
              <div className="border border-slate-100 dark:border-navy-800 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Code2 className="w-3.5 h-3.5 text-brand-500" />
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Technical Skills</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {merged.skills.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold border border-brand-500/20">
                      {s}
                    </span>
                  ))}
                </div>
                {merged.softSkills.length > 0 && (
                  <>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mt-3 mb-2">Soft Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {merged.softSkills.map((s) => (
                        <span key={s} className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-500 text-[10px] font-bold border border-indigo-500/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Experience + Education + Location row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Experience */}
              <div className="border border-slate-100 dark:border-navy-800 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-amber-500">
                  <Briefcase className="w-3.5 h-3.5" />
                  <p className="text-[10px] uppercase font-bold tracking-wider">Experience</p>
                </div>
                <p className="text-sm font-extrabold text-slate-800 dark:text-white">
                  {merged.experience || '—'}
                </p>
              </div>

              {/* Education */}
              <div className="border border-slate-100 dark:border-navy-800 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-indigo-500">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <p className="text-[10px] uppercase font-bold tracking-wider">Education</p>
                </div>
                {merged.college || merged.degree ? (
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-white">{merged.degree || '—'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{merged.college}</p>
                    {merged.graduationYear && (
                      <p className="text-[9px] text-slate-400 mt-0.5">Class of {merged.graduationYear}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Not provided</p>
                )}
              </div>

              {/* Location */}
              <div className="border border-slate-100 dark:border-navy-800 rounded-2xl p-4 flex flex-col gap-2">
                <div className="flex items-center gap-1.5 text-emerald-500">
                  <MapPin className="w-3.5 h-3.5" />
                  <p className="text-[10px] uppercase font-bold tracking-wider">Location</p>
                </div>
                <p className="text-sm font-extrabold text-slate-800 dark:text-white">
                  {merged.location || 'Not specified'}
                </p>
              </div>
            </div>

            {/* Projects */}
            {merged.projects.length > 0 && (
              <div className="border border-slate-100 dark:border-navy-800 rounded-2xl p-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <FolderKanban className="w-3.5 h-3.5 text-purple-500" />
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Projects</p>
                </div>
                <div className="flex flex-col gap-3">
                  {merged.projects.map((proj, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-50 dark:bg-navy-900/50 border border-slate-100 dark:border-navy-800">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-800 dark:text-white">{proj.title || proj.name}</p>
                        {proj.url && (
                          <a href={proj.url} target="_blank" rel="noreferrer" className="text-brand-500 hover:text-brand-600">
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      {(proj.description || proj.desc) && (
                        <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{proj.description || proj.desc}</p>
                      )}
                      {proj.tech && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {(Array.isArray(proj.tech) ? proj.tech : [proj.tech]).map((t) => (
                            <span key={t} className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-navy-800 text-slate-500">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resume / ATS Analysis */}
            <div className="border border-slate-100 dark:border-navy-800 rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <FileText className="w-3.5 h-3.5 text-rose-500" />
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Resume &amp; ATS Analysis</p>
              </div>

              {merged.resumeUrl ? (
                <a
                  href={merged.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-500 text-white text-[10px] font-bold hover:bg-brand-600 transition-all shadow-sm mb-3"
                >
                  <Download className="w-3 h-3" /> View / Download Resume
                </a>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-3">
                  <AlertCircle className="w-3.5 h-3.5" /> No resume URL available
                </div>
              )}

              {merged.resumeDetails && (
                <div className="flex flex-col gap-3 mt-2">
                  {merged.resumeDetails.summary && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed italic border-l-2 border-brand-500 pl-3">
                      "{merged.resumeDetails.summary}"
                    </p>
                  )}

                  {/* Score bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">ATS Compatibility</span>
                      <span className={`text-xs font-black ${atsColor(merged.resumeDetails.atsScore || merged.atsScore)}`}>
                        {merged.resumeDetails.atsScore || merged.atsScore}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-navy-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          (merged.resumeDetails.atsScore || merged.atsScore) >= 85 ? 'bg-emerald-500' :
                          (merged.resumeDetails.atsScore || merged.atsScore) >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${merged.resumeDetails.atsScore || merged.atsScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Missing keywords */}
                  {merged.resumeDetails.missingKeywords?.length > 0 && (
                    <div>
                      <p className="text-[9px] uppercase font-bold text-rose-400 tracking-wider mb-1.5">Missing Keywords</p>
                      <div className="flex flex-wrap gap-1">
                        {merged.resumeDetails.missingKeywords.map((k) => (
                          <span key={k} className="text-[9px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 font-bold border border-rose-500/20">{k}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Improvements */}
                  {merged.resumeDetails.improvements?.length > 0 && (
                    <div>
                      <p className="text-[9px] uppercase font-bold text-amber-400 tracking-wider mb-1.5">Suggested Improvements</p>
                      <ul className="flex flex-col gap-1">
                        {merged.resumeDetails.improvements.map((imp, i) => (
                          <li key={i} className="flex items-start gap-1.5 text-[10px] text-slate-600 dark:text-slate-300">
                            <Star className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
