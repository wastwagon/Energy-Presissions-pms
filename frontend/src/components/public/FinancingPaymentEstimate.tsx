import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Slider,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';
import { useGlobalSiteConfig } from '../../hooks/useGlobalSiteConfig';

function monthlyPayment(principal: number, annualRatePct: number, months: number): number {
  if (months <= 0 || principal <= 0) return 0;
  if (annualRatePct <= 0) return principal / months;
  const r = annualRatePct / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

const sliderSx = {
  color: colors.green,
  py: 1.5,
  '& .MuiSlider-thumb': {
    width: 22,
    height: 22,
  },
  '& .MuiSlider-rail': { opacity: 0.35 },
};

type Props = {
  title?: string;
  subtitle?: string;
};

const FinancingPaymentEstimate: React.FC<Props> = ({
  title = 'Example monthly payment',
  subtitle = 'Indicative only — actual terms depend on project size, lender, and your quote. Request a formal proposal for binding numbers.',
}) => {
  const { cta } = useGlobalSiteConfig();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [projectGhs, setProjectGhs] = useState('150000');
  const [downPct, setDownPct] = useState(30);
  const [termMonths, setTermMonths] = useState(24);
  const [ratePct, setRatePct] = useState(18);

  const result = useMemo(() => {
    const total = parseFloat(projectGhs.replace(/,/g, '')) || 0;
    const financed = total * (1 - downPct / 100);
    const monthly = monthlyPayment(financed, ratePct, termMonths);
    return { total, financed, monthly };
  }, [projectGhs, downPct, termMonths, ratePct]);

  return (
    <Card sx={{ ...publicUi.card, mt: 4 }}>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{title}</Typography>
        <Typography sx={{ ...publicUi.mutedText, mb: 2.5 }}>{subtitle}</Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Project cost (GHS)"
              value={projectGhs}
              onChange={(e) => setProjectGhs(e.target.value)}
              inputMode="decimal"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={publicUi.mutedText}>
              Down payment: {downPct}%
            </Typography>
            <Slider value={downPct} onChange={(_, v) => setDownPct(v as number)} min={0} max={70} step={5} sx={sliderSx} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={publicUi.mutedText}>
              Term: {termMonths} months
            </Typography>
            <Slider
              value={termMonths}
              onChange={(_, v) => setTermMonths(v as number)}
              min={6}
              max={48}
              step={6}
              marks={[
                { value: 12, label: '12' },
                { value: 24, label: '24' },
                { value: 36, label: '36' },
              ]}
              sx={sliderSx}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Indicative APR (%)"
              value={String(ratePct)}
              onChange={(e) => setRatePct(parseFloat(e.target.value) || 0)}
              inputMode="decimal"
              helperText="Placeholder rate for planning — not an offer"
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, p: 2, borderRadius: homeUi.innerRadius, bgcolor: colors.offWhite, border: homeUi.cardBorder }}>
          <Typography sx={{ ...homeUi.caption, ...publicUi.mutedText, mb: 0.5 }}>
            Financed amount: GHS {Math.round(result.financed).toLocaleString()}
          </Typography>
          <Typography sx={{ ...homeUi.headingSm, color: colors.blueBlack }}>
            ≈ GHS {Math.round(result.monthly).toLocaleString()} / month
          </Typography>
        </Box>

        {!isMobile && (
          <Button
            component={RouterLink}
            to={`${cta.quoteHref}&topic=financing`}
            variant="contained"
            sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget, mt: 2.5 }}
          >
            Discuss financing on your quote
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default FinancingPaymentEstimate;
