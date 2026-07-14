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

type Props = {
  packages?: HybridPackage[];
};

const specRow = (label: string, value: string) => (
  <Box key={label} display="flex" justifyContent="space-between" gap={2} py={0.75}>
    <Typography sx={{ ...homeUi.caption, color: colors.gray600 }}>{label}</Typography>
    <Typography sx={{ ...homeUi.caption, fontWeight: 600, textAlign: 'right' }}>{value}</Typography>
  </Box>
);

const PackageComparisonTable: React.FC<Props> = ({ packages = HYBRID_PACKAGES }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ mb: { xs: 4, md: 5 } }}>
      <Typography
        sx={{
          ...homeUi.headingSm,
          color: colors.blueBlack,
          mb: 0.75,
          textAlign: 'center',
        }}
      >
        Compare packages at a glance
      </Typography>
      <Typography sx={{ ...publicUi.mutedText, textAlign: 'center', mb: 2.5 }}>
        Compare load tiers, inverter, storage, panels and PV size — contact us for a free site assessment and tailored quote.
      </Typography>

      {isMobile ? (
        <Stack spacing={1.5}>
          {packages.map((pkg) => (
            <Card key={pkg.id} sx={publicUi.card}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800, ...homeUi.body, color: colors.blueBlack, mb: 1.5 }}>
                  {pkg.badge}
                </Typography>
                {specRow('Load', pkg.kvaLabel)}
                {specRow('Max watts', `${pkg.maxWatts} W`)}
                {specRow('Inverter', pkg.specs.inverter)}
                {specRow('Storage', pkg.specs.storage)}
                {specRow('Panels', pkg.specs.panels)}
                {specRow('PV array', pkg.specs.solarKw)}
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Card sx={{ ...publicUi.card, overflow: 'hidden' }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: colors.offWhite }}>
                  {['Tier', 'Load', 'Max W', 'Inverter', 'Storage', 'Panels', 'PV'].map((h) => (
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
                    <TableCell sx={{ ...publicUi.mutedText, ...homeUi.chip, borderColor: colors.gray200, maxWidth: 140 }}>
                      {pkg.specs.inverter}
                    </TableCell>
                    <TableCell sx={{ ...publicUi.mutedText, ...homeUi.chip, borderColor: colors.gray200, whiteSpace: 'nowrap' }}>
                      {pkg.specs.storage}
                    </TableCell>
                    <TableCell sx={{ borderColor: colors.gray200, ...homeUi.caption }}>{pkg.specs.panels}</TableCell>
                    <TableCell sx={{ borderColor: colors.gray200, fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {pkg.specs.solarKw}
                    </TableCell>
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
