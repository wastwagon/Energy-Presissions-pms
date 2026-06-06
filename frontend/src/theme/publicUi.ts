import { colors } from './colors';
import { homeUi } from './homeUi';

/** Shared tokens for public site chrome — header, heroes, inner pages */
export const publicUi = {
  containerPx: homeUi.containerPx,
  pageBg: homeUi.pageBg,
  cardBg: homeUi.cardBg,
  touchTarget: homeUi.touchTarget,

  topBar: {
    bg: colors.blueBlack,
    /** Deep blue-black → navy gradient for energy-transition chrome */
    bgGradient: `linear-gradient(135deg, ${colors.blueBlack} 0%, ${colors.blueBlackLight} 52%, ${colors.blueNavyDark} 100%)`,
    text: '#ffffff',
    muted: 'rgba(255,255,255,0.88)',
    border: 'rgba(0, 230, 118, 0.14)',
    accentLine: 'rgba(0, 230, 118, 0.2)',
  },

  topBarQuoteButton: {
    color: '#ffffff',
    border: '1px solid rgba(255,255,255,0.32)',
    bgcolor: 'rgba(255,255,255,0.06)',
    fontWeight: 600,
    textTransform: 'none' as const,
    borderRadius: 999,
    boxShadow: 'none',
    transition: 'background-color 0.22s ease, border-color 0.22s ease, color 0.22s ease',
    '&.MuiButton-root': { minWidth: 0 },
    '&:hover': {
      bgcolor: colors.green,
      borderColor: colors.green,
      color: colors.blueBlack,
      boxShadow: 'none',
    },
  },

  hero: {
    py: { xs: 4, sm: 5, md: 7 } as const,
    subtitle: 'rgba(255,255,255,0.78)',
    overlay: 'rgba(10, 14, 23, 0.88)',
  },

  primaryButton: {
    bgcolor: colors.green,
    color: colors.blueBlack,
    fontWeight: 600,
    textTransform: 'none' as const,
    borderRadius: 999,
    boxShadow: 'none',
    '&:hover': { bgcolor: colors.greenDark, boxShadow: 'none' },
  },

  appBar: {
    bgcolor: homeUi.cardBg,
    borderBottom: homeUi.cardBorder,
    boxShadow: 'none',
  },

  bottomNav: {
    bg: '#ffffff',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    shadow: '0 -4px 24px rgba(10, 14, 23, 0.06)',
    active: colors.green,
    inactive: colors.gray600,
  },
};
