import { Router } from "express";
import { requireAuth, getRequestUserId } from "../middlewares/requireAuth";
import { Interview } from "../models/Interview";
import { User } from "../models/User";
import { isEnvAdminUserId } from "../lib/envAdmin";
import { isDBConnected } from "../lib/mongodb";
import { getMemInterviews, createMemInterview } from "../lib/memoryDb";
import { defaultInterviewRounds, syncInterviewToCalendar } from "../lib/calendarSync";
import {
  getMemInterviews,
  createMemInterview,
  updateMemInterview,
  updateMemInterviewRound,
  deleteMemInterview,
  getMemUser,
} from "../lib/memoryDb";

const router = Router();
const paramToString = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

router.get("/interviews", requireAuth, async (req, res) => {
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (isEnvAdminUserId(userId)) {
    res.json([]);
    return;
  }

  if (!isDBConnected()) {
    const interviews = getMemInterviews(userId);
    res.json(interviews);
    return;
  }
  try {
    const interviews = await Interview.find({
      $or: [
        { recruiterClerkId: userId },
        { candidateClerkId: userId },
      ],
    }).sort({ date: 1, time: 1 });
    res.json(interviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch interviews" });
  }
});

router.post("/interviews", requireAuth, async (req, res) => {
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!isDBConnected()) {
    const result = await createMemInterview(userId, req.body);
    if (result.error) {
      res.status(result.status || 500).json({ error: result.error });
      return;
    }
    res.status(result.status || 201).json(result.data);
    return;
  }

  const user = await User.findOne({ clerkId: userId }).select("role");
  if (!user || (user.role !== "recruiter" && user.role !== "admin")) {
    res.status(403).json({ error: "Only recruiters can schedule interviews" });
    return;
  }
  const { candidateName, candidateAvatar, candidateClerkId, jobTitle, company, date, time, type, notes } = req.body;

  if (!candidateName || !jobTitle || !date || !time) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  try {
    const calendar = await syncInterviewToCalendar({
      candidateName,
      jobTitle,
      company,
      date,
      time,
      type,
      notes,
    });
    const interview = await Interview.create({
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
      rounds: req.body.rounds || defaultInterviewRounds(type || "Technical"),
      calendar,
    });
    res.status(201).json(interview);
  } catch (err) {
    res.status(500).json({ error: "Failed to schedule interview" });
  }
});

router.patch("/interviews/:id", requireAuth, async (req, res) => {
  const interviewId = paramToString(req.params.id);
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!isDBConnected()) {
    const memUser = getMemUser(userId);
    const isAdmin = memUser?.role === "admin";
    const result = updateMemInterview(interviewId, userId, req.body, isAdmin);
    if (result.error) {
      res.status(result.status || 500).json({ error: result.error });
      return;
    }
    res.json(result.data);
    return;
  }
  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ error: "Interview not found" });
      return;
    }
    const user = await User.findOne({ clerkId: userId }).select("role");
    const isOwner = interview.recruiterClerkId === userId;
    const isAdmin = user?.role === "admin";
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: "Forbidden: only the scheduling recruiter can modify this interview" });
      return;
    }
    const shouldResyncCalendar =
      req.body.date !== undefined ||
      req.body.time !== undefined ||
      req.body.jobTitle !== undefined ||
      req.body.candidateName !== undefined ||
      req.body.type !== undefined;
    const update: Record<string, unknown> = { ...req.body };

    if (shouldResyncCalendar) {
      const nextInterview = {
        ...(interview.toObject() as any),
        ...req.body,
      };
      update.calendar = await syncInterviewToCalendar({
        id: interviewId,
        candidateName: nextInterview.candidateName,
        jobTitle: nextInterview.jobTitle,
        company: nextInterview.company,
        date: nextInterview.date,
        time: nextInterview.time,
        type: nextInterview.type,
        notes: nextInterview.notes,
      });
    }

    const updated = await Interview.findByIdAndUpdate(
      interviewId,
      { $set: update },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update interview" });
  }
});

