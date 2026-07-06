/**
 * Static fallback contact — prefer `useGlobalSiteConfig()` on public pages.
 * @deprecated Import resolveSiteContact or useGlobalSiteConfig for CMS-backed values.
 */
import { resolveSiteContact } from '../utils/resolveSiteConfig';

export const COMPANY = resolveSiteContact();

export type CompanyContact = typeof COMPANY;
