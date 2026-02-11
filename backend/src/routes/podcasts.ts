import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { auth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const CreatePodcastSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  slug: z.string().min(1),
  coverUrl: z.string().url().optional(),
  categoryId: z.string().optional(),
});

// GET /podcasts - Fetch all podcasts (public)
router.get('/', async (_req, res) => {
  try {
    const podcasts = await prisma.podcast.findMany({
      include: {
        category: true,
        episodes: {
          select: { id: true },
        },
        _count: {
          select: { episodes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(podcasts);
  } catch (error) {
    console.error('Get podcasts error:', error);
    return res.status(500).json({ error: 'Failed to fetch podcasts' });
  }
});

// POST /podcasts - Create new podcast (authenticated)
router.post('/', auth, async (req, res) => {
  try {
    const body = CreatePodcastSchema.parse(req.body);

    // Check if slug already exists
    const existingPodcast = await prisma.podcast.findUnique({
      where: { slug: body.slug },
    });

    if (existingPodcast) {
      return res.status(409).json({ error: 'Podcast slug already exists' });
    }

    const podcast = await prisma.podcast.create({
      data: {
        title: body.title,
        description: body.description,
        slug: body.slug,
        coverUrl: body.coverUrl,
        categoryId: body.categoryId,
        userId: req.user!.id,
      },
      include: { category: true },
    });

    return res.status(201).json(podcast);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Create podcast error:', error);
    return res.status(500).json({ error: 'Failed to create podcast' });
  }
});

// GET /podcasts/:id - Fetch single podcast with episodes
router.get('/:id', async (req, res) => {
  try {
    const podcast = await prisma.podcast.findUnique({
      where: { id: req.params.id },
      include: {
        category: true,
        episodes: {
          orderBy: { publishedAt: 'desc' },
        },
      },
    });

    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    return res.json(podcast);
  } catch (error) {
    console.error('Get podcast error:', error);
    return res.status(500).json({ error: 'Failed to fetch podcast' });
  }
});

// PUT /podcasts/:id - Update podcast (authenticated)
router.put('/:id', auth, async (req, res) => {
  try {
    const podcast = await prisma.podcast.findUnique({
      where: { id: req.params.id },
    });

    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    if (podcast.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const body = CreatePodcastSchema.partial().parse(req.body);

    const updated = await prisma.podcast.update({
      where: { id: req.params.id },
      data: body,
    });

    return res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error('Update podcast error:', error);
    return res.status(500).json({ error: 'Failed to update podcast' });
  }
});

// DELETE /podcasts/:id - Delete podcast (authenticated)
router.delete('/:id', auth, async (req, res) => {
  try {
    const podcast = await prisma.podcast.findUnique({
      where: { id: req.params.id },
    });

    if (!podcast) {
      return res.status(404).json({ error: 'Podcast not found' });
    }

    if (podcast.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Delete all episodes first
    await prisma.episode.deleteMany({
      where: { podcastId: req.params.id },
    });

    // Then delete podcast
    const deleted = await prisma.podcast.delete({
      where: { id: req.params.id },
    });

    return res.json({ message: 'Podcast deleted successfully', podcast: deleted });
  } catch (error) {
    console.error('Delete podcast error:', error);
    return res.status(500).json({ error: 'Failed to delete podcast' });
  }
});

export default router;
