/**
 * Site-wide typography tokens — single source of truth for public + MUI theme.
 *
 * Scale (mobile → desktop):
 * - badge: 0.6875rem / 600
 * - caption: 0.8125rem
 * - chip: 0.75rem / 600
 * - bodySm: 0.875rem
 * - body: 0.9375rem → 1rem
 * - headingSm: 1.125rem → 1.25rem / 700
 * - headingMd: 1.375rem → 2rem / 700 (section titles)
 * - headingLg: 1.75rem → 2.75rem / 800 (flagship heroes)
 * - display: 2rem → 2.75rem / 800 (impact sections)
 * - stat: 2.5rem → 3.5rem / 800 (large metrics)
 */

export const fontFamily =
  '-apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const typeScale = {
  badge: {
    fontSize: '0.6875rem',
    fontWeight: fontWeight.semibold,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontSize: '0.8125rem',
    lineHeight: 1.5,
  },
  chip: {
    fontSize: '0.75rem',
    fontWeight: fontWeight.semibold,
  },
  bodySm: {
    fontSize: '0.875rem',
    lineHeight: 1.55,
  },
  body: {
    fontSize: { xs: '0.9375rem', md: '1rem' },
    lineHeight: 1.55,
  },
  bodyLg: {
    fontSize: '1.0625rem',
    lineHeight: 1.65,
  },
  headingSm: {
    fontSize: { xs: '1.125rem', md: '1.25rem' },
    fontWeight: fontWeight.bold,
    lineHeight: 1.3,
  },
  headingMd: {
    fontSize: { xs: '1.375rem', sm: '1.5625rem', md: '2rem' },
    fontWeight: fontWeight.bold,
    lineHeight: 1.2,
    letterSpacing: '-0.028em',
  },
  headingLg: {
    fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
    fontWeight: fontWeight.extrabold,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
  },
  display: {
    fontSize: { xs: '2rem', md: '2.75rem' },
    fontWeight: fontWeight.extrabold,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
  },
  stat: {
    fontSize: { xs: '2.5rem', md: '3.5rem' },
    fontWeight: fontWeight.extrabold,
    lineHeight: 1.1,
  },
  heroStat: {
    fontSize: '1.25rem',
    fontWeight: fontWeight.extrabold,
    lineHeight: 1.1,
  },
  price: {
    fontSize: { xs: '1.25rem', md: '1.5rem' },
    fontWeight: fontWeight.extrabold,
  },
  cardTitle: {
    fontSize: { xs: '1.125rem', md: '1.25rem' },
    fontWeight: fontWeight.bold,
    lineHeight: 1.3,
  },
  /** Site chrome — header, footer, nav */
  nav: {
    fontSize: '0.8125rem',
    fontWeight: fontWeight.semibold,
  },
  navLink: {
    fontSize: '0.875rem',
    fontWeight: fontWeight.semibold,
  },
  drawerItem: {
    fontSize: '0.95rem',
    fontWeight: fontWeight.bold,
  },
  drawerSubItem: {
    fontSize: '0.875rem',
    fontWeight: fontWeight.medium,
  },
  footerTitle: {
    fontSize: '1.125rem',
    fontWeight: fontWeight.bold,
    letterSpacing: '-0.022em',
  },
  /** Home page hero carousel (larger than inner-page heroes) */
  homeHeroTitle: {
    fontSize: { xs: '2rem', sm: '2.5rem', md: '3.25rem', lg: '3.5rem' },
    fontWeight: fontWeight.extrabold,
    lineHeight: 1.08,
    letterSpacing: '-0.03em',
  },
  homeHeroBody: {
    fontSize: { xs: '1rem', md: '1.125rem' },
    lineHeight: 1.65,
  },
  ctaButton: {
    fontSize: '0.95rem',
    fontWeight: fontWeight.bold,
  },
  prose: {
    fontSize: '1.0625rem',
    lineHeight: 1.65,
  },
};

type ResponsiveFontSize = {
  xs?: string;
  sm?: string;
  md?: string;
  lg?: string;
};

/** MUI theme typography only accepts scalar fontSize — pick desktop-first default. */
function muiFontSize(value: string | ResponsiveFontSize): string {
  if (typeof value === 'string') return value;
  return value.md ?? value.sm ?? value.xs ?? '1rem';
}

function muiTypographyVariant(token: {
  fontSize?: string | ResponsiveFontSize;
  fontWeight?: number;
  lineHeight?: number;
  letterSpacing?: string;
  textTransform?: 'uppercase';
}) {
  const { fontSize, ...rest } = token;
  return {
    ...rest,
    ...(fontSize !== undefined ? { fontSize: muiFontSize(fontSize) } : {}),
  };
}

/** MUI theme typography — keeps variant sizes predictable across admin + public. */
export function buildMuiTypography() {
  return {
    fontFamily,
    h1: muiTypographyVariant(typeScale.display),
    h2: muiTypographyVariant(typeScale.headingMd),
    h3: { fontSize: '1.5rem', fontWeight: fontWeight.bold, lineHeight: 1.25 },
    h4: { fontSize: '1.25rem', fontWeight: fontWeight.semibold, lineHeight: 1.3 },
    h5: { fontSize: '1.125rem', fontWeight: fontWeight.semibold, lineHeight: 1.35 },
    h6: { fontSize: '1rem', fontWeight: fontWeight.semibold, lineHeight: 1.4 },
    body1: { fontSize: '1rem', lineHeight: 1.55 },
    body2: { ...typeScale.bodySm },
    subtitle1: { fontSize: '1rem', fontWeight: fontWeight.semibold, lineHeight: 1.5 },
    subtitle2: { ...typeScale.bodySm, fontWeight: fontWeight.semibold },
    caption: { ...typeScale.caption },
    overline: { ...typeScale.badge },
    button: {
      fontWeight: fontWeight.semibold,
      textTransform: 'none' as const,
      fontSize: typeScale.bodySm.fontSize,
    },
  };
}
