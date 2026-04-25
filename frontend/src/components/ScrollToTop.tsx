import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Scroll window to top whenever the route pathname changes (all in-app links). */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
