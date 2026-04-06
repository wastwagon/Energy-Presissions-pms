import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Grid,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Seo, SITE_ORIGIN } from '../../components/Seo';
import { colors } from '../../theme/colors';
import { formatApiErrorDetail } from '../../utils/apiErrorMessage';
import { ballparkSizingFromDailyKwh } from '../../utils/solarSizingApprox';

type CatalogTemplate = {
  category: string;
  appliance_type: string;
  name: string;
  description: string;
  power_value: number;
  power_unit: string;
  default_hours: number;
  default_quantity: number;
  is_essential: boolean;
  typical_range?: string;
};

type CartLine = {
  key: string;
  name: string;
  description: string;
  power_value: number;
  power_unit: string;
  quantity: number;
  hours_per_day: number;
  appliance_type: string;
};

type PreviewLine = { index: number; label: string; daily_kwh: number };
type PreviewResult = {
  lines: PreviewLine[];
  total_daily_kwh_raw: number;
  total_daily_kwh: number;
  diversity_factor_applied: boolean;
  diversity_factor?: number;
};

function newLineKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function templateToCartLine(t: CatalogTemplate): CartLine {
  return {
    key: newLineKey(),
    name: t.name,
    description: t.description,
    power_value: t.power_value,
    power_unit: t.power_unit.toUpperCase() === 'KW' ? 'KW' : t.power_unit.toUpperCase(),
    quantity: t.default_quantity || 1,
    hours_per_day: t.default_hours || 1,
    appliance_type: t.appliance_type,
  };
}

function buildContactPrefill(lines: CartLine[], preview: PreviewResult): string {
  const rows = preview.lines.map((pl) => {
    const src = lines[pl.index];
    const label = src ? `${src.name}` : pl.label;
    return `• ${label} — ~${pl.daily_kwh.toFixed(3)} kWh/day`;
  });
  const monthly = (preview.total_daily_kwh * 30).toFixed(1);
  const totalLine = preview.diversity_factor_applied
    ? `Approx. total daily load (diversity applied): ${preview.total_daily_kwh.toFixed(3)} kWh/day`
    : `Approx. total daily load (simple sum of lines): ${preview.total_daily_kwh.toFixed(3)} kWh/day`;
  return [
    '[From website load calculator — indicative only]',
    totalLine,
    `Rough monthly (×30): ${monthly} kWh/mo`,
    '',
    'Items:',
    ...rows,
  ].join('\n');
}

