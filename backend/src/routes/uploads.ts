import { Router } from 'express';

const router = Router();

// POST /uploads/presign - Generate presigned URL for MinIO upload
router.post('/presign', async (req, res) => {
  // TODO: Implement presigned URL generation with MinIO SDK
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;
