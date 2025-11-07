import { Router } from 'express';

const router = Router();

// GET /api/dashboard/overview - Aggregate statistics
router.get('/overview', async (req, res) => {
  // TODO: 
  // - Total plays
  // - Top episodes
  // - Plays per day (last 30 days)
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
