import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
} from '@mui/material';
import { Search as SearchIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import api from '../services/api';
import { ApplianceTemplate } from '../types';

const CATEGORY_LABELS: Record<string, string> = {
  lighting: 'Lighting',
  cooling: 'Cooling',
  heating: 'Heating',
  cooking: 'Cooking',
  refrigeration: 'Refrigeration',
  laundry: 'Laundry',
  entertainment: 'Entertainment',
  computing: 'Computing',
  water_heating: 'Water Heating',
  water_pumping: 'Water Pumping',
  ventilation: 'Ventilation',
  security: 'Security',
  medical: 'Medical',
  industrial: 'Industrial',
  commercial: 'Commercial',
  other: 'Other',
};

type CatalogData = Record<string, ApplianceTemplate[]> | ApplianceTemplate[];

const AppliancesCatalog: React.FC = () => {
  const [catalog, setCatalog] = useState<CatalogData>({});
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = search
          ? await api.get('/appliances/catalog/list', { params: { search } })
          : await api.get('/appliances/catalog/list');
        if (cancelled) return;
        // No search: Dict[category, templates]; with search: List[template]
        setCatalog(response.data ?? (search ? [] : {}));
      } catch (err: any) {
        if (!cancelled) {
          console.error('Error fetching appliance catalog:', err);
          setError(err.response?.data?.detail || 'Failed to load appliance catalog');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    if (search) {
      const timer = setTimeout(fetchCatalog, 300);
      return () => {
        cancelled = true;
        clearTimeout(timer);
      };
    } else {
      fetchCatalog();
      return () => { cancelled = true; };
    }
  }, [search]);

  const formatPower = (template: ApplianceTemplate) => {
    const val = template.power_value;
    const unit = template.power_unit?.toUpperCase() || 'W';
    return `${val} ${unit}`;
  };

  const categories = Object.keys(catalog).sort((a, b) => {
    const labelA = CATEGORY_LABELS[a] || a;
    const labelB = CATEGORY_LABELS[b] || b;
    return labelA.localeCompare(labelB);
  });

  if (loading && !Object.keys(catalog).length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Appliances Catalog
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Browse the full list of appliances with typical power ratings. Use this reference when adding appliances to projects.
      </Typography>

      <TextField
        placeholder="Search appliances..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3, maxWidth: 400 }}
        size="small"
      />

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light' }}>
          <Typography color="error">{error}</Typography>
        </Paper>
      )}

      {search && Array.isArray(catalog) ? (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Search Results
          </Typography>
          {(catalog as ApplianceTemplate[]).length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              No appliances match &quot;{search}&quot;
            </Typography>
          ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Power</strong></TableCell>
                  <TableCell><strong>Typical Range</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(catalog as ApplianceTemplate[]).map((t, i) => (
                  <TableRow key={i}>
                    <TableCell>{t.name}</TableCell>
                    <TableCell>{CATEGORY_LABELS[t.category] || (t.category || '').replace(/_/g, ' ')}</TableCell>
                    <TableCell>{formatPower(t)}</TableCell>
                    <TableCell>{t.typical_range || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          )}
        </Paper>
      ) : (
        <>
          {categories.length === 0 && !loading ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No appliances found.</Typography>
            </Paper>
          ) : (
            categories.map((categoryKey) => {
              const templates = (catalog as Record<string, ApplianceTemplate[]>)[categoryKey] || [];
              const label = CATEGORY_LABELS[categoryKey] || categoryKey.replace(/_/g, ' ');
              return (
                <Accordion key={categoryKey} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ mr: 2 }}>
                      {label}
                    </Typography>
                    <Chip label={`${templates.length} appliances`} size="small" />
                  </AccordionSummary>
                  <AccordionDetails>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell><strong>Name</strong></TableCell>
                            <TableCell><strong>Description</strong></TableCell>
                            <TableCell><strong>Power</strong></TableCell>
                            <TableCell><strong>Typical Range</strong></TableCell>
                            <TableCell><strong>Default Hrs/Day</strong></TableCell>
                            <TableCell><strong>Essential</strong></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {templates.map((t, i) => (
                            <TableRow key={i}>
                              <TableCell>{t.name}</TableCell>
                              <TableCell sx={{ maxWidth: 280 }}>{t.description}</TableCell>
                              <TableCell>{formatPower(t)}</TableCell>
                              <TableCell>{t.typical_range || '-'}</TableCell>
                              <TableCell>{t.default_hours ?? '-'}</TableCell>
                              <TableCell>{t.is_essential ? 'Yes' : 'No'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </AccordionDetails>
                </Accordion>
              );
            })
          )}
        </>
      )}
    </Box>
  );
};

export default AppliancesCatalog;
