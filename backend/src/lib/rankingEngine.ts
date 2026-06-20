import { createHash } from "node:crypto";
import {
  generateEmbedding,
  computeCosineSimilarity,
  isGeminiAvailable,
} from "./gemini";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export interface SkillsMatchResult {
  score: number;
  matched: string[];
  missing: string[];
}

export interface RankingInput {
  jobSkills: string[];
  jobExperience: string;
  jobLocation: string;
  jobDescription: string;
  jobWorkplace: string;
  candidateSkills: string[];
  candidateExperience: string;
  candidateLocation: string;
  candidateResumeText: string;
  candidateBio: string;
}

export interface RankingResult {
  skillsScore: number;
  experienceScore: number;
  locationScore: number;
  semanticScore: number;
  finalScore: number;
  recommendation: string;
  matchedSkills: string[];
  missingSkills: string[];
  summary: string;
  autoShortlisted: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// 1. Skills Match (40%)
// ────────────────────────────────────────────────────────────────────────────

export function computeSkillsMatch(
  jobSkills: string[],
  candidateSkills: string[],
): SkillsMatchResult {
  if (!jobSkills.length) {
    return { score: 50, matched: [], missing: [] };
  }

  const candidateUpper = new Set(
    candidateSkills.map((s) => s.trim().toUpperCase()),
  );

  const matched: string[] = [];
  const missing: string[] = [];

  for (const skill of jobSkills) {
    const key = skill.trim().toUpperCase();
    if (!key) continue;
    if (candidateUpper.has(key)) {
      matched.push(skill.trim());
    } else {
      // Also check partial matches (e.g. "React.js" matches "React")
      const partialMatch = [...candidateUpper].some(
        (cs) => cs.includes(key) || key.includes(cs),
      );
      if (partialMatch) {
        matched.push(skill.trim());
      } else {
        missing.push(skill.trim());
      }
    }
  }

  const score = Math.round((matched.length / jobSkills.length) * 100);
  return { score: Math.min(100, score), matched, missing };
}

// ────────────────────────────────────────────────────────────────────────────
// 2. Experience Match (25%)
// ────────────────────────────────────────────────────────────────────────────

/** Extract numeric years from strings like "3+ Years", "5 Years", "2-4 Years", "Entry Level" */
export function parseYearsFromString(s: string): number | null {
  if (!s || !s.trim()) return null;

  const lower = s.toLowerCase().trim();
  if (lower.includes("entry") || lower.includes("fresher") || lower === "0") {
    return 0;
  }

  // Match patterns like "3+", "3-5", "3"
  const rangeMatch = lower.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (rangeMatch) {
    return (parseInt(rangeMatch[1], 10) + parseInt(rangeMatch[2], 10)) / 2;
  }

  const plusMatch = lower.match(/(\d+)\+?/);
  if (plusMatch) {
    return parseInt(plusMatch[1], 10);
  }

  return null;
}

export function computeExperienceMatch(
  jobExperience: string,
  candidateExperience: string,
): number {
  const requiredYears = parseYearsFromString(jobExperience);
  const candidateYears = parseYearsFromString(candidateExperience);

  // Can't evaluate — return a neutral score
  if (requiredYears === null || candidateYears === null) return 50;

  // Entry level jobs
  if (requiredYears === 0) return 100;

  if (candidateYears >= requiredYears) {
    // Perfect or overqualified — slight diminish for large overqualification
    const overRatio = candidateYears / requiredYears;
    if (overRatio > 2) return 85; // Very overqualified
    return 100;
  }

  // Under-qualified — proportional score
  const ratio = candidateYears / requiredYears;
  return Math.round(ratio * 100);
}

// ────────────────────────────────────────────────────────────────────────────
// 3. Location Match (15%)
// ────────────────────────────────────────────────────────────────────────────

export function computeLocationMatch(
  jobLocation: string,
  jobWorkplace: string,
  candidateLocation: string,
): number {
  const jLoc = (jobLocation || "").toLowerCase().trim();
  const jWork = (jobWorkplace || "").toLowerCase().trim();
  const cLoc = (candidateLocation || "").toLowerCase().trim();

  // Remote job — everyone matches
  if (jWork === "remote" || jLoc.includes("remote")) {
    return 100;
  }

  // No candidate location info — neutral
  if (!cLoc) return 60;

  // Same city check (extract city names)
  const jCity = extractCity(jLoc);
  const cCity = extractCity(cLoc);

  if (jCity && cCity && jCity === cCity) return 100;

  // Same state/region check
  const jState = extractState(jLoc);
  const cState = extractState(cLoc);

  if (jState && cState && jState === cState) return 80;

  // Same country check
  const jCountry = extractCountry(jLoc);
  const cCountry = extractCountry(cLoc);

  if (jCountry && cCountry) {
    if (jCountry === cCountry) return 50;
    return 20;
  }

  // General substring overlap
  const jWords = new Set(jLoc.split(/[\s,]+/).filter((w) => w.length > 2));
  const cWords = new Set(cLoc.split(/[\s,]+/).filter((w) => w.length > 2));
  const overlap = [...jWords].filter((w) => cWords.has(w)).length;
  if (overlap > 0) return 70;

  return 40;
}

function extractCity(location: string): string {
  // Common patterns: "City, State", "City, State (Remote)", "City"
  const parts = location.replace(/\(.*\)/, "").split(",");
  return parts[0]?.trim() || "";
}

function extractState(location: string): string {
  const parts = location.replace(/\(.*\)/, "").split(",");
  if (parts.length >= 2) return parts[1]?.trim() || "";
  return "";
}

function extractCountry(location: string): string {
  const lower = location.toLowerCase();
  // Common country indicators
  const countries: Record<string, string> = {
    india: "india",
    usa: "usa",
    "united states": "usa",
    us: "usa",
    uk: "uk",
    "united kingdom": "uk",
    canada: "canada",
    germany: "germany",
    australia: "australia",
    singapore: "singapore",
  };

  for (const [key, value] of Object.entries(countries)) {
    if (lower.includes(key)) return value;
  }

  // Check state abbreviations for US
  const usStates = [
    "ca",
    "ny",
    "tx",
    "wa",
    "ma",
    "il",
    "co",
    "fl",
    "ga",
    "pa",
    "oh",
    "nc",
    "nj",
    "va",
    "az",
    "or",
    "mn",
    "mi",
    "md",
    "ct",
  ];
  const parts = lower.split(/[\s,]+/);
  for (const part of parts) {
    if (usStates.includes(part)) return "usa";
  }

  // Check if it contains Indian cities
  const indianCities = [
    "bengaluru",
    "bangalore",
    "mumbai",
    "delhi",
    "hyderabad",
    "pune",
    "chennai",
    "kolkata",
    "noida",
    "gurgaon",
    "gurugram",
    "ahmedabad",
    "jaipur",
  ];
  for (const city of indianCities) {
    if (lower.includes(city)) return "india";
  }

  return "";
}

// ────────────────────────────────────────────────────────────────────────────
// 4. Semantic Match (20%)
// ────────────────────────────────────────────────────────────────────────────

/** Fallback token-overlap similarity when embeddings are unavailable */
export function computeTokenOverlapSimilarity(
  textA: string,
  textB: string,
): number {
  if (!textA || !textB) return 30;

  const tokenize = (text: string): Set<string> => {
    const stop = new Set([
      "the",
      "a",
      "an",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "must",
      "shall",
      "can",
      "to",
      "of",
      "in",
      "for",
      "on",
      "with",
      "at",
      "by",
      "from",
      "as",
      "into",
      "through",
      "during",
      "before",
      "after",
      "above",
      "below",
      "between",
      "and",
      "but",
      "or",
      "nor",
      "not",
      "so",
      "yet",
      "it",
      "its",
      "this",
      "that",
      "these",
      "those",
      "we",
      "our",
      "you",
      "your",
      "they",
      "their",
      "he",
      "she",
      "him",
      "her",
      "who",
      "which",
      "what",
      "where",
      "when",
      "how",
      "all",
      "each",
      "every",
      "both",
      "few",
      "more",
      "most",
      "other",
      "some",
      "such",
      "no",
      "only",
      "own",
      "same",
      "than",
      "too",
      "very",
    ]);
    return new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 2 && !stop.has(w)),
    );
  };

  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  if (tokensA.size === 0 || tokensB.size === 0) return 30;

  // Dice coefficient
  const intersection = [...tokensA].filter((t) => tokensB.has(t)).length;
  const dice = (2 * intersection) / (tokensA.size + tokensB.size);

  // Scale to 0-100 with a boost since Dice tends to be low for long texts
  return Math.min(100, Math.round(dice * 100 * 2.5));
}

