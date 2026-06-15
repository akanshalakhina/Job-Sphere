import { SEED_JOBS } from "./seedJobsData";
import { defaultInterviewRounds, syncInterviewToCalendar } from "./calendarSync";

let memoryUsers: any[] = [];
let memoryJobs: any[] = [];
let memoryApplications: any[] = [];
let memoryInterviews: any[] = [];

// Initialize memoryJobs with 24-character hex ObjectIDs
const ID_PREFIX = "60d5ec49e29a9a3b68c3ef";
export function initMemoryDb() {
  if (memoryJobs.length === 0) {
    memoryJobs = SEED_JOBS.map((job, idx) => {
      const hexId = (idx + 11).toString(16);
      return {
        ...job,
        _id: `${ID_PREFIX}${hexId}`,
        postedTime: job.postedTime || "2 days ago",
        applicants: job.applicants || 0,
        createdAt: new Date(Date.now() - idx * 86400000).toISOString(),
      };
    });
  }
}

// Ensure database is initialized
initMemoryDb();

// Users
export function getMemUser(userId: string) {
  return memoryUsers.find(u => u.clerkId === userId) || null;
}

export function getMemUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return memoryUsers.find(u => String(u.email || "").toLowerCase() === normalizedEmail) || null;
}

export function createMemAuthUser(body: any) {
  const id = `usr_${Math.random().toString(36).substr(2, 9)}`;
  const allowedRoles = ["candidate", "recruiter", "admin"];
  const safeRole = allowedRoles.includes(body.role) ? body.role : "candidate";

  const parseList = (value: unknown) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
    return [];
  };

  const user = {
    _id: id,
    clerkId: id,
    email: body.email,
    password: body.password,
    role: safeRole,
    name: body.name || "Anonymous User",
    onboarded: true,
    savedJobs: [],
    skills: parseList(body.skills),
    softSkills: parseList(body.softSkills),
    experience: body.experience || "",
    resumeUrl: body.resume || body.resumeUrl || "",
    graduationYear: body.graduationYear || "",
    college: body.college || "",
    degree: body.degree || "",
    avatar: body.avatar || "",
    companyName: body.companyName || "",
    company: body.companyName || body.company || "",
    industry: body.industry || "",
    companySize: body.companySize || "",
    logo: body.logo || "",
    website: body.website || "",
    description: body.description || "",
    bio: body.description || body.bio || "",
    atsScore: 75,
    profileViews: 0,
    postImpressions: 0,
    viewedTags: [],
    createdAt: new Date().toISOString(),
  };

  memoryUsers.push(user);
  return user;
}

export function syncMemUser(userId: string, body: any) {
  let user = memoryUsers.find(u => u.clerkId === userId);
  if (!user) {
    const allowedRoles = ["candidate", "recruiter", "admin"];
    const safeRole = allowedRoles.includes(body.role) ? body.role : "candidate";
    user = {
      _id: `usr_${Math.random().toString(36).substr(2, 9)}`,
      clerkId: userId,
      role: safeRole,
      savedJobs: [],
      skills: [],
      experience: "",
      onboarded: false,
      atsScore: 75,
      profileViews: 0,
      postImpressions: 0,
      viewedTags: [],
      createdAt: new Date().toISOString(),
    };
    memoryUsers.push(user);
  }
  if (body.name) user.name = body.name;
  if (body.email) user.email = body.email;
  if (body.avatar) user.avatar = body.avatar;
  return user;
}

export function updateMemUser(userId: string, body: any) {
  const user = memoryUsers.find(u => u.clerkId === userId);
  if (!user) return null;

  const allowed = [
    "name", "title", "bio", "skills", "experience",
    "company", "avatar", "subscriptionTier",
    "graduationYear", "college", "degree", "companyName",
    "industry", "companySize", "logo", "website",
    "description", "onboarded", "resume", "resumeUrl"
  ];

  for (const key of allowed) {
    if (body[key] !== undefined) {
      user[key] = body[key];
    }
  }

  // Special field mappings
  if (body.skills !== undefined) {
    if (typeof body.skills === "string") {
      user.skills = body.skills.split(",").map((s: string) => s.trim()).filter(Boolean);
    } else if (Array.isArray(body.skills)) {
      user.skills = body.skills;
    }
  }

  if (body.resume !== undefined) {
    user.resumeUrl = body.resume;
  }

  if (body.companyName !== undefined) {
    user.companyName = body.companyName;
    user.company = body.companyName;
  }

  if (body.description !== undefined) {
    user.description = body.description;
    user.bio = body.description;
  }

  return user;
}

