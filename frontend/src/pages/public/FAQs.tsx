import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import websiteContent from '../../data/extracted_content.json';
import { Seo } from '../../components/Seo';
import api from '../../services/api';

type Faq = { question: string; answer: string };

const FAQs: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>(websiteContent.faqs as Faq[]);

  useEffect(() => {
    let cancelled = false;
    api
      .get<Faq[]>('/content/faqs')
      .then((res) => {
        if (!cancelled && Array.isArray(res.data) && res.data.length > 0) {
          setFaqs(res.data);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Box sx={{ py: { xs: 3, md: 6 } }}>
      <Seo
        title="Solar FAQs Ghana | Energy Precisions"
        description="Answers to common questions about solar panels, installation, batteries, costs and maintenance in Ghana — from Energy Precisions."
        path="/faqs"
      />
      <Container maxWidth="lg">
        <Box textAlign="center" mb={{ xs: 3, md: 4 }}>
          <Typography variant="h2" sx={{ mb: 1, fontWeight: 800, color: '#1a4d7a', fontSize: { xs: '1.5rem', md: '1.85rem' } }}>
            Frequently Asked Questions
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Have Any Questions about Solar Energy?
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 2, lineHeight: 1.65 }}>
            Planning tools:{' '}
            <Link to="/solar-estimate" style={{ color: '#00c853', fontWeight: 700, textDecoration: 'none' }}>
              Solar size estimator
            </Link>
            {' · '}
            <Link to="/load-calculator" style={{ color: '#00c853', fontWeight: 700, textDecoration: 'none' }}>
              Appliance load calculator
            </Link>
          </Typography>
        </Box>

        <Box>
          {faqs.map((faq, index) => (
            <Accordion key={`${faq.question}-${index}`} sx={{ mb: 1.5, boxShadow: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.65 }}>
                  {faq.answer}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FAQs;
