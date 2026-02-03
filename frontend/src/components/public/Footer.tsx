import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  TextField,
  Button,
  IconButton,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const Footer: React.FC = () => {
  const theme = useTheme();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: '#1a4d7a',
        color: 'white',
        pt: 6,
        pb: 3,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#00E676' }}>
              ENERGY PRECISIONS
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
              We provide turnkey solar solutions, from design, installation, and commissioning to
              monitoring and maintenance.
            </Typography>
            <Box display="flex" gap={1} mt={2}>
              <IconButton sx={{ color: 'white' }} size="small">
                <FacebookIcon />
              </IconButton>
              <IconButton sx={{ color: 'white' }} size="small">
                <TwitterIcon />
              </IconButton>
              <IconButton sx={{ color: 'white' }} size="small">
                <LinkedInIcon />
              </IconButton>
              <IconButton sx={{ color: 'white' }} size="small">
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
                <Link href="/about" color="inherit" sx={{ textDecoration: 'none', '&:hover': { color: '#00E676' } }}>
                  About EnergyPrecisions
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/about" color="inherit" sx={{ textDecoration: 'none', '&:hover': { color: '#00E676' } }}>
                  Our History
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/contact?action=quote" color="inherit" sx={{ textDecoration: 'none', '&:hover': { color: '#00E676' } }}>
                  Get a Quote
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/shop" color="inherit" sx={{ textDecoration: 'none', '&:hover': { color: '#00E676' } }}>
                  Our Pricing
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
                <Link href="/contact" color="inherit" sx={{ textDecoration: 'none', '&:hover': { color: '#00E676' } }}>
                  Contact Us
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/projects" color="inherit" sx={{ textDecoration: 'none', '&:hover': { color: '#00E676' } }}>
                  Our Projects
                </Link>
              </Box>
              <Box component="li" sx={{ mb: 1 }}>
                <Link href="/testimonials" color="inherit" sx={{ textDecoration: 'none', '&:hover': { color: '#00E676' } }}>
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
                Energy storage Solutions
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
            <Box display="flex" gap={1}>
              <TextField
                placeholder="Your Email"
                size="small"
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
                sx={{
                  bgcolor: '#00E676',
                  color: 'white',
                  '&:hover': { bgcolor: '#00C85F' },
                  textTransform: 'none',
                }}
              >
                Subscribe
              </Button>
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
            © Copyright 2025 EnergyPrecisions. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;



