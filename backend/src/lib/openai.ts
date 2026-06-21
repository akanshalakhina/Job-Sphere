import OpenAI from "openai";

let _openai: OpenAI | null = null;

export const getOpenAI = (): OpenAI | null => {
  if (_openai) return _openai;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[OpenAI] OPENAI_API_KEY not set — using advanced mock fallback engine for AI features.");
    return null;
  }
  _openai = new OpenAI({ apiKey });
  return _openai;
};

// Advanced Mock Data Engine if OpenAI API Key is missing
export const generateMockAIResponse = (resumeText: string, jobDescription?: string) => {
  const hasReact = resumeText.toLowerCase().includes("react");
  const baseScore = hasReact ? 85 : 68;
  const scoreVariance = Math.floor(Math.random() * 10) - 5;
  const finalScore = Math.min(100, Math.max(0, baseScore + scoreVariance));

  const commonSkills = ["JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL", "GraphQL", "AWS", "Docker", "Git"];
  const randomlySelectedSkills = commonSkills.sort(() => 0.5 - Math.random()).slice(0, 6);
  
  const allKeywords = ["CI/CD", "Kubernetes", "Agile", "System Design", "Microservices", "TDD", "Webpack", "Redux"];
  const randomMissing = allKeywords.sort(() => 0.5 - Math.random()).slice(0, 4);

  return {
    atsScore: finalScore,
    skills: randomlySelectedSkills,
    missingKeywords: randomMissing,
    improvements: [
      "Consider quantifying your achievements with exact percentages (e.g., 'increased performance by 25%').",
      "Your resume lacks mentions of architectural scaling, which the job description emphasizes.",
      "Add a 'Projects' section tailored to the stack mentioned in the job post (e.g., Microservices).",
      "Ensure consistent date formatting across your experience entries for better ATS scraping."
    ],
    summary: "Strong engineering background with good web fundamentals, but lacking specific infrastructural keywords required for senior roles. [MOCK AI ENGINE RESPONDING]"
  };
};