export function getMemUserStats(userId: string) {
  const user = getMemUser(userId);
  const appliedCount = memoryApplications.filter(a => a.candidateClerkId === userId).length;
  const interviewCount = memoryApplications.filter(a => a.candidateClerkId === userId && a.stage === "Interview").length;
  return {
    applied: appliedCount,
    saved: user?.savedJobs?.length ?? 0,
    atsScore: user?.atsScore ?? 0,
    interviews: interviewCount,
    profileViews: user?.profileViews ?? 0,
    postImpressions: user?.postImpressions ?? 0,
  };
}

export function clearMemUser(userId: string) {
  memoryUsers = memoryUsers.filter(u => u.clerkId !== userId);
}

// Jobs
export function getMemJobs(query: any) {
  const { search, department, workplace, experience, location } = query;
  let filtered = memoryJobs.filter(j => j.status === "approved" || j.status === undefined);

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(j => 
      j.title.toLowerCase().includes(q) || 
      j.company.toLowerCase().includes(q) || 
      (j.skills && j.skills.some((s: string) => s.toLowerCase().includes(q)))
    );
  }

  if (department && department !== "All Departments") {
    filtered = filtered.filter(j => j.department === department);
  }

  if (workplace && workplace !== "All Types") {
    filtered = filtered.filter(j => j.workplace === workplace);
  }

  if (experience && experience !== "Any Experience") {
    filtered = filtered.filter(j => j.experience === experience);
  }

  if (location && location !== "Any Location") {
    const loc = String(location).toLowerCase();
    filtered = filtered.filter(j => j.location.toLowerCase().includes(loc));
  }

  return filtered;
}

export function getMemJobById(id: string) {
  return memoryJobs.find(j => j._id === id) || null;
}

export function createMemJob(jobData: any, userId: string, recruiterUser: any) {
  const id = `${ID_PREFIX}${Math.random().toString(16).substr(2, 2)}`;
  const newJob = {
    ...jobData,
    _id: id,
    status: "pending",
    postedBy: recruiterUser?._id || "system",
    recruiter: {
      name: recruiterUser?.name || jobData.recruiterName || "",
      role: recruiterUser?.title || jobData.recruiterRole || "",
      avatar: recruiterUser?.avatar || "",
      clerkId: userId,
    },
    postedTime: "Just now",
    applicants: 0,
    createdAt: new Date().toISOString(),
  };
  memoryJobs.push(newJob);
  return newJob;
}

export function getMemPendingJobs() {
  return memoryJobs
    .filter(j => j.status === "pending")
    .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
}

export function setMemJobStatus(id: string, status: "approved" | "rejected") {
  const job = memoryJobs.find(j => j._id === id);
  if (!job) return null;
  job.status = status;
  return job;
}

export function getMemAdminStats() {
  return {
    totalUsers: memoryUsers.length,
    totalJobs: memoryJobs.filter(j => j.status === "approved" || j.status === undefined).length,
    totalApplications: memoryApplications.length,
    totalPosts: 0,
    pendingJobs: memoryJobs.filter(j => j.status === "pending").length,
  };
}

export function getMemCompanies() {
  const companies = memoryUsers
    .filter(u => u.role === "recruiter")
    .map(u => u.companyName || u.company)
    .filter(Boolean);

  return Array.from(new Set(companies)).map(name => ({ name, verified: false }));
}

