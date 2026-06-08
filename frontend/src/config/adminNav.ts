import { UserRole } from '../types';

export type AdminNavItem = {
  text: string;
  path: string;
  /** When true, admin and website_admin can see the item */
  webStaff?: boolean;
};

export const PMS_NAV: AdminNavItem[] = [
  { text: 'Dashboard', path: '/pms/dashboard' },
  { text: 'Customers', path: '/pms/customers' },
  { text: 'Projects', path: '/pms/projects' },
  { text: 'Quotes', path: '/pms/quotes' },
  { text: 'Products', path: '/web/app/products', webStaff: true },
  { text: 'Appliances', path: '/pms/appliances' },
  { text: 'Orders', path: '/web/app/orders', webStaff: true },
  { text: 'Website content', path: '/web/app/content', webStaff: true },
  { text: 'Promo codes', path: '/web/app/promo-codes', webStaff: true },
  { text: 'Contact leads', path: '/web/app/contact-leads', webStaff: true },
  { text: 'Media Library', path: '/web/app/media', webStaff: true },
  { text: 'Reports', path: '/pms/reports' },
  { text: 'Settings', path: '/pms/settings' },
];

export const WEB_ADMIN_NAV: AdminNavItem[] = [
  { text: 'Dashboard', path: '/web/app' },
  { text: 'Shop products', path: '/web/app/products' },
  { text: 'Orders', path: '/web/app/orders' },
  { text: 'Media', path: '/web/app/media' },
  { text: 'Promo codes', path: '/web/app/promo-codes' },
  { text: 'Contact leads', path: '/web/app/contact-leads' },
  { text: 'Newsletter', path: '/web/app/newsletter' },
  { text: 'Website content', path: '/web/app/content' },
];

export function canManageWebsite(role?: string): boolean {
  return role === UserRole.ADMIN || role === UserRole.WEBSITE_ADMIN;
}

export function filterPmsNav(role?: string): AdminNavItem[] {
  return PMS_NAV.filter((item) => !item.webStaff || canManageWebsite(role));
}
