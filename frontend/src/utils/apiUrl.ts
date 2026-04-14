const LOCAL_API_URL = 'http://localhost:8000';

/** Live API when the marketing site has no /api reverse proxy (must match public/index.html fallback). */
const ENERGYPRECISIONS_API = 'https://energy-pms-backend-1b7h.onrender.com';

const isLocalHost = (host: string): boolean =>
  host === 'localhost' || host === '127.0.0.1';

const isEnergyPrecisionsSite = (host: string): boolean =>
  host === 'energyprecisions.com' || host === 'www.energyprecisions.com';

const deriveRenderBackendUrl = (host: string): string | null => {
  if (!host.endsWith('.onrender.com') || !host.includes('frontend')) {
    return null;
  }

  const backendHost = host.replace(/frontend/g, 'backend');
  return `https://${backendHost}`;
};

export const resolveApiUrl = (): string => {
  const runtimeApiUrl = (window as any).REACT_APP_API_URL;
  if (runtimeApiUrl && String(runtimeApiUrl).trim()) {
    return String(runtimeApiUrl).trim().replace(/\/+$/, '');
  }

  const envBuildUrl =
    typeof process !== 'undefined' && process.env?.REACT_APP_API_URL
      ? String(process.env.REACT_APP_API_URL).trim().replace(/\/+$/, '')
      : '';
  if (envBuildUrl) {
    return envBuildUrl;
  }

  const host = window.location.hostname;
  if (isLocalHost(host)) {
    return LOCAL_API_URL;
  }

  const renderBackendUrl = deriveRenderBackendUrl(window.location.host);
  if (renderBackendUrl) {
    return renderBackendUrl;
  }

  // Without this, login/API calls go to the static site origin (no /api) → Chrome "Network Error".
  if (isEnergyPrecisionsSite(host)) {
    return ENERGYPRECISIONS_API;
  }

  return window.location.origin.replace(/\/+$/, '');
};
