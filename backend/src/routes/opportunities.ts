import { Router } from "express";
import { requireAuth, getRequestUserId } from "../middlewares/requireAuth";
import { Opportunity } from "../models/Opportunity";
import { isDBConnected } from "../lib/mongodb";
import { getMemOpportunities, registerMemOpportunity } from "../lib/memoryDb";

const router = Router();

router.get("/opportunities", async (req, res) => {
  if (!isDBConnected()) {
    res.json(getMemOpportunities(req.query.type as string));
    return;
  }
  const { type } = req.query;
  const filter: Record<string, unknown> = {};
  if (type && type !== "all") filter.type = type;

  try {
    const opportunities = await Opportunity.find(filter).sort({ createdAt: -1 });
    res.json(opportunities);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch opportunities" });
  }
});

router.post("/opportunities/:id/register", requireAuth, async (req, res) => {
  if (!isDBConnected()) {
    const oppRes = registerMemOpportunity(req.params.id as string, getRequestUserId(req) as string);
    if (!oppRes) { res.status(404).json({ error: "Opportunity not found" }); return; }
    if (oppRes === "Already registered") { res.status(409).json({ error: "Already registered" }); return; }
    res.json({ success: true, registered: oppRes.registered });
    return;
  }
  const userId = getRequestUserId(req);
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) {
      res.status(404).json({ error: "Opportunity not found" });
      return;
    }
    if (opp.registeredUsers.includes(userId! as never)) {
      res.status(409).json({ error: "Already registered" });
      return;
    }
    opp.registeredUsers.push(userId! as never);
    opp.registered += 1;
    await opp.save();
    res.json({ success: true, registered: opp.registered });
  } catch (err) {
    res.status(500).json({ error: "Failed to register" });
  }
});

export default router;
