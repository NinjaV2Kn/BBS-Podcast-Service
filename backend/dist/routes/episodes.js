"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const CreateEpisodeSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    audioUrl: zod_1.z.string().min(1),
    podcastId: zod_1.z.string().optional(),
    podcastTitle: zod_1.z.string().optional(),
});
// GET /episodes - Fetch all episodes
router.get('/', async (req, res) => {
    try {
        const episodes = await prisma.episode.findMany({
            include: { podcast: true, plays: true },
            orderBy: { publishedAt: 'desc' },
        });
        res.json(episodes);
    }
    catch (error) {
        console.error('Get episodes error:', error);
        res.status(500).json({ error: 'Failed to fetch episodes' });
    }
});
// POST /episodes - Create new episode
router.post('/', auth_1.auth, async (req, res) => {
    try {
        const body = CreateEpisodeSchema.parse(req.body);
        // Find or create podcast
        let podcastId = body.podcastId;
        if (!podcastId && body.podcastTitle) {
            const podcast = await prisma.podcast.findFirst({
                where: { userId: req.user.id, title: body.podcastTitle },
            });
            if (podcast) {
                podcastId = podcast.id;
            }
            else {
                // Create new podcast
                const newPodcast = await prisma.podcast.create({
                    data: {
                        title: body.podcastTitle,
                        userId: req.user.id,
                        slug: body.podcastTitle.toLowerCase().replace(/\s+/g, '-'),
                    },
                });
                podcastId = newPodcast.id;
            }
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
        res.status(201).json(episode);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Create episode error:', error);
        res.status(500).json({ error: 'Failed to create episode' });
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
        res.json(episode);
    }
    catch (error) {
        console.error('Get episode error:', error);
        res.status(500).json({ error: 'Failed to fetch episode' });
    }
});
exports.default = router;
