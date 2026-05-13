import { resolveApiUrl } from './apiUrl';

/** Resolve catalog / upload paths to a full URL (call at render time, not module load). */
export function resolveMediaUrl(url: string | undefined | null): string {
  if (url == null) return '';
  let clean = String(url).trim().replace(/^['"]|['"]$/g, '');
  if (!clean) return '';
  // Backward compatibility: older records used `/api/media/file/{id}`.
  // Normalize to the current public route so images render for all browsers/sessions.
  clean = clean.replace(/\/api\/media\/file\/(\d+)$/i, '/api/media/public/$1');
  // Legacy/build assets are served by the frontend origin (not the API host).
  // These show up as "/static/media/..." in seeded data or old entries.
  if (
    (clean.startsWith('/static/') || clean.startsWith('static/')) &&
    typeof window !== 'undefined' &&
    window.location?.origin
  ) {
    const path = clean.startsWith('/') ? clean : `/${clean}`;
    return `${window.location.origin.replace(/\/$/, '')}${path}`;
  }
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
  return `${base}/${clean}`;
}
