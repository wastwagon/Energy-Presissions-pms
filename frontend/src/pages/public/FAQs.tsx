import React from 'react';
import { Box, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import websiteContent from '../../data/extracted_content.json';

const FAQs: React.FC = () => {
  const content = websiteContent;

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
          <Typography variant="h2" sx={{ mb: 2, fontWeight: 'bold', color: '#1a4d7a' }}>
            Frequently Asked Questions
          </Typography>
          <Typography variant="h5" sx={{ color: '#666' }}>
            Have Any Questions about Solar Energy?
          </Typography>
        </Box>

        <Box>
          {content.faqs.map((faq, index) => (
            <Accordion key={index} sx={{ mb: 2, boxShadow: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {faq.question}
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.8 }}>
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

