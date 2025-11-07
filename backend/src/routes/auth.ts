import { Router } from 'express';

const router = Router();

// POST /auth/signup
router.post('/signup', async (req, res) => {
  // TODO: Implement signup with Argon2 hashing
  res.status(501).json({ message: 'Not implemented yet' });
});

// POST /auth/login
router.post('/login', async (req, res) => {
  // TODO: Implement login with JWT
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
