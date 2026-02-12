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
          py: 6,
          mt: 8,
          color: isDarkMode ? '#cbd5e1' : '#64748b',
        }}
      >
        <Container maxWidth="lg">
          {/* Main Footer Content */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: isDarkMode ? '#f1f5f9' : '#1e293b' }}>
              🎙️ BBS 2 Podcast Zentrum
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Schulprojekt von Auszubildenden der BBS 2 Wolfsburg
            </Typography>
          </Box>

          {/* Legal Links */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mb: 4 }}>
            <Button 
              size="small" 
              onClick={() => window.scrollTo(0, 0)}
              sx={{ textTransform: 'none', color: 'inherit', '&:hover': { color: '#818cf8' } }}
            >
              Impressum
            </Button>
            <Typography sx={{ opacity: 0.3 }}>•</Typography>
            <Button 
              size="small"
              onClick={() => window.scrollTo(0, 0)}
              sx={{ textTransform: 'none', color: 'inherit', '&:hover': { color: '#818cf8' } }}
            >
              Datenschutz
            </Button>
            <Typography sx={{ opacity: 0.3 }}>•</Typography>
            <Button 
              size="small"
              onClick={() => window.scrollTo(0, 0)}
              sx={{ textTransform: 'none', color: 'inherit', '&:hover': { color: '#818cf8' } }}
            >
              Kontakt
            </Button>
          </Box>

          {/* Impressum Section */}
          <Box sx={{ mb: 4, py: 3, px: 2, background: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.5)', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              Impressum
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.8 }}>
              <strong>Verantwortlich:</strong> BBS 2 Wolfsburg, Klasse von Auszubildenden<br />
              <strong>Schuladresse:</strong> BBS 2 Wolfsburg, Schulweg 1, 38440 Wolfsburg, Deutschland<br />
              <strong>Telefon:</strong> +49 5361 89-0<br />
              <strong>E-Mail:</strong> info@bbs2-wolfsburg.de<br />
              <strong>Vertreten durch:</strong> Die Schulleitung der BBS 2 Wolfsburg<br />
              <br />
              Dieses Projekt wurde im Rahmen der Ausbildung von Auszubildenden der BBS 2 Wolfsburg entwickelt.
            </Typography>
          </Box>

          {/* Datenschutz Section */}
          <Box sx={{ mb: 4, py: 3, px: 2, background: isDarkMode ? 'rgba(15, 23, 42, 0.5)' : 'rgba(248, 250, 252, 0.5)', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              Datenschutzerklärung
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.8 }}>
              <strong>Verantwortliche Stelle:</strong> BBS 2 Wolfsburg<br />
              <br />
              <strong>Erhobene Daten:</strong><br />
              • Anmeldedaten (E-Mail, Passwort-Hash)<br />
              • Podcast- und Episode-Metadaten<br />
              • Anonymisierte Abspiel-Statistiken (IP-und User-Agent-Hashes)<br />
              <br />
              <strong>Datenschutz:</strong><br />
              • Passwörter werden mit Argon2 gekapselt<br />
              • IP-Adressen und User-Agents werden gehashed (SHA-256)<br />
              • Keine Weitergabe an Dritte<br />
              • Speicherung nur für Systemfunktionalität<br />
              <br />
              <strong>Ihre Rechte:</strong><br />
              • Auskunftspflicht gemäß DSGVO Art. 15<br />
              • Berichtigungsrecht gemäß DSGVO Art. 16<br />
              • Löschungsrecht gemäß DSGVO Art. 17<br />
              <br />
              Kontakt für Datenschutzfragen: datenschutz@bbs2-wolfsburg.de
            </Typography>
          </Box>

          {/* Copyright */}
          <Box sx={{ textAlign: 'center', pt: 3, borderTop: `1px solid ${isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`, fontSize: '0.75rem' }}>
            <Typography variant="caption" sx={{ display: 'block', mb: 1 }}>
              © 2026 BBS 2 Podcast Zentrum. Schulprojekt der BBS 2 Wolfsburg.
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              Built with ❤️ von Auszubildenden | Powered by React + Node.js
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
