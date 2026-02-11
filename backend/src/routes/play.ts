import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createPlayIdentifier } from '../utils/hash';

const router = Router();
const prisma = new PrismaClient();

/**
 * Get client IP address from request
 */
function getClientIp(req: Request): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
    req.socket.remoteAddress ||
    'unknown'
  );
}

// GET /play/:episodeId - Track play and redirect to audio
router.get('/:episodeId', async (req: Request, res: Response) => {
  try {
    const { episodeId } = req.params;

    // Find episode
    const episode = await prisma.episode.findUnique({
      where: { id: episodeId },
    });

    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    // Check referer header (GDPR-compliant: only count website plays)
    const referer = req.headers.referer || '';
    const isFromWebsite = referer.includes('localhost:3000') || 
                          referer.includes('/podcasts');

    // Only track plays from website (not from external podcast apps)
    if (isFromWebsite) {
      const ip = getClientIp(req);
      const userAgent = req.headers['user-agent'] || 'unknown';
      const identifier = createPlayIdentifier(ip, userAgent);

      // Log play
      await prisma.play.create({
        data: {
          identifier,
          referer: referer || null,
          episodeId,
        },
      });
    }

    // Redirect to audio file
    return res.redirect(episode.audioUrl);
  } catch (error) {
    console.error('Play tracking error:', error);
    // Still redirect even if tracking fails
    const episode = await prisma.episode.findUnique({
      where: { id: req.params.episodeId },
    });
    if (episode) {
      return res.redirect(episode.audioUrl);
    }
    res.status(500).json({ error: 'Failed to process play request' });
  }
});

export default router;
