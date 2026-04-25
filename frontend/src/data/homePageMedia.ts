import { portfolioPageItems } from './portfolioPageItems';

const portfolioImage = (id: number): string => {
  const item = portfolioPageItems.find((p) => p.id === id);
  return item?.image ?? '';
};

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
      '/website_images/services-commercial-solar.png',
    industrial:
      '/website_images/services-industrial-solar.png',
    agricultural:
      '/website_images/services-agricultural-productive-use.png',
  },
} as const;

/** Services page — six large cards (same order as `Services.tsx` premiumServices). */
export const servicesPageImages = {
  residential: homePageImages.services.residential,
  commercial: homePageImages.services.commercial,
  industrial: homePageImages.services.industrial,
  battery:
    '/website_images/services-battery-storage-solutions.png',
  consultation:
    '/website_images/services-solar-energy-consultation.png',
  maintenance:
    '/website_images/services-maintenance-monitoring.png',
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
    image: portfolioImage(1),
    alt: 'Solar panels installed on a residential roof',
  },
  {
    title: 'Commercial office array',
    category: 'Commercial',
    image: portfolioImage(2),
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
