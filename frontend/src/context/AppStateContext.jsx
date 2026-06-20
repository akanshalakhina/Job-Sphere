import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppStateContext = createContext();

const normalizeUser = (user) => user
  ? { ...user, resumeUploaded: Boolean(user.resumeUploaded || user.resumeDetails) }
  : user;

export const AppStateProvider = ({ children }) => {
  // Authentication & Session States
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);
  const [userRole, setUserRole] = useState(() => localStorage.getItem('userRole') || 'candidate');
  const [currentUser, setCurrentUser] = useState(null);

  // DB States — all start empty, populated from backend
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [verifiedCompanies, setVerifiedCompanies] = useState([]);
  const [userStats, setUserStats] = useState({
    applied: 0,
    saved: 0,
    atsScore: 0,
    interviews: 0,
    profileViews: 0,
    postImpressions: 0,
  });
  const [trendingTags, setTrendingTags] = useState([]);

  // Floating AI Chatbot state
  const [chatbotMessages, setChatbotMessages] = useState([
    { id: 'msg-1', sender: 'ai', text: 'Hi! I am SphereAI, your recruiting assistant. How can I help you find your dream opportunity today?' }
  ]);

  // Subscription State
  const [subscriptionTier, setSubscriptionTier] = useState('free');

  // Resume Builder Data
  const [resumeBuilderData, setResumeBuilderData] = useState({
    personal: { name: '', email: '', phone: '', linkedin: '', github: '', portfolio: '' },
    education: { degree: '', college: '', cgpa: '', gradYear: '' },
    skills: { technical: [], soft: [], tools: [], frameworks: [] },
    experience: [],
    certifications: [],
    achievements: []
  });

  const apiFetch = useCallback(async (url, options = {}) => {
    const headers = { ...options.headers };
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (!(options.body instanceof FormData) && !headers['Content-Type'] && options.body) {
      headers['Content-Type'] = 'application/json';
    }
    return fetch(url, { ...options, headers });
  }, []);

  const parseApiResponse = async (res) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return { success: false, error: data.error || data.message || `Request failed (${res.status})`, ...data };
    }
    return { success: true, ...data };
  };

  // Fetch all backend data
  const fetchBackendData = useCallback(async () => {
    try {
      // Jobs
      const jobsRes = await apiFetch('/api/jobs');
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs((jobsData || []).map(j => ({ ...j, id: j._id })));
      }

      // Feed posts
      const postsRes = await apiFetch('/api/posts');
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setFeedPosts((postsData || []).map(p => ({ ...p, id: p._id })));
      }

      const tagsRes = await apiFetch('/api/posts/trending-tags');
      if (tagsRes.ok) {
        const tagsData = await tagsRes.json();
        setTrendingTags(tagsData || []);
      }

      // Opportunities
      const oppsRes = await apiFetch('/api/opportunities');
      if (oppsRes.ok) {
        const oppsData = await oppsRes.json();
        setOpportunities((oppsData || []).map(o => ({ ...o, id: o._id })));
      }

      // Interviews (requires auth)
      if (isSignedIn) {
        const intRes = await apiFetch('/api/interviews');
        if (intRes.ok) {
          const intData = await intRes.json();
          setInterviews((intData || []).map(i => ({ ...i, id: i._id })));
        }

        // Candidates (for recruiter/admin) — normalize Application fields to UI shape
        const candsRes = await apiFetch('/api/applications/candidates');
        if (candsRes.ok) {
          const candsData = await candsRes.json();
          const stageMap = { 'Interview': 'Interviewing', 'Offer': 'Offered' };
          setCandidates((candsData || []).map(c => ({
            ...c,
            id: c._id,
            name: c.candidateName || c.name || 'Unknown',
            title: c.experience ? `${c.experience} Experience` : 'Candidate',
            avatar: c.candidateAvatar || c.avatar || '',
            email: c.candidateEmail || c.email || '',
            appliedFor: c.jobTitle || c.appliedFor || '',
            atsScore: c.atsScore || 0,
            skills: c.skills || [],
            stage: stageMap[c.stage] || c.stage || 'Applied',
            resumeUrl: c.resumeUrl || '',
          })));
        }

        // Pending jobs (for admin)
        const pendingRes = await apiFetch('/api/admin/pending-jobs');
        if (pendingRes.ok) {
          const pendingData = await pendingRes.json();
          setPendingJobs((pendingData || []).map(j => ({ ...j, id: j._id })));
        }

        // Applied jobs for candidate
        const myAppsRes = await apiFetch('/api/applications/my');
        if (myAppsRes.ok) {
          const myApps = await myAppsRes.json();
          setAppliedJobIds((myApps || []).map(a => a.job?._id || a.job));
        }

        // Saved job IDs from user profile
        const userRes = await apiFetch('/api/users/me');
        if (userRes.ok) {
          const userData = await userRes.json();
          setCurrentUser(normalizeUser(userData));
          setSavedJobIds(userData.savedJobs || []);
        }

        const statsRes = await apiFetch('/api/users/stats');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setUserStats({
            applied: statsData.applied || 0,
            saved: statsData.saved || 0,
            atsScore: statsData.atsScore || 0,
            interviews: statsData.interviews || 0,
            profileViews: statsData.profileViews || 0,
            postImpressions: statsData.postImpressions || 0,
          });
        }
      }
    } catch (err) {
      console.warn('Failed to fetch backend data:', err);
    }
  }, [apiFetch, isSignedIn]);

  // Mount backend fetch and re-fetch when sign-in changes
  useEffect(() => {
    if (isSignedIn) {
      fetchBackendData();
    }
  }, [isSignedIn, fetchBackendData]);

  // Check / Restore session on page load
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsSignedIn(false);
        setAuthLoaded(true);
        return;
      }
      try {
        const res = await fetch('/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(normalizeUser(user));
          setUserRole(user.role);
          setIsSignedIn(true);
        } else {
          // Token expired or invalid
          localStorage.removeItem('token');
          setIsSignedIn(false);
        }
      } catch (err) {
        console.warn('Failed to verify session:', err);
      } finally {
        setAuthLoaded(true);
      }
    };
    checkSession();
  }, []);

  // Custom Authentication Actions
  const login = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        setCurrentUser(normalizeUser(data.user));
        setUserRole(data.user.role);
        setIsSignedIn(true);
        return { success: true };
      } else {
        const errorData = await res.json();
        return { success: false, error: errorData.error || 'Login failed' };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const signup = async (payload) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        setCurrentUser(normalizeUser(data.user));
        setUserRole(data.user.role);
        setIsSignedIn(true);
        return { success: true };
      } else {
        const errorData = await res.json();
        return { success: false, error: errorData.error || 'Signup failed' };
      }
    } catch (err) {
      return { success: false, error: 'Network error occurred' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    setCurrentUser(null);
    setIsSignedIn(false);
    // Clear all DB states
    setJobs([]);
    setAppliedJobIds([]);
    setSavedJobIds([]);
    setCandidates([]);
    setInterviews([]);
    setPendingJobs([]);
    setFeedPosts([]);
    setOpportunities([]);
    setVerifiedCompanies([]);
    setTrendingTags([]);
    setUserStats({
      applied: 0,
      saved: 0,
      atsScore: 0,
      interviews: 0,
      profileViews: 0,
      postImpressions: 0,
    });
  };

  // Persist User Role changes in settings
  useEffect(() => {
    localStorage.setItem('userRole', userRole);
  }, [userRole]);

  // ── Job Actions ──────────────────────────────────────────────────
  const applyToJob = async (jobId) => {
    if (appliedJobIds.includes(jobId)) return false;
    try {
      const res = await apiFetch('/api/applications', {
        method: 'POST',
        body: JSON.stringify({ jobId })
      });
      if (res.ok) {
        setAppliedJobIds(prev => [...prev, jobId]);
        fetchBackendData();
        return true;
      }
    } catch (err) {
      console.error('Failed to apply to job:', err);
    }
    return false;
  };

  const toggleSaveJob = async (jobId) => {
    try {
      const res = await apiFetch(`/api/jobs/${jobId}/save`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSavedJobIds(data.savedJobs || []);
        return;
      }
    } catch (err) {
      console.error('Failed to save job:', err);
    }
    setSavedJobIds(prev =>
      prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId]
    );
  };

  // ── Recruiter Pipeline ───────────────────────────────────────────
  const updateCandidateStage = async (candidateId, newStage) => {
    // Map display stages → DB enum values
    const stageToDb = { 'Interviewing': 'Interview', 'Offered': 'Offer' };
    const dbStage = stageToDb[newStage] || newStage;
    try {
      const res = await apiFetch(`/api/applications/${candidateId}/stage`, {
        method: 'PATCH',
        body: JSON.stringify({ stage: dbStage })
      });
      if (res.ok) { fetchBackendData(); return; }
    } catch (err) {
      console.error('Failed to update candidate stage:', err);
    }
    // Optimistic update with display name
    setCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: newStage } : c));
  };

  const scheduleInterview = async (candidateOrPayload, role, date, time) => {
    const payload = typeof candidateOrPayload === 'object'
      ? candidateOrPayload
      : { candidateName: candidateOrPayload, jobTitle: role, date, time };

    try {
      const res = await apiFetch('/api/interviews', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const interview = await res.json();
        setInterviews(prev => [{ ...interview, id: interview._id }, ...prev]);
        fetchBackendData();
        return { success: true, interview };
      }
      return await parseApiResponse(res);
    } catch (err) {
      console.error('Failed to schedule interview:', err);
    }
    return { success: false, error: 'Unable to schedule interview right now.' };
  };

  // ── Feed / Posts ─────────────────────────────────────────────────
  const addPost = async (content) => {
    try {
      const res = await apiFetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        const newPost = await res.json();
        setFeedPosts(prev => [{ ...newPost, id: newPost._id }, ...prev]);
        return true;
      }
    } catch (err) {
      console.error('Failed to create post:', err);
    }
    return false;
  };

  const likePost = async (postId) => {
    try {
      const res = await apiFetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setFeedPosts(prev => prev.map(p =>
          p.id === postId ? { ...p, likesCount: data.likesCount, userHasLiked: data.liked } : p
        ));
        return;
      }
    } catch (err) {
      console.error('Failed to like post:', err);
    }
    // Optimistic fallback
    setFeedPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likesCount: (p.likesCount || 0) + (p.userHasLiked ? -1 : 1), userHasLiked: !p.userHasLiked } : p
    ));
  };

  const addCommentToPost = async (postId, content) => {
    try {
      const res = await apiFetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setFeedPosts(prev => prev.map(p =>
          p.id === postId ? { ...updatedPost, id: updatedPost._id } : p
        ));
        return;
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  // ── Opportunities ─────────────────────────────────────────────────
  const registerForOpportunity = async (oppId, title) => {
    try {
      const res = await apiFetch(`/api/opportunities/${oppId}/register`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setOpportunities(prev => prev.map(o =>
          o.id === oppId ? { ...o, registered: data.registered } : o
        ));
        return true;
      }
    } catch (err) {
      console.error('Failed to register for opportunity:', err);
    }
    return false;
  };

  // ── Chatbot ──────────────────────────────────────────────────────
  const sendChatbotMessage = async (text) => {
    const userMsg = { id: `chat-user-${Date.now()}`, sender: 'user', text };
    setChatbotMessages(prev => [...prev, userMsg]);

    try {
      // Pass the last 10 messages as history so the AI has context
      const history = chatbotMessages.slice(-10).map(m => ({ sender: m.sender, text: m.text }));
      const res = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, history })
      });
      if (res.ok) {
        const data = await res.json();
        const reply = data.reply || data.response || data.message;
        if (reply && reply.trim()) {
          setChatbotMessages(prev => [...prev, { id: `chat-ai-${Date.now()}`, sender: 'ai', text: reply }]);
          return;
        }
      }
    } catch (err) {
      console.error('Chatbot API failed:', err);
    }

    // Smart keyword-based fallback
    const q = text.toLowerCase();
    let aiText;
    if (q.includes('hello') || q.includes('hi') || q.includes('hey')) {
      aiText = `Hi ${currentUser?.name || 'there'}! I'm SphereAI. Ask me about jobs, resume tips, interview prep, or career guidance.`;
    } else if (q.includes('react') || q.includes('javascript') || q.includes('js')) {
      aiText = 'React is a JavaScript library for building user interfaces. It uses a component-based architecture and a virtual DOM for efficient rendering. Key concepts include JSX, hooks (useState, useEffect), props, and state management.';
    } else if (q.includes('python')) {
      aiText = 'Python is a versatile, high-level programming language known for readability. It\'s widely used in data science, AI/ML, web development (Django/Flask), and automation.';
    } else if (q.includes('typescript') || q.includes('ts')) {
      aiText = 'TypeScript is a statically typed superset of JavaScript. It adds type annotations, interfaces, and generics — helping catch errors at compile time and improving code maintainability.';
    } else if (q.includes('resume') || q.includes('cv')) {
      aiText = 'A strong resume should: 1) Lead with a concise summary, 2) Quantify achievements (e.g. "improved load time by 40%"), 3) Tailor skills to the job description, 4) Keep it to 1 page for early career. Use the Resume Builder tab to create yours!';
    } else if (q.includes('interview')) {
      aiText = 'For technical interviews: 1) Clarify requirements before coding, 2) Think out loud, 3) Discuss time/space complexity. For behavioral: use the STAR method (Situation, Task, Action, Result). Practice on LeetCode and mock interviews.';
    } else if (q.includes('job') || q.includes('hiring') || q.includes('apply')) {
      aiText = 'Browse available roles in the Jobs page. You can filter by skills, location, and experience level. Apply directly and track your application status in the dashboard.';
    } else if (q.includes('system design')) {
      aiText = 'System design interviews test your ability to architect scalable systems. Framework: 1) Clarify requirements, 2) Estimate scale, 3) High-level design, 4) Deep dive into components, 5) Identify bottlenecks.';
    } else if (q.includes('salary') || q.includes('negotiate') || q.includes('offer')) {
      aiText = 'Salary negotiation tips: 1) Research market rates on Glassdoor/Levels.fyi, 2) Give a range, not a single number, 3) Don\'t accept on the spot — ask for time to consider, 4) Negotiate the full package (equity, benefits, PTO).';
    } else {
      aiText = `You asked: "${text}" — I can help with resume tips, interview prep, job searching, technical concepts (React, Python, TS), system design, and salary negotiation. Try asking something more specific!`;
    }
    setChatbotMessages(prev => [...prev, { id: `chat-ai-${Date.now()}`, sender: 'ai', text: aiText }]);
  };

  // ── Resume ───────────────────────────────────────────────────────
  const uploadAndAnalyzeResume = async (fileOrName, score = 88) => {
    if (fileOrName && typeof fileOrName === 'object' && fileOrName instanceof File) {
      try {
        const formData = new FormData();
        formData.append('resume', fileOrName);
        const res = await apiFetch('/api/resume/analyze', { method: 'POST', body: formData });
        if (res.ok) {
          const analysis = await res.json();
          setCurrentUser(prev => ({
            ...prev,
            resumeUploaded: true,
            resumeDetails: {
              fileName: fileOrName.name,
              atsScore: analysis.atsScore,
              skills: analysis.skills,
              missingKeywords: analysis.missingKeywords,
              improvements: analysis.improvements,
              summary: analysis.summary,
              analyzedWith: analysis.analyzedWith,
              warning: analysis.warning,
            }
          }));
          return { success: true, analysis };
        }
        return await parseApiResponse(res);
      } catch (err) {
        console.error('Failed to analyze resume:', err);
        return { success: false, error: 'Failed to analyze resume' };
      }
    }

    const fileName = typeof fileOrName === 'string' ? fileOrName : (fileOrName?.name || null);
    if (!fileName) {
      setCurrentUser(prev => ({ ...prev, resumeUploaded: false, resumeDetails: null }));
      return { success: true };
    }
    setCurrentUser(prev => ({
      ...prev,
      resumeUploaded: true,
      resumeDetails: { fileName, atsScore: score, skills: [], missingKeywords: [], improvements: [] }
    }));
    return { success: true };
  };

  const submitContactMessage = async (payload) => {
    try {
      const res = await apiFetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return await parseApiResponse(res);
    } catch (err) {
      console.error('Failed to submit contact message:', err);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const subscribeNewsletter = async (email) => {
    try {
      const res = await apiFetch('/api/newsletter/subscribe', {
        method: 'POST',
        body: JSON.stringify({ email, source: 'footer' }),
      });
      return await parseApiResponse(res);
    } catch (err) {
      console.error('Failed to subscribe newsletter:', err);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const upgradeSubscription = (tier) => setSubscriptionTier(tier);

  // ── Admin Actions ────────────────────────────────────────────────
  const addPendingJob = async (job) => {
    try {
      const res = await apiFetch('/api/jobs', {
        method: 'POST',
        body: JSON.stringify({
          title: job.title, company: job.company, salary: job.salary,
          skills: job.skills, location: job.location, workplace: job.workplace,
          department: job.department, experience: job.experience,
          description: job.description, responsibilities: job.responsibilities || []
        })
      });
      if (res.ok) {
        const createdJob = await res.json();
        fetchBackendData();
        return { success: true, job: { ...createdJob, id: createdJob._id } };
      }
      return await parseApiResponse(res);
    } catch (err) {
      console.error('Failed to post job:', err);
    }
    return { success: false, error: 'Unable to submit job right now.' };
  };

  const approveJob = async (jobId) => {
    try {
      const jobInPending = pendingJobs.find(j => j.id === jobId);
      const dbId = (jobInPending?._id) || jobId;
      const res = await apiFetch(`/api/admin/jobs/${dbId}/approve`, { method: 'POST' });
      if (res.ok) {
        fetchBackendData();
        setPendingJobs(prev => prev.filter(j => j.id !== jobId));
        return;
      }
    } catch (err) {
      console.error('Failed to approve job:', err);
    }
    setPendingJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const rejectJob = async (jobId) => {
    try {
      const jobInPending = pendingJobs.find(j => j.id === jobId);
      const dbId = (jobInPending?._id) || jobId;
      const res = await apiFetch(`/api/admin/jobs/${dbId}/reject`, { method: 'POST' });
      if (res.ok) {
        setPendingJobs(prev => prev.filter(j => j.id !== jobId));
        return;
      }
    } catch (err) {
      console.error('Failed to reject job:', err);
    }
    setPendingJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const toggleCompanyVerification = async (companyName) => {
    const isVerified = verifiedCompanies.includes(companyName);
    try {
      const res = await apiFetch('/api/admin/companies/verify', {
        method: 'PATCH',
        body: JSON.stringify({ company: companyName, verified: !isVerified })
      });
      if (res.ok) {
        setVerifiedCompanies(prev =>
          prev.includes(companyName) ? prev.filter(c => c !== companyName) : [...prev, companyName]
        );
        return;
      }
    } catch (err) {
      console.error('Failed to toggle company verification:', err);
    }
    setVerifiedCompanies(prev =>
      prev.includes(companyName) ? prev.filter(c => c !== companyName) : [...prev, companyName]
    );
  };

  const saveResumeBuilderData = (data) => {
    setResumeBuilderData(data);
    const allSkills = [...(data.skills?.technical || []), ...(data.skills?.frameworks || [])];
    const score = Math.min(65 + allSkills.length * 4, 98);
    uploadAndAnalyzeResume(`${data.personal?.name?.toLowerCase().replace(' ', '_') || 'user'}_resume.pdf`, score);
  };

  // ── AI Ranking Engine ──────────────────────────────────────────────────
  const generateRanking = async (jobId) => {
    try {
      const res = await apiFetch(`/api/jobs/${jobId}/generate-ranking`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        return { success: true, ...data };
      }
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to generate rankings' };
    } catch (err) {
      console.error('Failed to generate ranking:', err);
      return { success: false, error: 'Network error occurred' };
    }
  };

  const fetchRankedCandidates = async (jobId, filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.sort) params.set('sort', filters.sort);
      if (filters.recommendation) params.set('recommendation', filters.recommendation);
      if (filters.minScore) params.set('minScore', String(filters.minScore));
      if (filters.skill) params.set('skill', filters.skill);
      if (filters.limit) params.set('limit', String(filters.limit));
      if (filters.page) params.set('page', String(filters.page));

      const qs = params.toString();
      const url = `/api/jobs/${jobId}/ranked-candidates${qs ? `?${qs}` : ''}`;
      const res = await apiFetch(url);
      if (res.ok) {
        return await res.json();
      }
      return { rankings: [], total: 0 };
    } catch (err) {
      console.error('Failed to fetch ranked candidates:', err);
      return { rankings: [], total: 0 };
    }
  };

  const handleShortlistDecision = async (jobId, rankingId, accepted) => {
    try {
      const res = await apiFetch(`/api/jobs/${jobId}/rankings/${rankingId}/shortlist`, {
        method: 'PATCH',
        body: JSON.stringify({ accepted }),
      });
      if (res.ok) {
        const data = await res.json();
        if (accepted) {
          fetchBackendData(); // Refresh pipeline after stage change
        }
        return { success: true, ...data };
      }
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || 'Failed to update shortlist' };
    } catch (err) {
      console.error('Failed to update shortlist:', err);
      return { success: false, error: 'Network error occurred' };
    }
  };

  return (
    <AppStateContext.Provider value={{
      userRole, setUserRole,
      currentUser, setCurrentUser,
      isSignedIn, setIsSignedIn,
      authLoaded, setAuthLoaded,
      login, signup, logout,
      apiFetch,
      jobs, setJobs,
      appliedJobIds,
      savedJobIds,
      candidates, setCandidates,
      interviews,
      chatbotMessages,
      feedPosts,
      userStats,
      trendingTags,
      opportunities,
      applyToJob,
      toggleSaveJob,
      updateCandidateStage,
      scheduleInterview,
      sendChatbotMessage,
      addPost,
      likePost,
      addCommentToPost,
      submitContactMessage,
      subscribeNewsletter,
      registerForOpportunity,
      uploadAndAnalyzeResume,
      subscriptionTier,
      upgradeSubscription,
      pendingJobs, setPendingJobs,
      addPendingJob,
      approveJob,
      rejectJob,
      verifiedCompanies,
      toggleCompanyVerification,
      resumeBuilderData,
      saveResumeBuilderData,
      fetchBackendData,
      // AI Ranking Engine
      generateRanking,
      fetchRankedCandidates,
      handleShortlistDecision,
    }}>
      {children}
    </AppStateContext.Provider>
  );
};

export const useAppState = () => useContext(AppStateContext);

