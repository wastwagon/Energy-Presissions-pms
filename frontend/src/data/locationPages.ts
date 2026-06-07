export type LocationPageData = {
  slug: string;
  city: string;
  region: string;
  badge: string;
  headline: string;
  description: string;
  highlights: string[];
  services: string[];
  seoTitle: string;
  seoDescription: string;
};

export const LOCATION_PAGES: LocationPageData[] = [
  {
    slug: 'solar-accra',
    city: 'Accra',
    region: 'Greater Accra',
    badge: 'Greater Accra',
    headline: 'Solar installation in Accra',
    description:
      'Turnkey hybrid solar, lithium backup, and grid-tied systems for homes and businesses across Accra — from our Haatso office with site surveys across Greater Accra.',
    highlights: [
      'Accra-based engineering team and warehouse',
      'Hybrid packages from 6.5–20 kVA with LiFePO₄ storage',
      'Residential, commercial, and light industrial projects',
    ],
    services: ['Residential solar', 'Commercial solar', 'Hybrid packages', 'Battery storage', 'Shop equipment + install'],
    seoTitle: 'Solar Installation Accra Ghana | Energy Precisions',
    seoDescription:
      'Solar design, hybrid lithium systems, and turnkey installation in Accra and Greater Accra. Free site survey from Energy Precisions, Haatso.',
  },
  {
    slug: 'solar-kumasi',
    city: 'Kumasi',
    region: 'Ashanti Region',
    badge: 'Ashanti Region',
    headline: 'Solar installation in Kumasi',
    description:
      'Engineered solar for homes, schools, and businesses in Kumasi and the Ashanti Region — remote sizing, scheduled site surveys, and nationwide installation support.',
    highlights: [
      'Commercial and institutional projects across Ashanti',
      'Load analysis and hybrid backup for unreliable grid areas',
      'Coordinated logistics from our Accra headquarters',
    ],
    services: ['Commercial solar', 'Industrial solar', 'Off-grid & hybrid', 'Maintenance & monitoring'],
    seoTitle: 'Solar Installation Kumasi Ghana | Energy Precisions',
    seoDescription:
      'Solar panels, inverters, batteries, and professional installation in Kumasi and Ashanti Region. Request a quote from Energy Precisions.',
  },
  {
    slug: 'solar-tamale',
    city: 'Tamale',
    region: 'Northern Region',
    badge: 'Northern Region',
    headline: 'Solar installation in Tamale',
    description:
      'Reliable solar for northern Ghana — off-grid-ready hybrid systems, agricultural loads, and community projects with engineering support from Accra.',
    highlights: [
      'Strong sun hours — sized for real production in the north',
      'Agricultural pumps, clinics, schools, and residential backup',
      'Survey and install scheduling for Northern Region clients',
    ],
    services: ['Agricultural solar', 'Off-grid hybrid', 'Battery storage', 'Community & NGO projects'],
    seoTitle: 'Solar Installation Tamale Northern Ghana | Energy Precisions',
    seoDescription:
      'Solar power for Tamale and Northern Region — hybrid systems, batteries, and professional installation by Energy Precisions.',
  },
];

export function getLocationPage(slug: string): LocationPageData | undefined {
  return LOCATION_PAGES.find((p) => p.slug === slug);
}
