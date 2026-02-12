import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { auth } from '../middleware/auth';
import { normalizeUrl } from '../utils/hash';

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
    
    // Normalize URLs in episodes for CSP compliance
    const normalized = episodes.map(ep => {
      const podcast = ep.podcast;
      return {
        ...ep,
        audioUrl: normalizeUrl(ep.audioUrl),
        podcast: podcast ? {
          ...podcast,
          coverUrl: normalizeUrl(podcast.coverUrl),
        } : null,
      };
    });
    
    return res.json(normalized);
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
      try {
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
              coverUrl: body.coverUrl || null,
            },
          });
          podcastId = newPodcast.id;
        }
      } catch (podcastError) {
        console.error('Podcast lookup/creation error:', podcastError);
        return res.status(500).json({ error: 'Failed to create or find podcast' });
      }
    } else if (podcastId && body.coverUrl) {
      // Update existing podcast with cover if provided
      try {
        await prisma.podcast.update({
          where: { id: podcastId },
          data: { coverUrl: body.coverUrl },
        });
      } catch (updateError) {
        console.error('Podcast update error:', updateError);
      }
    }
    
    if (!podcastId) {
      return res.status(400).json({ error: 'Podcast ID or title required' });
    }
    
    // Create episode
    const episode = await prisma.episode.create({
      data: {
        title: body.title,
        description: body.description || null,
        audioUrl: body.audioUrl,
        podcastId,
      },
      include: { podcast: true },
    });
    
    // Normalize URLs in response
    const podcast = episode.podcast;
    const response = {
      ...episode,
      audioUrl: normalizeUrl(episode.audioUrl),
      podcast: podcast ? {
        ...podcast,
        coverUrl: normalizeUrl(podcast.coverUrl),
      } : null,
    };
    
    return res.status(201).json(response);
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
    
    // Normalize URLs in response
    const response = {
      ...episode,
      audioUrl: normalizeUrl(episode.audioUrl),
      podcast: episode.podcast ? {
        ...episode.podcast,
        coverUrl: normalizeUrl(episode.podcast.coverUrl),
      } : null,
    };
    
    return res.json(response);
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

    return res.json({ message: 'Episode deleted successfully' });
  } catch (error) {
    console.error('Delete episode error:', error);
    return res.status(500).json({ error: 'Failed to delete episode' });
  }
});

export default router;
