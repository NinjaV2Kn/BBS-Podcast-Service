import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { normalizeUrl } from '../utils/hash';

const router = Router();
const prisma = new PrismaClient();

/**
 * Generate RSS XML for a podcast
 * @param podcast Podcast with episodes (must include owner/user)
 * @param episodes Episodes array
 * @param baseUrl Base URL for the feed links
 */
function generateRssFeed(podcast: any, episodes: any[], baseUrl: string): string {
  const podcastUrl = `${baseUrl}/feeds/${podcast.slug}`;
  
  // Format timestamp for RSS (RFC 2822)
  const formatRFC2822 = (date: Date) => {
    return new Date(date).toUTCString();
  };

  // Get owner email - fall back to default school email
  const ownerEmail = podcast.user?.email || 'podcast@bbs2-wolfsburg.de';
  const ownerName = podcast.user?.name || 'BBS 2 Podcast Team';
  const coverUrl = podcast.coverUrl || `${baseUrl}/default-cover.svg`;

  // Generate episode items with YouTube-compatible tags
  const episodeItems = episodes
    .map(
      (episode) => {
        const duration = episode.duration ? Math.floor(episode.duration) : 0;
        return `
    <item>
      <title>${escapeXml(episode.title)}</title>
      <description>${escapeXml(episode.description || '')}</description>
      <link>${podcastUrl}/${episode.id}</link>
      <guid>${baseUrl}/episodes/${episode.id}</guid>
      <pubDate>${formatRFC2822(episode.publishedAt)}</pubDate>
      <enclosure url="${escapeXml(normalizeUrl(episode.audioUrl) || '')}" type="audio/mpeg" />
      <itunes:author>${escapeXml(ownerName)}</itunes:author>
      ${duration > 0 ? `<itunes:duration>${duration}</itunes:duration>` : ''}
      <itunes:explicit>no</itunes:explicit>
    </item>`;
      }
    )
    .join('\n');

  // Generate RSS XML with YouTube-required iTunes tags
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(podcast.title)}</title>
    <link>${podcastUrl}</link>
    <description>${escapeXml(podcast.description || podcast.title)}</description>
    <language>de</language>
    <lastBuildDate>${formatRFC2822(new Date())}</lastBuildDate>
    <image>
      <url>${escapeXml(coverUrl)}</url>
      <title>${escapeXml(podcast.title)}</title>
      <link>${podcastUrl}</link>
    </image>
    <itunes:image href="${escapeXml(coverUrl)}" />
    <itunes:owner>
      <itunes:name>${escapeXml(ownerName)}</itunes:name>
      <itunes:email>${escapeXml(ownerEmail)}</itunes:email>
    </itunes:owner>
    <itunes:category text="Bildung" />
    <itunes:explicit>no</itunes:explicit>
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

// GET /feeds/all.xml - Global RSS feed with ALL episodes from ALL podcasts
// MUST be defined BEFORE /:slug.xml to prevent :slug matching "all"
router.get('/all.xml', async (_req, res: Response) => {
  try {
    // Fetch all podcasts with their episodes AND user/owner info
    const podcasts = await prisma.podcast.findMany({
      include: {
        episodes: {
          orderBy: { publishedAt: 'desc' },
        },
        user: true,  // Include owner info for email
      },
    });

    // Flatten all episodes from all podcasts
    const allEpisodes = podcasts
      .flatMap((podcast) =>
        podcast.episodes.map((episode) => ({
          ...episode,
          podcastTitle: podcast.title,
          podcastSlug: podcast.slug,
          ownerEmail: podcast.user?.email || 'podcast@bbs2-wolfsburg.de',
          ownerName: podcast.user?.name || 'BBS 2 Podcast Team',
          coverUrl: podcast.coverUrl,
        }))
      )
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Format timestamp for RSS (RFC 2822)
    const formatRFC2822 = (date: Date) => {
      return new Date(date).toUTCString();
    };

    // Generate episode items with YouTube-compatible tags
    const episodeItems = allEpisodes
      .map(
        (episode) => {
          const duration = episode.duration ? Math.floor(episode.duration) : 0;
          return `
    <item>
      <title>${escapeXml(episode.title)} - ${escapeXml(episode.podcastTitle)}</title>
      <description>${escapeXml(episode.description || '')}</description>
      <link>${baseUrl}/episodes/${episode.id}</link>
      <guid>${baseUrl}/episodes/${episode.id}</guid>
      <pubDate>${formatRFC2822(episode.publishedAt)}</pubDate>
      <enclosure url="${escapeXml(normalizeUrl(episode.audioUrl) || '')}" type="audio/mpeg" />
      <itunes:author>${escapeXml(episode.podcastTitle)}</itunes:author>
      ${duration > 0 ? `<itunes:duration>${duration}</itunes:duration>` : ''}
      <itunes:explicit>no</itunes:explicit>
      <itunes:image href="${escapeXml(episode.coverUrl || `${baseUrl}/default-cover.svg`)}" />
    </item>`;
        }
      )
      .join('\n');

    // Generate global RSS XML with YouTube-required tags
    const defaultCoverUrl = `${baseUrl}/default-cover.svg`;
    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>BBS Podcast Zentrum</title>
    <link>${baseUrl}</link>
    <description>Alle Podcasts von BBS 2 Wolfsburg - Schüler und Lehrerschaft berichten</description>
    <language>de</language>
    <lastBuildDate>${formatRFC2822(new Date())}</lastBuildDate>
    <image>
      <url>${escapeXml(defaultCoverUrl)}</url>
      <title>BBS Podcast Zentrum</title>
      <link>${baseUrl}</link>
    </image>
    <itunes:image href="${escapeXml(defaultCoverUrl)}" />
    <itunes:owner>
      <itunes:name>BBS 2 Podcast Team</itunes:name>
      <itunes:email>podcast@bbs2-wolfsburg.de</itunes:email>
    </itunes:owner>
    <itunes:category text="Bildung" />
    <itunes:explicit>no</itunes:explicit>
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

// GET /feeds/:slug.xml - Generate RSS feed
router.get('/:slug.xml', async (req, res: Response) => {
  try {
    const { slug } = req.params;

    // Find podcast by slug with user info for owner email
    const podcast = await prisma.podcast.findUnique({
      where: { slug },
      include: {
        episodes: {
          orderBy: { publishedAt: 'desc' },
        },
        user: true,  // Include owner info for email
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

    // Normalize URLs in episodes for CSP compliance
    const normalizedPodcast = {
      ...podcast,
      coverUrl: normalizeUrl(podcast.coverUrl),
      episodes: podcast.episodes.map(ep => ({
        ...ep,
        audioUrl: normalizeUrl(ep.audioUrl),
      })),
    };

    return res.json({
      podcast: normalizedPodcast,
      rssUrl: `/feeds/${slug}.xml`,
    });
  } catch (error) {
    console.error('Get feed error:', error);
    return res.status(500).json({ error: 'Failed to fetch feed' });
  }
});

export default router;
