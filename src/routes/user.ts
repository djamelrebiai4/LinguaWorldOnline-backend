import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { strictRateLimit } from '../middleware/rateLimit';
import { supabaseAdmin } from '../config/supabase';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// Get user progress (authenticated)
router.get('/progress', authMiddleware, strictRateLimit, async (req, res) => {
  const authenticatedReq = req as AuthenticatedRequest;
  const userId = authenticatedReq.userId!;
  const { data, error } = await supabaseAdmin
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single();
  if (error) {
    // Return empty progress if not found yet
    return res.json({ userId, xp: 0, level: 1, completedQuests: [] });
  }
  res.json(data);
});

export default router;
