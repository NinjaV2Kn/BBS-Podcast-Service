import { Router } from 'express';

const router = Router();

// GET /feeds/:slug.xml - Generate RSS feed
router.get('/:slug.xml', async (req, res) => {
  const { slug } = req.params;
  // TODO: Generate RSS XML from podcast episodes
  res.status(501).send('RSS feed not implemented yet');
});

export default router;
