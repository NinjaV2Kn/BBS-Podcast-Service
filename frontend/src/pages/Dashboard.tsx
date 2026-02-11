import { useEffect, useState } from 'react';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Stack,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import {
  Edit,
  Delete,
  PlayArrow,
  Podcasts,
  Radio,
} from '@mui/icons-material';

interface DashboardData {
  totalPlays: number;
  topEpisodes: Array<{ id: string; title: string; plays: number }>;
  playsPerDay: Array<{ date: string; plays: number }>;
}

interface Episode {
  id: string;
  title: string;
  description?: string;
  publishedAt: string;
}

interface PodcastType {
  id: string;
  title: string;
  description?: string;
  slug: string;
  episodes: Episode[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [podcasts, setPodcasts] = useState<PodcastType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const muiTheme = useMuiTheme();

  const isDarkMode = muiTheme.palette.mode === 'dark';
  const chartColor = isDarkMode ? '#818cf8' : '#6366f1';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');

        const analyticsResponse = await fetch(
          'http://localhost:8080/api/dashboard/overview',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        const analyticsData = await analyticsResponse.json();
        setData(analyticsData);

        const podcastsResponse = await fetch('http://localhost:8080/podcasts', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!podcastsResponse.ok) {
          throw new Error('Failed to fetch podcasts');
        }

        const podcastsData = await podcastsResponse.json();

        const podcastsWithEpisodes = await Promise.all(
          (Array.isArray(podcastsData) ? podcastsData : []).map(
            async (podcast: any) => {
              try {
                const feedResponse = await fetch(
                  `http://localhost:8080/feeds/${podcast.slug}`
                );
                const feedData = await feedResponse.json();
                return {
                  ...podcast,
                  episodes: feedData.podcast?.episodes || [],
                };
              } catch {
                return { ...podcast, episodes: [] };
              }
            }
          )
        );

        setPodcasts(podcastsWithEpisodes);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const startEditing = (podcast: PodcastType) => {
    setEditingId(podcast.id);
    setEditTitle(podcast.title);
    setEditDialog(true);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/podcasts/${editingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editTitle }),
      });

      if (!response.ok) {
        throw new Error('Failed to update podcast');
      }

