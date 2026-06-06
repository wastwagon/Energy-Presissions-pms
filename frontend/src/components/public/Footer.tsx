import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  TextField,
  Button,
  CircularProgress,
  Stack,
  Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import {
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

/** Dark-footer contrast tokens — tuned for readability on blueBlack */
const ft = {
  text: 'rgba(255,255,255,0.92)',
  body: 'rgba(255,255,255,0.78)',
  muted: 'rgba(255,255,255,0.58)',
  faint: 'rgba(255,255,255,0.52)',
  border: 'rgba(255,255,255,0.1)',
  inputBg: 'rgba(255,255,255,0.08)',
  inputBorder: 'rgba(255,255,255,0.18)',
  inputBorderHover: 'rgba(255,255,255,0.28)',
  placeholder: 'rgba(255,255,255,0.5)',
};

const linkSx = {
  display: 'flex',
  alignItems: 'center',
  color: ft.body,
  fontSize: '0.875rem',
  lineHeight: 1.45,
  textDecoration: 'none',
  minHeight: { xs: 40, md: 32 },
  transition: 'color 0.2s ease',
  '&:hover': { color: ft.text },
};

const columnLabelSx = {
  color: ft.muted,
  fontWeight: 600,
  fontSize: '0.6875rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  mb: { xs: 1.25, md: 1.5 },
};

const FooterLink: React.FC<{ link: CmsLink }> = ({ link }) => {
  const isExternal =
    link.path.startsWith('http') || link.path.startsWith('tel:') || link.path.startsWith('mailto:');
  const isHash = link.path.includes('#');

  if (isExternal || isHash) {
    return (
      <Link href={link.path} underline="none" sx={linkSx}>
        {link.label}
      </Link>
    );
  }

  return (
    <Link component={RouterLink} to={link.path} underline="none" sx={linkSx}>
      {link.label}
    </Link>
  );
};

const socialIconSx = {
  width: 40,
  height: 40,
  borderRadius: '50%',
  border: `1px solid ${ft.border}`,
  color: ft.body,
  transition: 'color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
  '&:hover': {
    color: ft.text,
    borderColor: ft.inputBorderHover,
    bgcolor: ft.inputBg,
  },
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
      setMessage({ type: 'success', text: 'Thank you for subscribing.' });
      setEmail('');
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: err.response?.data?.detail || 'Subscription failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: colors.blueBlack,
        color: ft.text,
        pt: { xs: 4.5, md: 7 },
        pb: { xs: 'calc(4.5rem + env(safe-area-inset-bottom, 0px))', md: 3.5 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: homeUi.containerPx }}>
        {/* Newsletter */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 2, md: 3 },
            pb: { xs: 3.5, md: 5 },
            mb: { xs: 3.5, md: 4.5 },
            borderBottom: `1px solid ${ft.border}`,
          }}
        >
          <Box>
            <Typography component="p" sx={{ ...columnLabelSx, mb: 0.75 }}>
              {footer.newsletter_title}
            </Typography>
            <Typography
              sx={{
                color: ft.body,
                fontSize: '0.9375rem',
                lineHeight: 1.55,
                maxWidth: 420,
              }}
            >
              {footer.newsletter_text}
            </Typography>
          </Box>

          <Box sx={{ width: '100%', maxWidth: { md: 460 } }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                placeholder="Email address"
                size="small"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                disabled={loading}
                fullWidth
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 999,
                    bgcolor: ft.inputBg,
                    color: ft.text,
                    fontSize: '0.9375rem',
                    minHeight: 48,
                    '& fieldset': { borderColor: ft.inputBorder },
                    '&:hover fieldset': { borderColor: ft.inputBorderHover },
                    '&.Mui-focused fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                  },
                  '& .MuiOutlinedInput-input::placeholder': {
                    color: ft.placeholder,
                    opacity: 1,
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSubscribe}
                disabled={loading}
                sx={{
                  ...homeUi.touchTarget,
                  borderRadius: 999,
                  px: 3,
                  minWidth: { xs: '100%', sm: 120 },
                  flexShrink: 0,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  bgcolor: colors.green,
                  color: colors.blueBlack,
                  boxShadow: 'none',
                  '&:hover': { bgcolor: colors.greenDark, boxShadow: 'none' },
                }}
              >
                {loading ? <CircularProgress size={22} sx={{ color: colors.blueBlack }} /> : footer.subscribe_button}
              </Button>
            </Stack>
            {message && (
              <Typography
                sx={{
                  mt: 1,
                  fontSize: '0.8125rem',
                  color: message.type === 'success' ? colors.green : '#fecaca',
                }}
              >
                {message.text}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Main footer grid — single column on mobile, opens up on tablet+ */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1.6fr 1fr 1fr 1.2fr' },
            gap: { xs: 3, sm: 3.5, md: 4 },
            mb: { xs: 3.5, md: 4.5 },
          }}
        >
          <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1', md: 'auto' } }}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1.0625rem', md: '1.125rem' },
                letterSpacing: '-0.022em',
                color: ft.text,
                mb: 1,
              }}
            >
              {footer.company_name}
            </Typography>
            <Typography
              sx={{
                color: ft.body,
                fontSize: '0.875rem',
                lineHeight: 1.6,
                maxWidth: 340,
                mb: 2,
              }}
            >
              {footer.tagline}
            </Typography>

            <Stack spacing={0.5}>
              <Link href={COMPANY.phoneHref} underline="none" sx={linkSx}>
                {COMPANY.phoneDisplay}
              </Link>
              <Link href={`mailto:${COMPANY.emailSales}`} underline="none" sx={linkSx}>
                {COMPANY.emailSales}
              </Link>
              <Typography sx={{ color: ft.body, fontSize: '0.875rem', lineHeight: 1.55, pt: 0.25 }}>
                {COMPANY.addressFull}
              </Typography>
            </Stack>
          </Box>

          <Box component="nav" aria-label={footer.quick_links_title}>
            <Typography component="p" sx={columnLabelSx}>
              {footer.quick_links_title}
            </Typography>
            <Stack spacing={0.25}>
              {(footer.quick_links || []).map((link) => (
                <FooterLink key={`${link.path}-${link.label}`} link={link} />
              ))}
            </Stack>
          </Box>

          <Box component="nav" aria-label={footer.other_links_title}>
            <Typography component="p" sx={columnLabelSx}>
              {footer.other_links_title}
            </Typography>
            <Stack spacing={0.25}>
              {(footer.other_links || []).map((link) => (
                <FooterLink key={`${link.path}-${link.label}`} link={link} />
              ))}
            </Stack>
          </Box>

          <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1', md: 'auto' } }}>
            <Typography component="p" sx={columnLabelSx}>
              {footer.service_list_title}
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)', md: '1fr' },
                gap: { xs: 1, sm: 2, md: 0.75 },
              }}
            >
              {(footer.service_list || []).map((item) => (
                <Typography
                  key={item}
                  sx={{ color: ft.body, fontSize: '0.875rem', lineHeight: 1.45 }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ borderColor: ft.border, mb: { xs: 2.5, md: 3 } }} />

        <Stack
          direction={{ xs: 'column-reverse', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={{ xs: 2, sm: 2.5 }}
        >
          <Typography sx={{ color: ft.faint, fontSize: '0.8125rem', lineHeight: 1.5 }}>
            {copyright}
          </Typography>

          <Stack direction="row" spacing={0.75}>
            <Link
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              sx={{ ...socialIconSx, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <FacebookIcon sx={{ fontSize: 18 }} />
            </Link>
            <Link
              href={SOCIAL_LINKS.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              sx={{ ...socialIconSx, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <TwitterIcon sx={{ fontSize: 18 }} />
            </Link>
            <Link
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              sx={{ ...socialIconSx, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <LinkedInIcon sx={{ fontSize: 18 }} />
            </Link>
            <Link
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              sx={{ ...socialIconSx, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <InstagramIcon sx={{ fontSize: 18 }} />
            </Link>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;
