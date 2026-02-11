import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { auth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const CreateEpisodeSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  audioUrl: z.string().min(1),
  podcastId: z.string().optional(),
  podcastTitle: z.string().optional(),
  coverUrl: z.string().optional(),
});

// GET /episodes - Fetch all episodes
router.get('/', async (_req, res) => {
  try {
    const episodes = await prisma.episode.findMany({
      include: { podcast: true, plays: true },
      orderBy: { publishedAt: 'desc' },
    });
    return res.json(episodes);
  } catch (error) {
    console.error('Get episodes error:', error);
    return res.status(500).json({ error: 'Failed to fetch episodes' });
  }
});

// POST /episodes - Create new episode
router.post('/', auth, async (req, res) => {
  try {
    const body = CreateEpisodeSchema.parse(req.body);
    
    // Find or create podcast
    let podcastId = body.podcastId;
    if (!podcastId && body.podcastTitle) {
      const podcast = await prisma.podcast.findFirst({
        where: { userId: req.user!.id, title: body.podcastTitle },
      });
      
      if (podcast) {
        podcastId = podcast.id;
      } else {
        // Create new podcast
        const newPodcast = await prisma.podcast.create({
          data: {
            title: body.podcastTitle,
            userId: req.user!.id,
            slug: body.podcastTitle.toLowerCase().replace(/\s+/g, '-'),
            coverUrl: body.coverUrl,
          },
        });
        podcastId = newPodcast.id;
      }
    } else if (podcastId && body.coverUrl) {
      // Update existing podcast with cover if provided
      await prisma.podcast.update({
        where: { id: podcastId },
        data: { coverUrl: body.coverUrl },
      });
    }
    
    if (!podcastId) {
      return res.status(400).json({ error: 'Podcast ID or title required' });
    }
    
    // Create episode
    const episode = await prisma.episode.create({
      data: {
        title: body.title,
        description: body.description,
        audioUrl: body.audioUrl,
        podcastId,
      },
      include: { podcast: true },
    });
    
    return res.status(201).json(episode);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create episode error:', error);
    return res.status(500).json({ error: 'Failed to create episode' });
  }
});

// GET /episodes/:id - Fetch single episode
router.get('/:id', async (req, res) => {
  try {
    const episode = await prisma.episode.findUnique({
      where: { id: req.params.id },
      include: { podcast: true, plays: true },
    });
    
    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }
    
    return res.json(episode);
  } catch (error) {
    console.error('Get episode error:', error);
    return res.status(500).json({ error: 'Failed to fetch episode' });
  }
});

// DELETE /episodes/:id - Delete episode
router.delete('/:id', auth, async (req, res) => {
  try {
    const episode = await prisma.episode.findUnique({
      where: { id: req.params.id },
      include: { podcast: true },
    });

    if (!episode) {
      return res.status(404).json({ error: 'Episode not found' });
    }

    // Verify user owns the podcast
    if (episode.podcast.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Delete all plays for this episode
    await prisma.play.deleteMany({
      where: { episodeId: req.params.id },
    });

    // Delete episode
    await prisma.episode.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'Episode deleted successfully' });
  } catch (error) {
    console.error('Delete episode error:', error);
    res.status(500).json({ error: 'Failed to delete episode' });
  }
});

export default router;
