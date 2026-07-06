/**
 * Static fallback CTA copy — prefer `useGlobalSiteConfig()` on public pages.
 */
import { resolveSiteCta } from '../utils/resolveSiteConfig';

export const SITE_CTA = resolveSiteCta();
