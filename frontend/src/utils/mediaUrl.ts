import { resolveApiUrl } from './apiUrl';

/** Paths served from frontend/public (nginx) — not the FastAPI host. */
const FRONTEND_PUBLIC_PREFIXES = ['/portfolio/', '/website_images/', '/static/'];

function isFrontendPublicAsset(path: string): boolean {
  if (path.startsWith('/api/')) return false;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return FRONTEND_PUBLIC_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function frontendOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '');
  }
  return '';
}

/** Resolve catalog / upload paths to a full URL (call at render time, not module load). */
export function resolveMediaUrl(url: string | undefined | null): string {
  if (url == null) return '';
  let clean = String(url).trim().replace(/^['"]|['"]$/g, '');
  if (!clean) return '';
  // Backward compatibility: older records used `/api/media/file/{id}`.
  // Normalize to the current public route so images render for all browsers/sessions.
  clean = clean.replace(/\/api\/media\/file\/(\d+)$/i, '/api/media/public/$1');

  if (isFrontendPublicAsset(clean)) {
    const path = clean.startsWith('/') ? clean : `/${clean}`;
    const origin = frontendOrigin();
    return origin ? `${origin}${path}` : path;
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
