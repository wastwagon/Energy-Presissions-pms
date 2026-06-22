import React from 'react';
import { Chip } from '@mui/material';
import { colors } from '../../theme/colors';

type Props = {
  label: string;
  selected: boolean;
  onSelect: () => void;
};

/** Category / filter chip with aria-pressed for screen readers */
const FilterChip: React.FC<Props> = ({ label, selected, onSelect }) => (
  <Chip
    label={label}
    clickable
    onClick={onSelect}
    aria-pressed={selected}
    sx={{
      fontWeight: 600,
      minHeight: 44,
      '& .MuiChip-label': { px: 1.25 },
      bgcolor: selected ? colors.green : 'transparent',
      color: selected ? colors.blueBlack : colors.gray600,
      border: selected ? 'none' : `1px solid ${colors.gray200}`,
    }}
  />
);

export default FilterChip;
