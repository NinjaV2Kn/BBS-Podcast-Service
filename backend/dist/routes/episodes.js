"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const hash_1 = require("../utils/hash");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
const CreateEpisodeSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    audioUrl: zod_1.z.string().min(1),
    podcastId: zod_1.z.string().optional(),
    podcastTitle: zod_1.z.string().optional(),
    coverUrl: zod_1.z.string().optional(),
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
                audioUrl: (0, hash_1.normalizeUrl)(ep.audioUrl),
                podcast: podcast ? {
                    ...podcast,
                    coverUrl: (0, hash_1.normalizeUrl)(podcast.coverUrl),
                } : null,
            };
        });
        return res.json(normalized);
    }
    catch (error) {
        console.error('Get episodes error:', error);
        return res.status(500).json({ error: 'Failed to fetch episodes' });
    }
});
// POST /episodes - Create new episode
router.post('/', auth_1.auth, async (req, res) => {
    try {
        console.log('=== EPISODE CREATION REQUEST ===');
        console.log('User:', req.user);
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        // Verify user exists in database
        const userExists = await prisma.user.findUnique({
            where: { id: req.user.id },
        });
        if (!userExists) {
            console.error('❌ User not found in database:', req.user.id);
            return res.status(401).json({
                error: 'User session invalid. Please log in again.',
                reason: 'User record not found'
            });
        }
        console.log('✅ User verified in database');
        const body = CreateEpisodeSchema.parse(req.body);
        console.log('Validation passed. Parsed body:', body);
        // Find or create podcast
        let podcastId = body.podcastId;
        console.log('Initial podcastId:', podcastId);
        console.log('Podcast title:', body.podcastTitle);
        if (!podcastId && body.podcastTitle) {
            try {
                console.log('Looking for existing podcast:', body.podcastTitle);
                const podcast = await prisma.podcast.findFirst({
                    where: { userId: req.user.id, title: body.podcastTitle },
                });
                console.log('Podcast search result:', podcast);
                if (podcast) {
                    podcastId = podcast.id;
                    console.log('Using existing podcast ID:', podcastId);
                }
                else {
                    // Create new podcast
                    console.log('Creating new podcast...');
                    const newPodcast = await prisma.podcast.create({
                        data: {
                            title: body.podcastTitle,
                            userId: req.user.id,
                            slug: body.podcastTitle.toLowerCase().replace(/\s+/g, '-'),
                            coverUrl: body.coverUrl || null,
                        },
                    });
                    podcastId = newPodcast.id;
                    console.log('Created new podcast:', newPodcast.id);
                }
            }
            catch (podcastError) {
                console.error('❌ Podcast lookup/creation error:', podcastError);
                throw podcastError;
            }
        }
        else if (podcastId && body.coverUrl) {
            // Update existing podcast with cover if provided
            try {
                console.log('Updating podcast with cover...');
                await prisma.podcast.update({
                    where: { id: podcastId },
                    data: { coverUrl: body.coverUrl },
                });
                console.log('Podcast updated successfully');
            }
            catch (updateError) {
                console.error('Podcast update error:', updateError);
            }
        }
        if (!podcastId) {
            console.error('❌ No podcast ID after processing');
            return res.status(400).json({ error: 'Podcast ID or title required' });
        }
        console.log('Creating episode with podcastId:', podcastId);
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
        console.log('✅ Episode created successfully:', episode.id);
        // Normalize URLs in response
        const podcast = episode.podcast;
        const response = {
            ...episode,
            audioUrl: (0, hash_1.normalizeUrl)(episode.audioUrl),
            podcast: podcast ? {
                ...podcast,
                coverUrl: (0, hash_1.normalizeUrl)(podcast.coverUrl),
            } : null,
        };
        console.log('✅ Episode creation response normalized and ready to send');
        return res.status(201).json(response);
    }
    catch (error) {
        console.error('=== EPISODE CREATION ERROR ===');
        console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
        console.error('Error message:', error instanceof Error ? error.message : String(error));
        console.error('Full error:', error);
        if (error instanceof zod_1.z.ZodError) {
            console.error('Validation error details:', error.errors);
            return res.status(400).json({ error: error.errors[0].message });
        }
        return res.status(500).json({ error: 'Failed to create episode', details: error instanceof Error ? error.message : String(error) });
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
            audioUrl: (0, hash_1.normalizeUrl)(episode.audioUrl),
            podcast: episode.podcast ? {
                ...episode.podcast,
                coverUrl: (0, hash_1.normalizeUrl)(episode.podcast.coverUrl),
            } : null,
        };
        return res.json(response);
    }
    catch (error) {
        console.error('Get episode error:', error);
        return res.status(500).json({ error: 'Failed to fetch episode' });
    }
});
// DELETE /episodes/:id - Delete episode
router.delete('/:id', auth_1.auth, async (req, res) => {
    try {
        const episode = await prisma.episode.findUnique({
            where: { id: req.params.id },
            include: { podcast: true },
        });
        if (!episode) {
            return res.status(404).json({ error: 'Episode not found' });
        }
        // Verify user owns the podcast
        if (episode.podcast.userId !== req.user.id) {
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
    }
    catch (error) {
        console.error('Delete episode error:', error);
        return res.status(500).json({ error: 'Failed to delete episode' });
    }
});
exports.default = router;
