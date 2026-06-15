import { Router } from "express";
import { getOpenAI } from "../lib/openai";
import { callGemini, isGeminiAvailable } from "../lib/gemini";

const router = Router();

const SYSTEM_PROMPT = `You are SphereAI, an intelligent recruiting assistant for JobSphere AI — a LinkedIn/Naukri-style platform for tech professionals in India and globally.

You help:
- Candidates find jobs, improve their resumes, prepare for interviews, and plan career paths
- Recruiters screen candidates, understand the job market, and post better job descriptions
- Everyone navigate the JobSphere platform features

JobSphere features:
- AI Resume Analyzer (ATS scanner with score, keyword analysis, improvement tips)
- Job Listings with AI match scores
- Career Roadmaps (Frontend Dev, AI Engineering)
- Recruiter Pipeline (Kanban board for candidate stages)
- Opportunities (Hackathons, Internships, Competitions)
- Social Feed (posts, likes, comments)
- Interview Scheduler

Always be helpful, concise, and professional. Keep responses under 150 words unless a detailed explanation is requested.`;

router.post("/chat", async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message?.trim()) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  // Convert history for both OpenAI and Gemini
  const historyMapped = history.slice(-6).map((m: { sender: string; text: string }) => ({
    role: m.sender === "user" ? "user" as const : "assistant" as const,
    content: m.text,
  }));

  // Try OpenAI first
  const openai = getOpenAI();
  if (openai) {
    try {
      const messages = [
        { role: "system" as const, content: SYSTEM_PROMPT },
        ...historyMapped,
        { role: "user" as const, content: message },
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 300,
        messages,
      });

      const reply = response.choices[0]?.message?.content ?? "I'm not sure how to help with that. Could you rephrase?";
      res.json({ reply, aiEnabled: true, provider: "openai" });
      return;
    } catch (err) {
      console.error("[Chat] OpenAI failed, trying Gemini:", err);
    }
  }

  // Try Gemini as fallback
  if (isGeminiAvailable()) {
    try {
      const geminiMessages = [
        ...historyMapped,
        { role: "user" as const, content: message },
      ];
      const reply = await callGemini(SYSTEM_PROMPT, geminiMessages);
      res.json({ reply, aiEnabled: true, provider: "gemini" });
      return;
    } catch (err) {
      console.error("[Chat] Gemini failed, using fallback:", err);
    }
  }

  // Final fallback
  const fallback = generateFallbackResponse(message);
  res.json({ reply: fallback, aiEnabled: false });
});

function generateFallbackResponse(text: string): string {
  const query = text.toLowerCase();
  if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
    return "Hello! I'm SphereAI, your recruiting assistant. How can I help you today? Try asking about jobs, resume tips, or career roadmaps!";
  }
  if (query.includes("job") || query.includes("search") || query.includes("hiring")) {
    return "We have outstanding roles at Stripe, Google DeepMind, Linear, and more. Visit the Jobs page to apply with your AI Compatibility Score!";
  }
  if (query.includes("resume") || query.includes("ats") || query.includes("scan")) {
    return "Head to the Resume Analyzer page to upload your PDF and get an instant ATS score, keyword analysis, and improvement tips!";
  }
  if (query.includes("hackathon") || query.includes("internship") || query.includes("opportunity")) {
    return "Check the Opportunities page for hackathons, internships, and competitions from Google, Stripe, ACM-ICPC and more!";
  }
  if (query.includes("recruiter") || query.includes("pipeline") || query.includes("candidate")) {
    return "Switch to Recruiter mode to access the Kanban pipeline, candidate screening, AI shortlisting, and interview scheduling tools!";
  }
  if (query.includes("roadmap") || query.includes("learn") || query.includes("upskill")) {
    return "Visit your Candidate Dashboard to access personalized career roadmaps for Frontend Development and AI Engineering!";
  }
  return "I'm here to help with jobs, resumes, career guidance, and navigating JobSphere. What would you like to know?";
}

export default router;
