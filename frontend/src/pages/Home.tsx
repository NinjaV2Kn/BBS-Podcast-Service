import { useAuth } from '../utils/auth';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  Stack,
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  Podcasts,
  TrendingUp,
  Radio,
  Share,
  Bolt,
  Public,
} from '@mui/icons-material';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  // const muiTheme = useMuiTheme();

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
        duration: 0.8,
        ease: 'easeOut' as any,
      },
    },
  };

  const features = [
    {
      icon: <Podcasts sx={{ fontSize: 40 }} />,
      title: 'Podcast Management',
      description: 'Effortlessly manage your podcasts and episodes in one place',
    },
    {
      icon: <Radio sx={{ fontSize: 40 }} />,
      title: 'RSS Feeds',
      description: 'Automatic RSS feed generation for Spotify, Apple Podcasts & more',
    },
    {
      icon: <Share sx={{ fontSize: 40 }} />,
      title: 'Community Discovery',
      description: 'Share your podcasts and discover others in our network',
    },
    {
      icon: <TrendingUp sx={{ fontSize: 40 }} />,
      title: 'Analytics',
      description: 'Track plays, engagement, and performance metrics',
    },
    {
      icon: <Bolt sx={{ fontSize: 40 }} />,
      title: 'Fast & Reliable',
      description: 'Lightning-fast delivery with zero downtime',
    },
    {
      icon: <Public sx={{ fontSize: 40 }} />,
      title: 'Self-Hosted',
      description: 'Complete control over your data and infrastructure',
    },
  ];

  return (
    <Box
      sx={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #030712 0%, #0f172a 50%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f0f4f8 100%)',
        minHeight: '100vh',
        pt: { xs: 6, md: 10 },
        pb: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        {/* Hero Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <Box
            sx={{
              textAlign: 'center',
              mb: { xs: 8, md: 12 },
              position: 'relative',
            }}
          >
            {/* Animated Background Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -100,
                left: '10%',
                width: 300,
                height: 300,
                background: 'radial-gradient(circle, #818cf8 0%, transparent 70%)',
                opacity: isDarkMode ? 0.1 : 0.05,
                borderRadius: '50%',
                filter: 'blur(40px)',
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: '5%',
                width: 250,
                height: 250,
                background: 'radial-gradient(circle, #f472b6 0%, transparent 70%)',
                opacity: isDarkMode ? 0.08 : 0.03,
                borderRadius: '50%',
                filter: 'blur(40px)',
                zIndex: 0,
              }}
            />

            <motion.div variants={itemVariants}>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  mb: 3,
                  fontWeight: 900,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Self-Hosted Podcasting Made Simple
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Typography
                variant="h5"
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.5rem' },
                  color: isDarkMode ? '#cbd5e1' : '#64748b',
                  mb: 4,
                  maxWidth: '600px',
                  mx: 'auto',
                  lineHeight: 1.8,
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                Create, manage, and distribute your podcasts with automatic RSS
                feed generation. Full control, zero limitations.
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                sx={{ position: 'relative', zIndex: 1 }}
              >
                {isAuthenticated ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/dashboard')}
                    >
                      <Button
                        variant="contained"
                        size="large"
                        sx={{
                          background:
                            'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)',
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          width: '100%',
                        }}
                      >
                        Go to Dashboard
                      </Button>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/upload')}
                    >
                      <Button
                        variant="outlined"
                        size="large"
                        sx={{
                          borderColor: '#818cf8',
                          color: '#818cf8',
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          width: '100%',
                          '&:hover': {
                            background: 'rgba(129, 140, 248, 0.1)',
                          },
                        }}
                      >
                        Upload Episode
                      </Button>
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/signup')}
                    >
                      <Button
                        variant="contained"
                        size="large"
                        sx={{
                          background:
                            'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)',
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          width: '100%',
                        }}
                      >
                        Get Started Free
                      </Button>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/community')}
                    >
                      <Button
                        variant="outlined"
                        size="large"
                        sx={{
                          borderColor: '#818cf8',
                          color: '#818cf8',
                          px: 4,
                          py: 1.5,
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          width: '100%',
                          '&:hover': {
                            background: 'rgba(129, 140, 248, 0.1)',
                          },
                        }}
                      >
                        Explore Community
                      </Button>
                    </motion.button>
                  </>
                )}
              </Stack>
            </motion.div>
          </Box>

          {/* Features Section */}
          <motion.div variants={itemVariants as any}>
            <Box sx={{ mt: { xs: 12, md: 16 } }}>
              <Typography
                variant="h2"
                sx={{
                  textAlign: 'center',
                  mb: 8,
                  fontSize: { xs: '2rem', md: '3rem' },
                }}
              >
                Powerful Features
              </Typography>

              <Grid container spacing={3}>
                {features.map((feature, index) => (
                  <Box key={index} sx={{ xs: '100%', sm: '50%', md: '33.33%' }}>
                    <motion.div
                      variants={itemVariants}
                      whileHover={{ y: -8 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 10,
                      }}
                    >
                      <Card
                        sx={{
                          p: 3,
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)',
                            color: '#fff',
                            mb: 2,
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          {feature.description}
                        </Typography>
                      </Card>
                    </motion.div>
                  </Box>
                ))}
              </Grid>
            </Box>
          </motion.div>

          {/* CTA Section */}
          <motion.div variants={itemVariants as any}>
            <Card
              sx={{
                mt: { xs: 12, md: 16 },
                p: { xs: 4, md: 6 },
                textAlign: 'center',
                background: isDarkMode
                  ? 'linear-gradient(135deg, rgba(129, 140, 248, 0.1) 0%, rgba(244, 114, 182, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)',
                border: `2px solid ${isDarkMode ? 'rgba(129, 140, 248, 0.2)' : 'rgba(99, 102, 241, 0.1)'}`,
              }}
            >
              <Typography variant="h3" sx={{ mb: 2 }}>
                Ready to Start Your Podcast?
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  mb: 3,
                  color: isDarkMode ? '#cbd5e1' : '#64748b',
                }}
              >
                Join creators who are taking control of their podcast distribution.
              </Typography>
              {!isAuthenticated && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/signup')}
                >
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      background:
                        'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)',
                      px: 6,
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}
                  >
                    Start Now → It's Free
                  </Button>
                </motion.button>
              )}
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </Box>
  );
}