export function updateMemJob(id: string, userId: string, body: any, isAdmin: boolean) {
  const job = memoryJobs.find(j => j._id === id);
  if (!job) return null;

  const isOwner = job.recruiter?.clerkId === userId;
  if (!isOwner && !isAdmin) return null;

  const ownerAllowed = [
    "title", "description", "location", "salary", "skills",
    "department", "workplace", "experience", "benefits", "requirements",
  ];
  const allowedFields = isAdmin ? [...ownerAllowed, "status"] : ownerAllowed;

  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      job[key] = body[key];
    }
  }

  return job;
}

export function deleteMemJob(id: string, userId: string, isAdmin: boolean) {
  const jobIndex = memoryJobs.findIndex(j => j._id === id);
  if (jobIndex === -1) return false;

  const job = memoryJobs[jobIndex];
  const isOwner = job.recruiter?.clerkId === userId;
  if (!isOwner && !isAdmin) return false;

  memoryJobs.splice(jobIndex, 1);
  return true;
}

export function toggleSaveJob(userId: string, jobId: string) {
  const user = getMemUser(userId);
  if (!user) return null;

  if (!user.savedJobs) user.savedJobs = [];
  const isSaved = user.savedJobs.includes(jobId);
  if (isSaved) {
    user.savedJobs = user.savedJobs.filter((id: string) => id !== jobId);
  } else {
    user.savedJobs.push(jobId);
  }
  return { saved: !isSaved, savedJobs: user.savedJobs };
}

export function getSavedJobStatus(userId: string, jobId: string) {
  const user = getMemUser(userId);
  if (!user || !user.savedJobs) return { saved: false };
  return { saved: user.savedJobs.includes(jobId) };
}

// Applications
export function createMemApplication(userId: string, body: any) {
  const { jobId, coverLetter } = body;
  const user = getMemUser(userId);
  const job = getMemJobById(jobId);

  if (!user || !job) return { error: "User or job not found", status: 404 };
  if (user.role !== "candidate") return { error: "Only candidates can apply to jobs", status: 403 };

  const existing = memoryApplications.find(a => a.job === jobId && a.candidateClerkId === userId);
  if (existing) return { error: "Already applied to this job", status: 409 };

  let calculatedAtsScore = 0;
  const applicantSkills = user.skills || [];
  const jobSkills = job.skills || [];
  
  if (jobSkills.length > 0) {
    const applicantSkillsUpper = applicantSkills.map((s: string) => s.toUpperCase());
    const matchedSkills = jobSkills.filter((skill: string) => 
      applicantSkillsUpper.includes(skill.toUpperCase())
    );
    calculatedAtsScore = Math.min(100, Math.round((matchedSkills.length / jobSkills.length) * 100));
  } else {
    calculatedAtsScore = user.atsScore || 60;
  }

  const application = {
    _id: `app_${Math.random().toString(36).substr(2, 9)}`,
    job: jobId,
    jobTitle: job.title,
    company: job.company,
    candidate: user._id,
    candidateClerkId: userId,
    candidateName: user.name,
    candidateEmail: user.email,
    candidateAvatar: user.avatar,
    resumeUrl: user.resumeUrl || "",
    atsScore: calculatedAtsScore,
    skills: applicantSkills,
    experience: user.experience || "",
    coverLetter: coverLetter || "",
    stage: "Applied",
    createdAt: new Date().toISOString(),
  };

  memoryApplications.push(application);
  job.applicants = (job.applicants || 0) + 1;

  return { data: application, status: 201 };
}

