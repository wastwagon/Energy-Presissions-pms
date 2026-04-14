/**
 * Trust & compliance messaging for public pages.
 * Legal/compliance should verify wording and any certification claims before campaigns.
 */
export type TrustBadge = {
  key: string;
  title: string;
  subtitle: string;
};

export const TRUST_BADGES: TrustBadge[] = [
  {
    key: 'google',
    title: '5.0★ Google-rated',
    subtitle: 'Verified reviews from Accra & Ghana installations',
  },
  {
    key: 'engineering',
    title: 'Engineering-led sizing',
    subtitle: 'Load profiles, BOM transparency, and documented assumptions',
  },
  {
    key: 'compliance',
    title: 'Regulatory alignment',
    subtitle: 'Project documentation aligned with national energy registration pathways — details on request',
  },
];
