import { fontWeight, typeScale } from './typography';

/** Compact typography for PMS + website admin shells */
export const adminUi = {
  pageTitle: {
    fontWeight: fontWeight.bold,
  },
  nav: typeScale.nav,
  navItem: {
    fontSize: typeScale.nav.fontSize,
  },
  appBarTitle: {
    fontSize: '0.95rem',
    fontWeight: fontWeight.semibold,
  },
  avatar: {
    fontSize: '0.8rem',
  },
  label: {
    fontSize: typeScale.caption.fontSize,
    fontWeight: fontWeight.semibold,
  },
};
