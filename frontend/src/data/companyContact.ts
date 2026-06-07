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
  /** WhatsApp Business — wa.me link (no + or spaces) */
  whatsapp: '233533611611',
  whatsappHref: 'https://wa.me/233533611611',
  whatsappDisplay: 'Chat on WhatsApp',
  /**
   * Optional Google Place ID — when set, embed and write-review links use direct Place ID URLs.
   * Find yours in Google Business Profile or Maps share link.
   */
  googlePlaceId: '' as string,
  /** Google Maps — update write-review URL when you claim the Business Profile */
  googleMapsReviewUrl:
    'https://www.google.com/maps/search/?api=1&query=Energy+Precisions+Haatso+Ecomog+Accra+Ghana',
  googleMapsWriteReviewUrl:
    'https://www.google.com/maps/search/?api=1&query=Energy+Precisions+Haatso+Ecomog+Accra+Ghana',
  /** Embed map (no API key) — replace if embed breaks or use Place ID embed */
  googleMapsEmbedUrl:
    'https://maps.google.com/maps?q=Energy+Precisions+Haatso+Ecomog+Accra+Ghana&hl=en&z=15&output=embed',
  emailPrimary: 'info@energyprecisions.com',
  /** Public sales/support inbox (same as emailPrimary) */
  emailSales: 'info@energyprecisions.com',
  addressLine1: 'Haatso, Ecomog',
  addressLine2: 'Accra, Ghana',
  addressFull: 'Haatso, Ecomog, Accra, Ghana',
  /** Only physical office — used on packages page & brochures */
  officeHeading: 'Accra office',
  officeRegionNote:
    'We operate from our Accra office. Site surveys and installations are arranged across Greater Accra and other regions by appointment.',
} as const;
