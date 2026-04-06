import React, { useState } from 'react';
import api from '../../services/api';
import {
  Box,
  Container,
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
} from '@mui/material';
import { Phone as PhoneIcon, Email as EmailIcon, LocationOn as LocationIcon } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import websiteContent from '../../data/extracted_content.json';
import { Seo } from '../../components/Seo';
import { trackGenerateLead } from '../../utils/analytics';

const Contact: React.FC = () => {
  const [searchParams] = useSearchParams();
  const isQuoteRequest = searchParams.get('action') === 'quote';
  const content = websiteContent;

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
      });
      trackGenerateLead(isQuoteRequest ? 'quote_request' : 'contact_form');
      setSubmitOk(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        service: '',
        message: '',
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
    <Box sx={{ py: { xs: 3, md: 6 } }}>
      <Seo
        title={isQuoteRequest ? 'Request a Solar Quote | Energy Precisions' : 'Contact Energy Precisions | Solar Ghana'}
        description="Contact Energy Precisions for solar quotes, site assessments and support. Haatso, Accra — serving homes and businesses across Ghana."
        path="/contact"
      />
      <Container maxWidth="lg">
        <Box textAlign="center" mb={{ xs: 3, md: 4 }}>
          <Typography variant="h2" sx={{ mb: 1, fontWeight: 800, color: '#1a4d7a', fontSize: { xs: '1.5rem', md: '1.85rem' } }}>
            {isQuoteRequest ? 'Request a Quote' : "Let's discuss a project"}
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Get in touch with us for expert solar solutions
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: { xs: 2.5, md: 3 }, position: 'relative' }}>
                {submitOk && (
                  <Typography sx={{ mb: 3, color: '#00E676', fontWeight: 600 }}>
                    Thank you for your message. We will contact you soon.
                  </Typography>
                )}
                {submitError && (
                  <Typography sx={{ mb: 3, color: 'error.main' }}>{submitError}</Typography>
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
                        sx={{
                          bgcolor: '#00E676',
                          '&:hover': { bgcolor: '#00C85F' },
                          textTransform: 'none',
                          px: 4,
                        }}
                      >
                        {submitting ? 'Sending…' : 'Send Us Mail'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <PhoneIcon sx={{ color: '#00E676', fontSize: '2rem' }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Call For Services
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {content.contact.phone}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <EmailIcon sx={{ color: '#00E676', fontSize: '2rem' }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Send Us Email
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {content.contact.email_alt}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>

              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={2}>
                    <LocationIcon sx={{ color: '#00E676', fontSize: '2rem' }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        Visit Our Location
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        {content.contact.address}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact;

