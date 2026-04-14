import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView } from '../utils/analytics';

/**
 * Loads gtag once and sends page_view on SPA route changes.
 */
const AnalyticsRouteListener: React.FC = () => {
  const location = useLocation();
  const initialised = useRef(false);

  useEffect(() => {
    initAnalytics();
    initialised.current = true;
  }, []);

  useEffect(() => {
    if (!initialised.current) return;
    const path = `${location.pathname}${location.search}`;
    const title = typeof document !== 'undefined' ? document.title : undefined;
    const t = window.setTimeout(() => {
      trackPageView(path, title);
    }, 0);
    return () => window.clearTimeout(t);
  }, [location.pathname, location.search]);

  return null;
};

export default AnalyticsRouteListener;
