import { Router, type IRouter } from "express";
import { Course } from "../models/Course";

const router: IRouter = Router();

// Get upskilling recommendations based on missing skills
router.post("/upskill/recommend", async (req, res) => {
  try {
    const { missingSkills } = req.body;
    
    if (!Array.isArray(missingSkills) || missingSkills.length === 0) {
      res.json([]);
      return;
    }

    // Convert requested skills to lower case regexes for matching
    const skillRegexes = missingSkills.map(skill => new RegExp(skill, "i"));

    // Find active courses that target ANY of the missing skills
    const courses = await Course.find({
      isActive: true,
      targetSkill: { $in: skillRegexes },
    }).limit(10);

    res.json(courses);
  } catch (error) {
    console.error("Error recommending courses:", error);
    res.status(500).json({ error: "Failed to fetch course recommendations" });
  }
});

export default router;
