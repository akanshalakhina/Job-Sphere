import { Router } from "express";
import { requireAuth } from "../middlewares/requireAuth";
import { callGemini, isGeminiAvailable } from "../lib/gemini";

const router = Router();

const SYSTEM_PROMPT = `You are an expert technical interview coach for JobSphere AI. Your role is to:
1. Help candidates practice for job interviews by asking relevant technical and behavioral questions
2. Provide constructive feedback on their answers
3. Suggest improvements and best practices
4. Keep responses concise, professional, and encouraging

Focus on software engineering, data science, product management, and design roles.
Adapt difficulty based on the candidate's experience level.`;

router.post("/ai-coach", requireAuth, async (req, res) => {
  const { message, history = [] } = req.body;
  if (!message?.trim()) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  // Check if Gemini is available
  if (!isGeminiAvailable()) {
    const fallback = generateMockCoachResponse(message);
    res.json({ reply: fallback, aiEnabled: false });
    return;
  }

  try {
    // Map frontend history format { sender: 'user'|'ai', text } → { role, content }
    const messages = history
      .slice(-10)
      .filter((m: { sender: string; text: string }) => m.text?.trim())
      .map((m: { sender: string; text: string }) => ({
        role: (m.sender === "user" ? "user" : "assistant") as "user" | "assistant",
        content: m.text,
      }));

    // Add current user message
    messages.push({ role: "user" as const, content: message });

    const reply = await callGemini(SYSTEM_PROMPT, messages);
    res.json({ reply, aiEnabled: true, provider: "gemini" });
  } catch (err) {
    console.error("[AI Coach] Gemini error:", err);
    const fallback = generateMockCoachResponse(message);
    res.json({ reply: fallback, aiEnabled: false });
  }
});

function generateMockCoachResponse(text: string): string {
  const query = text.toLowerCase();
  if (query.includes("hello") || query.includes("hi") || query.includes("hey")) {
    return "Hello! I'm your AI Interview Coach. I can help you practice for technical interviews, behavioral questions, and system design rounds. What role are you preparing for?";
  }
  if (query.includes("behavioral") || query.includes("tell me about yourself")) {
    return "Great question! When answering 'Tell me about yourself', structure your response as: 1) Current role and key responsibilities, 2) Past experience that led you here, 3) What you're looking for next. Keep it under 2 minutes. Want to practice your response?";
  }
  if (query.includes("technical") || query.includes("coding") || query.includes("leetcode")) {
    return "For technical interviews, focus on: 1) Understanding the problem before coding, 2) Communicating your approach clearly, 3) Optimizing time and space complexity. Common topics include arrays, graphs, dynamic programming, and system design. What specific topic would you like to practice?";
  }
  if (query.includes("system design")) {
    return "For system design interviews, follow this framework: 1) Clarify requirements and constraints, 2) Estimate scale (traffic, storage), 3) Design high-level components, 4) Dive into key components, 5) Identify bottlenecks and trade-offs. Want to try designing a specific system like a URL shortener or chat application?";
  }
  if (query.includes("feedback") || query.includes("improve")) {
    return "Here are common interview improvement areas: 1) Practice thinking out loud - interviewers want to understand your thought process, 2) Use the STAR method (Situation, Task, Action, Result) for behavioral questions, 3) Ask clarifying questions before diving into solutions, 4) Review data structures and algorithms fundamentals.";
  }
  return "I'm here to help you ace your interviews! Try asking about: behavioral questions, technical prep, system design, or say 'practice' to start a mock interview session. What would you like to work on?";
}

export default router;
