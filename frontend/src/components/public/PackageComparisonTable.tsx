import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Card,
} from '@mui/material';
import { HYBRID_PACKAGES, formatGhs } from '../../data/hybridPackages';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';
import { publicUi } from '../../theme/publicUi';

function panelCount(components: string[]): string {
  const line = components.find((c) => /panels/i.test(c));
  if (!line) return '—';
  const m = line.match(/\((\d+)\)/);
  return m ? m[1] : line.replace(/.*panels?\s*/i, '').trim() || '—';
}

function batterySummary(components: string[]): string {
  const line = components.find((c) => /LiFePO|battery|kWh/i.test(c));
  return line ? line.replace(/\s*\(\d+\)\s*$/, '').trim() : '—';
}

const PackageComparisonTable: React.FC = () => (
  <Box sx={{ mb: { xs: 4, md: 5 } }}>
    <Typography
      sx={{
        ...homeUi.title,
        fontSize: { xs: '1.125rem', md: '1.25rem' },
        color: colors.blueBlack,
        mb: 0.75,
        textAlign: 'center',
      }}
    >
      Compare packages at a glance
    </Typography>
    <Typography sx={{ ...publicUi.mutedText, textAlign: 'center', mb: 2.5, fontSize: '0.875rem' }}>
      Turnkey GHS prices from our Accra office — final BOM confirmed after site survey.
    </Typography>
    <Card sx={{ ...publicUi.card, overflow: 'hidden' }}>
      <TableContainer sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: colors.offWhite }}>
              {['Tier', 'Load (kVA)', 'Max W', 'Battery', 'Panels', 'From (GHS)'].map((h) => (
                <TableCell key={h} sx={{ fontWeight: 700, whiteSpace: 'nowrap', borderColor: colors.gray200 }}>
                  {h}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {HYBRID_PACKAGES.map((pkg) => (
              <TableRow key={pkg.id} hover>
                <TableCell sx={{ fontWeight: 600, borderColor: colors.gray200 }}>{pkg.badge}</TableCell>
                <TableCell sx={{ borderColor: colors.gray200 }}>{pkg.kvaLabel}</TableCell>
                <TableCell sx={{ borderColor: colors.gray200 }}>{pkg.maxWatts} W</TableCell>
                <TableCell sx={{ ...publicUi.mutedText, fontSize: '0.8125rem', borderColor: colors.gray200 }}>
                  {batterySummary(pkg.components)}
                </TableCell>
                <TableCell sx={{ borderColor: colors.gray200 }}>{panelCount(pkg.components)}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: colors.greenDark, borderColor: colors.gray200, whiteSpace: 'nowrap' }}>
                  {formatGhs(pkg.priceGhs)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  </Box>
);

export default PackageComparisonTable;
