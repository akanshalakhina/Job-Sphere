// Mock Database for JobSphere AI

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Sarah Jenkins",
    role: "Lead Frontend Engineer at Stripe",
    text: "JobSphere AI completely changed my job hunting experience. The AI resume analyzer gave me actionable insights that bumped my response rate by 80%. I landed a job in under 2 weeks!",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150"
  },
  {
    id: 2,
    name: "David Chen",
    role: "University Student at Georgia Tech",
    text: "The Unstop-style opportunities dashboard is incredibly engaging. I registered for three hackathons, secured an internship at a top fintech startup, and expanded my network. Incredible tool!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
  },
  {
    id: 3,
    name: "Marcus Vance",
    role: "Head of Talent Acquisition at Linear",
    text: "As a recruiter, finding qualified candidates is normally a needles-in-a-haystack search. JobSphere's automated candidate scoring and interactive Kanban pipelines cut our sourcing time by 75%.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
  }
];

export const FAQS = [
  {
    question: "How does the AI Resume Analyzer calculate the ATS score?",
    answer: "Our proprietary AI engine parses your resume, mapping your skills, experiences, and qualifications against thousands of industry-standard job descriptions. It evaluates content relevancy, vocabulary complexity, layout clarity, and parses for critical missing industry keywords to generate your final score."
  },
  {
    question: "Is JobSphere AI free for students?",
    answer: "Absolutely! Students and active candidates have complete access to the Resume Analyzer, LinkedIn-style community feed, Unstop-style hackathons/internships catalog, and job search filters entirely for free."
  },
  {
    question: "How do recruiters benefit from the platform?",
    answer: "Recruiters receive an AI-generated shortlist that automatically scores applicants based on specific role alignment. Rather than scanning PDFs manually, recruiters get a premium, visual Kanban pipeline sorting candidate profiles by compatibility, experience, and custom filters."
  },
  {
    question: "Can I host hackathons or workshops on JobSphere?",
    answer: "Yes, verified corporate and university sponsors can seamlessly list opportunities like hackathons, mentorship sessions, webinars, and mock interviews directly on the Internship & Opportunities Board."
  }
];

export const COMPANYS = [
  { name: "Google", logo: "G" },
  { name: "Apple", logo: "" },
  { name: "Stripe", logo: "S" },
  { name: "Linear", logo: "L" },
  { name: "Meta", logo: "M" },
  { name: "Netflix", logo: "N" }
];

