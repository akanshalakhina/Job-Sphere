import { Router } from "express";
import multer from "multer";
import { requireAuth, getRequestUserId } from "../middlewares/requireAuth";
import { User } from "../models/User";
import { Application } from "../models/Application";
import { getOpenAI, generateMockAIResponse } from "../lib/openai";
import { isDBConnected } from "../lib/mongodb";

import { callGemini, callGeminiWithInlineFile, isGeminiAvailable } from "../lib/gemini";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are allowed"));
    }
  },
});

const MIN_EXTRACTED_RESUME_CHARS = 50;
const EMPTY_TEXT_ERROR =
  "Unable to extract text. Please ensure the PDF is not scanned/image-only and has selectable text.";

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdf = (await import("pdf-parse")) as any;
    const pdfParse = typeof pdf === "function" ? pdf : (pdf.default || pdf);
    const data = await pdfParse(buffer);
    return String(data.text || "").trim();
  } catch {
    return "";
  }
}

async function extractTextFromUploadedFile(file: Express.Multer.File): Promise<string> {
  if (file.mimetype === "application/pdf") {
    return extractTextFromPDF(file.buffer);
  }

  // DOCX support is accepted by the upload control, but this backend has no
  // local DOCX parser dependency. Gemini PDF fallback below intentionally only
  // handles PDFs, so short/empty DOCX text receives the same explicit error.
  return "";
}

const RESUME_SYSTEM_PROMPT = `You are an expert ATS (Applicant Tracking System) analyzer. Analyze the provided resume and return a JSON object with:
- atsScore: number 0-100 (ATS compatibility score)
- skills: array of skills found in the resume
- missingKeywords: array of important keywords missing from the resume
- improvements: array of 3-5 specific actionable improvements
- summary: one sentence summary of the resume's strengths

Return ONLY valid JSON, no markdown code fences.`;

async function analyzeResumeWithAI(
  resumeText: string,
  jobDescription?: string
): Promise<{
  atsScore: number;
  skills: string[];
  missingKeywords: string[];
  improvements: string[];
  summary: string;
}> {
  const prompt = jobDescription
    ? `Analyze this resume against the job description and provide ATS optimization feedback.\n\nJOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resumeText}`
    : `Analyze this resume and provide ATS optimization feedback.\n\nRESUME:\n${resumeText}`;

  // Try OpenAI first
  const openai = getOpenAI();
  if (openai) {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 1000,
        messages: [
          { role: "system", content: RESUME_SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
      });

      let raw = response.choices[0]?.message?.content ?? "{}";
      raw = raw.replace(/^\s*```json?/i, "").replace(/```\s*$/, "").trim();
      return JSON.parse(raw);
    } catch (err) {
      console.error("[Resume] OpenAI failed, trying Gemini:", err);
    }
  }

  // Try Gemini as fallback
  if (isGeminiAvailable()) {
    try {
      const reply = await callGemini(RESUME_SYSTEM_PROMPT, [
        { role: "user", content: prompt },
      ]);
      let raw = reply.replace(/^\s*```json?/i, "").replace(/```\s*$/, "").trim();
      return JSON.parse(raw);
    } catch (err) {
      console.error("[Resume] Gemini failed, using mock:", err);
    }
  }

  // Final fallback: mock engine
  return generateMockAIResponse(resumeText, jobDescription);
}

async function analyzeResumePdfWithGemini(
  file: Express.Multer.File,
  jobDescription?: string,
): Promise<{
  atsScore: number;
  skills: string[];
  missingKeywords: string[];
  improvements: string[];
  summary: string;
}> {
  const prompt = jobDescription
    ? `Analyze the attached resume PDF against the job description and provide ATS optimization feedback.\n\nJOB DESCRIPTION:\n${jobDescription}`
    : "Analyze the attached resume PDF and provide ATS optimization feedback.";

  const reply = await callGeminiWithInlineFile(RESUME_SYSTEM_PROMPT, prompt, {
    mimeType: file.mimetype,
    data: file.buffer,
  });
  let raw = reply.replace(/^\s*```json?/i, "").replace(/```\s*$/, "").trim();
  return JSON.parse(raw);
}

