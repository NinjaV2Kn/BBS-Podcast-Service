import { Router } from 'express';

const router = Router();

// GET /podcasts
router.get('/', async (req, res) => {
  // TODO: Fetch all podcasts
  res.status(501).json({ message: 'Not implemented yet' });
});

// POST /podcasts
router.post('/', async (req, res) => {
  // TODO: Create new podcast
  res.status(501).json({ message: 'Not implemented yet' });
});

// GET /podcasts/:id
router.get('/:id', async (req, res) => {
  // TODO: Fetch single podcast
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
