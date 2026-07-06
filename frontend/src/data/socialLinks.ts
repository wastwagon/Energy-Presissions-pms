/**
 * Static fallback social links — prefer `useGlobalSiteConfig()` on public pages.
 */
import { resolveSiteSocial } from '../utils/resolveSiteConfig';

export const SOCIAL_LINKS = resolveSiteSocial();