export function getMemApplicationsMy(userId: string) {
  return memoryApplications
    .filter(a => a.candidateClerkId === userId)
    .map(a => ({
      ...a,
      job: getMemJobById(a.job)
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function checkMemApplication(userId: string, jobId: string) {
  const existing = memoryApplications.find(a => a.job === jobId && a.candidateClerkId === userId);
  return { applied: !!existing, application: existing || null };
}

export function getMemApplicationsByJob(userId: string, jobId: string, isAdmin: boolean) {
  const job = getMemJobById(jobId);
  if (!job) return { error: "Job not found", status: 404 };

  const isOwner = job.recruiter?.clerkId === userId;
  if (!isOwner && !isAdmin) return { error: "Forbidden: recruiter only", status: 403 };

  return {
    data: memoryApplications
      .filter(a => a.job === jobId)
      .sort((a, b) => b.atsScore - a.atsScore || b.createdAt.localeCompare(a.createdAt))
  };
}

export function getMemApplicationsCandidates(userId: string, isAdmin: boolean) {
  const user = getMemUser(userId);
  if (!user || (user.role !== "recruiter" && user.role !== "admin")) {
    return { error: "Forbidden: recruiters only", status: 403 };
  }

  const recruiterJobs = memoryJobs.filter(j => j.recruiter?.clerkId === userId);
  const jobIds = recruiterJobs.map(j => j._id);

  return {
    data: memoryApplications
      .filter(a => jobIds.includes(a.job))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  };
}

export function updateMemApplicationStage(id: string, userId: string, stage: string, isAdmin: boolean) {
  const application = memoryApplications.find(a => a._id === id);
  if (!application) return { error: "Application not found", status: 404 };

  const job = getMemJobById(application.job);
  const isOwner = job?.recruiter?.clerkId === userId;
  if (!isOwner && !isAdmin) return { error: "Forbidden", status: 403 };

  application.stage = stage;
  return { data: application };
}

// Interviews
export function getMemInterviews(userId: string) {
  return memoryInterviews
    .filter(i => i.recruiterClerkId === userId || i.candidateClerkId === userId)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

export async function createMemInterview(userId: string, body: any) {
  const user = getMemUser(userId);
  if (!user || (user.role !== "recruiter" && user.role !== "admin")) {
    return { error: "Only recruiters can schedule interviews", status: 403 };
  }

  const { candidateName, candidateAvatar, candidateClerkId, jobTitle, company, date, time, type, notes } = body;
  if (!candidateName || !jobTitle || !date || !time) {
    return { error: "Missing required fields", status: 400 };
  }

  const calendar = await syncInterviewToCalendar({
    candidateName,
    jobTitle,
    company,
    date,
    time,
    type,
    notes,
  });

  const interview = {
    _id: `int_${Math.random().toString(36).substr(2, 9)}`,
    candidateName,
    candidateAvatar: candidateAvatar || "",
    candidateClerkId: candidateClerkId || "",
    jobTitle,
    company: company || "",
    recruiterClerkId: userId,
    date,
    time,
    type: type || "Technical",
    notes: notes || "",
    status: "scheduled",
    rounds: body.rounds || defaultInterviewRounds(type || "Technical"),
    calendar,
    createdAt: new Date().toISOString(),
  };

  memoryInterviews.push(interview);
  return { data: interview, status: 201 };
}

export function updateMemInterview(id: string, userId: string, body: any, isAdmin: boolean) {
  const interview = memoryInterviews.find(i => i._id === id);
  if (!interview) return { error: "Interview not found", status: 404 };

  const isOwner = interview.recruiterClerkId === userId;
  if (!isOwner && !isAdmin) return { error: "Forbidden", status: 403 };

  Object.assign(interview, body);
  return { data: interview };
}

export function updateMemInterviewRound(
  id: string,
  roundId: string,
  userId: string,
  status: string,
  isAdmin: boolean,
) {
  const interview = memoryInterviews.find(i => i._id === id);
  if (!interview) return { error: "Interview not found", status: 404 };

  const isOwner = interview.recruiterClerkId === userId;
  if (!isOwner && !isAdmin) return { error: "Forbidden", status: 403 };

  const round = (interview.rounds || []).find((item: any) => item._id === roundId || item.name === roundId);
  if (!round) return { error: "Interview round not found", status: 404 };

  round.status = status;
  return { data: interview };
}

export function deleteMemInterview(id: string, userId: string, isAdmin: boolean) {
  const interviewIndex = memoryInterviews.findIndex(i => i._id === id);
  if (interviewIndex === -1) return { error: "Interview not found", status: 404 };

  const interview = memoryInterviews[interviewIndex];
  const isOwner = interview.recruiterClerkId === userId;
  if (!isOwner && !isAdmin) return { error: "Forbidden", status: 403 };

  memoryInterviews.splice(interviewIndex, 1);
  return { success: true };
}
