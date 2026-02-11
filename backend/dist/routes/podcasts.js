"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const CreatePodcastSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    slug: zod_1.z.string().min(1),
    coverUrl: zod_1.z.string().url().optional(),
});
// GET /podcasts - Fetch all podcasts (public)
router.get('/', async (req, res) => {
    try {
        const podcasts = await prisma.podcast.findMany({
            include: {
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
    }
    catch (error) {
        console.error('Get podcasts error:', error);
        res.status(500).json({ error: 'Failed to fetch podcasts' });
    }
});
// POST /podcasts - Create new podcast (authenticated)
router.post('/', auth_1.auth, async (req, res) => {
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
                userId: req.user.id,
            },
        });
        res.status(201).json(podcast);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Create podcast error:', error);
        res.status(500).json({ error: 'Failed to create podcast' });
    }
});
// GET /podcasts/:id - Fetch single podcast with episodes
router.get('/:id', async (req, res) => {
    try {
        const podcast = await prisma.podcast.findUnique({
            where: { id: req.params.id },
            include: {
                episodes: {
                    orderBy: { publishedAt: 'desc' },
                },
            },
        });
        if (!podcast) {
            return res.status(404).json({ error: 'Podcast not found' });
        }
        res.json(podcast);
    }
    catch (error) {
        console.error('Get podcast error:', error);
        res.status(500).json({ error: 'Failed to fetch podcast' });
    }
});
// PUT /podcasts/:id - Update podcast (authenticated)
router.put('/:id', auth_1.auth, async (req, res) => {
    try {
        const podcast = await prisma.podcast.findUnique({
            where: { id: req.params.id },
        });
        if (!podcast) {
            return res.status(404).json({ error: 'Podcast not found' });
        }
        if (podcast.userId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        const body = CreatePodcastSchema.partial().parse(req.body);
        const updated = await prisma.podcast.update({
            where: { id: req.params.id },
            data: body,
        });
        res.json(updated);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Update podcast error:', error);
        res.status(500).json({ error: 'Failed to update podcast' });
    }
});
exports.default = router;
