import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { auth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/dashboard/overview - Get dashboard statistics for authenticated user
router.get('/overview', auth, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // Get user's podcasts
    const podcasts = await prisma.podcast.findMany({
      where: { userId },
      include: {
        episodes: true,
      },
    });

    if (podcasts.length === 0) {
      return res.json({
        totalPodcasts: 0,
        totalEpisodes: 0,
        totalPlays: 0,
        topEpisodes: [],
        recentPlays: [],
      });
    }

    const episodeIds = podcasts.flatMap((p) => p.episodes.map((e) => e.id));

    // Get total plays
    const plays = await prisma.play.findMany({
      where: { episodeId: { in: episodeIds } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    // Get top episodes
    const topEpisodes = await prisma.episode.findMany({
      where: { id: { in: episodeIds } },
      include: {
        _count: {
          select: { plays: true },
        },
      },
      orderBy: {
        plays: {
          _count: 'desc',
        },
      },
      take: 5,
    });

    // Get plays per day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const playsPerDay = await prisma.play.groupBy({
      by: ['createdAt'],
      where: {
        episodeId: { in: episodeIds },
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: true,
    });

    return res.json({
      totalPodcasts: podcasts.length,
      totalEpisodes: episodeIds.length,
      totalPlays: plays.length,
      topEpisodes: topEpisodes.map((e) => ({
        id: e.id,
        title: e.title,
        plays: e._count.plays,
      })),
      recentPlays: plays.map((p) => ({
        id: p.id,
        episodeId: p.episodeId,
        createdAt: p.createdAt,
      })),
      playsPerDay,
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
