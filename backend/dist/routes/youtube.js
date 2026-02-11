"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const youtube_1 = require("../utils/youtube");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
/**
 * GET /api/youtube/auth - Get YouTube OAuth2 authorization URL
 */
router.get('/auth', auth_1.auth, (_req, res) => {
    try {
        const authUrl = (0, youtube_1.getYouTubeAuthUrl)();
        return res.json({ authUrl });
    }
    catch (error) {
        console.error('YouTube auth URL error:', error);
        return res.status(500).json({ error: 'Failed to generate auth URL' });
    }
});
/**
 * GET /api/youtube/callback - Handle YouTube OAuth2 callback
 */
router.get('/callback', auth_1.auth, async (req, res) => {
    try {
        const { code } = req.query;
        if (!code || typeof code !== 'string') {
            return res.status(400).json({ error: 'Missing authorization code' });
        }
        // Exchange code for tokens
        const tokens = await (0, youtube_1.exchangeCodeForToken)(code);
        if (!tokens.access_token) {
            return res.status(400).json({ error: 'Failed to get access token' });
        }
        // TODO: Get channel info from YouTube to store
        // For now, store with placeholder
        const existingAccount = await prisma.youTubeAccount.findFirst({
            where: { userId: req.user.id },
        });
        const youtubeAccount = existingAccount
            ? await prisma.youTubeAccount.update({
                where: { id: existingAccount.id },
                data: {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token || undefined,
                    expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
                },
            })
            : await prisma.youTubeAccount.create({
                data: {
                    userId: req.user.id,
                    channelId: 'unknown',
                    channelTitle: 'YouTube Channel',
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token || undefined,
                    expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
                },
            });
        return res.json({
            success: true,
            message: 'YouTube account connected',
            accountId: youtubeAccount.id,
        });
    }
    catch (error) {
        console.error('YouTube callback error:', error);
        return res.status(500).json({ error: 'Failed to authenticate with YouTube' });
    }
});
/**
 * POST /api/youtube/upload - Upload episode to YouTube
 */
router.post('/upload', auth_1.auth, async (req, res) => {
    try {
        const { episodeId } = req.body;
        if (!episodeId) {
            return res.status(400).json({ error: 'Episode ID required' });
        }
        // Get episode with podcast info
        const episode = await prisma.episode.findUnique({
            where: { id: episodeId },
            include: { podcast: true },
        });
        if (!episode) {
            return res.status(404).json({ error: 'Episode not found' });
        }
        // Check if user owns the podcast
        if (episode.podcast.userId !== req.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }
        // Get YouTube account
        const youtubeAccount = await prisma.youTubeAccount.findFirst({
            where: { userId: req.user.id },
        });
        if (!youtubeAccount) {
            return res.status(400).json({
                error: 'YouTube account not connected',
                authUrl: (0, youtube_1.getYouTubeAuthUrl)(),
            });
        }
        // Return 202 Accepted immediately, process in background
        res.status(202).json({
            status: 'processing',
            message: 'Episode upload to YouTube started',
            episodeId,
            note: 'Processing video conversion and upload...',
        });
        // Process upload in background
        (async () => {
            try {
                console.log(`\n🚀 Starting YouTube upload for episode: ${episode.title}`);
                const youtubeId = await (0, youtube_1.processEpisodeForYouTube)(youtubeAccount.accessToken, episode.audioUrl, episode.podcast.coverUrl, episode.title, episode.description || '', episode.podcast.title, [episode.podcast.title, 'podcast', 'audio']);
                // Update episode with YouTube video ID
                await prisma.episode.update({
                    where: { id: episodeId },
                    data: { youtubeVideoId: youtubeId },
                });
                console.log(`✅ Episode successfully uploaded to YouTube: https://youtu.be/${youtubeId}`);
            }
            catch (error) {
                console.error(`❌ Failed to upload episode to YouTube:`, error);
            }
        })();
    }
    catch (error) {
        console.error('YouTube upload error:', error);
        res.status(500).json({ error: 'Failed to upload to YouTube' });
    }
});
/**
 * GET /api/youtube/status - Get YouTube account connection status
 */
router.get('/status', auth_1.auth, async (req, res) => {
    try {
        const youtubeAccount = await prisma.youTubeAccount.findFirst({
            where: { userId: req.user.id },
            select: {
                id: true,
                channelId: true,
                channelTitle: true,
                createdAt: true,
            },
        });
        if (!youtubeAccount) {
            return res.json({
                connected: false,
                authUrl: (0, youtube_1.getYouTubeAuthUrl)(),
            });
        }
        return res.json({
            connected: true,
            accountId: youtubeAccount.id,
            channelId: youtubeAccount.channelId,
            channelTitle: youtubeAccount.channelTitle,
            connectedAt: youtubeAccount.createdAt,
        });
    }
    catch (error) {
        console.error('YouTube status error:', error);
        return res.status(500).json({ error: 'Failed to get YouTube status' });
    }
});
/**
 * DELETE /api/youtube/disconnect - Disconnect YouTube account
 */
router.delete('/disconnect', auth_1.auth, async (req, res) => {
    try {
        await prisma.youTubeAccount.deleteMany({
            where: { userId: req.user.id },
        });
        return res.json({ success: true, message: 'YouTube account disconnected' });
    }
    catch (error) {
        console.error('YouTube disconnect error:', error);
        return res.status(500).json({ error: 'Failed to disconnect YouTube account' });
    }
});
exports.default = router;
