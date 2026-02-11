import { useState } from 'react';
import { useAuth } from '../utils/auth';
import { useTheme } from '../ThemeContext';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Card,
  TextField,
  Button,
  Typography,
  Alert,
  Stack,
  Link,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Lock } from '@mui/icons-material';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(email, password);
      setSuccess('✅ Login successful! Redirecting...');
      setTimeout(() => window.location.href = '/', 1000);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #030712 0%, #0f172a 50%, #1e293b 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #ffffff 50%, #f0f4f8 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card
            sx={{
              p: { xs: 3, md: 4 },
              backdropFilter: 'blur(20px)',
              border: isDarkMode
                ? '1px solid rgba(148, 163, 184, 0.12)'
                : '1px solid rgba(99, 102, 241, 0.1)',
            }}
          >
            {/* Logo Section */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)',
                  mb: 2,
                }}
              >
                <Lock sx={{ color: '#fff', fontSize: 30 }} />
              </Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                Welcome Back
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Sign in to your RSS-Cast account
              </Typography>
            </Box>

            {/* Alerts */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              </motion.div>
            )}

            {success && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              </motion.div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                <TextField
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  fullWidth
                  size="medium"
                />

                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  fullWidth
                  size="medium"
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ width: '100%', marginTop: 12 }}
                >
                  <Button
                    type="submit"
                    disabled={loading}
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{
                      background:
                        'linear-gradient(135deg, #818cf8 0%, #f472b6 100%)',
                      fontSize: '1rem',
                      fontWeight: 700,
                    }}
                  >
                    {loading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </motion.button>

                <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
                  Don't have an account?{' '}
                  <Link
                    onClick={() => navigate('/signup')}
                    sx={{
                      cursor: 'pointer',
                      color: '#818cf8',
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Sign up here
                  </Link>
                </Typography>
              </Stack>
            </form>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}
