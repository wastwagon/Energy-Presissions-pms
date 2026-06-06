/**
 * Legacy trust messaging — superseded by CMS `credibility` section on the home page.
 * Kept for reference; legal/compliance should verify wording before campaigns.
 */
export type TrustBadge = {
  key: string;
  title: string;
  subtitle: string;
};

/** @deprecated Use home page CMS credibility section instead */
export const TRUST_BADGES: TrustBadge[] = [];