export const JOBS = [
  {
    id: "job-1",
    title: "Senior React Engineer",
    company: "Stripe",
    logo: "S",
    salary: "₹15,00,000 - ₹18,50,000",
    skills: ["React", "TypeScript", "TailwindCSS", "REST APIs"],
    location: "San Francisco, CA (Hybrid)",
    department: "Engineering",
    experience: "5+ Years",
    aiMatch: 96,
    postedTime: "2 hours ago",
    description: "Stripe is seeking an expert React Developer to join our core dashboard architecture team. You will build highly responsive web dashboards that support millions of global e-commerce merchants.",
    responsibilities: [
      "Design, implement, and maintain high-fidelity merchant dashboard features.",
      "Collaborate with Apple-grade product designers to craft interactive UI and animations.",
      "Optimize core web performance metrics (LCP, FID, CLS) across all subdomains."
    ],
    recruiter: {
      name: "Olivia Rhye",
      role: "Global Talent Lead at Stripe",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
    }
  },
  {
    id: "job-2",
    title: "AI UI/UX Designer",
    company: "Linear",
    logo: "L",
    salary: "₹13,00,000 - ₹16,00,000",
    skills: ["Figma", "Framer Motion", "Design Systems", "Prototyping"],
    location: "New York, NY (Remote)",
    department: "Design",
    experience: "3+ Years",
    aiMatch: 88,
    postedTime: "5 hours ago",
    description: "Linear builds tools that developers love. We are searching for an interface designer focused on crafting AI-assisted scheduling, roadmap modeling, and collaborative flow components.",
    responsibilities: [
      "Pioneer the visual system for Linear's upcoming conversational workspace integration.",
      "Build high-fidelity prototypes and export React-ready UI styles.",
      "Iterate on beautiful micro-interactions, dark mode patterns, and keyboard-first shortcuts."
    ],
    recruiter: {
      name: "Karla Adams",
      role: "Head of Product Design at Linear",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150"
    }
  },
  {
    id: "job-3",
    title: "Backend Core Architect (Go/Node)",
    company: "Google",
    logo: "G",
    salary: "₹18,00,000 - ₹22,00,000",
    skills: ["Go", "Node.js", "PostgreSQL", "gRPC", "Kubernetes"],
    location: "Mountain View, CA (Hybrid)",
    department: "Engineering",
    experience: "7+ Years",
    aiMatch: 74,
    postedTime: "1 day ago",
    description: "Join the Cloud AI Infrastructure engineering squad. You will be responsible for building robust, scalable high-throughput API endpoints facilitating low-latency ML inference delivery.",
    responsibilities: [
      "Develop ultra-fast RPC-based Go APIs connecting microservices with LLM clusters.",
      "Design database schema migrations supporting millions of writes per second.",
      "Establish strict continuous deployment strategies on global Kubernetes grids."
    ],
    recruiter: {
      name: "Marcus Aurelius",
      role: "Director of Engineering Talent",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150"
    }
  },
  {
    id: "job-4",
    title: "Junior Frontend Engineer",
    company: "Vercel",
    logo: "V",
    salary: "₹9,00,000 - ₹11,50,000",
    skills: ["Next.js", "CSS Grid", "React Hooks", "Vercel SDKs"],
    location: "Remote (Global)",
    department: "Engineering",
    experience: "1-2 Years",
    aiMatch: 92,
    postedTime: "2 days ago",
    description: "Seeking a passionate web enthusiast to join our Developer Relations and product marketing engineering division. You will build stellar showcase apps and visual templates.",
    responsibilities: [
      "Build outstanding responsive demo landing pages highlighting core Next.js capabilities.",
      "Write thorough documentation and maintain starter templates.",
      "Engage with community builders to diagnose frontend issues and gather visual design feedback."
    ],
    recruiter: {
      name: "Guillermo Rauch",
      role: "CEO at Vercel",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150"
    }
  },
  {
    id: "job-5",
    title: "AI Research Engineer",
    company: "Meta",
    logo: "M",
    salary: "₹21,00,000 - ₹26,00,000",
    skills: ["PyTorch", "Transformers", "Python", "CUDA", "C++"],
    location: "Menlo Park, CA (On-site)",
    department: "Research",
    experience: "4+ Years",
    aiMatch: 68,
    postedTime: "3 days ago",
    description: "Meta AI Research is looking for engineers to implement optimization techniques for training large language models. Experience with parameter-efficient fine-tuning (PEFT) is highly valued.",
    responsibilities: [
      "Develop state-of-the-art architectures for multimodal LLMs.",
      "Profile and optimize CUDA training pipelines on H100 GPU clusters.",
      "Collaborate with academic researchers to publish novel deep learning systems."
    ],
    recruiter: {
      name: "Emily Watson",
      role: "Principal AI Recruiter at Meta",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
    }
  }
];

export const OPPORTUNITIES = [
  {
    id: "opp-1",
    type: "hackathon",
    title: "SphereHack 2026: AI for Good",
    organizer: "JobSphere AI + Google Cloud",
    bannerColor: "from-blue-600 to-indigo-600",
    prize: "₹20,00,000 Cash Pool",
    registered: 1840,
    status: "Open",
    daysLeft: 8,
    skills: ["Generative AI", "React", "Cloud Functions"]
  },
  {
    id: "opp-2",
    type: "internship",
    title: "Interactive UX Engineering Intern",
    organizer: "Linear Software",
    bannerColor: "from-slate-800 to-navy-950",
    prize: "₹70,000/Month + Equity",
    registered: 3450,
    status: "Apply Now",
    daysLeft: 12,
    skills: ["React", "Framer Motion", "TailwindCSS"]
  },
  {
    id: "opp-3",
    type: "competition",
    title: "Global Algorithmic Battle Royale",
    organizer: "HackerRank Sponsor Group",
    bannerColor: "from-emerald-600 to-teal-700",
    prize: "Gold Medal + Apple Studio Display",
    registered: 840,
    status: "Open",
    daysLeft: 3,
    skills: ["Data Structures", "Algorithms", "C++", "Python"]
  },
  {
    id: "opp-4",
    type: "mentorship",
    title: "SaaS Scaling: 0 to ₹80 Crore ARR masterclass",
    organizer: "Stripe Founders Network",
    bannerColor: "from-purple-600 to-pink-600",
    prize: "1-on-1 VC Pitch Sessions",
    registered: 650,
    status: "Register",
    daysLeft: 15,
    skills: ["Business Models", "Pitching", "Growth Sourcing"]
  },
  {
    id: "opp-5",
    type: "workshop",
    title: "Next.js 16 Visual Transitions Deep-Dive",
    organizer: "Vercel Core Engineers",
    bannerColor: "from-amber-500 to-orange-600",
    prize: "Vercel Pro free for 1 Year",
    registered: 1200,
    status: "Register Now",
    daysLeft: 2,
    skills: ["Next.js", "Server Components", "View Transitions"]
  }
];

