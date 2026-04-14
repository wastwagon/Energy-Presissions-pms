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
import { colors } from '../../theme/colors';
import { ballparkSizingFromMonthlyKwh } from '../../utils/solarSizingApprox';

const SolarEstimate: React.FC = () => {
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
    <Box>
      <Seo
        title="Solar System Size Estimator Ghana | Ballpark kW | Energy Precisions"
        description="Rough, non-binding estimate of solar array size from monthly energy use or bill. For an engineered quote, contact Energy Precisions in Accra."
        path="/solar-estimate"
      />
      <Box sx={{ bgcolor: colors.blueBlack, color: 'white', py: { xs: 4, md: 5 } }}>
        <Container maxWidth="md">
          <Typography variant="h1" sx={{ fontSize: { xs: '1.55rem', md: '1.9rem' }, fontWeight: 800, mb: 1.5 }}>
            Ballpark solar size calculator
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.65 }}>
            Indicative numbers only — roof, shading, equipment, and grid rules change every project. Use this to
            start a conversation; our engineers confirm sizing on site.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 3, md: 4 } }}>
        <Alert severity="info" sx={{ mb: 3 }}>
          This tool runs in your browser. It is <strong>not</strong> a quotation, financial offer, or guarantee of
          production or savings. Prefer to add appliances from our catalog? Use the{' '}
          <RouterLink to="/load-calculator" style={{ color: 'inherit', fontWeight: 700 }}>
            load calculator
          </RouterLink>{' '}
          — ballpark kWp below uses the same peak-sun and performance-ratio assumptions.
        </Alert>

        <Card elevation={0} sx={{ border: `1px solid ${colors.gray200}`, borderRadius: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Your electricity use
            </Typography>
            <ToggleButtonGroup
              exclusive
              value={mode}
              onChange={(_, v) => v && setMode(v)}
              size="small"
              sx={{ mb: 2 }}
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
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
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
                  size="large"
                  sx={{ bgcolor: colors.green, textTransform: 'none', fontWeight: 700 }}
                >
                  Get a formal engineered quote
                </Button>
              </Box>
            ) : (
              <Typography color="text.secondary">Enter valid numbers to see an indicative range.</Typography>
            )}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default SolarEstimate;
