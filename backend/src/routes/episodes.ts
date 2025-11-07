import { Router } from 'express';

const router = Router();

// GET /episodes
router.get('/', async (req, res) => {
  // TODO: Fetch all episodes from Prisma
  res.status(501).json({ message: 'Not implemented yet' });
});

// POST /episodes
router.post('/', async (req, res) => {
  // TODO: Create new episode with Zod validation
  res.status(501).json({ message: 'Not implemented yet' });
});

// GET /episodes/:id
router.get('/:id', async (req, res) => {
  // TODO: Fetch single episode
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
