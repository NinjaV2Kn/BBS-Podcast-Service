import { Router } from 'express';

const router = Router();

// GET /play/:episodeId - Track play and redirect to audio
router.get('/:episodeId', async (req, res) => {
  const { episodeId } = req.params;
  // TODO: 
  // 1. Hash IP + User-Agent
  // 2. Check referer header (only website plays)
  // 3. Log play to database
  // 4. Redirect to MinIO audio URL
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
