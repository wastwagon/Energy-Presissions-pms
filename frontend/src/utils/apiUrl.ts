const LOCAL_API_URL = 'http://localhost:8000';

const isLocalHost = (host: string): boolean =>
  host === 'localhost' || host === '127.0.0.1';

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
    // Same-origin /api via CRA proxy in development (avoids CORS).
    if (process.env.NODE_ENV === 'development') {
      return '';
    }
    return LOCAL_API_URL;
  }

  const renderBackendUrl = deriveRenderBackendUrl(window.location.host);
  if (renderBackendUrl) {
    return renderBackendUrl;
  }

  // Self-hosted (Coolify/VPS): nginx proxies /api on the same origin.
  return window.location.origin.replace(/\/+$/, '');
};
