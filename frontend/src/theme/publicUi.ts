import { colors } from './colors';
import { homeUi } from './homeUi';
import { typeScale } from './typography';

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

  secondaryButton: {
    borderColor: colors.blueNavy,
    color: colors.blueNavy,
    fontWeight: 600,
    textTransform: 'none' as const,
    borderRadius: 999,
    '&:hover': {
      borderColor: colors.blueNavy,
      bgcolor: 'rgba(26, 77, 122, 0.04)',
    },
  },

  inlineLink: {
    color: colors.greenDark,
    fontWeight: 600,
    textDecoration: 'none',
    '&:hover': { textDecoration: 'underline' },
  },

  mutedText: {
    color: colors.gray600,
    lineHeight: 1.65,
    fontSize: typeScale.bodySm.fontSize,
  },

  card: {
    bgcolor: homeUi.cardBg,
    borderRadius: homeUi.cardRadius,
    border: homeUi.cardBorder,
    boxShadow: homeUi.cardShadow,
  },

  contentPy: { xs: 4, md: 6 } as const,

  appBar: {
    bgcolor: homeUi.cardBg,
    borderBottom: homeUi.cardBorder,
    boxShadow: 'none',
  },

  bottomNav: {
    bg: 'rgba(255, 255, 255, 0.72)',
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    shadow: '0 -4px 24px rgba(10, 14, 23, 0.06)',
    active: colors.green,
    inactive: colors.gray600,
  },
};
