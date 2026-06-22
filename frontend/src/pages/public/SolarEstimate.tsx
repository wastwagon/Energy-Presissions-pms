import React, { useMemo, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Seo } from '../../components/Seo';
import PublicPageShell from '../../components/public/PublicPageShell';
import { useCmsPage } from '../../hooks/useCmsPage';
import { resolveCmsSeo } from '../../hooks/useCmsSeo';
import { colors } from '../../theme/colors';
import { publicUi } from '../../theme/publicUi';
import { homeUi } from '../../theme/homeUi';
import { ballparkSizingFromMonthlyKwh } from '../../utils/solarSizingApprox';
import PublicStickyMobileCta from '../../components/public/PublicStickyMobileCta';
import { SITE_CTA } from '../../data/siteCta';

const toggleSx = {
  '& .MuiToggleButton-root': {
    flex: 1,
    minHeight: 48,
    textTransform: 'none' as const,
    fontWeight: 600,
    fontSize: '0.875rem',
  },
};

const SolarEstimate: React.FC = () => {
  const { sections } = useCmsPage('solar_estimate');
  const seo = resolveCmsSeo(sections, {
    title: 'Solar System Size Estimator Ghana | Ballpark kW | Energy Precisions',
    description:
      'Rough, non-binding estimate of solar array size from monthly energy use or bill. For an engineered quote, contact Energy Precisions in Accra.',
  });
  const { hero } = sections;
  const [mode, setMode] = useState<'kwh' | 'bill'>('kwh');
  const [monthlyKwh, setMonthlyKwh] = useState<string>('450');
  const [monthlyBill, setMonthlyBill] = useState<string>('800');
  const [tariff, setTariff] = useState<string>('1.45');
  const [peakSun, setPeakSun] = useState<string>('5.2');
  const [performanceRatio, setPerformanceRatio] = useState<string>('0.76');

  const effectiveMonthlyKwh = useMemo(() => {
    if (mode === 'kwh') {
      const v = parseFloat(monthlyKwh.replace(/,/g, ''));
      return Number.isFinite(v) ? v : 0;
    }
    const bill = parseFloat(monthlyBill.replace(/,/g, ''));
    const t = parseFloat(tariff.replace(/,/g, ''));
    if (!Number.isFinite(bill) || !Number.isFinite(t) || t <= 0) return 0;
    return bill / t;
  }, [mode, monthlyKwh, monthlyBill, tariff]);

  const ps = parseFloat(peakSun) || 0;
  const pr = parseFloat(performanceRatio) || 0;
  const result = useMemo(
    () => ballparkSizingFromMonthlyKwh(effectiveMonthlyKwh, ps, pr),
    [effectiveMonthlyKwh, ps, pr]
  );

  return (
    <>
      <Seo title={seo.title} description={seo.description} path="/solar-estimate" />
      <PublicPageShell
        badge={hero.badge}
        headline={hero.headline}
        description={hero.description}
        contentMaxWidth="md"
        contentPy={{ xs: 3, md: 4 }}
      >
        <Alert severity="info" sx={{ mb: 3 }}>
          This tool runs in your browser. It is <strong>not</strong> a quotation, financial offer, or guarantee of
          production or savings. Prefer to add appliances from our catalog? Use the{' '}
          <RouterLink to="/load-calculator" style={{ color: 'inherit', fontWeight: 700 }}>
            load calculator
          </RouterLink>{' '}
          — ballpark kWp below uses the same peak-sun and performance-ratio assumptions.
        </Alert>

        <Card elevation={0} sx={{ ...publicUi.card }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Your electricity use
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={mode}
              onChange={(_, v) => v && setMode(v)}
              fullWidth
              sx={{ mb: 2, ...toggleSx }}
            >
              <ToggleButton value="kwh">Monthly kWh</ToggleButton>
              <ToggleButton value="bill">Monthly bill (GHS)</ToggleButton>
            </ToggleButtonGroup>

            {mode === 'kwh' ? (
              <TextField
                fullWidth
                label="Average monthly consumption (kWh)"
                value={monthlyKwh}
                onChange={(e) => setMonthlyKwh(e.target.value)}
                type="text"
                inputMode="decimal"
                helperText="From your ECG bill or meter history"
                sx={{ mb: 2 }}
              />
            ) : (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Monthly bill (GHS)"
                    value={monthlyBill}
                    onChange={(e) => setMonthlyBill(e.target.value)}
                    type="text"
                    inputMode="decimal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Effective tariff (GHS / kWh)"
                    value={tariff}
                    onChange={(e) => setTariff(e.target.value)}
                    type="text"
                    inputMode="decimal"
                    helperText="Divide bill by kWh if unsure"
                  />
                </Grid>
              </Grid>
            )}

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, mt: 1 }}>
              Assumptions (editable)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Peak sun hours / day"
                  value={peakSun}
                  onChange={(e) => setPeakSun(e.target.value)}
                  helperText="~5–5.5 typical for Greater Accra"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Performance ratio"
                  value={performanceRatio}
                  onChange={(e) => setPerformanceRatio(e.target.value)}
                  helperText="0.72–0.78 typical (losses + inverter)"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {result ? (
              <Box
                sx={{
                  p: 2,
                  borderRadius: homeUi.innerRadius,
                  bgcolor: colors.offWhite,
                  border: homeUi.cardBorder,
                }}
              >
                <Typography sx={{ fontWeight: 800, fontSize: { xs: '1.125rem', md: '1.25rem' }, mb: 1.5 }}>
                  Indicative result
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Implied daily energy: <strong>{result.dailyKwh.toFixed(1)} kWh/day</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Rough DC array size: <strong>{result.kWp.toFixed(2)} kWp</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Approx. modules @ ~555W: <strong>{result.panelsApprox}</strong> panels
                </Typography>
                <Button
                  component={RouterLink}
                  to="/contact?action=quote&topic=estimate"
                  variant="contained"
                  fullWidth
                  sx={{ ...publicUi.primaryButton, ...homeUi.touchTarget, display: { xs: 'none', md: 'inline-flex' } }}
                >
                  Get a formal engineered quote
                </Button>
              </Box>
            ) : (
              <Typography sx={publicUi.mutedText}>Enter valid numbers to see an indicative range.</Typography>
            )}
          </CardContent>
        </Card>
      </PublicPageShell>
      <PublicStickyMobileCta
        label={SITE_CTA.consultation}
        to="/contact?action=quote&topic=estimate"
      />
    </>
  );
};

export default SolarEstimate;
