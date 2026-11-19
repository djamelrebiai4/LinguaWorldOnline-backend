import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Admin: list users (placeholder for future admin operations)
router.get('/users', authMiddleware, async (_req, res) => {
  // In production, check admin role here
  res.json({ message: 'Admin endpoint - user list', users: [] });
});

export default router;
