import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  TextField,
  Button,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { colors } from '../../theme/colors';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
} from '@mui/icons-material';
import api from '../../services/api';

const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/energyprecisions',
  twitter: 'https://twitter.com/energyprecisions',
  linkedin: 'https://www.linkedin.com/company/energyprecisions',
  instagram: 'https://www.instagram.com/energyprecisions',
};

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubscribe = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/newsletter/subscribe', { email });
      setMessage({ type: 'success', text: 'Thank you for subscribing!' });
      setEmail('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Subscription failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: colors.blueBlack,
        color: 'white',
        pt: 6,
        pb: 3,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: colors.green }}>
              ENERGY PRECISIONS
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
              We provide turnkey solar solutions, from design, installation, and commissioning to
              monitoring and maintenance.
            </Typography>
            <Box display="flex" gap={1} mt={2}>
              <IconButton component="a" href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" sx={{ color: 'white' }} size="small" aria-label="Facebook">
                <FacebookIcon />
              </IconButton>
              <IconButton component="a" href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" sx={{ color: 'white' }} size="small" aria-label="Twitter">
                <TwitterIcon />
              </IconButton>
              <IconButton component="a" href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" sx={{ color: 'white' }} size="small" aria-label="LinkedIn">
                <LinkedInIcon />
              </IconButton>
              <IconButton component="a" href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" sx={{ color: 'white' }} size="small" aria-label="Instagram">
                <InstagramIcon />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Quick Links
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/about" underline="none" color="inherit" sx={{ '&:hover': { color: colors.green } }}>
                  About Us
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/contact?action=quote" underline="none" color="inherit" sx={{ '&:hover': { color: colors.green } }}>
                  Get a Quote
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/shop" underline="none" color="inherit" sx={{ '&:hover': { color: colors.green } }}>
                  Shop
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/services" underline="none" color="inherit" sx={{ '&:hover': { color: colors.green } }}>
                  Our Services
                </Link>
              </Box>
            </Box>
          </Grid>

          {/* Other Links */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Other Links
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/contact" underline="none" color="inherit" sx={{ '&:hover': { color: colors.green } }}>
                  Contact Us
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/portfolio" underline="none" color="inherit" sx={{ '&:hover': { color: colors.green } }}>
                  Our Portfolio
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link component={RouterLink} to="/#testimonials" underline="none" color="inherit" sx={{ '&:hover': { color: colors.green } }}>
                  Client Reviews
                </Link>
              </Box>
            </Box>
          </Grid>

          {/* Services & Newsletter */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Service List
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mb: 3 }}>
              <Box component="li" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                Residential Solar Installation
              </Box>
              <Box component="li" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                Commercial Solar Installation
              </Box>
              <Box component="li" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                Energy Storage Solutions
              </Box>
              <Box component="li" sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                System Maintenance and Monitoring
              </Box>
            </Box>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              SUBSCRIBE TO NEWSLETTER
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
              Get exclusive news & offers through our Energy Precision newsletter
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Box display="flex" gap={1}>
                <TextField
                  placeholder="Your Email"
                  size="small"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                  disabled={loading}
                  sx={{
                    flexGrow: 1,
                    '& .MuiOutlinedInput-root': {
                      bgcolor: 'white',
                      '& fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
                    },
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSubscribe}
                  disabled={loading}
                  sx={{
                    bgcolor: colors.green,
                    color: 'white',
                    '&:hover': { bgcolor: colors.greenDark },
                    textTransform: 'none',
                    minWidth: 100,
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Subscribe'}
                </Button>
              </Box>
              {message && (
                <Alert severity={message.type} sx={{ py: 0, '& .MuiAlert-message': { fontSize: '0.8rem' } }}>
                  {message.text}
                </Alert>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Contact Info */}
        <Box
          sx={{
            borderTop: '1px solid rgba(255,255,255,0.2)',
            mt: 4,
            pt: 3,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            justifyContent: 'center',
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <PhoneIcon />
            <Typography variant="body2">(+233) 533 611 611</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <EmailIcon />
            <Typography variant="body2">energyprecisions@gmail.com</Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationIcon />
            <Typography variant="body2">Haatso, Ecomog</Typography>
          </Box>
        </Box>

        {/* Copyright */}
        <Box sx={{ textAlign: 'center', mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            © Copyright 2025 Energy Precisions. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;



