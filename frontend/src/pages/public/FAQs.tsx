import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Link,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon, Search as SearchIcon } from '@mui/icons-material';
import websiteContent from '../../data/extracted_content.json';
import { Seo } from '../../components/Seo';
import PublicPageShell from '../../components/public/PublicPageShell';
import api from '../../services/api';
import { faqPageJsonLd } from '../../utils/jsonLd';
import { colors } from '../../theme/colors';
import { publicUi } from '../../theme/publicUi';
import { homeUi } from '../../theme/homeUi';

type Faq = { question: string; answer: string };

const FAQs: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>(websiteContent.faqs as Faq[]);
  const [query, setQuery] = useState('');

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q),
    );
  }, [faqs, query]);

  return (
    <>
      <Seo
        title="Solar FAQs Ghana | Energy Precisions"
        description="Answers to common questions about solar panels, installation, batteries, costs and maintenance in Ghana — from Energy Precisions."
        path="/faqs"
        jsonLd={faqPageJsonLd(faqs)}
      />
      <PublicPageShell
        badge="Support"
        headline="Frequently asked questions"
        description="Have questions about solar in Ghana? Start here — or use our planning tools for a rough sizing estimate."
        heroAlign="center"
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search FAQs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          sx={{ mb: 3, maxWidth: 480, mx: 'auto', display: 'block' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.gray400 }} />
              </InputAdornment>
            ),
          }}
        />

        <Typography sx={{ ...homeUi.body, ...publicUi.mutedText, textAlign: 'center', mb: 3 }}>
          Planning tools:{' '}
          <Link component={RouterLink} to="/solar-estimate" sx={publicUi.inlineLink}>
            Solar size estimator
          </Link>
          {' · '}
          <Link component={RouterLink} to="/load-calculator" sx={publicUi.inlineLink}>
            Load calculator
          </Link>
        </Typography>

        <Box sx={{ maxWidth: 800, mx: 'auto' }}>
          {filtered.map((faq, index) => (
            <Accordion
              key={`${faq.question}-${index}`}
              sx={{ ...publicUi.card, mb: 1.5, '&:before': { display: 'none' } }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 700, fontSize: '0.9375rem' }}>{faq.question}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography sx={{ ...homeUi.body, ...publicUi.mutedText }}>{faq.answer}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
          {filtered.length === 0 && (
            <Typography sx={{ ...publicUi.mutedText, textAlign: 'center', py: 4 }}>
              No FAQs match your search.{' '}
              <Link component={RouterLink} to="/contact" sx={publicUi.inlineLink}>
                Contact us
              </Link>{' '}
              instead.
            </Typography>
          )}
        </Box>
      </PublicPageShell>
    </>
  );
};

export default FAQs;
