"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const hash_1 = require("../utils/hash");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
/**
 * Get client IP address from request
 */
function getClientIp(req) {
    return (req.headers['x-forwarded-for']?.split(',')[0].trim() ||
        req.socket.remoteAddress ||
        'unknown');
}
// GET /play/:episodeId - Track play and redirect to audio
router.get('/:episodeId', async (req, res) => {
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
        const host = req.get('host') || '';
        const isFromWebsite = referer.includes(host) ||
            referer.includes('localhost:3000') ||
            referer.includes('/podcasts') ||
            referer.includes('/community');
        // Only track plays from website (not from external podcast apps)
        if (isFromWebsite) {
            const ip = getClientIp(req);
            const userAgent = req.headers['user-agent'] || 'unknown';
            const identifier = (0, hash_1.createPlayIdentifier)(ip, userAgent);
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
    }
    catch (error) {
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
exports.default = router;
