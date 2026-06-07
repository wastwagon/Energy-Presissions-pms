import React, { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Link,
} from '@mui/material';
import {
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useLocation, useSearchParams } from 'react-router-dom';
import { COMPANY } from '../../data/companyContact';
import { Seo } from '../../components/Seo';
import PublicPageShell from '../../components/public/PublicPageShell';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';
import { trackGenerateLead } from '../../utils/analytics';
import {
  CONTACT_TOPIC_BANNERS,
  CONTACT_TOPIC_MESSAGE_HINTS,
  normalizeContactTopic,
} from '../../utils/contactUrlParams';
import { colors } from '../../theme/colors';
import { publicUi } from '../../theme/publicUi';
import { homeUi } from '../../theme/homeUi';

const Contact: React.FC = () => {
  const { sections } = useCmsPage('contact');
  const [searchParams] = useSearchParams();
  const { search } = useLocation();
  const isQuoteRequest = searchParams.get('action') === 'quote';
  const seo = resolveCmsSeo(
    sections,
    {
      title: 'Contact Energy Precisions | Solar Ghana',
      quoteTitle: 'Request a Solar Quote | Energy Precisions',
      description:
        'Contact Energy Precisions for solar quotes, site assessments and support. Haatso, Accra — serving homes and businesses across Ghana.',
    },
    { isQuoteRequest },
  );
  const contactTopic = useMemo(() => {
    const params = new URLSearchParams(search);
    return normalizeContactTopic(params.get('topic'));
  }, [search]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    message: '',
    company_website: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(search);
    const topic = normalizeContactTopic(params.get('topic'));
    const messageParam = params.get('message');
    const prefill = sessionStorage.getItem('ep_load_prefill');
    if (prefill) {
      sessionStorage.removeItem('ep_load_prefill');
    }

    setFormData((prev) => {
      if (prefill) {
        const hint = topic ? CONTACT_TOPIC_MESSAGE_HINTS[topic] : '';
        const block = [hint, prefill].filter(Boolean).join('\n\n');
        const nextMsg = prev.message.trim()
          ? `${prev.message.trim()}\n\n---\n\n${block}`
          : block;
        return { ...prev, message: nextMsg };
      }
      if (messageParam && prev.message.trim() === '') {
        return { ...prev, message: messageParam };
      }
      if (topic && prev.message.trim() === '') {
        return { ...prev, message: CONTACT_TOPIC_MESSAGE_HINTS[topic] };
      }
      return prev;
    });
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);
    try {
      await api.post('/contact/submit', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        service: formData.service || undefined,
        message: formData.message.trim(),
        company_website: formData.company_website || undefined,
        ...(contactTopic ? { topic: contactTopic } : {}),
      });
      trackGenerateLead(isQuoteRequest ? 'quote_request' : 'contact_form', {
        topic: contactTopic,
      });
      setSubmitOk(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: contactTopic ? CONTACT_TOPIC_MESSAGE_HINTS[contactTopic] : '',
        company_website: '',
      });
    } catch (err: any) {
      const d = err.response?.data?.detail;
      if (err.response?.status === 429) {
        setSubmitError('Too many requests. Please wait a few minutes and try again.');
      } else {
        setSubmitError(typeof d === 'string' ? d : 'Something went wrong. Please try again or call us.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Seo title={seo.title} description={seo.description} path="/contact" />
      <PublicPageShell
        badge={isQuoteRequest ? 'Free quote' : 'Contact'}
        headline={isQuoteRequest ? sections.hero?.quote_title || 'Request a quote' : sections.hero?.title || 'Contact us'}
        description={sections.hero?.subtitle}
        heroAlign="center"
      >
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} md={8}>
            <Card sx={publicUi.card}>
              <CardContent sx={{ p: { xs: 2.5, md: 3 }, position: 'relative' }}>
                {submitOk && (
                  <Typography sx={{ mb: 3, color: colors.greenDark, fontWeight: 600 }}>
                    {sections.form?.success_message}
                  </Typography>
                )}
                {submitError && (
                  <Typography sx={{ mb: 3, color: 'error.main' }}>{submitError}</Typography>
                )}
                {contactTopic && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {CONTACT_TOPIC_BANNERS[contactTopic].title}
                    </Typography>
                    <Typography variant="body2">{CONTACT_TOPIC_BANNERS[contactTopic].body}</Typography>
                  </Alert>
                )}
                <form onSubmit={handleSubmit} autoComplete="on">
                  <input
                    type="text"
                    name="company_website"
                    value={formData.company_website}
                    onChange={(e) => setFormData({ ...formData, company_website: e.target.value })}
                    style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                  />
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Name"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="E-mail Address"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Phone No"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Service Name</InputLabel>
                        <Select
                          value={formData.service}
                          label="Service Name"
                          onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                        >
                          <MenuItem value="Consultation">Consultation</MenuItem>
                          <MenuItem value="Solar Installation">Solar Installation</MenuItem>
                          <MenuItem value="Battery Storage">Battery Storage</MenuItem>
                          <MenuItem value="Efficiency Audit">Efficiency Audit</MenuItem>
                          <MenuItem value="Turbine Maintenance">Turbine Maintenance</MenuItem>
                          <MenuItem value="Energy Training">Energy Training</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Message"
                        multiline
                        rows={4}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={submitting}
                        sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget, px: 4 }}
                      >
                        {submitting ? 'Sending…' : sections.form?.submit_text}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <StackCards sections={sections} />
          </Grid>
        </Grid>
      </PublicPageShell>
    </>
  );
};

