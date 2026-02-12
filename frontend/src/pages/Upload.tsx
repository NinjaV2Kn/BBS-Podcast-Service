import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Container,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
} from '@mui/material';
import { motion } from 'framer-motion';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddIcon from '@mui/icons-material/Add';
import RadioIcon from '@mui/icons-material/Radio';

interface Podcast {
  id: string;
  title: string;
  description?: string;
  slug: string;
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

export default function Upload() {
  const theme = useTheme();

  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [podcastId, setPodcastId] = useState('');
  const [newPodcastTitle, setNewPodcastTitle] = useState('');
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [createNewPodcast, setCreateNewPodcast] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedEpisode, setUploadedEpisode] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/podcasts', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await response.json();
        setPodcasts(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch podcasts:', error);
      }
    };
    fetchPodcasts();
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('audio/')) {
        setFile(droppedFile);
        setError('');
      } else {
        setError('Please drop an audio file');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an audio file');
      return;
    }
    if (!title) {
      setError('Please enter episode title');
      return;
    }
    if (createNewPodcast && !newPodcastTitle) {
      setError('Please enter podcast name');
      return;
    }
    if (!createNewPodcast && !podcastId) {
      setError('Please select or create a podcast');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      let coverUrl = '';

      // Step 0: Upload cover if provided
      if (coverFile) {
        setUploadProgress(20);
        const coverPresignResponse = await fetch('/uploads/presign', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filename: `cover-${Date.now()}-${coverFile.name}` }),
        });

        if (coverPresignResponse.ok) {
          const { url: coverUploadUrl, objectKey: coverObjectKey } = await coverPresignResponse.json();
          const coverUploadResponse = await fetch(coverUploadUrl, {
            method: 'PUT',
            body: coverFile,
            headers: { 'Content-Type': coverFile.type || 'application/octet-stream' },
          });

          if (coverUploadResponse.ok) {
            // Always use relative path for CSP compliance
            coverUrl = `/uploads/file/${coverObjectKey}`;
          }
        }
      }

      setUploadProgress(40);
      const presignResponse = await fetch('/uploads/presign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename: file.name }),
      });

      if (!presignResponse.ok) {
        const errorData = await presignResponse.json();
        throw new Error(errorData.error || 'Failed to get presigned URL');
      }

      const { url, objectKey } = await presignResponse.json();

      setUploadProgress(60);
      const uploadResponse = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      });

      if (!uploadResponse.ok) {
        throw new Error('File upload failed');
      }

      setUploadProgress(80);
      // Always use relative path for CSP compliance
      const audioUrl = `/uploads/file/${objectKey}`;

      let finalPodcastTitle = '';
      if (createNewPodcast) {
        finalPodcastTitle = newPodcastTitle;
      } else if (podcastId) {
        const selectedPodcast = podcasts.find(p => p.id === podcastId);
        finalPodcastTitle = selectedPodcast?.title || 'My Podcast';
      }

      const episodeBody: any = {
        title,
        description,
        audioUrl,
        podcastTitle: finalPodcastTitle,
      };

      if (createNewPodcast && coverUrl) {
        episodeBody.coverUrl = coverUrl;
      }

      const episodeResponse = await fetch('/episodes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(episodeBody),
      });

      if (!episodeResponse.ok) {
        const errorData = await episodeResponse.json();
        throw new Error(errorData.error || 'Failed to create episode');
      }

      const episode = await episodeResponse.json();
      setUploadProgress(100);
      setUploadedEpisode(episode);
      setPodcastId('');
      setNewPodcastTitle('');
      setTitle('');
      setDescription('');
      setFile(null);
      setCoverFile(null);
      setCoverPreview('');
      setCreateNewPodcast(false);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (uploadedEpisode) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <CheckCircleIcon
              sx={{
                fontSize: 80,
                color: theme.palette.success.main,
                mb: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                borderRadius: '50%',
                padding: 1,
              }}
            />
          </motion.div>
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Episode erfolgreich hochgeladen!
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              {uploadedEpisode.title}
            </Typography>
            <Chip
              label="Wird automatisch veröffentlicht"
              color="success"
              variant="outlined"
              sx={{ mb: 4 }}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setUploadedEpisode(null)}
                fullWidth
              >
                Weitere Episode
              </Button>
            </Box>
          </motion.div>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <Box sx={{ mb: 4, pt: 3 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                📻 Neue Episode hochladen
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Wähle ein Podcast aus oder erstelle einen neuen
              </Typography>
            </Box>
          </motion.div>

          <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Podcast Selection / Creation */}
            {/* @ts-ignore */}
            <Grid item xs={12} component="div">
              <motion.div variants={itemVariants}>
                <Card
                  sx={{
                    backdropFilter: 'blur(20px)',
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(15, 23, 42, 0.8)'
                      : 'rgba(255, 255, 255, 0.8)',
                    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.05)'}`,
                    '&:hover': {
                      boxShadow: theme.palette.mode === 'dark'
                        ? '0 20px 40px rgba(0, 0, 0, 0.4)'
                        : '0 20px 40px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <RadioIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Podcast
                      </Typography>
                    </Box>

                    {!createNewPodcast ? (
                      <Box>
                        <FormControl fullWidth sx={{ mb: 2 }}>
                          <InputLabel>Podcast auswählen</InputLabel>
                          <Select
                            value={podcastId}
                            label="Podcast auswählen"
                            onChange={(e) => setPodcastId(e.target.value)}
                          >
                            {podcasts.map((podcast) => (
                              <MenuItem key={podcast.id} value={podcast.id}>
                                {podcast.title}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <Button
                          variant="text"
                          startIcon={<AddIcon />}
                          onClick={() => setShowCreateDialog(true)}
                          fullWidth
                        >
                          Neuen Podcast erstellen
                        </Button>
                      </Box>
                    ) : (
                      <Box>
                        <TextField
                          fullWidth
                          label="Podcast Name"
                          value={newPodcastTitle}
                          onChange={(e) => setNewPodcastTitle(e.target.value)}
                          required
                          sx={{ mb: 3 }}
                        />

                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                          Podcast Cover (optional)
                        </Typography>
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 2,
                            alignItems: 'flex-start',
                            mb: 2,
                          }}
                        >
                          <Button
                            variant="outlined"
                            component="label"
                            sx={{ flex: 1 }}
                          >
                            Cover auswählen
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleCoverChange}
                              hidden
                            />
                          </Button>
                          {coverPreview && (
                            <Avatar
                              src={coverPreview}
                              sx={{ width: 80, height: 80 }}
                            />
                          )}
                        </Box>

                        <Button
                          variant="text"
                          onClick={() => {
                            setCreateNewPodcast(false);
                            setNewPodcastTitle('');
                            setCoverFile(null);
                            setCoverPreview('');
                          }}
                          fullWidth
                        >
                          Zurück zur Auswahl
                        </Button>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Audio File Upload - Drag and Drop */}
            {/* @ts-ignore */}
            <Grid item xs={12} component="div">
              <motion.div variants={itemVariants}>
                <Box
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  sx={{
                    position: 'relative',
                    p: 4,
                    textAlign: 'center',
                    borderRadius: 2,
                    border: `2px dashed ${dragActive ? theme.palette.primary.main : theme.palette.divider}`,
                    background: dragActive
                      ? theme.palette.mode === 'dark'
                        ? 'rgba(129, 140, 248, 0.1)'
                        : 'rgba(99, 102, 241, 0.05)'
                      : 'transparent',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(129, 140, 248, 0.05)'
                        : 'rgba(99, 102, 241, 0.02)',
                    },
                  }}
                >
                  <CloudUploadIcon
                    sx={{
                      fontSize: 48,
                      color: dragActive ? 'primary.main' : 'text.secondary',
                      mb: 1,
                      transition: 'all 0.3s ease',
                      transform: dragActive ? 'scale(1.2)' : 'scale(1)',
                    }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {file ? `✓ ${file.name}` : 'Audio-Datei hierher ziehen'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    oder klicken zum durchsuchen
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                  >
                    Datei auswählen
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileChange}
                      hidden
                    />
                  </Button>
                </Box>
              </motion.div>
            </Grid>

            {/* Episode Details */}
            {/* @ts-ignore */}
            <Grid item xs={12} component="div">
              <motion.div variants={itemVariants}>
                <Card
                  sx={{
                    backdropFilter: 'blur(20px)',
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(15, 23, 42, 0.8)'
                      : 'rgba(255, 255, 255, 0.8)',
                    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.05)'}`,
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                      Episode Details
                    </Typography>
                    <TextField
                      fullWidth
                      label="Episoden-Titel"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Beschreibung"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      multiline
                      rows={4}
                    />
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Error Alert */}
            {error && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  variants={itemVariants}
                >
                  <Alert severity="error">{error}</Alert>
                </motion.div>
              </Box>
            )}

            {/* Progress */}
            {uploading && uploadProgress > 0 && (
              <Box sx={{ gridColumn: '1 / -1' }}>
                <motion.div variants={itemVariants}>
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">Upload läuft...</Typography>
                      <Typography variant="body2">{uploadProgress}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                  </Box>
                </motion.div>
              </Box>
            )}

            {/* Submit Button */}
            {/* @ts-ignore */}
            <Grid item xs={12} component="div">
              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={uploading}
                  fullWidth
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: `0 12px 24px rgba(0, 0, 0, 0.2)`,
                    },
                  }}
                >
                  {uploading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      Wird hochgeladen...
                    </Box>
                  ) : (
                    'Episode hochladen'
                  )}
                </Button>
              </motion.div>
            </Grid>
          </Grid>
          </form>
        </motion.div>
      </Box>

      {/* Create New Podcast Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Neuen Podcast erstellen</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Podcast Name"
                value={newPodcastTitle}
                onChange={(e) => setNewPodcastTitle(e.target.value)}
                autoFocus
              />
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Cover (optional)
                </Typography>
                <Button variant="outlined" component="label" fullWidth>
                  {coverFile ? '✓ Cover ausgewählt' : 'Cover auswählen'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    hidden
                  />
                </Button>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateDialog(false)}>Abbrechen</Button>
            <Button
              onClick={() => {
                setCreateNewPodcast(true);
                setShowCreateDialog(false);
              }}
              variant="contained"
            >
              Erstellen
            </Button>
          </DialogActions>
        </Dialog>
    </Container>
  );
}
