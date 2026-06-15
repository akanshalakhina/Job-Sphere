import { Job } from "../models/Job";
import { Post } from "../models/Post";
import { Opportunity } from "../models/Opportunity";
import { Interview } from "../models/Interview";

const SEED_JOBS = [
  {
    title: "Senior Frontend Engineer",
    company: "Stripe",
    logo: "S",
    salary: "₹18,00,000 - ₹24,00,000",
    skills: ["React", "TypeScript", "GraphQL", "Tailwind"],
    location: "San Francisco, CA (Remote)",
    workplace: "Remote",
    department: "Engineering",
    experience: "4+ Years",
    description:
      "Join Stripe's world-class frontend team to build payment UIs used by millions globally. You'll architect scalable React components and GraphQL integrations.",
    responsibilities: [
      "Build and maintain high-performance React applications",
      "Collaborate with design and backend teams",
      "Write clean, well-tested TypeScript code",
      "Mentor junior engineers",
    ],
    recruiter: {
      name: "Emily Chen",
      role: "Senior Engineering Recruiter",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    },
    status: "approved",
    applicants: 128,
    postedTime: "2 days ago",
  },
  {
    title: "AI/ML Engineer",
    company: "Google DeepMind",
    logo: "G",
    salary: "₹28,00,000 - ₹40,00,000",
    skills: ["Python", "TensorFlow", "PyTorch", "LLMs"],
    location: "London, UK (Hybrid)",
    workplace: "Hybrid",
    department: "AI Research",
    experience: "5+ Years",
    description:
      "Shape the future of AI at DeepMind. Work on cutting-edge language models and reinforcement learning systems that push the boundaries of what's possible.",
    responsibilities: [
      "Research and implement novel ML architectures",
      "Train and fine-tune large language models",
      "Publish research findings",
      "Collaborate with world-leading AI researchers",
    ],
    recruiter: {
      name: "James Wilson",
      role: "AI Talent Lead",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    },
    status: "approved",
    applicants: 342,
    postedTime: "1 week ago",
  },
  {
    title: "Product Designer",
    company: "Linear",
    logo: "L",
    salary: "₹14,00,000 - ₹20,00,000",
    skills: ["Figma", "UX Research", "Prototyping", "Design Systems"],
    location: "Remote",
    workplace: "Remote",
    department: "Design",
    experience: "3+ Years",
    description:
      "Design beautiful, intuitive interfaces for Linear's project management platform. Work closely with engineering to ship pixel-perfect features.",
    responsibilities: [
      "Design end-to-end product experiences",
      "Build and maintain design system components",
      "Conduct user research and usability testing",
      "Collaborate with product and engineering",
    ],
    recruiter: {
      name: "Sofia Park",
      role: "Design Recruiter",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
    },
    status: "approved",
    applicants: 89,
    postedTime: "3 days ago",
  },
  {
    title: "Backend Engineer — Infra",
    company: "Vercel",
    logo: "V",
    salary: "₹22,00,000 - ₹30,00,000",
    skills: ["Go", "Kubernetes", "AWS", "PostgreSQL"],
    location: "New York, NY (Hybrid)",
    workplace: "Hybrid",
    department: "Infrastructure",
    experience: "5+ Years",
    description:
      "Build the serverless infrastructure powering millions of deployments per day. Work on Edge Network, build pipelines, and distributed systems at massive scale.",
    responsibilities: [
      "Design and implement scalable backend systems",
      "Optimize performance for global edge network",
      "Build CI/CD pipelines and developer tooling",
      "On-call rotation for production systems",
    ],
    recruiter: {
      name: "Marcus Johnson",
      role: "Infrastructure Recruiter",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
    status: "approved",
    applicants: 215,
    postedTime: "5 days ago",
  },
  {
    title: "DevRel Engineer",
    company: "Supabase",
    logo: "SB",
    salary: "₹16,00,000 - ₹22,00,000",
    skills: ["Next.js", "PostgreSQL", "Technical Writing", "Public Speaking"],
    location: "Remote (Worldwide)",
    workplace: "Remote",
    department: "Developer Relations",
    experience: "3+ Years",
    description:
      "Be the bridge between Supabase and its global developer community. Create content, build sample apps, and speak at conferences worldwide.",
    responsibilities: [
      "Create technical tutorials and blog posts",
      "Build open-source demo projects",
      "Represent Supabase at conferences",
      "Gather developer feedback for product team",
    ],
    recruiter: {
      name: "Aisha Patel",
      role: "Community Recruiter",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    },
    status: "approved",
    applicants: 67,
    postedTime: "1 day ago",
  },
  {
    title: "Full Stack Engineer",
    company: "Razorpay",
    logo: "R",
    salary: "₹20,00,000 - ₹28,00,000",
    skills: ["React", "Node.js", "Redis", "MongoDB"],
    location: "Bengaluru, India",
    workplace: "Hybrid",
    department: "Payments Engineering",
    experience: "3+ Years",
    description:
      "Build the payment infrastructure for India's fastest growing fintech. Own features end-to-end from DB schema to React UI.",
    responsibilities: [
      "Build full-stack payment features",
      "Design low-latency APIs for payment processing",
      "Ensure PCI compliance in implementation",
      "Collaborate with product, design and QA teams",
    ],
    recruiter: {
      name: "Priya Sharma",
      role: "Tech Recruiter",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    },
    status: "approved",
    applicants: 190,
    postedTime: "4 days ago",
  },
];

const SEED_POSTS = [
  {
    author: {
      name: "Sarah Chen",
      title: "Staff Engineer @ Google",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      isVerified: true,
    },
    content:
      "🚀 Excited to share that our team just shipped real-time AI candidate matching at scale — processing 50k resumes/hour with 94% accuracy! The key was combining vector embeddings with traditional keyword matching. The future of recruiting is here. #AI #Tech #Hiring",
    likesCount: 847,
    likes: [],
    comments: [
      {
        author: "Alex Rivera",
        content: "This is incredible! What embedding model did you use?",
        time: "2h ago",
      },
      {
        author: "Priya Sharma",
        content: "Would love to see a technical deep-dive post on this!",
        time: "1h ago",
      },
    ],
    time: "4h ago",
  },
  {
    author: {
      name: "Marcus Johnson",
      title: "Engineering Manager @ Vercel",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      isVerified: true,
    },
    content:
      "Hot take: Most interview processes are broken. We screen out great engineers because they can't reverse a binary tree on a whiteboard, but can't assess if they'll collaborate, communicate, and ship. The best engineers I've hired had empathy and curiosity — not LeetCode ratings. 🎯",
    likesCount: 2341,
    likes: [],
    comments: [
      {
        author: "Emily Watson",
        content: "100% agree. Communication skills matter so much more.",
        time: "3h ago",
      },
    ],
    time: "8h ago",
  },
  {
    author: {
      name: "Meera Nair",
      title: "Lead Designer @ Figma",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
      isVerified: false,
    },
    content:
      "📌 Open to work! After 3 amazing years at Figma building design systems, I'm looking for my next challenge. Passionate about: accessible design, AI-augmented workflows, and team culture. DM me or hit the link in bio! #OpenToWork #UXDesign #DesignSystems",
    likesCount: 523,
    likes: [],
    comments: [
      {
        author: "Sofia Park",
        content: "Meera, I'll reach out! We have something perfect at Linear.",
        time: "1h ago",
      },
    ],
    time: "12h ago",
  },
];

const SEED_OPPORTUNITIES = [
  {
    type: "hackathon",
    title: "Google Cloud Hackathon 2026",
    organizer: "Google",
    bannerColor: "from-blue-500 to-cyan-500",
    prize: "₹10,00,000",
    daysLeft: 12,
    status: "open",
    skills: ["GCP", "Python", "AI/ML"],
    registered: 1247,
    description: "Build AI-powered solutions on Google Cloud Platform",
  },
  {
    type: "internship",
    title: "Stripe Summer Engineering Internship",
    organizer: "Stripe",
    bannerColor: "from-indigo-500 to-purple-600",
    prize: "₹1,20,000/month",
    daysLeft: 28,
    status: "open",
    skills: ["React", "Go", "Distributed Systems"],
    registered: 892,
    description: "12-week paid internship with world-class mentorship",
  },
  {
    type: "competition",
    title: "ICPC India Regional 2026",
    organizer: "ACM-ICPC",
    bannerColor: "from-rose-500 to-orange-500",
    prize: "₹5,00,000 + Global Finals Invite",
    daysLeft: 45,
    status: "open",
    skills: ["Algorithms", "Data Structures", "C++"],
    registered: 3210,
    description: "Premier collegiate competitive programming competition",
  },
  {
    type: "mentorship",
    title: "Sequoia Pathfinders Mentorship",
    organizer: "Sequoia Capital",
    bannerColor: "from-emerald-500 to-teal-600",
    prize: "Equity Insights + Network",
    daysLeft: 7,
    status: "open",
    skills: ["Startups", "Product", "Fundraising"],
    registered: 156,
    description: "1:1 mentorship from Sequoia portfolio founders and partners",
  },
];

export const seedDatabase = async (): Promise<void> => {
  console.log("[Seed] Seeding disabled to keep database empty");
};