export async function computeSemanticMatch(
  jobDescription: string,
  candidateText: string,
): Promise<number> {
  // Try Gemini embeddings first
  if (isGeminiAvailable() && jobDescription.length > 20 && candidateText.length > 20) {
    try {
      const [jobEmbedding, candidateEmbedding] = await Promise.all([
        generateEmbedding(jobDescription.slice(0, 3000)),
        generateEmbedding(candidateText.slice(0, 3000)),
      ]);

      if (jobEmbedding.length > 0 && candidateEmbedding.length > 0) {
        const similarity = computeCosineSimilarity(
          jobEmbedding,
          candidateEmbedding,
        );
        // Cosine similarity ranges from -1 to 1, typically 0.3-0.9 for similar texts
        // Scale to 0-100 with the practical range
        const score = Math.round(Math.max(0, Math.min(1, (similarity - 0.3) / 0.5)) * 100);
        return Math.min(100, Math.max(0, score));
      }
    } catch (err) {
      console.warn("[RankingEngine] Gemini embeddings failed, falling back to token overlap:", err);
    }
  }

  // Fallback: token-overlap similarity
  return computeTokenOverlapSimilarity(jobDescription, candidateText);
}

// ────────────────────────────────────────────────────────────────────────────
// 5. Recommendation & Summary
// ────────────────────────────────────────────────────────────────────────────

