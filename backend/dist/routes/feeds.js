"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
/**
 * Generate RSS XML for a podcast
 * @param podcast Podcast with episodes
 * @param baseUrl Base URL for the feed links
 */
function generateRssFeed(podcast, episodes, baseUrl) {
    const feedUrl = `${baseUrl}/feeds/${podcast.slug}.xml`;
    const podcastUrl = `${baseUrl}/feeds/${podcast.slug}`;
    // Format timestamp for RSS (RFC 2822)
    const formatRFC2822 = (date) => {
        return new Date(date).toUTCString();
    };
    // Generate episode items
    const episodeItems = episodes
        .map((episode) => `
    <item>
      <title>${escapeXml(episode.title)}</title>
      <description>${escapeXml(episode.description || '')}</description>
      <link>${podcastUrl}/${episode.id}</link>
      <guid>${baseUrl}/episodes/${episode.id}</guid>
      <pubDate>${formatRFC2822(episode.publishedAt)}</pubDate>
      <enclosure url="${escapeXml(episode.audioUrl)}" type="audio/mpeg" />
    </item>`)
        .join('\n');
    // Generate RSS XML
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>${escapeXml(podcast.title)}</title>
    <link>${podcastUrl}</link>
    <description>${escapeXml(podcast.description || podcast.title)}</description>
    <language>de</language>
    <lastBuildDate>${formatRFC2822(new Date())}</lastBuildDate>
    <image>
      <url>${escapeXml(podcast.coverUrl || `${baseUrl}/default-cover.png`)}</url>
      <title>${escapeXml(podcast.title)}</title>
      <link>${podcastUrl}</link>
    </image>
    ${episodeItems}
  </channel>
</rss>`;
    return rss;
}
/**
 * Escape special XML characters
 */
function escapeXml(unsafe) {
    if (!unsafe)
        return '';
    return unsafe
        .replace(/[<]/g, '&lt;')
        .replace(/[>]/g, '&gt;')
        .replace(/[&]/g, '&amp;')
        .replace(/['"]/g, (c) => (c === '"' ? '&quot;' : '&#39;'));
}
// GET /feeds/:slug.xml - Generate RSS feed
router.get('/:slug.xml', async (req, res) => {
    try {
        const { slug } = req.params;
        // Find podcast by slug
        const podcast = await prisma.podcast.findUnique({
            where: { slug },
            include: {
                episodes: {
                    orderBy: { publishedAt: 'desc' },
                },
            },
        });
        if (!podcast) {
            return res.status(404).send('Podcast not found');
        }
        // Generate RSS feed
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const rssFeed = generateRssFeed(podcast, podcast.episodes, baseUrl);
        // Set proper headers for RSS
        res.type('application/rss+xml; charset=utf-8');
        res.set('Content-Disposition', `inline; filename="${slug}.xml"`);
        return res.send(rssFeed);
    }
    catch (error) {
        console.error('RSS feed generation error:', error);
        res.status(500).send('Failed to generate RSS feed');
    }
});
// GET /feeds/:slug - Podcast feed page (for reference)
router.get('/:slug', async (req, res) => {
    try {
        const { slug } = req.params;
        const podcast = await prisma.podcast.findUnique({
            where: { slug },
            include: {
                episodes: {
                    orderBy: { publishedAt: 'desc' },
                    take: 10,
                },
            },
        });
        if (!podcast) {
            return res.status(404).json({ error: 'Podcast not found' });
        }
        res.json({
            podcast,
            rssUrl: `http://localhost:8080/feeds/${slug}.xml`,
        });
    }
    catch (error) {
        console.error('Get feed error:', error);
        res.status(500).json({ error: 'Failed to fetch feed' });
    }
});
exports.default = router;
