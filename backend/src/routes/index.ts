import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import jobsRouter from "./jobs";
import applicationsRouter from "./applications";
import postsRouter from "./posts";
import opportunitiesRouter from "./opportunities";
import interviewsRouter from "./interviews";
import resumeRouter from "./resume";
import adminRouter from "./admin";
import chatRouter from "./chat";
import aiCoachRouter from "./aiCoach";
import authRouter from "./auth";
import communicationsRouter from "./communications";
import rankingRouter from "./ranking";

const router: IRouter = Router();

router.use(authRouter);

router.use(healthRouter);
router.use(usersRouter);
router.use(jobsRouter);
router.use(applicationsRouter);
router.use(postsRouter);
router.use(opportunitiesRouter);
router.use(interviewsRouter);
router.use(resumeRouter);
router.use(adminRouter);
router.use(chatRouter);
router.use(aiCoachRouter);
router.use(communicationsRouter);
router.use(rankingRouter);

export default router;