export function getRecommendation(score: number): string {
  if (score > 85) return "Highly Recommended";
  if (score >= 70) return "Recommended";
  if (score >= 50) return "Potential Match";
  return "Low Match";
}

export function generateSummary(
  matched: string[],
  missing: string[],
  expScore: number,
  locScore: number,
  finalScore: number,
): string {
  const parts: string[] = [];

  if (matched.length > 0) {
    if (matched.length <= 3) {
      parts.push(`Strong ${matched.join(", ")} profile`);
    } else {
      parts.push(
        `Strong ${matched.slice(0, 3).join(", ")} profile with ${matched.length - 3} more matching skills`,
      );
    }
  }

  if (missing.length > 0) {
    if (missing.length <= 2) {
      parts.push(`Missing ${missing.join(" and ")}`);
    } else {
      parts.push(`Missing ${missing.length} required skills (${missing.slice(0, 2).join(", ")}...)`);
    }
  }

  if (expScore >= 90) {
    parts.push("Excellent experience fit");
  } else if (expScore >= 70) {
    parts.push("Good experience alignment");
  } else if (expScore < 50 && expScore > 0) {
    parts.push("Below required experience level");
  }

  if (locScore >= 90) {
    parts.push("Location-compatible");
  } else if (locScore < 40) {
    parts.push("Location may require relocation");
  }

  if (parts.length === 0) {
    if (finalScore >= 70) return "Solid overall candidate profile.";
    return "Limited profile match data available.";
  }

  return parts.join(". ") + ".";
}

// ────────────────────────────────────────────────────────────────────────────
// 6. Full Ranking Computation
// ────────────────────────────────────────────────────────────────────────────

export async function computeRanking(
  input: RankingInput,
): Promise<RankingResult> {
  // 1. Skills Match (40%)
  const skills = computeSkillsMatch(input.jobSkills, input.candidateSkills);

  // 2. Experience Match (25%)
  const experienceScore = computeExperienceMatch(
    input.jobExperience,
    input.candidateExperience,
  );

  // 3. Location Match (15%)
  const locationScore = computeLocationMatch(
    input.jobLocation,
    input.jobWorkplace,
    input.candidateLocation,
  );

  // 4. Semantic Match (20%)
  // Build candidate text from all available profile data
  const candidateText = [
    input.candidateSkills.join(", "),
    input.candidateExperience,
    input.candidateResumeText,
    input.candidateBio,
  ]
    .filter(Boolean)
    .join(" ");

  const semanticScore = await computeSemanticMatch(
    input.jobDescription,
    candidateText,
  );

  // 5. Final Composite Score
  const finalScore = Math.round(
    skills.score * 0.4 +
      experienceScore * 0.25 +
      locationScore * 0.15 +
      semanticScore * 0.2,
  );

  // 6. Recommendation
  const recommendation = getRecommendation(finalScore);

  // 7. Summary
  const summary = generateSummary(
    skills.matched,
    skills.missing,
    experienceScore,
    locationScore,
    finalScore,
  );

  // 8. Auto-shortlist
  const autoShortlisted = finalScore > 80;

  return {
    skillsScore: skills.score,
    experienceScore,
    locationScore,
    semanticScore,
    finalScore,
    recommendation,
    matchedSkills: skills.matched,
    missingSkills: skills.missing,
    summary,
    autoShortlisted,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// 7. Cache Hash Generation
// ────────────────────────────────────────────────────────────────────────────

export function generateJobHash(job: {
  skills?: string[];
  experience?: string;
  description?: string;
  location?: string;
}): string {
  const data = JSON.stringify({
    skills: (job.skills || []).map((s: string) => s.toLowerCase().trim()).sort(),
    experience: (job.experience || "").toLowerCase().trim(),
    description: (job.description || "").slice(0, 500).toLowerCase().trim(),
    location: (job.location || "").toLowerCase().trim(),
  });
  return createHash("md5").update(data).digest("hex");
}

export function generateCandidateHash(candidate: {
  skills?: string[];
  experience?: string;
  resumeText?: string;
  bio?: string;
}): string {
  const data = JSON.stringify({
    skills: (candidate.skills || []).map((s: string) => s.toLowerCase().trim()).sort(),
    experience: (candidate.experience || "").toLowerCase().trim(),
    resumeText: (candidate.resumeText || "").slice(0, 500).toLowerCase().trim(),
    bio: (candidate.bio || "").slice(0, 200).toLowerCase().trim(),
  });
  return createHash("md5").update(data).digest("hex");
}