export const FEED_POSTS = [
  {
    id: "post-1",
    author: {
      name: "Vansh Karnwal",
      title: "Fullstack Architect | Building JobSphere AI",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
      isVerified: true
    },
    content: "Thrilled to share that we just finalized our new AI-powered Resume Analyzer scoring mechanism! 🚀 We map resume structures dynamically against strict applicant parameters. Say goodbye to black-box resume filtration. Our candidate-first dashboard gives you actionable tips. Let me know your thoughts on our visual interface design! 👇",
    likes: 142,
    comments: [
      {
        id: "c-1",
        author: "Alisha Sharma",
        text: "The layout looks drop-dead gorgeous! Love the glassmorphism aesthetic.",
        time: "1h ago"
      },
      {
        id: "c-2",
        author: "Robert Kowalski",
        text: "Are you planning support for LaTeX resumes? Most developers use them.",
        time: "30m ago"
      }
    ],
    shares: 12,
    time: "3 hours ago",
    likesCount: 142
  },
  {
    id: "post-2",
    author: {
      name: "Olivia Rhye",
      title: "Design Lead at Stripe",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      isVerified: true
    },
    content: "Clean, consistent spacing and a robust design system are what turn a basic utility app into a stellar startup product. A sneak peek into Stripe's upcoming widgets library: expect interactive graphs, magnetic hover effects, and deep integration with Framer Motion transitions. Web design is evolving so fast!",
    likes: 890,
    comments: [],
    shares: 45,
    time: "6 hours ago",
    likesCount: 890
  }
];

export const CANDIDATES = [
  {
    id: "cand-1",
    name: "Alex Rivera",
    title: "Senior Full Stack Dev",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    atsScore: 94,
    skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
    appliedFor: "Senior React Engineer",
    stage: "Shortlisted", // Pipeline columns: Applied, Screening, Shortlisted, Interviewing, Offered
    experience: "6 Years",
    email: "alex.rivera@gmail.com",
    resumeUrl: "alex_rivera_resume.pdf"
  },
  {
    id: "cand-2",
    name: "Meera Nair",
    title: "Product & UI/UX Engineer",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150",
    atsScore: 88,
    skills: ["Figma", "Design Systems", "Framer Motion", "TailwindCSS"],
    appliedFor: "AI UI/UX Designer",
    stage: "Interviewing",
    experience: "4 Years",
    email: "meera.nair@uxdesign.io",
    resumeUrl: "meera_nair_design.pdf"
  },
  {
    id: "cand-3",
    name: "John Doe",
    title: "Junior React Dev",
    avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150",
    atsScore: 78,
    skills: ["React", "JavaScript", "HTML/CSS", "Bootstrap"],
    appliedFor: "Junior Frontend Engineer",
    stage: "Applied",
    experience: "1 Year",
    email: "john.doe@gmail.com",
    resumeUrl: "john_doe_front.pdf"
  },
  {
    id: "cand-4",
    name: "Dr. Sandeep Patel",
    title: "AI Specialist / ML Researcher",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    atsScore: 96,
    skills: ["Python", "PyTorch", "LLMs", "Transformers", "CUDA"],
    appliedFor: "AI Research Engineer",
    stage: "Offered",
    experience: "5 Years",
    email: "sandeep.patel@stanford.edu",
    resumeUrl: "sandeep_patel_ai.pdf"
  },
  {
    id: "cand-5",
    name: "Li Wei",
    title: "Golang Backend Architect",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    atsScore: 82,
    skills: ["Go", "Kubernetes", "gRPC", "PostgreSQL", "Redis"],
    appliedFor: "Backend Core Architect (Go/Node)",
    stage: "Screening",
    experience: "8 Years",
    email: "li.wei@backend.io",
    resumeUrl: "li_wei_go.pdf"
  }
];

