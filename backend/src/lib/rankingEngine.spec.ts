import { describe, it, expect } from "vitest";
import {
  parseYearsFromString,
  computeExperienceMatch,
  computeLocationMatch,
  computeSkillsMatch,
  computeTokenOverlapSimilarity,
} from "./rankingEngine";

describe("Ranking Engine", () => {
  describe("parseYearsFromString", () => {
    it("handles entry level strings", () => {
      expect(parseYearsFromString("Entry Level")).toBe(0);
      expect(parseYearsFromString("Fresher")).toBe(0);
      expect(parseYearsFromString("No experience required")).toBe(0);
    });

    it("handles explicit numbers and decimals", () => {
      expect(parseYearsFromString("3 Years")).toBe(3);
      expect(parseYearsFromString("1.5")).toBe(1.5);
      expect(parseYearsFromString("half a year")).toBe(0.5);
      expect(parseYearsFromString("18 months")).toBe(1.5);
    });

    it("handles text numbers", () => {
      expect(parseYearsFromString("five years")).toBe(5);
      expect(parseYearsFromString("one yr")).toBe(1);
    });

    it("handles ranges", () => {
      expect(parseYearsFromString("3-5 Years")).toBe(4);
      expect(parseYearsFromString("1.5-2.5")).toBe(2);
    });

    it("handles semantic seniority", () => {
      expect(parseYearsFromString("Senior Engineer")).toBe(5);
      expect(parseYearsFromString("Principal Developer")).toBe(8);
    });

    it("returns null for unparseable strings", () => {
      expect(parseYearsFromString("Competitive")).toBeNull();
      expect(parseYearsFromString("")).toBeNull();
    });
  });

  describe("computeExperienceMatch", () => {
    it("returns 100 for entry level jobs", () => {
      expect(computeExperienceMatch("Entry Level", "0 Years")).toBe(100);
      expect(computeExperienceMatch("0", "5")).toBe(100);
    });

    it("returns 100 for exact match or slight overqualification", () => {
      expect(computeExperienceMatch("3 Years", "3 Years")).toBe(100);
      expect(computeExperienceMatch("3 Years", "5 Years")).toBe(100);
    });

    it("diminishes slightly for extreme overqualification", () => {
      expect(computeExperienceMatch("2 Years", "10 Years")).toBe(85);
    });

    it("scores proportionally for under-qualified candidates", () => {
      expect(computeExperienceMatch("5 Years", "2 Years")).toBe(40);
      expect(computeExperienceMatch("4 Years", "3 Years")).toBe(75);
    });

    it("returns 50 if unable to parse", () => {
      expect(computeExperienceMatch("Unknown", "3")).toBe(50);
    });
  });

  describe("computeSkillsMatch", () => {
    it("handles perfect match", () => {
      const result = computeSkillsMatch(["React", "Node", "TypeScript"], ["React", "Node", "TypeScript"]);
      expect(result.score).toBe(100);
      expect(result.matched.length).toBe(3);
      expect(result.missing.length).toBe(0);
    });

    it("handles partial overlaps gracefully", () => {
      // Candidate has "React.js" instead of "React"
      const result = computeSkillsMatch(["React", "Node.js"], ["React.js", "Node"]);
      expect(result.score).toBe(100);
    });

    it("handles missing skills", () => {
      const result = computeSkillsMatch(["React", "Node", "MongoDB", "AWS"], ["React", "Node"]);
      expect(result.score).toBe(50);
      expect(result.missing).toEqual(["MongoDB", "AWS"]);
    });

    it("returns 50 when job has no skills", () => {
      expect(computeSkillsMatch([], ["React"]).score).toBe(50);
    });
  });

  describe("computeLocationMatch", () => {
    it("returns 100 for remote jobs", () => {
      expect(computeLocationMatch("New York", "Remote", "London")).toBe(100);
      expect(computeLocationMatch("Remote US", "On-site", "California")).toBe(100);
    });

    it("returns 100 for same city", () => {
      expect(computeLocationMatch("San Francisco, CA", "On-site", "San Francisco, CA")).toBe(100);
    });

    it("returns 80 for same state", () => {
      expect(computeLocationMatch("San Francisco, CA", "On-site", "Los Angeles, CA")).toBe(80);
    });

    it("returns 50 for same country", () => {
      expect(computeLocationMatch("New York, NY", "On-site", "Chicago, IL")).toBe(50); // Same country (USA)
    });

    it("returns 20 for different countries", () => {
      expect(computeLocationMatch("London, UK", "On-site", "New York, USA")).toBe(20);
    });

    it("handles neutral cases", () => {
      expect(computeLocationMatch("London", "On-site", "")).toBe(60);
    });
  });

  describe("computeTokenOverlapSimilarity", () => {
    it("calculates overlap correctly", () => {
      const textA = "We are looking for a senior React engineer with Node and AWS.";
      const textB = "Senior software engineer skilled in React, Node, and AWS.";
      const score = computeTokenOverlapSimilarity(textA, textB);
      expect(score).toBeGreaterThan(50);
    });

    it("handles disjoint texts", () => {
      const textA = "Frontend Vue developer";
      const textB = "Backend Java engineer";
      const score = computeTokenOverlapSimilarity(textA, textB);
      expect(score).toBeLessThan(40);
    });
  });
});
