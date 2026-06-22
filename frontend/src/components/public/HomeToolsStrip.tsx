import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import {
  Calculate as CalculateIcon,
  Bolt as BoltIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { colors } from '../../theme/colors';
import { homeUi } from '../../theme/homeUi';

type ToolLink = {
  label: string;
  url: string;
  icon: 'estimate' | 'calculator';
};

type Props = {
  title?: string;
  subtitle?: string;
  tools: ToolLink[];
};

const iconFor = (type: ToolLink['icon']) =>
  type === 'estimate' ? <CalculateIcon sx={{ fontSize: 22 }} /> : <BoltIcon sx={{ fontSize: 22 }} />;

const HomeToolsStrip: React.FC<Props> = ({
  title = 'Plan your system',
  subtitle = 'Free tools to estimate size and load before you request a quote.',
  tools,
}) => {
  const visible = tools.filter((t) => t.label && t.url);
  if (visible.length === 0) return null;

  return (
    <Box component="section" sx={{ py: { xs: 4, md: 5 }, bgcolor: homeUi.cardBg, borderTop: homeUi.cardBorder, borderBottom: homeUi.cardBorder }}>
      <Container maxWidth="lg" sx={{ px: homeUi.containerPx }}>
        <Typography
          sx={{
            ...homeUi.title,
            fontSize: { xs: '1.25rem', md: '1.375rem' },
            color: colors.blueBlack,
            textAlign: 'center',
            mb: 0.75,
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            ...homeUi.body,
            color: colors.gray600,
            textAlign: 'center',
            mb: { xs: 2.5, md: 3 },
            maxWidth: 480,
            mx: 'auto',
          }}
        >
          {subtitle}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 1.5 },
            maxWidth: 720,
            mx: 'auto',
          }}
        >
          {visible.map((tool) => (
            <Box
              key={tool.url}
              component={Link}
              to={tool.url}
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: { xs: 2, md: 2.5 },
                py: { xs: 1.75, md: 2 },
                minHeight: 56,
                borderRadius: homeUi.innerRadius,
                textDecoration: 'none',
                ...homeUi.glass,
                bgcolor: homeUi.pageBg,
                transition: 'background-color 0.2s ease, box-shadow 0.2s ease',
                '@media (hover: hover)': {
                  '&:hover': {
                    bgcolor: '#fff',
                    boxShadow: homeUi.cardShadow,
                  },
                },
                '&:active': { transform: 'scale(0.98)' },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: 'rgba(0, 230, 118, 0.12)',
                  color: colors.green,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {iconFor(tool.icon)}
              </Box>
              <Typography
                sx={{
                  flex: 1,
                  fontWeight: 600,
                  fontSize: '0.9375rem',
                  color: colors.blueBlack,
                  letterSpacing: '-0.01em',
                }}
              >
                {tool.label}
              </Typography>
              <ChevronRightIcon sx={{ color: colors.gray400, fontSize: 22 }} />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default HomeToolsStrip;
