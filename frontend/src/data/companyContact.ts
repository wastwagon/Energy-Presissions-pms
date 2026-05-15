/**
 * Canonical company contact & branding — single Accra office.
 * Keep in sync with Footer, Contact, Solar Packages, and marketing PDFs.
 */
export const COMPANY = {
  name: 'Energy Precisions',
  tagline: 'Seamless solar installation service you can trust',
  logoSrc: '/website_images/Logo1-1-scaled-e1752479241874.png',
  logoAlt: 'Energy Precisions logo',
  website: 'https://energyprecisions.com',
  websiteDisplay: 'www.energyprecisions.com',
  phone: '+233533611611',
  phoneDisplay: '(+233) 533 611 611',
  phoneHref: 'tel:+233533611611',
  emailPrimary: 'info@energyprecisions.com',
  emailSales: 'energyprecisions@gmail.com',
  addressLine1: 'Haatso, Ecomog',
  addressLine2: 'Accra, Ghana',
  addressFull: 'Haatso, Ecomog, Accra, Ghana',
  /** Only physical office — used on packages page & brochures */
  officeHeading: 'Accra office',
  officeRegionNote:
    'We operate from our Accra office. Site surveys and installations are arranged across Greater Accra and other regions by appointment.',
} as const;
