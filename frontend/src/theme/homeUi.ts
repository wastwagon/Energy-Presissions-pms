/** Shared mobile-first, Apple-inspired homepage surface styles */
export const homeUi = {
  sectionPy: { xs: 5, sm: 6, md: 9 },
  containerPx: { xs: 2, sm: 3 },
  cardRadius: 3,
  innerRadius: 2.5,
  cardBorder: '1px solid rgba(0, 0, 0, 0.06)',
  cardBg: '#ffffff',
  pageBg: '#fbfbfd',
  cardShadow: '0 1px 2px rgba(0, 0, 0, 0.04), 0 8px 24px rgba(0, 0, 0, 0.04)',
  cardShadowHover: '0 4px 8px rgba(0, 0, 0, 0.04), 0 16px 40px rgba(0, 0, 0, 0.08)',
  touchTarget: { minHeight: 48 },
  title: {
    fontWeight: 700,
    letterSpacing: '-0.028em',
    lineHeight: 1.15,
  },
  body: {
    lineHeight: 1.55,
    fontSize: { xs: '0.9375rem', md: '1rem' },
  },
  glass: {
    bgcolor: 'rgba(255, 255, 255, 0.72)',
    backdropFilter: 'saturate(180%) blur(20px)',
    WebkitBackdropFilter: 'saturate(180%) blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.5)',
  },
};
