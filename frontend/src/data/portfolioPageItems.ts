/**
 * Portfolio grid — replace `image` URLs when CMS/media library is connected.
 * Unsplash (https://unsplash.com/license).
 */
export type PortfolioPageItem = {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  location: string;
};

export const portfolioPageItems: PortfolioPageItem[] = [
  {
    id: 1,
    title: 'Residential Solar Installation - Accra',
    category: 'Residential',
    description: 'Complete 5kW home solar system with battery backup for a family in East Legon.',
    image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=80',
    location: 'Accra, Ghana',
  },
  {
    id: 2,
    title: 'Commercial Office Solar - Kumasi',
    category: 'Commercial',
    description: '25kW solar installation for a corporate office building with smart monitoring.',
    image: 'https://images.unsplash.com/photo-1559302504-64aae0ca2a3d?auto=format&fit=crop&w=800&q=80',
    location: 'Kumasi, Ghana',
  },
  {
    id: 3,
    title: 'Industrial Facility - Tema',
    category: 'Industrial',
    description: '100kW hybrid solar system for manufacturing facility with battery storage.',
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=800&q=80',
    location: 'Tema, Ghana',
  },
  {
    id: 4,
    title: 'School Solar Project',
    category: 'Education',
    description: 'Off-grid solar solution for rural school providing 24/7 power for learning.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=800&q=80',
    location: 'Northern Region',
  },
  {
    id: 5,
    title: 'Hospital Backup Power',
    category: 'Healthcare',
    description: 'Critical backup solar system ensuring uninterrupted power for medical equipment.',
    image: 'https://images.unsplash.com/photo-1516549655169-cf83a451ccdb?auto=format&fit=crop&w=800&q=80',
    location: 'Greater Accra',
  },
  {
    id: 6,
    title: 'Residential Estate',
    category: 'Residential',
    description: 'Multiple home installations across a new residential development.',
    image: 'https://images.unsplash.com/photo-1611365892117-00ac5ef43c90?auto=format&fit=crop&w=800&q=80',
    location: 'Accra, Ghana',
  },
];
