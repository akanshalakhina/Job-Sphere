import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, DollarSign, Star, Briefcase, Filter, ChevronRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { useAppState } from '../context/AppStateContext';
import { useToast } from '../context/ToastContext';

export const JobListingPage = () => {
  const navigate = useNavigate();
  const { jobs, appliedJobIds, savedJobIds, applyToJob, toggleSaveJob } = useAppState();
  const { addToast } = useToast();

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedWorkplace, setSelectedWorkplace] = useState('All');
  const [selectedExp, setSelectedExp] = useState('All');
  const [sortBy, setSortBy] = useState('match'); // 'match', 'salary', 'newest'

  // Sourcing filters lists
  const departments = ['All', 'Engineering', 'Design', 'Research'];
  const workplaces = ['All', 'Remote', 'Hybrid', 'On-site'];
  const experiences = ['All', '1-2 Years', '3+ Years', '5+ Years', '7+ Years'];

  const filteredJobs = useMemo(() => {
    return jobs
      .filter(job => {
        const matchesSearch =
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.company.toLowerCase().includes(search.toLowerCase()) ||
          job.location.toLowerCase().includes(search.toLowerCase()) ||
          job.skills.some(s => s.toLowerCase().includes(search.toLowerCase()));

        const matchesDept = selectedDept === 'All' || job.department === selectedDept;
        
        const matchesWorkplace = selectedWorkplace === 'All' || 
          (selectedWorkplace === 'Remote' && job.location.toLowerCase().includes('remote')) ||
          (selectedWorkplace === 'Hybrid' && job.location.toLowerCase().includes('hybrid')) ||
          (selectedWorkplace === 'On-site' && job.location.toLowerCase().includes('on-site'));

        const matchesExp = selectedExp === 'All' || job.experience === selectedExp;

        return matchesSearch && matchesDept && matchesWorkplace && matchesExp;
      })
      .sort((a, b) => {
        if (sortBy === 'match') return b.aiMatch - a.aiMatch;
        if (sortBy === 'newest') return 1; // Simulated newest
        if (sortBy === 'salary') {
          const valA = parseInt(a.salary.replace(/[^0-9]/g, ''));
          const valB = parseInt(b.salary.replace(/[^0-9]/g, ''));
          return valB - valA;
        }
        return 0;
      });
  }, [jobs, search, selectedDept, selectedWorkplace, selectedExp, sortBy]);

  const handleApply = (e, jobId, title) => {
    e.stopPropagation();
    const success = applyToJob(jobId);
    if (success) {
      addToast(`Successfully applied to ${title}!`, 'success');
    } else {
      addToast(`You have already applied to this role.`, 'info');
    }
  };

  const handleBookmark = (e, jobId) => {
    e.stopPropagation();
    toggleSaveJob(jobId);
    const saved = savedJobIds.includes(jobId);
    addToast(saved ? 'Removed from saved jobs' : 'Job bookmarked successfully!', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-8">
      
      {/* Top Search bar row */}
      <div className="border border-slate-200/60 dark:border-navy-800/40 bg-white/60 dark:bg-navy-900/40 backdrop-blur-xl rounded-3xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by job title, tech keywords, company, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50/50 dark:bg-navy-950/40 border border-slate-200 dark:border-navy-800/60 rounded-2xl pl-12 pr-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-brand-500"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="flex-1 md:flex-initial p-3 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 text-xs font-semibold rounded-2xl outline-none text-slate-700 dark:text-slate-200 focus:border-brand-500"
          >
            <option value="match">Sort by: AI Match Score</option>
            <option value="salary">Sort by: High Salary</option>
            <option value="newest">Sort by: Latest</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64 border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 backdrop-blur-xl rounded-3xl p-5 shadow-sm flex flex-col gap-6 flex-shrink-0">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-navy-850 pb-3">
            <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-brand-500" />
              Advanced Filters
            </h4>
          </div>

          {/* Department Filter */}
          <div className="flex flex-col gap-2">
            <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Department</h5>
            <div className="flex flex-col gap-1.5">
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`text-xs font-medium px-3.5 py-2 rounded-xl text-left transition-colors ${
                    selectedDept === dept
                      ? 'bg-brand-500/10 text-brand-650 dark:text-brand-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-navy-800/40'
                  }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Workplace Type */}
          <div className="flex flex-col gap-2">
            <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Workplace Mode</h5>
            <div className="flex flex-col gap-1.5">
              {workplaces.map(mode => (
                <button
                  key={mode}
                  onClick={() => setSelectedWorkplace(mode)}
                  className={`text-xs font-medium px-3.5 py-2 rounded-xl text-left transition-colors ${
                    selectedWorkplace === mode
                      ? 'bg-brand-500/10 text-brand-650 dark:text-brand-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-navy-800/40'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Experience level */}
          <div className="flex flex-col gap-2">
            <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Experience Level</h5>
            <div className="flex flex-col gap-1.5">
              {experiences.map(exp => (
                <button
                  key={exp}
                  onClick={() => setSelectedExp(exp)}
                  className={`text-xs font-medium px-3.5 py-2 rounded-xl text-left transition-colors ${
                    selectedExp === exp
                      ? 'bg-brand-500/10 text-brand-650 dark:text-brand-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-navy-800/40'
                  }`}
                >
                  {exp === 'All' ? 'All Experiences' : exp}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Listings Content */}
        <div className="flex-1 flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <p className="text-xs text-slate-450 dark:text-slate-400 font-semibold">Showing <span className="text-slate-800 dark:text-white font-bold">{filteredJobs.length}</span> corresponding positions</p>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.map(job => {
                const applied = appliedJobIds.includes(job.id);
                const saved = savedJobIds.includes(job.id);

                return (
                  <div
                    key={job.id}
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="border border-slate-200/60 dark:border-navy-800/40 bg-white/70 dark:bg-navy-900/40 hover:bg-white dark:hover:bg-navy-900 backdrop-blur-xl rounded-3xl p-5 md:p-6 shadow-sm flex flex-col gap-4 md:flex-row md:items-center justify-between hover:border-brand-500/30 dark:hover:border-brand-400/30 hover:scale-[1.003] cursor-pointer transition-all duration-300 group"
                  >
                    {/* Left Pane Details */}
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-navy-950 flex items-center justify-center font-extrabold text-lg text-brand-500 border border-slate-200/40 dark:border-navy-850 flex-shrink-0">
                        {job.logo}
                      </div>
                      <div className="flex flex-col gap-1">
                        <h4 className="text-sm font-bold text-slate-850 dark:text-white group-hover:text-brand-500 transition-colors flex items-center gap-2">
                          {job.title}
                        </h4>
                        <p className="text-[10px] text-slate-550 dark:text-slate-400 font-medium">
                          <span className="font-bold text-slate-700 dark:text-slate-350">{job.company}</span> • <span className="flex-shrink-0">{job.location}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Posted {job.postedTime}</p>
                      </div>
                    </div>

                    {/* Middle details/tags and right CTA panel */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8 flex-wrap">
                      <div className="flex flex-wrap gap-1.5 max-w-[220px]">
                        {job.skills.map(skill => (
                          <span
                            key={skill}
                            className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-navy-950 text-slate-500 dark:text-slate-400 border border-slate-200/20 dark:border-navy-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-6 justify-between w-full md:w-auto">
                        <div className="flex flex-col items-end md:items-end">
                          <span className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-0.5">
                            <DollarSign className="w-3.5 h-3.5 text-slate-450" />
                            {job.salary.replace(/ - .*/, '')}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold mt-0.5">{job.experience}</span>
                        </div>

                        {/* Match & CTAs */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/15">
                            <Star className="w-3 h-3 fill-current" />
                            {job.aiMatch}% Match
                          </div>

                          <button
                            onClick={(e) => handleBookmark(e, job.id)}
                            className={`p-2.5 rounded-xl border transition-colors ${
                              saved
                                ? 'bg-amber-500/10 text-amber-500 border-amber-500/30'
                                : 'border-slate-250 dark:border-navy-800 hover:bg-slate-100 dark:hover:bg-navy-850 text-slate-400'
                            }`}
                          >
                            {saved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={(e) => handleApply(e, job.id, job.title)}
                            className={`px-4 py-2.5 rounded-xl text-[10px] font-bold shadow-md transition-all ${
                              applied
                                ? 'bg-slate-100 dark:bg-navy-850 text-slate-400 dark:text-slate-550 border border-slate-200 dark:border-navy-800 shadow-none cursor-default'
                                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/10'
                            }`}
                            disabled={applied}
                          >
                            {applied ? 'Applied' : 'Apply Now'}
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="border border-slate-200/50 dark:border-navy-850 bg-white/40 dark:bg-navy-900/20 rounded-3xl p-12 text-center flex flex-col items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-navy-800 flex items-center justify-center text-slate-400">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">No matches found</h4>
                <p className="text-xs text-slate-450 dark:text-slate-400 max-w-[280px] mx-auto mt-0.5">We couldn't find any job matches. Try adjusting your sidebar filters or changing the search keywords.</p>
              </div>
              <button
                onClick={() => { setSearch(''); setSelectedDept('All'); setSelectedWorkplace('All'); setSelectedExp('All'); }}
                className="px-5 py-2.5 rounded-xl border border-slate-250 dark:border-navy-800 bg-white dark:bg-navy-900 text-xs font-bold text-slate-700 dark:text-slate-200"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
