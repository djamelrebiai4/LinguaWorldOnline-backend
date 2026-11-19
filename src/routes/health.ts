import { Router } from 'express';
import { generalRateLimit } from '../middleware/rateLimit';

const router = Router();

router.get('/health', generalRateLimit, (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
