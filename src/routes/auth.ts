import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { generalRateLimit } from '../middleware/rateLimit';
import { AuthenticatedRequest } from '../middleware/auth';

const router = Router();

router.get('/me', generalRateLimit, authMiddleware, (req, res) => {
  const authenticatedReq = req as AuthenticatedRequest;
  res.json({
    userId: authenticatedReq.userId,
    email: authenticatedReq.userEmail,
  });
});

export default router;