export const TRENDING_SKILLS = [
  { id: "ts-1", name: "AI Engineering", growth: 145, demand: "Critical", salary: "₹16,50,000", companies: ["Google", "OpenAI", "Meta"] },
  { id: "ts-2", name: "Generative AI", growth: 180, demand: "Critical", salary: "₹17,50,000", companies: ["Anthropic", "Stripe", "Microsoft"] },
  { id: "ts-3", name: "Prompt Engineering", growth: 95, demand: "High", salary: "₹12,00,000", companies: ["Scale AI", "Meta", "Copy.ai"] },
  { id: "ts-4", name: "DevOps & SRE", growth: 42, demand: "High", salary: "₹14,00,000", companies: ["Netflix", "Vercel", "Apple"] },
  { id: "ts-5", name: "Full Stack Development", growth: 38, demand: "High", salary: "₹13,00,000", companies: ["Stripe", "Linear", "Airbnb"] },
  { id: "ts-6", name: "UI/UX Design", growth: 25, demand: "Medium", salary: "₹11,50,000", companies: ["Linear", "Figma", "Apple"] },
  { id: "ts-7", name: "Cloud Computing", growth: 50, demand: "High", salary: "₹13,50,000", companies: ["AWS", "Google", "Azure"] },
  { id: "ts-8", name: "Cyber Security", growth: 65, demand: "Critical", salary: "₹14,50,005", companies: ["CrowdStrike", "Cloudflare", "Palantir"] }
];

export const ROADMAPS = {
  frontend: {
    title: "Premium Frontend Engineer",
    description: "Learn HTML/CSS fundamentals, Master JavaScript, Dive deep into React, Next.js, and advanced styling with Framer Motion.",
    steps: [
      { id: "f-1", title: "Web Basics", desc: "HTML5 semantic syntax, CSS Flexbox & Grid layouts, and responsive media queries.", completed: true },
      { id: "f-2", title: "Modern JavaScript", desc: "ES6 syntax, asynchronous fetches, promises, closures, and modular code structures.", completed: true },
      { id: "f-3", title: "React Architecture", desc: "React Hooks, Context API, state machines, virtual DOM rendering performance, and key triggers.", completed: true },
      { id: "f-4", title: "Next.js Core Concepts", desc: "App Router, SSR (Server-Side Rendering), SSG, routing optimizations, API handlers, and Server Actions.", completed: false },
      { id: "f-5", title: "Framer Motion & Tailwind", desc: "Beautiful layout view transitions, hover micro-interactions, hardware acceleration, and glassmorphism styling.", completed: false },
      { id: "f-6", title: "Web Performance & SEO", desc: "Core Web Vitals optimization (LCP, INP, CLS), semantic HTML, schema data, and bundle size reduction.", completed: false }
    ]
  },
  ai: {
    title: "AI & Prompt Engineer",
    description: "Master Python fundamentals, explore PyTorch frameworks, learn LLM fine-tuning APIs, and practice advanced prompt patterns.",
    steps: [
      { id: "a-1", title: "Python & Analytics", desc: "Core Python algorithms, NumPy matrices, Pandas dataframes, and descriptive plots.", completed: true },
      { id: "a-2", title: "Machine Learning Foundations", desc: "Supervised and unsupervised models, loss gradients, regression, and tree classifiers.", completed: false },
      { id: "a-3", title: "Deep Learning (PyTorch)", desc: "Building neural networks, backward propagation, neural weights initialization, and model fitting.", completed: false },
      { id: "a-4", title: "Transformers & LLMs", desc: "Attention mechanisms, GPT architectures, HuggingFace model hubs, and weight loadings.", completed: false },
      { id: "a-5", title: "Prompt Optimization", desc: "Few-shot templates, Chain-of-Thought (CoT), Retrieval Augmented Generation (RAG) structures.", completed: false },
      { id: "a-6", title: "MLOps Deployment", desc: "Deploying inference models, scaling Docker containers, Kubernetes scheduling, and API serving.", completed: false }
    ]
  }
};

export const CERTIFICATIONS = [
  { id: "cert-1", name: "AWS Certified Cloud Practitioner", provider: "Amazon Web Services", duration: "12 Hours", level: "Beginner", rating: 4.8 },
  { id: "cert-2", name: "Google UX Design Professional Certificate", provider: "Google", duration: "48 Hours", level: "Intermediate", rating: 4.9 },
  { id: "cert-3", name: "Meta Frontend Developer Professional Certificate", provider: "Meta", duration: "32 Hours", level: "Beginner", rating: 4.7 },
  { id: "cert-4", name: "Generative AI Fundamentals", provider: "DeepLearning.AI", duration: "8 Hours", level: "Intermediate", rating: 4.9 }
];

