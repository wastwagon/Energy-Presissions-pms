import React, { useState } from 'react';
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
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will contact you soon.');
  };

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 'bold', color: '#1a4d7a' }}>
            {isQuoteRequest ? 'Request a Quote' : "Let's discuss a project"}
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Get in touch with us for expert solar solutions
          </Typography>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <form onSubmit={handleSubmit}>
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
                        sx={{
                          bgcolor: '#00E676',
                          '&:hover': { bgcolor: '#00C85F' },
                          textTransform: 'none',
                          px: 4,
                        }}
                      >
                        Send Us Mail
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

