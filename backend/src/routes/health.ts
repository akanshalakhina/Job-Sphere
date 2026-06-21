import { Router, type IRouter } from 'express';
import { isDBConnected } from '../lib/mongodb';

const router: IRouter = Router();

router.get('/healthz', (_req, res) => {
  if (process.env.MONGODB_URI && !isDBConnected()) {
    res.status(503).json({ status: 'connecting' });
    return;
  }
  res.json({ status: 'ok' });
});

export default router;
