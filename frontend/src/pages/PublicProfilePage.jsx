import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Briefcase, Eye, FileCode, Mail, Sparkles } from 'lucide-react';
import { ImageWithFallback } from '../components/ImageWithFallback';

export const PublicProfilePage = () => {
  const { clerkId } = useParams();
  const [profile, setProfile] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let ignore = false;

    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/users/public/${clerkId}`);
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || 'Profile not found');
        }
        if (!ignore) {
          setProfile(data);
          setError('');
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Unable to load profile');
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    };

    if (clerkId) loadProfile();
    return () => {
      ignore = true;
    };
  }, [clerkId]);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{error || 'Profile not found'}</p>
        <Link to="/feed" className="text-xs font-bold text-brand-500 hover:underline mt-3 inline-block">Back to feed</Link>
      </div>
    );
  }

  const skills = profile.skills || [];
  const isRecruiter = profile.role === 'recruiter';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-6">
      <section className="rounded-3xl overflow-hidden border border-slate-200/60 dark:border-navy-800/40 bg-white/80 dark:bg-navy-900/50 shadow-sm">
        <div className="h-32 bg-gradient-to-r from-brand-600 to-indigo-600" />
        <div className="p-6 sm:p-8 -mt-14 flex flex-col sm:flex-row sm:items-end gap-5">
          <ImageWithFallback
            src={profile.avatar || profile.logo}
            alt={profile.name || profile.companyName || 'Profile'}
            type={isRecruiter ? 'company' : 'avatar'}
            className="w-24 h-24 rounded-3xl object-cover border-4 border-white dark:border-navy-900 shadow-xl bg-white"
          />
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              {isRecruiter ? 'Recruiter Profile' : 'Candidate Profile'}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
              {profile.name || profile.companyName || 'JobSphere Member'}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              {profile.title || profile.company || profile.companyName || profile.degree || 'JobSphere professional'}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 p-5">
          <Eye className="w-5 h-5 text-brand-500 mb-2" />
          <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{profile.profileViews || 0}</p>
          <p className="text-[10px] uppercase font-bold text-slate-400">Profile views</p>
        </div>
        <div className="rounded-2xl border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 p-5">
          <FileCode className="w-5 h-5 text-indigo-500 mb-2" />
          <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{profile.atsScore || 0}%</p>
          <p className="text-[10px] uppercase font-bold text-slate-400">ATS score</p>
        </div>
        <div className="rounded-2xl border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 p-5">
          <Briefcase className="w-5 h-5 text-emerald-500 mb-2" />
          <p className="text-2xl font-extrabold text-slate-800 dark:text-white">{profile.postImpressions || 0}</p>
          <p className="text-[10px] uppercase font-bold text-slate-400">Post impressions</p>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 p-6 flex flex-col gap-4">
        <h2 className="text-sm font-bold text-slate-800 dark:text-white">About</h2>
        <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          {profile.bio || profile.description || 'This member has not added a profile summary yet.'}
        </p>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <span key={skill} className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400">
                {skill}
              </span>
            ))}
          </div>
        )}
        {profile.email && (
          <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-500 hover:underline">
            <Mail className="w-3.5 h-3.5" />
            Contact
          </a>
        )}
      </section>
    </div>
  );
};