const sidebarCardSx = { ...publicUi.card, mb: 2 };

const StackCards: React.FC<{ sections: any }> = ({ sections }) => (
  <Box>
    <Card sx={sidebarCardSx}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <PhoneIcon sx={{ color: colors.green, fontSize: '2rem' }} />
          <Box>
            <Typography sx={{ fontWeight: 700 }}>{sections.sidebar?.phone_label}</Typography>
            <Link href={COMPANY.phoneHref} underline="none" sx={{ ...publicUi.mutedText, fontSize: '0.875rem' }}>
              {COMPANY.phoneDisplay}
            </Link>
          </Box>
        </Box>
      </CardContent>
    </Card>
    <Card sx={sidebarCardSx}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <ChatIcon sx={{ color: colors.green, fontSize: '2rem' }} />
          <Box>
            <Typography sx={{ fontWeight: 700 }}>WhatsApp</Typography>
            <Link href={COMPANY.whatsappHref} target="_blank" rel="noopener noreferrer" underline="none" sx={{ ...publicUi.mutedText, fontSize: '0.875rem' }}>
              {COMPANY.whatsappDisplay}
            </Link>
          </Box>
        </Box>
      </CardContent>
    </Card>
    <Card sx={sidebarCardSx}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <EmailIcon sx={{ color: colors.green, fontSize: '2rem' }} />
          <Box>
            <Typography sx={{ fontWeight: 700 }}>{sections.sidebar?.email_label}</Typography>
            <Link href={`mailto:${COMPANY.emailSales}`} underline="none" sx={{ ...publicUi.mutedText, fontSize: '0.875rem' }}>
              {COMPANY.emailSales}
            </Link>
          </Box>
        </Box>
      </CardContent>
    </Card>
    <Card sx={publicUi.card}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2}>
          <LocationIcon sx={{ color: colors.green, fontSize: '2rem' }} />
          <Box>
            <Typography sx={{ fontWeight: 700 }}>{sections.sidebar?.location_label}</Typography>
            <Typography sx={{ ...publicUi.mutedText, fontSize: '0.875rem' }}>{COMPANY.addressFull}</Typography>
            <Typography sx={{ ...publicUi.mutedText, fontSize: '0.8125rem', mt: 1 }}>
              We typically respond within one business day.
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  </Box>
);

export default Contact;
