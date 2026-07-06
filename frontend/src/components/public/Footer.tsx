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
  Grid,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
} from '@mui/icons-material';
import api from '../../services/api';
import { formatApiErrorDetail } from '../../utils/apiErrorMessage';
import {
  DEFAULT_FOOTER_LEGAL_LINKS,
  DEFAULT_FOOTER_TOOLS_LINKS,
  resolveFooterServiceLinks,
} from '../../data/footerLinks';
import { useCmsPage } from '../../hooks/useCmsPage';
import { useGlobalSiteConfig } from '../../hooks/useGlobalSiteConfig';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { MOBILE_TAB_BAR_RESERVE } from '../../utils/mobileChrome';
import { publicUi } from '../../theme/publicUi';
import type { CmsLink } from '../../types/cms';

const ft = {
  text: '#ffffff',
  body: 'rgba(255,255,255,0.82)',
  muted: 'rgba(255,255,255,0.55)',
  faint: 'rgba(255,255,255,0.48)',
  border: 'rgba(255,255,255,0.1)',
  inputBg: 'rgba(255,255,255,0.08)',
  inputBorder: 'rgba(255,255,255,0.18)',
  inputBorderHover: 'rgba(255,255,255,0.28)',
  placeholder: 'rgba(255,255,255,0.5)',
};

const linkSx = {
  display: 'block',
  color: ft.body,
  fontSize: '0.875rem',
  lineHeight: 1.5,
  textDecoration: 'none',
  py: 0.4,
  transition: 'color 0.2s ease',
  '&:hover': { color: ft.text },
};

