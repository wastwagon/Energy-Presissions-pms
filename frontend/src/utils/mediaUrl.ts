import { resolveApiUrl } from './apiUrl';

/** Resolve catalog / upload paths to a full URL (call at render time, not module load). */
export function resolveMediaUrl(url: string | undefined | null): string {
  if (url == null) return '';
  const clean = String(url).trim().replace(/^['"]|['"]$/g, '');
  if (!clean) return '';
  const base = resolveApiUrl().replace(/\/$/, '');
  if (/^https?:\/\//i.test(clean)) {
    const isLegacyLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//i.test(clean);
    if (
      isLegacyLocal &&
      typeof window !== 'undefined' &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      const path = clean.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, '');
      return `${base}${path.startsWith('/') ? path : `/${path}`}`;
    }
    return clean;
  }
  if (clean.startsWith('/')) return `${base}${clean}`;
  if (clean.startsWith('static/')) return `${base}/${clean}`;
  return `${base}/${clean}`;
}
