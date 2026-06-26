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
  CardContent,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { HYBRID_PACKAGES, type HybridPackage } from '../../data/hybridPackages';
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

type Props = {
  packages?: HybridPackage[];
};

const specRow = (label: string, value: string) => (
  <Box key={label} display="flex" justifyContent="space-between" gap={2} py={0.75}>
    <Typography sx={{ fontSize: '0.8125rem', color: colors.gray600 }}>{label}</Typography>
    <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, textAlign: 'right' }}>{value}</Typography>
  </Box>
);

const PackageComparisonTable: React.FC<Props> = ({ packages = HYBRID_PACKAGES }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
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
        Compare load tiers, storage and panels — contact us for a free site assessment and tailored quote.
      </Typography>

      {isMobile ? (
        <Stack spacing={1.5}>
          {packages.map((pkg) => (
            <Card key={pkg.id} sx={publicUi.card}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800, fontSize: '1rem', color: colors.blueBlack, mb: 1.5 }}>
                  {pkg.badge}
                </Typography>
                {specRow('Load', pkg.kvaLabel)}
                {specRow('Max watts', `${pkg.maxWatts} W`)}
                {specRow('Battery', batterySummary(pkg.components))}
                {specRow('Panels', panelCount(pkg.components))}
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Card sx={{ ...publicUi.card, overflow: 'hidden' }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 640 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: colors.offWhite }}>
                  {['Tier', 'Load (kVA)', 'Max W', 'Battery', 'Panels'].map((h) => (
                    <TableCell key={h} sx={{ fontWeight: 700, whiteSpace: 'nowrap', borderColor: colors.gray200 }}>
                      {h}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id} hover>
                    <TableCell sx={{ fontWeight: 600, borderColor: colors.gray200 }}>{pkg.badge}</TableCell>
                    <TableCell sx={{ borderColor: colors.gray200 }}>{pkg.kvaLabel}</TableCell>
                    <TableCell sx={{ borderColor: colors.gray200 }}>{pkg.maxWatts} W</TableCell>
                    <TableCell sx={{ ...publicUi.mutedText, fontSize: '0.8125rem', borderColor: colors.gray200 }}>
                      {batterySummary(pkg.components)}
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.gray200 }}>{panelCount(pkg.components)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
};

export default PackageComparisonTable;
