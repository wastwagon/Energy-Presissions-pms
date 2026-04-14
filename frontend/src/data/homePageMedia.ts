/**
 * Homepage imagery — single place to swap URLs when wiring admin/CMS.
 * Default sources: Unsplash (https://unsplash.com/license — free use with attribution appreciated).
 *
 * Section order aligns with typical corporate solar Webflow templates:
 * hero → trust strip → differentiators → service grid → portfolio teaser →
 * process steps → testimonials → closing CTA.
 */
export const homePageImages = {
  /** Hero visual (installers / array). Replace with `/website_images/your-hero.webp` from CMS. */
  hero: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1400&q=85',
  services: {
    residential:
      'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    commercial:
      'https://images.unsplash.com/photo-1559302504-64aae0ca2a3d?auto=format&fit=crop&w=800&q=80',
    industrial:
      'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
    agricultural:
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
  },
} as const;

/** Services page — six large cards (same order as `Services.tsx` premiumServices). */
export const servicesPageImages = {
  residential: homePageImages.services.residential,
  commercial: homePageImages.services.commercial,
  industrial: homePageImages.services.industrial,
  battery:
    'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80',
  consultation:
    'https://images.unsplash.com/photo-1497430603517-7e2fab8fff72?auto=format&fit=crop&w=800&q=80',
  maintenance:
    'https://images.unsplash.com/photo-1621905251189-0b2e291625fb?auto=format&fit=crop&w=800&q=80',
} as const;

export type HomePortfolioPreviewItem = {
  title: string;
  category: string;
  image: string;
  alt: string;
};

/** Teaser row above “View portfolio” — replace `image` with CMS asset URLs. */
export const homePortfolioPreview: HomePortfolioPreviewItem[] = [
  {
    title: 'Residential rooftop — Greater Accra',
    category: 'Residential',
    image:
      'https://images.unsplash.com/photo-1611365892117-00ac5ef43c90?auto=format&fit=crop&w=900&q=80',
    alt: 'Solar panels installed on a residential roof',
  },
  {
    title: 'Commercial office array',
    category: 'Commercial',
    image:
      'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=900&q=80',
    alt: 'Solar installation on a commercial building',
  },
  {
    title: 'Industrial canopy project',
    category: 'Industrial',
    image:
      'https://images.unsplash.com/photo-1592838064575-70ed626d3a0e?auto=format&fit=crop&w=900&q=80',
    alt: 'Large-scale solar array at an industrial site',
  },
];
