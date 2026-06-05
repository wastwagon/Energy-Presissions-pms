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
import { SOCIAL_LINKS } from '../../data/socialLinks';
import { COMPANY } from '../../data/companyContact';
import { useCmsPage } from '../../hooks/useCmsPage';
import type { CmsLink } from '../../types/cms';

const FooterLink: React.FC<{ link: CmsLink }> = ({ link }) => {
  const isExternal = link.path.startsWith('http') || link.path.startsWith('tel:') || link.path.startsWith('mailto:');
  const isHash = link.path.includes('#');

  if (isExternal) {
    return (
      <Link href={link.path} underline="none" color="inherit" sx={{ '&:hover': { color: colors.green } }}>
        {link.label}
      </Link>
    );
  }

  if (isHash) {
    return (
      <Link href={link.path} underline="none" color="inherit" sx={{ '&:hover': { color: colors.green } }}>
        {link.label}
      </Link>
    );
  }

  return (
    <Link component={RouterLink} to={link.path} underline="none" color="inherit" sx={{ '&:hover': { color: colors.green } }}>
      {link.label}
    </Link>
  );
};

const Footer: React.FC = () => {
  const { sections } = useCmsPage('global');
  const footer = sections.footer;
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const copyright = (footer.copyright || '').replace('{year}', String(new Date().getFullYear()));

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
        pt: { xs: 4, md: 5 },
        pb: { xs: 'calc(5rem + env(safe-area-inset-bottom, 0px))', md: 2.5 },
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={{ xs: 3, md: 3 }}>
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" sx={{ mb: 1.25, fontWeight: 700, color: colors.green }}>
              {footer.company_name}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>
              {footer.tagline}
            </Typography>
            <Box display="flex" gap={0.75} mt={1.5}>
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

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ mb: 1.25, fontWeight: 700 }}>
              {footer.quick_links_title}
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {(footer.quick_links || []).map((link) => (
                <Box component="li" key={`${link.path}-${link.label}`} sx={{ mb: 0.5 }}>
                  <FooterLink link={link} />
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="subtitle1" sx={{ mb: 1.25, fontWeight: 700 }}>
              {footer.other_links_title}
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              {(footer.other_links || []).map((link) => (
                <Box component="li" key={`${link.path}-${link.label}`} sx={{ mb: 0.5 }}>
                  <FooterLink link={link} />
                </Box>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12} md={3}>
            <Typography variant="subtitle1" sx={{ mb: 1.25, fontWeight: 700 }}>
              {footer.service_list_title}
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, mb: 2 }}>
              {(footer.service_list || []).map((item) => (
                <Box component="li" key={item} sx={{ mb: 0.5, fontSize: '0.875rem' }}>
                  {item}
                </Box>
              ))}
            </Box>

            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700, letterSpacing: 0.02 }}>
              {footer.newsletter_title}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1.5, color: 'rgba(255,255,255,0.8)', lineHeight: 1.55 }}>
              {footer.newsletter_text}
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
                  size="small"
                  onClick={handleSubscribe}
                  disabled={loading}
                  sx={{
                    bgcolor: colors.green,
                    color: 'white',
                    '&:hover': { bgcolor: colors.greenDark },
                    textTransform: 'none',
                    minWidth: 88,
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : footer.subscribe_button}
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

        <Box
          sx={{
            borderTop: '1px solid rgba(255,255,255,0.2)',
            mt: 3,
            pt: 2.5,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'center',
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <PhoneIcon />
            <Typography
              component="a"
              href={COMPANY.phoneHref}
              variant="body2"
              sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: colors.green } }}
            >
              {COMPANY.phoneDisplay}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <EmailIcon />
            <Typography
              component="a"
              href={`mailto:${COMPANY.emailSales}`}
              variant="body2"
              sx={{ color: 'inherit', textDecoration: 'none', '&:hover': { color: colors.green } }}
            >
              {COMPANY.emailSales}
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <LocationIcon />
            <Typography variant="body2">{COMPANY.addressFull}</Typography>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            {copyright}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