router.post("/resume/analyze", requireAuth, upload.single("resume"), async (req, res) => {
  const userId = getRequestUserId(req);

  if (!req.file) {
    res.status(400).json({ error: "No resume file uploaded" });
    return;
  }

  try {
    const resumeText = await extractTextFromUploadedFile(req.file);
    const jobDescription = req.body.jobDescription || "";
    let analysis:
      | Awaited<ReturnType<typeof analyzeResumeWithAI>>
      | Awaited<ReturnType<typeof analyzeResumePdfWithGemini>>;
    let analyzedWith = "text-extraction";

    if (resumeText.trim().length < MIN_EXTRACTED_RESUME_CHARS) {
      if (req.file.mimetype === "application/pdf" && isGeminiAvailable()) {
        try {
          analysis = await analyzeResumePdfWithGemini(req.file, jobDescription);
          analyzedWith = "gemini-inline-pdf";
        } catch (err) {
          console.error("[Resume] Gemini inline PDF analysis failed:", err);
          res.status(422).json({ error: EMPTY_TEXT_ERROR });
          return;
        }
      } else {
        res.status(422).json({ error: EMPTY_TEXT_ERROR });
        return;
      }
    } else {
      analysis = await analyzeResumeWithAI(resumeText, jobDescription);
    }

    if (isDBConnected()) {
      await User.findOneAndUpdate(
        { clerkId: userId },
        {
          $set: {
            atsScore: analysis.atsScore,
            resumeDetails: {
              fileName: req.file.originalname,
              atsScore: analysis.atsScore,
              skills: analysis.skills,
              missingKeywords: analysis.missingKeywords,
              improvements: analysis.improvements,
              summary: analysis.summary,
            },
          },
        }
      );
    }

    res.json({
      fileName: req.file.originalname,
      analyzedWith,
      ...analysis,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to analyze resume" });
  }
});

router.post("/resume/shortlist", requireAuth, async (req, res) => {
  if (!isDBConnected()) {
    res.status(503).json({ error: "Database not connected" });
    return;
  }
  const { jobId, jobDescription, topN = 5 } = req.body;
  if (!jobId && !jobDescription) {
    res.status(400).json({ error: "jobId or jobDescription required" });
    return;
  }

  try {
    const applications = await Application.find({ job: jobId }).limit(50);
    if (applications.length === 0) {
      res.json({ shortlisted: [], message: "No applications found for this job" });
      return;
    }

    const appSummaries = applications.map((a, i) => ({
      index: i,
      id: a._id?.toString(),
      name: a.candidateName,
      atsScore: a.atsScore,
      skills: a.skills?.join(", ") || "",
      experience: a.experience || "",
      stage: a.stage,
    }));

    let ranked: Array<{ id: string; score: number; reason: string }> = [];
    let aiUsed = false;
    let provider = "";

    // Try OpenAI first
    const openai = getOpenAI();
    if (openai) {
      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          max_tokens: 500,
          messages: [
            {
              role: "system",
              content: `You are a recruitment AI. Rank the top ${topN} candidates for the job based on their profiles. Return a JSON array of the top candidate IDs with a brief reason: [{"id":"...", "score":90, "reason":"..."}]`,
            },
            {
              role: "user",
              content: `Job: ${jobDescription || "See job description"}\n\nCandidates:\n${JSON.stringify(appSummaries)}`,
            },
          ],
        });

        let raw = response.choices[0]?.message?.content ?? "[]";
        raw = raw.replace(/^\s*```json?/i, "").replace(/```\s*$/, "").trim();
        ranked = JSON.parse(raw);
        aiUsed = true;
        provider = "openai";
      } catch (err) {
        console.error("[Resume] OpenAI shortlisting failed, trying Gemini:", err);
      }
    }

    // Try Gemini as fallback
    if (!aiUsed && isGeminiAvailable()) {
      try {
        const systemPrompt = `You are a recruitment AI. Rank the top ${topN} candidates for the job based on their profiles. Return a JSON array of the top candidate IDs with a brief reason: [{"id":"...", "score":90, "reason":"..."}]`;
        const prompt = `Job: ${jobDescription || "See job description"}\n\nCandidates:\n${JSON.stringify(appSummaries)}`;
        const reply = await callGemini(systemPrompt, [{ role: "user", content: prompt }]);
        let raw = reply.replace(/^\s*```json?/i, "").replace(/```\s*$/, "").trim();
        ranked = JSON.parse(raw);
        aiUsed = true;
        provider = "gemini";
      } catch (err) {
        console.error("[Resume] Gemini shortlisting failed, using mock:", err);
      }
    }

    // Mock fallback if both failed
    if (!aiUsed) {
      ranked = appSummaries
        .sort((a, b) => (b.atsScore ?? 0) - (a.atsScore ?? 0))
        .slice(0, topN)
        .map((a) => ({
          id: a.id!,
          score: a.atsScore ?? 0,
          reason: "Ranked by ATS score (local fallback)",
        }));
    }

    const enriched = ranked.map((r) => {
      const app = applications.find((a) => a._id?.toString() === r.id);
      return { ...app?.toObject(), aiScore: r.score, aiReason: r.reason };
    });

    res.json({ shortlisted: enriched, aiEnabled: aiUsed, provider });
  } catch (err) {
    res.status(500).json({ error: "Failed to shortlist candidates" });
  }
});

export default router;
