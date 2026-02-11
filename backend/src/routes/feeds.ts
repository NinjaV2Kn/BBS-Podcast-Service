import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Generate RSS XML for a podcast
 * @param podcast Podcast with episodes
 * @param baseUrl Base URL for the feed links
 */
function generateRssFeed(podcast: any, episodes: any[], baseUrl: string): string {
  // Format timestamp for RSS (RFC 2822)
  const formatRFC2822 = (date: Date) => {
    return new Date(date).toUTCString();
  };

  // Generate episode items
  const episodeItems = episodes
    .map(
      (episode) => `
    <item>
      <title>${escapeXml(episode.title)}</title>
      <description>${escapeXml(episode.description || '')}</description>
      <link>${podcastUrl}/${episode.id}</link>
      <guid>${baseUrl}/episodes/${episode.id}</guid>
      <pubDate>${formatRFC2822(episode.publishedAt)}</pubDate>
      <enclosure url="${escapeXml(episode.audioUrl)}" type="audio/mpeg" />
    </item>`
    )
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
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return unsafe
    .replace(/[<]/g, '&lt;')
    .replace(/[>]/g, '&gt;')
    .replace(/[&]/g, '&amp;')
    .replace(/['"]/g, (c) => (c === '"' ? '&quot;' : '&#39;'));
}

// GET /feeds/:slug.xml - Generate RSS feed
router.get('/:slug.xml', async (req, res: Response) => {
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
  } catch (error) {
    console.error('RSS feed generation error:', error);
    return res.status(500).send('Failed to generate RSS feed');
  }
});

// GET /feeds/all.xml - Global RSS feed with ALL episodes from ALL podcasts
router.get('/all.xml', async (_req, res: Response) => {
  try {
    // Fetch all podcasts with their episodes
    const podcasts = await prisma.podcast.findMany({
      include: {
        episodes: {
          orderBy: { publishedAt: 'desc' },
        },
      },
    });

    // Flatten all episodes from all podcasts
    const allEpisodes = podcasts
      .flatMap((podcast) =>
        podcast.episodes.map((episode) => ({
          ...episode,
          podcastTitle: podcast.title,
          podcastSlug: podcast.slug,
        }))
      )
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Format timestamp for RSS (RFC 2822)
    const formatRFC2822 = (date: Date) => {
      return new Date(date).toUTCString();
    };

    // Generate episode items
    const episodeItems = allEpisodes
      .map(
        (episode) => `
    <item>
      <title>${escapeXml(episode.title)} - ${escapeXml(episode.podcastTitle)}</title>
      <description>${escapeXml(episode.description || '')}</description>
      <link>${baseUrl}/episodes/${episode.id}</link>
      <guid>${baseUrl}/episodes/${episode.id}</guid>
      <pubDate>${formatRFC2822(episode.publishedAt)}</pubDate>
      <enclosure url="${escapeXml(episode.audioUrl)}" type="audio/mpeg" />
      <itunes:author>${escapeXml(episode.podcastTitle)}</itunes:author>
    </item>`
      )
      .join('\n');

    // Generate global RSS XML
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
  <channel>
    <title>BBS Podcast Zentrum</title>
    <link>${baseUrl}</link>
    <description>Alle Podcasts von BBS</description>
    <language>de</language>
    <lastBuildDate>${formatRFC2822(new Date())}</lastBuildDate>
    ${episodeItems}
  </channel>
</rss>`;

    res.type('application/rss+xml; charset=utf-8');
    res.set('Content-Disposition', 'inline; filename="all.xml"');
    return res.send(rss);
  } catch (error) {
    console.error('Global RSS feed generation error:', error);
    return res.status(500).send('Failed to generate RSS feed');
  }
});

// GET /feeds/:slug - Podcast feed page (for reference)
router.get('/:slug', async (req, res: Response) => {
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

    return res.json({
      podcast,
      rssUrl: `http://localhost:8080/feeds/${slug}.xml`,
    });
  } catch (error) {
    console.error('Get feed error:', error);
    return res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

export default router;