const LoadCalculator: React.FC = () => {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<Record<string, CatalogTemplate[]>>({});
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [lines, setLines] = useState<CartLine[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [filter, setFilter] = useState('');
  const [searchHits, setSearchHits] = useState<CatalogTemplate[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchSeqRef = useRef(0);

  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [applyDiversity, setApplyDiversity] = useState(true);
  const [peakSun, setPeakSun] = useState('5.2');
  const [performanceRatio, setPerformanceRatio] = useState('0.76');
  const [copySnackbar, setCopySnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setCatalogLoading(true);
        const res = await api.get<Record<string, CatalogTemplate[]>>('/public/load/catalog');
        if (!cancelled) {
          setCatalog(res.data || {});
          setCatalogError(null);
        }
      } catch (e: unknown) {
        if (!cancelled) {
          const err = e as { response?: { status?: number; data?: { detail?: unknown } } };
          const msg =
            err.response?.status === 429
              ? 'Too many catalog requests. Please try again in a few minutes.'
              : formatApiErrorDetail(err.response?.data?.detail) ||
                'Could not load the appliance list. Check your connection or try again later.';
          setCatalogError(msg);
        }
      } finally {
        if (!cancelled) setCatalogLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const flatTemplates = useMemo(() => Object.values(catalog).flat(), [catalog]);

  const filteredTemplates = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return flatTemplates;
    return flatTemplates.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.appliance_type.toLowerCase().includes(q)
    );
  }, [flatTemplates, filter]);

  useEffect(() => {
    const q = filter.trim();
    if (q.length < 2) {
      setSearchHits(null);
      setSearchLoading(false);
      return;
    }

    const seq = ++searchSeqRef.current;
    setSearchLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const res = await api.get<CatalogTemplate[]>('/public/load/catalog', {
          params: { search: q },
        });
        if (seq !== searchSeqRef.current) return;
        const data = res.data;
        setSearchHits(Array.isArray(data) ? data : []);
      } catch {
        if (seq !== searchSeqRef.current) return;
        setSearchHits(null);
      } finally {
        if (seq === searchSeqRef.current) setSearchLoading(false);
      }
    }, 320);

    return () => window.clearTimeout(timer);
  }, [filter]);

  const displayTemplates = useMemo(() => {
    const q = filter.trim();
    if (q.length >= 2 && searchHits !== null) return searchHits;
    return filteredTemplates;
  }, [filter, searchHits, filteredTemplates]);

  const runPreview = useCallback(async () => {
    if (lines.length === 0) {
      setPreview(null);
      return;
    }
    setPreviewError(null);
    setPreviewLoading(true);
    try {
      const payload = {
        apply_diversity_factor: applyDiversity,
        lines: lines.map((L) => ({
          power_value: L.power_value,
          power_unit: L.power_unit,
          quantity: L.quantity,
          hours_per_day: L.hours_per_day,
          appliance_type: L.appliance_type,
          label: L.name,
        })),
      };
      const res = await api.post<PreviewResult>('/public/load/preview', payload);
      setPreview(res.data);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { detail?: unknown } } };
      if (err.response?.status === 429) {
        setPreviewError('Too many calculations. Please wait a few minutes and try again.');
      } else {
        const formatted = formatApiErrorDetail(err.response?.data?.detail);
        setPreviewError(
          formatted || 'Could not calculate load. Check inputs and try again.'
        );
      }
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  }, [lines, applyDiversity]);

  useEffect(() => {
    setPreview(null);
  }, [lines, applyDiversity]);

  const ballpark = useMemo(() => {
    if (!preview) return null;
    const ps = parseFloat(peakSun) || 0;
    const pr = parseFloat(performanceRatio) || 0;
    return ballparkSizingFromDailyKwh(preview.total_daily_kwh, ps, pr);
  }, [preview, peakSun, performanceRatio]);

  const summaryText = useMemo(() => {
    if (!preview || lines.length === 0) return '';
    let base = buildContactPrefill(lines, preview);
    if (ballpark) {
      base += `\n\nBallpark DC size (same assumptions as /solar-estimate): ~${ballpark.kWp.toFixed(2)} kWp, ~${ballpark.panelsApprox} × ~555W modules — indicative only.`;
    }
    return base;
  }, [preview, lines, ballpark]);

  const goToQuote = () => {
    if (!preview || lines.length === 0) return;
    sessionStorage.setItem('ep_load_prefill', summaryText);
    navigate('/contact?action=quote&topic=load');
  };

  const copySummary = async () => {
    if (!summaryText) return;
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopySnackbar({ open: true, message: 'Summary copied to clipboard' });
    } catch {
      setCopySnackbar({
        open: true,
        message: 'Could not copy automatically — select and copy the text from your quote request instead.',
      });
    }
  };

  const closeAddDialog = () => {
    setAddOpen(false);
    setFilter('');
    setSearchHits(null);
    setSearchLoading(false);
    searchSeqRef.current += 1;
  };

  const openAddDialog = () => {
    setFilter('');
    setSearchHits(null);
    setSearchLoading(false);
    searchSeqRef.current += 1;
    setAddOpen(true);
  };

  return (
    <Box>
      <Seo
        title="Home & Business Load Calculator | Appliances | Energy Precisions"
        description="Build a rough daily kWh estimate from the same appliance catalog our engineers use in the PMS. Indicative only — not a quote."
        path="/load-calculator"
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'Energy Precisions appliance load calculator',
          url: `${SITE_ORIGIN}/load-calculator`,
          description:
            'Indicative daily kWh from a catalog of appliances, using the same load rules as Energy Precisions engineers. Not a quotation.',
          applicationCategory: 'UtilitiesApplication',
          operatingSystem: 'Any',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'GHS',
          },
        }}
      />
      <Box sx={{ bgcolor: colors.blueBlack, color: 'white', py: { xs: 4, md: 5 } }}>
        <Container maxWidth="lg">
          <Typography variant="h1" sx={{ fontSize: { xs: '1.55rem', md: '1.9rem' }, fontWeight: 800, mb: 1.5 }}>
            Appliance load calculator
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.88)', lineHeight: 1.65, maxWidth: 720 }}>
            Pick typical appliances from our catalog, adjust how many you run and for how long each day. We use the
            same load rules as our internal project tool (including optional diversity). Results are{' '}
            <strong>indicative</strong> — your engineer confirms everything on site.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          This page calls our API for calculations so totals stay aligned with Energy Precisions’ PMS. It is not a
          quotation or guarantee.
        </Alert>

        {catalogError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {catalogError}
          </Alert>
        )}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<AddIcon />}
            onClick={openAddDialog}
            disabled={catalogLoading || !!catalogError}
            sx={{ textTransform: 'none', alignSelf: { xs: 'stretch', md: 'center' } }}
          >
            Add from catalog
          </Button>
          <FormControlLabel
            control={
              <Checkbox
                checked={applyDiversity}
                onChange={(_, v) => setApplyDiversity(v)}
                sx={{ color: 'secondary.main', '&.Mui-checked': { color: 'secondary.main' } }}
              />
            }
            label="Apply load diversity (typical simultaneous use)"
          />
          <Box sx={{ flex: 1 }} />
          <Button
            variant="outlined"
            onClick={() => runPreview()}
            disabled={lines.length === 0 || previewLoading}
            sx={{ textTransform: 'none' }}
          >
            {previewLoading ? <CircularProgress size={22} /> : 'Calculate load'}
          </Button>
        </Stack>

        <Card elevation={0} sx={{ border: `1px solid ${colors.gray200}`, borderRadius: 2, mb: 2 }}>
          <CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
            {lines.length === 0 ? (
              <Typography color="text.secondary">No appliances yet. Use “Add from catalog” to begin.</Typography>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Appliance</TableCell>
                    <TableCell align="right" width={100}>
                      Qty
                    </TableCell>
                    <TableCell align="right" width={120}>
                      Hours / day
                    </TableCell>
                    <TableCell align="right" width={90}>
                      Power
                    </TableCell>
                    <TableCell width={56} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {lines.map((L) => (
                    <TableRow key={L.key}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {L.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {L.description}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="number"
                          inputProps={{ min: 1, max: 500, step: 1 }}
                          value={L.quantity}
                          onChange={(e) => {
                            const v = parseInt(e.target.value, 10);
                            setLines((prev) =>
                              prev.map((x) => (x.key === L.key ? { ...x, quantity: Number.isFinite(v) ? v : 1 } : x))
                            );
                          }}
                          sx={{ width: 88 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="number"
                          inputProps={{ min: 0.1, max: 24, step: 0.5 }}
                          value={L.hours_per_day}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            setLines((prev) =>
                              prev.map((x) =>
                                x.key === L.key ? { ...x, hours_per_day: Number.isFinite(v) ? v : 1 } : x
                              )
                            );
                          }}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          {L.power_value} {L.power_unit}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          aria-label="Remove"
                          size="small"
                          onClick={() => setLines((prev) => prev.filter((x) => x.key !== L.key))}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {previewError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {previewError}
          </Alert>
        )}

        {preview && (
          <Card elevation={0} sx={{ border: `1px solid ${colors.gray200}`, borderRadius: 2, mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                Estimated consumption
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Sum of line items (no diversity): <strong>{preview.total_daily_kwh_raw.toFixed(3)}</strong> kWh/day
                {preview.diversity_factor_applied && preview.diversity_factor != null && (
                  <>
                    {' '}
                    → with diversity (~{Math.round(preview.diversity_factor * 100)}%):{' '}
                    <strong>{preview.total_daily_kwh.toFixed(3)}</strong> kWh/day
                  </>
                )}
                {!preview.diversity_factor_applied && <> → total: {preview.total_daily_kwh.toFixed(3)} kWh/day</>}
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Rough monthly (×30): <strong>{(preview.total_daily_kwh * 30).toFixed(1)}</strong> kWh/mo
              </Typography>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                Ballpark array size (optional — same math as the solar estimator)
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                Uses your estimated daily kWh above as if it were your average usage. Tune sun hours and performance
                ratio like on the{' '}
                <RouterLink to="/solar-estimate" style={{ color: colors.green, fontWeight: 600 }}>
                  solar size page
                </RouterLink>
                .
              </Typography>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Peak sun hours / day"
                    value={peakSun}
                    onChange={(e) => setPeakSun(e.target.value)}
                    helperText="e.g. 4.5–5.5 for Ghana"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Performance ratio"
                    value={performanceRatio}
                    onChange={(e) => setPerformanceRatio(e.target.value)}
                    helperText="0.72–0.78 typical"
                  />
                </Grid>
              </Grid>
              {ballpark ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Indicative DC size: <strong>{ballpark.kWp.toFixed(2)} kWp</strong> · approx.{' '}
                  <strong>{ballpark.panelsApprox}</strong> modules @ ~555W
                </Typography>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Enter valid peak sun hours and performance ratio to see a ballpark kWp range.
                </Typography>
              )}
              <Divider sx={{ my: 1.5 }} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} flexWrap="wrap" alignItems={{ sm: 'center' }}>
                <Button variant="contained" color="secondary" onClick={goToQuote} sx={{ textTransform: 'none' }}>
                  Request a quote with this load
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ContentCopyIcon />}
                  onClick={() => copySummary()}
                  sx={{ textTransform: 'none' }}
                >
                  Copy summary
                </Button>
              </Stack>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                Quote opens the contact form with this summary in your message. Copy is useful for email or WhatsApp.
              </Typography>
            </CardContent>
          </Card>
        )}

        <Typography variant="body2" color="text.secondary">
          Prefer starting from your bill? Try the{' '}
          <RouterLink to="/solar-estimate" style={{ color: colors.green, fontWeight: 600 }}>
            ballpark solar size estimator
          </RouterLink>
          .
        </Typography>
      </Container>

      <Snackbar
        open={copySnackbar.open}
        autoHideDuration={4000}
        onClose={() => setCopySnackbar((s) => ({ ...s, open: false }))}
        message={copySnackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <Dialog open={addOpen} onClose={closeAddDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add appliance</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size="small"
            placeholder="Type 2+ letters to search the full catalog via API…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            sx={{ mb: 1.5, mt: 0.5 }}
          />
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            Short queries filter the list locally. Longer terms use the same server search as our internal tools.
          </Typography>
          {searchLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={28} />
            </Box>
          )}
          <List dense sx={{ maxHeight: 360, overflow: 'auto', display: searchLoading ? 'none' : 'block' }}>
            {displayTemplates.slice(0, 250).map((t, idx) => (
              <ListItemButton
                key={`${idx}-${t.category}-${t.appliance_type}-${t.name}-${t.power_value}`}
                onClick={() => {
                  setLines((prev) => [...prev, templateToCartLine(t)]);
                  closeAddDialog();
                }}
              >
                <ListItemText
                  primary={t.name}
                  secondary={`${t.power_value} ${t.power_unit} · ${t.description}`}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                />
              </ListItemButton>
            ))}
            {!searchLoading && displayTemplates.length === 0 && !catalogLoading && (
              <Typography variant="body2" color="text.secondary" sx={{ py: 2, px: 1 }}>
                No matches.
              </Typography>
            )}
            {!searchLoading && filter.trim().length < 2 && flatTemplates.length > 250 && (
              <Typography variant="caption" color="text.secondary" sx={{ px: 1, py: 1, display: 'block' }}>
                Showing first 250 appliances — search to narrow down.
              </Typography>
            )}
            {!searchLoading && filter.trim().length >= 2 && displayTemplates.length > 250 && (
              <Typography variant="caption" color="text.secondary" sx={{ px: 1, py: 1, display: 'block' }}>
                Showing first 250 results — refine search.
              </Typography>
            )}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LoadCalculator;