const columnLabelSx = {
  color: ft.muted,
  fontWeight: 600,
  fontSize: '0.6875rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  mb: 1.25,
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

const FooterNavColumn: React.FC<{ title: string; links: CmsLink[]; ariaLabel: string }> = ({
  title,
  links,
  ariaLabel,
}) => (
  <Box component="nav" aria-label={ariaLabel}>
    <Typography component="p" sx={columnLabelSx}>
      {title}
    </Typography>
    <Stack spacing={0.15}>
      {links.map((link) => (
        <FooterLink key={`${link.path}-${link.label}`} link={link} />
      ))}
    </Stack>
  </Box>
);

const socialIconSx = {
  width: 38,
  height: 38,
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
  const { contact, social } = useGlobalSiteConfig();
  const footer = sections.footer;
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const copyright = (footer.copyright || '').replace('{year}', String(new Date().getFullYear()));
  const serviceLinks = resolveFooterServiceLinks(footer.service_links, footer.service_list);
  const toolsLinks = footer.tools_links?.length ? footer.tools_links : DEFAULT_FOOTER_TOOLS_LINKS;
  const legalLinks = footer.legal_links?.length ? footer.legal_links : DEFAULT_FOOTER_LEGAL_LINKS;

  const handleSubscribe = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/newsletter/subscribe', { email, company_website: honeypot });
      setMessage({ type: 'success', text: 'Thank you for subscribing.' });
      setEmail('');
    } catch (err: any) {
      setMessage({
        type: 'error',
        text: formatApiErrorDetail(err) || 'Subscription failed. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        background: publicUi.topBar.bgGradient,
        color: ft.text,
        borderTop: `1px solid ${publicUi.topBar.accentLine}`,
        pt: { xs: 5, md: 7 },
        pb: { xs: `calc(${MOBILE_TAB_BAR_RESERVE}px + env(safe-area-inset-bottom, 0px))`, md: 4 },
      }}
    >
      <Container maxWidth="xl" sx={{ px: homeUi.containerPx }}>
        {/* Newsletter band */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
            gap: { xs: 2, md: 4 },
            alignItems: { md: 'end' },
            pb: { xs: 4, md: 5 },
            mb: { xs: 4, md: 5 },
            borderBottom: `1px solid ${ft.border}`,
          }}
        >
          <Box>
            <Typography component="p" sx={{ ...columnLabelSx, mb: 0.75 }}>
              {footer.newsletter_title}
            </Typography>
            <Typography sx={{ color: ft.body, fontSize: '0.9375rem', lineHeight: 1.55, maxWidth: 440 }}>
              {footer.newsletter_text}
            </Typography>
          </Box>
          <Box>
            <Box
              component="input"
              type="text"
              name="company_website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              sx={{ position: 'absolute', left: -9999, width: 1, height: 1, opacity: 0 }}
            />
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
                  '& .MuiOutlinedInput-input::placeholder': { color: ft.placeholder, opacity: 1 },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSubscribe}
                disabled={loading}
                sx={{
                  ...homeUi.touchTarget,
                  ...publicUi.topBarQuoteButton,
                  minWidth: { xs: '100%', sm: 128 },
                  flexShrink: 0,
                  fontSize: '0.9375rem',
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

        {/* Link columns */}
        <Grid container spacing={{ xs: 3.5, md: 4, lg: 5 }} sx={{ mb: { xs: 4, md: 5 } }}>
          <Grid item xs={12} lg={3}>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '1.125rem',
                letterSpacing: '-0.022em',
                mb: 1,
              }}
            >
              {footer.company_name}
            </Typography>
            <Typography sx={{ color: ft.body, fontSize: '0.875rem', lineHeight: 1.65, mb: 2.5, maxWidth: 320 }}>
              {footer.tagline}
            </Typography>
            <Stack spacing={0.35} sx={{ mb: 2.5 }}>
              <Link href={contact.phoneHref} underline="none" sx={linkSx}>
                {contact.phoneDisplay}
              </Link>
              <Link href={contact.whatsappHref} target="_blank" rel="noopener noreferrer" underline="none" sx={linkSx}>
                {contact.whatsappDisplay}
              </Link>
              <Link href={`mailto:${contact.emailSales}`} underline="none" sx={linkSx}>
                {contact.emailSales}
              </Link>
              <Typography sx={{ color: ft.body, fontSize: '0.875rem', lineHeight: 1.55, py: 0.4 }}>
                {contact.addressFull}
              </Typography>
            </Stack>
            <Button
              component={RouterLink}
              to="/contact?action=quote"
              endIcon={<ArrowForwardIcon sx={{ fontSize: 18 }} />}
              sx={{
                ...publicUi.topBarQuoteButton,
                px: 2.5,
                py: 0.85,
                fontSize: '0.875rem',
              }}
            >
              Get a quote
            </Button>
          </Grid>

          <Grid item xs={6} sm={4} lg={2}>
            <FooterNavColumn
              title={footer.service_links_title || footer.service_list_title || 'Services'}
              links={serviceLinks}
              ariaLabel="Services"
            />
          </Grid>

          <Grid item xs={6} sm={4} lg={2}>
            <FooterNavColumn
              title={footer.quick_links_title || 'Explore'}
              links={footer.quick_links || []}
              ariaLabel="Explore"
            />
          </Grid>

          <Grid item xs={6} sm={4} lg={2}>
            <FooterNavColumn
              title={footer.tools_links_title || 'Tools & resources'}
              links={toolsLinks}
              ariaLabel="Tools and resources"
            />
          </Grid>

          <Grid item xs={6} sm={4} lg={3}>
            <FooterNavColumn
              title={footer.other_links_title || 'Company'}
              links={footer.other_links || []}
              ariaLabel="Company"
            />
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: ft.border, mb: { xs: 2.5, md: 3 } }} />

        {/* Bottom bar */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={{ xs: 2, md: 2.5 }}
        >
          <Typography sx={{ color: ft.faint, fontSize: '0.8125rem' }}>{copyright}</Typography>

          <Stack direction="row" flexWrap="wrap" gap={{ xs: 1.5, sm: 2 }} sx={{ py: 0.25 }}>
            {legalLinks.map((link) => (
              <FooterLink key={`legal-${link.path}`} link={link} />
            ))}
          </Stack>

          <Stack direction="row" spacing={0.75}>
            <Link
              href={social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              sx={{ ...socialIconSx, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <FacebookIcon sx={{ fontSize: 18 }} />
            </Link>
            <Link
              href={social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="X (Twitter)"
              sx={{ ...socialIconSx, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <TwitterIcon sx={{ fontSize: 18 }} />
            </Link>
            <Link
              href={social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              sx={{ ...socialIconSx, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <LinkedInIcon sx={{ fontSize: 18 }} />
            </Link>
            <Link
              href={social.instagram}
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
