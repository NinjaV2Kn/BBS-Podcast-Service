import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { usePlayer } from '../contexts/PlayerContext';
import {
  Paper,
  Box,
  Container,
  Typography,
  LinearProgress,
  IconButton,
} from '@mui/material';
import { PlayArrow, Pause, Close, FastRewind, FastForward } from '@mui/icons-material';

export default function GlobalAudioPlayer() {
  const { isDarkMode } = useTheme();
  const { selectedEpisode, isPlaying, setIsPlaying, setSelectedEpisode } = usePlayer();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const handleTimeUpdate = () => {
    if (audioRef.current && !isSeeking) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
  };

  const formatTime = (time: number) => {
    if (!isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (newTime: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    handleSeek(newTime);
  };

  const handleSkip = (seconds: number) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    handleSeek(newTime);
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <AnimatePresence>
      {selectedEpisode && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Paper
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              borderRadius: 0,
              background: isDarkMode
                ? 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)'
                : 'linear-gradient(180deg, rgba(248, 250, 252, 0.95) 0%, rgba(240, 244, 248, 0.95) 100%)',
              backdropFilter: 'blur(20px)',
              borderTop: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.2)' : 'rgba(0, 0, 0, 0.05)'}`,
              boxShadow: isDarkMode
                ? '0 -20px 40px rgba(0, 0, 0, 0.3)'
                : '0 -20px 40px rgba(0, 0, 0, 0.1)',
            }}
          >
            <audio
              ref={audioRef}
              src={selectedEpisode.url}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleEnded}
            />

            <Container maxWidth="lg" sx={{ py: 2 }}>
              {/* Progress Bar - Clickable */}
              <Box sx={{ mb: 2 }}>
                <Box
                  onClick={handleProgressClick}
                  sx={{
                    cursor: 'pointer',
                    height: 3,
                    borderRadius: '2px',
                    background: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden',
                    transition: 'height 0.2s ease',
                    '&:hover': {
                      height: 6,
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: '100%',
                      width: `${progress}%`,
                      background: 'linear-gradient(90deg, #818cf8 0%, #f472b6 100%)',
                      transition: 'width 0.1s linear',
                    }}
                  />
                </Box>
                {/* Time display below progress */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.6 }}>
                    {formatTime(currentTime)}
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: '0.7rem', opacity: 0.6 }}>
                    {formatTime(duration)}
                  </Typography>
                </Box>
              </Box>

              {/* Player Controls */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                {/* Rewind 15s */}
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <IconButton
                    onClick={() => handleSkip(-15)}
                    size="small"
                    sx={{
                      color: '#818cf8',
                      '&:hover': {
                        background: 'rgba(129, 140, 248, 0.1)',
                      },
                    }}
                  >
                    <FastRewind fontSize="small" />
                  </IconButton>
                </motion.button>

                {/* Play/Pause */}
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <IconButton
                    onClick={() => setIsPlaying(!isPlaying)}
                    sx={{
                      background: 'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)',
                      color: '#fff',
                      boxShadow: '0 4px 12px rgba(129, 140, 248, 0.3)',
                      width: 56,
                      height: 56,
                      '&:hover': {
                        boxShadow: '0 8px 24px rgba(129, 140, 248, 0.4)',
                      },
                    }}
                  >
                    {isPlaying ? <Pause sx={{ fontSize: 28 }} /> : <PlayArrow sx={{ fontSize: 28 }} />}
                  </IconButton>
                </motion.button>

                {/* Forward 15s */}
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <IconButton
                    onClick={() => handleSkip(15)}
                    size="small"
                    sx={{
                      color: '#818cf8',
                      '&:hover': {
                        background: 'rgba(129, 140, 248, 0.1)',
                      },
                    }}
                  >
                    <FastForward fontSize="small" />
                  </IconButton>
                </motion.button>

                {/* Episode Info */}
                <Box sx={{ flex: 1, minWidth: 0, mx: 2 }}>
                  <Typography variant="caption" sx={{ opacity: 0.7, display: 'block' }}>
                    {selectedEpisode.podcast}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                    {selectedEpisode.title}
                  </Typography>
                </Box>

                {/* Time Display */}
                <Typography variant="caption" sx={{ opacity: 0.7, whiteSpace: 'nowrap' }}>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Typography>

                {/* Close Button */}
                <IconButton
                  onClick={() => setSelectedEpisode(null)}
                  sx={{
                    color: isDarkMode ? '#94a3b8' : '#64748b',
                    '&:hover': {
                      color: '#ef4444',
                    },
                  }}
                >
                  <Close />
                </IconButton>
              </Box>
            </Container>
          </Paper>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
