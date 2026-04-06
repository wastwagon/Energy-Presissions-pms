import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';

const WebAdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const trimmedEmail = email.trim();
      const trimmedPassword = password.trim();
      
      if (!trimmedEmail || !trimmedPassword) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }
      
      await login(trimmedEmail, trimmedPassword);
      // Navigate to website admin or back to website
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Website admin sign in | Energy Precisions</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: { xs: 4, sm: 5 },
          marginBottom: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: { xs: 2.5, sm: 3 }, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" sx={{ fontWeight: 800 }} gutterBottom>
            Energy Precisions
          </Typography>
          <Typography component="h2" variant="subtitle1" align="center" color="text.secondary" gutterBottom>
            Website Admin
          </Typography>
          <Typography component="p" variant="body2" align="center" color="text.secondary" sx={{ mb: 2 }}>
            Sign in to manage website content and e-commerce
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 1, mb: 1.5 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 0.5 }}>
            <TextField
              margin="dense"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="dense"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="medium"
              sx={{ mt: 2, mb: 1.5, textTransform: 'none', bgcolor: '#00E676', '&:hover': { bgcolor: '#00C85F' } }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In to Website'}
            </Button>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Button
                variant="text"
                size="small"
                onClick={() => navigate('/')}
                sx={{ textTransform: 'none' }}
              >
                Back to Website
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
    </>
  );
};

export default WebAdminLogin;