      setPodcasts(
        podcasts.map((p) =>
          p.id === editingId ? { ...p, title: editTitle } : p
        )
      );
      setEditDialog(false);
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update podcast:', error);
      alert('Failed to update podcast');
    }
  };

  const confirmDelete = (podcastId: string) => {
    setDeletingId(podcastId);
    setDeleteDialog(true);
  };

  const deletePodcast = async () => {
    if (!deletingId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/podcasts/${deletingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete podcast');
      }

      setPodcasts(podcasts.filter((p) => p.id !== deletingId));
      setDeleteDialog(false);
      setDeletingId(null);
    } catch (error) {
      console.error('Failed to delete podcast:', error);
      alert('Failed to delete podcast');
    }
  };

  const deleteEpisode = async (episodeId: string, podcastId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/episodes/${episodeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete episode');
      }

      setPodcasts(
        podcasts.map((p) =>
          p.id === podcastId
            ? { ...p, episodes: p.episodes.filter((e) => e.id !== episodeId) }
            : p
        )
      );
    } catch (error) {
      console.error('Failed to delete episode:', error);
      alert('Failed to delete episode');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #030712 0%, #0f172a 50%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f0f4f8 100%)',
        minHeight: '100vh',
        py: 4,
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
              <Typography
                variant="h3"
                sx={{
                  mb: 1,
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                📊 Dashboard
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.7 }}>
                Verwalte deine Podcasts und sehe deine Statistiken
              </Typography>
            </Box>
          </motion.div>

          {/* Analytics Cards */}
          <Grid container spacing={3} sx={{ mb: 6 }}>
            <Grid item xs={12} sm={6} md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Card
                  sx={{
                    background: `linear-gradient(135deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                    color: '#fff',
                    height: '100%',
                    backdropFilter: 'blur(20px)',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0 20px 40px rgba(0, 0, 0, 0.2)`,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <PlayArrow sx={{ fontSize: 40, opacity: 0.8 }} />
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.9, color: '#fff' }}>
                          Gesamt Plays
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff' }}>
                          {data?.totalPlays || 0}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={4} component="div">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
              >
                <Card
                  sx={{
                    backdropFilter: 'blur(20px)',
                    background: isDarkMode
                      ? 'rgba(15, 23, 42, 0.8)'
                      : 'rgba(255, 255, 255, 0.8)',
                    border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.05)'}`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Podcasts sx={{ fontSize: 40, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          Podcasts
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                          {podcasts.length}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            <Grid item xs={12} sm={6} md={4} component="div">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card
                  sx={{
                    backdropFilter: 'blur(20px)',
                    background: isDarkMode
                      ? 'rgba(15, 23, 42, 0.8)'
                      : 'rgba(255, 255, 255, 0.8)',
                    border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.05)'}`,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Radio sx={{ fontSize: 40, color: 'secondary.main' }} />
                      <Box>
                        <Typography variant="body2" sx={{ opacity: 0.7 }}>
                          Episoden
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 800 }}>
                          {podcasts.reduce((sum, p) => sum + p.episodes.length, 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

          {/* Charts */}
          {data?.playsPerDay && data.playsPerDay.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              <Card
                sx={{
                  mb: 6,
                  backdropFilter: 'blur(20px)',
                  background: isDarkMode
                    ? 'rgba(15, 23, 42, 0.8)'
                    : 'rgba(255, 255, 255, 0.8)',
                  border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.05)'}`,
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                    📈 Plays über Zeit
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.playsPerDay}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDarkMode ? 'rgba(148, 163, 184, 0.12)' : '#e2e8f0'}
                      />
                      <XAxis
                        dataKey="date"
                        stroke={isDarkMode ? '#94a3b8' : '#64748b'}
                      />
                      <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
                      <Tooltip
                        contentStyle={{
                          background: isDarkMode ? '#1e293b' : '#fff',
                          border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          color: isDarkMode ? '#f1f5f9' : '#1e293b',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="plays"
                        stroke={chartColor}
                        strokeWidth={3}
                        dot={{ fill: chartColor, r: 5 }}
                        activeDot={{ r: 7 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Top Episodes */}
          {data?.topEpisodes && data.topEpisodes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card
                sx={{
                  mb: 6,
                  backdropFilter: 'blur(20px)',
                  background: isDarkMode
                    ? 'rgba(15, 23, 42, 0.8)'
                    : 'rgba(255, 255, 255, 0.8)',
                  border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.05)'}`,
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                    🔥 Top Episoden
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.topEpisodes}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={isDarkMode ? 'rgba(148, 163, 184, 0.12)' : '#e2e8f0'}
                      />
                      <XAxis dataKey="title" stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
                      <YAxis stroke={isDarkMode ? '#94a3b8' : '#64748b'} />
                      <Tooltip
                        contentStyle={{
                          background: isDarkMode ? '#1e293b' : '#fff',
                          border: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
                          borderRadius: '8px',
                          color: isDarkMode ? '#f1f5f9' : '#1e293b',
                        }}
                      />
                      <Bar dataKey="plays" fill={chartColor} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Podcasts Section */}
          <motion.div variants={itemVariants}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
              🎙️ Meine Podcasts
            </Typography>
          </motion.div>

          {podcasts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card
                sx={{
                  backdropFilter: 'blur(20px)',
                  background: isDarkMode
                    ? 'rgba(15, 23, 42, 0.8)'
                    : 'rgba(255, 255, 255, 0.8)',
                  border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.05)'}`,
                }}
              >
                <CardContent sx={{ textAlign: 'center', py: 6 }}>
                  <Podcasts sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    Noch keine Podcasts
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.7, mb: 3 }}>
                    Erstelle deinen ersten Podcast durch das Hochladen einer Episode
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => (window.location.href = '/upload')}
                    sx={{
                      background: `linear-gradient(135deg, ${muiTheme.palette.primary.main}, ${muiTheme.palette.secondary.main})`,
                    }}
                  >
                    Episode hochladen
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <Grid container spacing={3}>
              {podcasts.map((podcast, idx) => (
                <Grid item xs={12} key={podcast.id} component="div">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + idx * 0.05 }}
                    whileHover={{ y: -4 }}
                  >
                    <Card
                      sx={{
                        backdropFilter: 'blur(20px)',
                        background: isDarkMode
                          ? 'rgba(15, 23, 42, 0.8)'
                          : 'rgba(255, 255, 255, 0.8)',
                        border: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.05)'}`,
                      }}
                    >
                      <CardContent>
                        {/* Title Section */}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 2,
                          }}
                        >
                          <Typography variant="h6" sx={{ fontWeight: 700, flex: 1 }}>
                            🎙️ {podcast.title}
                          </Typography>
                          <Stack direction="row" spacing={1}>
                            <IconButton
                              size="small"
                              onClick={() => startEditing(podcast)}
                            >
                              <Edit />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => confirmDelete(podcast.id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Stack>
                        </Box>

                        {podcast.description && (
                          <Typography variant="body2" sx={{ opacity: 0.8, mb: 2 }}>
                            {podcast.description}
                          </Typography>
                        )}

                        <Chip
                          label={`${podcast.episodes.length} Episode${
                            podcast.episodes.length !== 1 ? 's' : ''
                          }`}
                          size="small"
                          sx={{ mb: 3 }}
                        />

                        {/* Episodes Table */}
                        {podcast.episodes.length > 0 && (
                          <TableContainer
                            component={Paper}
                            sx={{
                              mt: 3,
                              background: 'transparent',
                              boxShadow: 'none',
                            }}
                          >
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Episoden Titel</TableCell>
                                  <TableCell align="right">Veröffentlicht</TableCell>
                                  <TableCell align="right">Aktion</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {podcast.episodes
                                  .sort(
                                    (a, b) =>
                                      new Date(b.publishedAt).getTime() -
                                      new Date(a.publishedAt).getTime()
                                  )
                                  .map((episode) => (
                                    <TableRow key={episode.id}>
                                      <TableCell>{episode.title}</TableCell>
                                      <TableCell align="right">
                                        {new Date(episode.publishedAt).toLocaleDateString(
                                          'de-DE'
                                        )}
                                      </TableCell>
                                      <TableCell align="right">
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            deleteEpisode(episode.id, podcast.id)
                                          }
                                          color="error"
                                        >
                                          <Delete sx={{ fontSize: 18 }} />
                                        </IconButton>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </motion.div>
      </Container>

      {/* Edit Dialog */}
      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Podcast bearbeiten</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Podcast Titel"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            margin="normal"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Abbrechen</Button>
          <Button onClick={saveEdit} variant="contained">
            Speichern
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>⚠️ Podcast löschen?</DialogTitle>
        <DialogContent>
          <Typography>
            Bist du sicher, dass du diesen Podcast löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Abbrechen</Button>
          <Button onClick={deletePodcast} variant="contained" color="error">
            Löschen
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
