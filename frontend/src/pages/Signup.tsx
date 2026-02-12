import { useState } from 'react';
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
import { PersonAdd } from '@mui/icons-material';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        setSuccess(`✅ Welcome ${data.name}! Redirecting...`);
        setTimeout(() => window.location.href = '/', 1500);
      } else {
        setError(data.error || 'Signup failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
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
                <PersonAdd sx={{ color: '#fff', fontSize: 30 }} />
              </Box>
              <Typography variant="h4" sx={{ mb: 1 }}>
                Join RSS-Cast
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Create your account and start podcasting
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
                  label="Full Name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  fullWidth
                  size="medium"
                />

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
                  helperText="Minimum 6 characters"
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
                    {loading ? 'Creating Account...' : 'Sign Up'}
                  </Button>
                </motion.button>

                <Typography variant="body2" sx={{ textAlign: 'center', mt: 2 }}>
                  Already have an account?{' '}
                  <Link
                    onClick={() => navigate('/login')}
                    sx={{
                      cursor: 'pointer',
                      color: '#818cf8',
                      fontWeight: 600,
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Sign in here
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