router.patch("/interviews/:id/rounds/:roundId", requireAuth, async (req, res) => {
  const interviewId = paramToString(req.params.id);
  const roundId = paramToString(req.params.roundId);
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { status } = req.body;
  const validStatuses = ["completed", "active", "locked", "scheduled", "cancelled"];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: "Invalid round status" });
    return;
  }

  if (!isDBConnected()) {
    const memUser = getMemUser(userId);
    const isAdmin = memUser?.role === "admin";
    const result = updateMemInterviewRound(interviewId, roundId, userId, status, isAdmin);
    if (result.error) {
      res.status(result.status || 500).json({ error: result.error });
      return;
    }
    res.json(result.data);
    return;
  }

  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ error: "Interview not found" });
      return;
    }
    const user = await User.findOne({ clerkId: userId }).select("role");
    const isOwner = interview.recruiterClerkId === userId;
    const isAdmin = user?.role === "admin";
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: "Forbidden: only the scheduling recruiter can modify this interview" });
      return;
    }

    const updated = await Interview.findOneAndUpdate(
      { _id: interviewId, "rounds._id": roundId },
      { $set: { "rounds.$.status": status } },
      { new: true },
    );

    if (!updated) {
      res.status(404).json({ error: "Interview round not found" });
      return;
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Failed to update interview round" });
  }
});

router.post("/interviews/:id/sync-calendar", requireAuth, async (req, res) => {
  const interviewId = paramToString(req.params.id);
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!isDBConnected()) {
    const memUser = getMemUser(userId);
    const isAdmin = memUser?.role === "admin";
    const result = updateMemInterview(interviewId, userId, {}, isAdmin);
    if (result.error) {
      res.status(result.status || 500).json({ error: result.error });
      return;
    }
    const calendar = await syncInterviewToCalendar({
      id: result.data._id,
      candidateName: result.data.candidateName,
      jobTitle: result.data.jobTitle,
      company: result.data.company,
      date: result.data.date,
      time: result.data.time,
      type: result.data.type,
      notes: result.data.notes,
    });
    result.data.calendar = calendar;
    res.json(result.data);
    return;
  }

  try {
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      res.status(404).json({ error: "Interview not found" });
      return;
    }
    const user = await User.findOne({ clerkId: userId }).select("role");
    const isOwner = interview.recruiterClerkId === userId;
    const isAdmin = user?.role === "admin";
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: "Forbidden: only the scheduling recruiter can sync this interview" });
      return;
    }

    const calendar = await syncInterviewToCalendar({
      id: interviewId,
      candidateName: interview.candidateName,
      jobTitle: interview.jobTitle,
      company: interview.company,
      date: interview.date,
      time: interview.time,
      type: interview.type,
      notes: interview.notes,
    });
    interview.set("calendar", calendar);
    await interview.save();
    res.json(interview);
  } catch (err) {
    res.status(500).json({ error: "Failed to sync calendar event" });
  }
});

router.delete("/interviews/:id", requireAuth, async (req, res) => {
  const interviewId = paramToString(req.params.id);
  const userId = getRequestUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!isDBConnected()) {
    const memUser = getMemUser(userId);
    const isAdmin = memUser?.role === "admin";
    const result = deleteMemInterview(interviewId, userId, isAdmin);
    if (result.error) {
      res.status(result.status || 500).json({ error: result.error });
      return;
    }
    res.json({ success: true });
    return;
  }
  try {
    const interview = await Interview.findById(interviewId).select("recruiterClerkId");
    if (!interview) {
      res.status(404).json({ error: "Interview not found" });
      return;
    }
    const user = await User.findOne({ clerkId: userId }).select("role");
    const isOwner = interview.recruiterClerkId === userId;
    const isAdmin = user?.role === "admin";
    if (!isOwner && !isAdmin) {
      res.status(403).json({ error: "Forbidden: only the scheduling recruiter can cancel this interview" });
      return;
    }
    await Interview.findByIdAndDelete(interviewId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to cancel interview" });
  }
});

export default router;
