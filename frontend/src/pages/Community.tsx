import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { usePlayer } from '../contexts/PlayerContext';
import {
  Container,
  Card,
  CardMedia,
  Typography,
  TextField,
  Box,
  CircularProgress,
  Stack,
  IconButton,
  Avatar,
} from '@mui/material';
import { PlayArrow, Pause, Search, Podcasts, Radio as RadioIcon } from '@mui/icons-material';

interface Episode {
  id: string;
  title: string;
  description?: string;
  audioUrl: string;
  publishedAt: string;
}

interface Podcast {
  id: string;
  title: string;
  description?: string;
  slug: string;
  coverUrl?: string;
  episodes: Episode[];
  userId: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export default function Community() {
  const { isDarkMode } = useTheme();
  const { selectedEpisode, isPlaying, setSelectedEpisode, setIsPlaying } = usePlayer();
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    try {
      const response = await fetch('/podcasts');
      const data = await response.json();

      const podcastsWithEpisodes = await Promise.all(
        (Array.isArray(data) ? data : []).map(async (podcast: any) => {
          try {
            const feedResponse = await fetch(`/feeds/${podcast.slug}`);
            const feedData = await feedResponse.json();
            return {
              ...podcast,
              episodes: feedData.podcast?.episodes || [],
            };
          } catch {
            return { ...podcast, episodes: [] };
          }
        })
      );

      setPodcasts(podcastsWithEpisodes);
    } catch (error) {
      console.error('Error fetching podcasts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPodcasts = podcasts.filter(
    (podcast) =>
      podcast.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      podcast.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEpisodes = podcasts.reduce((sum, p) => sum + p.episodes.length, 0);

  return (
    <Box
      sx={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #030712 0%, #0f172a 50%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f0f4f8 100%)',
        minHeight: '100vh',
        py: 4,
        pb: 20,
      }}
    >
      <Container maxWidth="lg">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <Box sx={{ mb: 6 }}>
              <Typography variant="h3" sx={{ mb: 1, fontWeight: 800 }}>
                🎙️ Podcast Community
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.7, mb: 3 }}>
                Entdecke {podcasts.length} Podcasts mit {totalEpisodes} Episoden
              </Typography>

              {/* Search Bar */}
              <TextField
                fullWidth
                placeholder="Podcasts durchsuchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Search
                      sx={{
                        mr: 2,
                        color: isDarkMode ? '#94a3b8' : '#64748b',
                      }}
                    />
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    background: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: isDarkMode
                        ? 'rgba(30, 41, 59, 0.8)'
                        : 'rgba(255, 255, 255, 1)',
                    },
                    '& fieldset': {
                      borderColor: isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.05)',
                    },
                    '&:hover fieldset': {
                      borderColor: '#818cf8',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#818cf8',
                    },
                  },
                  '& .MuiOutlinedInput-input::placeholder': {
                    opacity: 0.6,
                  },
                }}
              />
            </Box>
          </motion.div>

          {/* Content */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#818cf8' }} />
            </Box>
          ) : filteredPodcasts.length === 0 ? (
            <motion.div variants={itemVariants}>
              <Card
                sx={{
                  p: 6,
                  textAlign: 'center',
                  background: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.05)'}`,
                }}
              >
                <Podcasts sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
                <Typography variant="h6">Keine Podcasts gefunden</Typography>
              </Card>
            </motion.div>
          ) : (
            <Stack spacing={3}>
              {filteredPodcasts.map((podcast) => (
                <motion.div
                  key={podcast.id}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card
                    sx={{
                      background: isDarkMode
                        ? 'rgba(30, 41, 59, 0.6)'
                        : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${
                        isDarkMode
                          ? 'rgba(148, 163, 184, 0.2)'
                          : 'rgba(0, 0, 0, 0.05)'
                      }`,
                      overflow: 'visible',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: isDarkMode
                          ? '0 20px 40px rgba(129, 140, 248, 0.1)'
                          : '0 20px 40px rgba(99, 102, 241, 0.1)',
                      },
                    }}
                  >
                    {/* Podcast Header */}
                    <Box sx={{ display: 'flex', gap: 3, p: 3 }}>
                      {/* Cover Image */}
                      <Box sx={{ flexShrink: 0 }}>
                        {podcast.coverUrl ? (
                          <CardMedia
                            component="img"
                            image={podcast.coverUrl}
                            alt={podcast.title}
                            sx={{
                              width: 120,
                              height: 120,
                              borderRadius: '12px',
                            }}
                          />
                        ) : (
                          <Avatar
                            sx={{
                              width: 120,
                              height: 120,
                              fontSize: '3rem',
                              background: 'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)',
                            }}
                          >
                            🎙️
                          </Avatar>
                        )}
                      </Box>

                      {/* Podcast Info */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                          {podcast.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            opacity: 0.7,
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {podcast.description || 'Keine Beschreibung'}
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              px: 2,
                              py: 1,
                              borderRadius: '8px',
                              background: isDarkMode
                                ? 'rgba(129, 140, 248, 0.1)'
                                : 'rgba(129, 140, 248, 0.05)',
                            }}
                          >
                            <RadioIcon sx={{ fontSize: 18, color: '#818cf8' }} />
                            <Typography variant="caption">
                              {podcast.episodes.length} Episode{podcast.episodes.length !== 1 ? 's' : ''}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </Box>

                    {/* Episodes */}
                    {podcast.episodes.length > 0 && (
                      <Box
                        sx={{
                          borderTop: `1px solid ${
                            isDarkMode
                              ? 'rgba(148, 163, 184, 0.2)'
                              : 'rgba(0, 0, 0, 0.05)'
                          }`,
                        }}
                      >
                        {podcast.episodes
                          .sort(
                            (a, b) =>
                              new Date(b.publishedAt).getTime() -
                              new Date(a.publishedAt).getTime()
                          )
                          .map((episode) => (
                            <motion.div
                              key={episode.id}
                              whileHover={{ x: 4 }}
                              transition={{ duration: 0.2 }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  p: 2,
                                  transition: 'background-color 0.2s',
                                  '&:not(:last-child)': {
                                    borderBottom: `1px solid ${
                                      isDarkMode
                                        ? 'rgba(148, 163, 184, 0.1)'
                                        : 'rgba(0, 0, 0, 0.02)'
                                    }`,
                                  },
                                  '&:hover': {
                                    background: isDarkMode
                                      ? 'rgba(129, 140, 248, 0.05)'
                                      : 'rgba(129, 140, 248, 0.02)',
                                  },
                                }}
                              >
                                {/* Play Button */}
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <IconButton
                                    onClick={() => {
                                      const isCurrentEpisode = selectedEpisode?.episodeId === episode.id;

                                      if (isCurrentEpisode) {
                                        setIsPlaying(!isPlaying);
                                      } else {
                                        setSelectedEpisode({
                                          episodeId: episode.id,
                                          url: episode.audioUrl,
                                          title: episode.title,
                                          podcast: podcast.title,
                                        });
                                        setIsPlaying(true);
                                      }
                                    }}
                                    sx={{
                                      background: 'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)',
                                      color: '#fff',
                                      transition: 'all 0.3s ease',
                                      '&:hover': {
                                        transform: 'scale(1.08)',
                                        boxShadow: '0 8px 20px rgba(129, 140, 248, 0.3)',
                                      },
                                    }}
                                  >
                                    {selectedEpisode?.episodeId === episode.id && isPlaying ? (
                                      <Pause />
                                    ) : (
                                      <PlayArrow />
                                    )}
                                  </IconButton>
                                </motion.button>

                                {/* Episode Info */}
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                                    {episode.title}
                                  </Typography>
                                  <Typography variant="caption" sx={{ opacity: 0.6 }}>
                                    {new Date(episode.publishedAt).toLocaleDateString('de-DE')}
                                  </Typography>
                                </Box>
                              </Box>
                            </motion.div>
                          ))}
                      </Box>
                    )}
                  </Card>
                </motion.div>
              ))}
            </Stack>
          )}
        </motion.div>
      </Container>
    </Box>
  );
}
