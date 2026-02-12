import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Container,
  Typography,
  useMediaQuery,
  Drawer,
  List,
  // ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import { Brightness4, Brightness7, Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import { useState } from 'react';
import { useAuth } from '../utils/auth';
import { useTheme } from '../ThemeContext';
import GlobalAudioPlayer from './GlobalAudioPlayer';

export default function Layout() {
  const { isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width:600px)');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const navLinkStyle = {
    textDecoration: 'none',
    color: isDarkMode ? '#f1f5f9' : '#1e293b',
    fontSize: '0.95rem',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    '&:hover': {
      color: '#818cf8',
    },
  };

  const activeNavLinkStyle = {
    ...navLinkStyle,
    color: '#818cf8',
    borderBottom: '2px solid #818cf8',
    paddingBottom: '4px',
  };

  const navItems = [
    { label: '🎧 Community', path: '/community' },
    ...(isAuthenticated ? [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Upload', path: '/upload' },
    ] : []),
  ];

  const isCurrentPage = (path: string) => location.pathname === path;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: isDarkMode 
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderBottom: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
          {/* Left Section - Logo */}
          <Button
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textTransform: 'none',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.8,
              },
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #818cf8 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#fff',
                fontSize: '1.2rem',
              }}
            >
              🎧
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: '1.3rem',
                color: isDarkMode ? '#f1f5f9' : '#1e293b',
                display: { xs: 'none', sm: 'block' },
              }}
            >
              RSS-Cast
            </Typography>
          </Button>

          {/* Center Section - Desktop Nav Links */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 3, ml: 6 }}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  sx={isCurrentPage(item.path) ? activeNavLinkStyle : navLinkStyle}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}

          {/* Right Section - Theme Toggle & Auth */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={toggleDarkMode}
              size="large"
              sx={{
                color: isDarkMode ? '#fbbf24' : '#f59e0b',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'rotate(20deg)',
                },
              }}
            >
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>

            {!isMobile && (
              <>
                {isAuthenticated ? (
                  <Button
                    onClick={handleLogout}
                    variant="outlined"
                    size="small"
                    sx={{
                      fontWeight: 600,
                      textTransform: 'none',
                      borderColor: isDarkMode ? '#64748b' : '#cbd5e1',
                      color: isDarkMode ? '#f1f5f9' : '#1e293b',
                    }}
                  >
                    Logout
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => navigate('/login')}
                      sx={{
                        fontWeight: 600,
                        textTransform: 'none',
                        color: isDarkMode ? '#f1f5f9' : '#1e293b',
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      onClick={() => navigate('/signup')}
                      variant="contained"
                      size="small"
                      sx={{
                        background: 'linear-gradient(135deg, #818cf8 0%, #ec4899 100%)',
                        fontWeight: 600,
                        textTransform: 'none',
                      }}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                size="large"
                sx={{ color: isDarkMode ? '#f1f5f9' : '#1e293b' }}
              >
                {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Menu */}
      <Drawer
        anchor="top"
        open={mobileMenuOpen && isMobile}
        onClose={() => setMobileMenuOpen(false)}
        sx={{ pt: 2 }}
      >
        <Box
          sx={{
            width: '100%',
            background: isDarkMode ? '#0f172a' : '#f8fafc',
            pt: 2,
            pb: 4,
          }}
        >
          <List>
            {navItems.map((item) => (
              <ListItemButton
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                sx={{
                  py: 1.5,
                  px: 2,
                  color: isDarkMode ? '#f1f5f9' : '#1e293b',
                  '&:hover': {
                    background: isDarkMode ? '#1e293b' : '#e2e8f0',
                  },
                  borderLeft: isCurrentPage(item.path) ? '4px solid #818cf8' : 'none',
                }}
              >
                <ListItemText
                  primary={item.label}
                  sx={{
                    fontWeight: 600,
                    '& .MuiListItemText-primary': {
                      fontWeight: 600,
                      fontSize: '0.95rem',
                    },
                  }}
                />
              </ListItemButton>
            ))}
            {isAuthenticated && (
              <ListItemButton
                onClick={handleLogout}
                sx={{
                  py: 1.5,
                  px: 2,
                  color: '#ef4444',
                  '&:hover': {
                    background: isDarkMode ? '#1e293b' : '#fee2e2',
                  },
                }}
              >
                <ListItemText
                  primary="Logout"
                  sx={{
                    fontWeight: 600,
                    '& .MuiListItemText-primary': {
                      fontWeight: 600,
                      fontSize: '0.95rem',
                    },
                  }}
                />
              </ListItemButton>
            )}
            {!isAuthenticated && (
              <>
                <ListItemButton
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  sx={{
                    py: 1.5,
                    px: 2,
                    color: isDarkMode ? '#f1f5f9' : '#1e293b',
                    '&:hover': {
                      background: isDarkMode ? '#1e293b' : '#e2e8f0',
                    },
                  }}
                >
                  <ListItemText primary="Login" />
                </ListItemButton>
                <ListItemButton
                  onClick={() => {
                    navigate('/signup');
                    setMobileMenuOpen(false);
                  }}
                  sx={{
                    py: 1.5,
                    px: 2,
                    background: 'linear-gradient(135deg, #818cf8 0%, #ec4899 100%)',
                    color: '#fff',
                    fontWeight: 600,
                  }}
                >
                  <ListItemText primary="Sign Up" />
                </ListItemButton>
              </>
            )}
          </List>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flex: 1 }}>
        <Outlet />
      </Box>

      {/* Global Audio Player - Persists across routes */}
      <GlobalAudioPlayer />

      {/* Footer */}
      <Box
        sx={{
          background: isDarkMode
            ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
          borderTop: `1px solid ${isDarkMode ? '#334155' : '#e2e8f0'}`,
          py: 4,
          mt: 8,
          textAlign: 'center',
          color: isDarkMode ? '#cbd5e1' : '#64748b',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ fontSize: '0.875rem' }}>
            © 2026 RSS-Cast. Built with ❤️ for podcast enthusiasts.
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
