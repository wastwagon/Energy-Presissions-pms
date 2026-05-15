/**
 * Portfolio gallery — site install photos/videos under /public/portfolio/.
 */
export type PortfolioMediaType = 'image' | 'video';

export type PortfolioPageItem = {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  location: string;
  mediaType?: PortfolioMediaType;
};

const installGallery: PortfolioPageItem[] = [
  {
    id: 101,
    title: 'Roof-mounted PV array',
    category: 'Installation',
    description: 'Tier-1 modules on residential roof — rails, weatherproofing, and clean cable routing.',
    image: '/portfolio/ep-install-01.jpg',
    location: 'Ghana',
    mediaType: 'image',
  },
  {
    id: 102,
    title: 'Array layout & fixing',
    category: 'Installation',
    description: 'Panel alignment and mounting hardware installed to manufacturer specification.',
    image: '/portfolio/ep-install-02.jpg',
    location: 'Ghana',
    mediaType: 'image',
  },
  {
    id: 103,
    title: 'DC side preparation',
    category: 'Installation',
    description: 'String wiring and protection before inverter commissioning.',
    image: '/portfolio/ep-install-03.jpg',
    location: 'Ghana',
    mediaType: 'image',
  },
  {
    id: 104,
    title: 'Inverter & battery wall',
    category: 'Battery storage',
    description: 'Hybrid inverter with lithium storage and labelled AC/DC distribution.',
    image: '/portfolio/ep-install-04.jpg',
    location: 'Ghana',
    mediaType: 'image',
  },
  {
    id: 105,
    title: 'Client handover — system live',
    category: 'Commissioning',
    description: 'Final checks and customer walkthrough after successful commissioning.',
    image: '/portfolio/ep-install-05.jpg',
    location: 'Ghana',
    mediaType: 'image',
  },
  {
    id: 106,
    title: 'Commercial roof install',
    category: 'Commercial',
    description: 'Multi-row array on pitched roof for higher daytime consumption.',
    image: '/portfolio/ep-install-06.jpg',
    location: 'Ghana',
    mediaType: 'image',
  },
  {
    id: 107,
    title: 'Team on site',
    category: 'Installation',
    description: 'Energy Precisions technicians during installation and quality checks.',
    image: '/portfolio/ep-install-07.jpg',
    location: 'Ghana',
    mediaType: 'image',
  },
  {
    id: 108,
    title: 'Battery storage cabinet',
    category: 'Battery storage',
    description: 'LiFePO₄ battery bank with monitoring for backup and self-consumption.',
    image: '/portfolio/ep-install-08.jpg',
    location: 'Ghana',
    mediaType: 'image',
  },
  {
    id: 109,
    title: 'Roof works in progress',
    category: 'Installation',
    description: 'Mounting rails and modules staged before electrical tie-in.',
    image: '/portfolio/ep-install-09.jpg',
    location: 'Ghana',
    mediaType: 'image',
  },
  {
    id: 110,
    title: 'Completed residential system',
    category: 'Residential',
    description: 'Finished home solar package — panels, inverter, and storage integrated.',
    image: '/portfolio/ep-install-10.jpg',
    location: 'Ghana',
    mediaType: 'image',
  },
  {
    id: 111,
    title: 'Electrical room fit-out',
    category: 'Commissioning',
    description: 'DB boards, changeover, and labelled circuits for safe operation.',
    image: '/portfolio/ep-install-11.jpg',
    location: 'Ghana',
    mediaType: 'image',
  },
  {
    id: 112,
    title: 'Array close-up',
    category: 'Installation',
    description: 'Module glass and frame finish — quality check before energizing.',
    image: '/portfolio/ep-install-12.jpg',
    location: 'Ghana',
    mediaType: 'image',
  },
  {
    id: 113,
    title: 'Site logistics',
    category: 'Installation',
    description: 'Materials and equipment staged for efficient install day.',
    image: '/portfolio/ep-install-13.jpg',
    location: 'Ghana',
    mediaType: 'image',
  },
  {
    id: 114,
    title: 'Hybrid system overview',
    category: 'Residential',
    description: 'Full hybrid solar solution — generation, storage, and backup ready.',
    image: '/portfolio/ep-install-14.jpg',
    location: 'Ghana',
    mediaType: 'image',
  },
  {
    id: 115,
    title: 'Finished roofline',
    category: 'Residential',
    description: 'Low-profile array integrated with existing roof structure.',
    image: '/portfolio/ep-install-15.jpg',
    location: 'Ghana',
    mediaType: 'image',
  },
  {
    id: 116,
    title: 'Installation walkthrough',
    category: 'Installation',
    description: 'On-site video — mounting and electrical progress.',
    image: '/portfolio/ep-install-16.mp4',
    location: 'Ghana',
    mediaType: 'video',
  },
  {
    id: 117,
    title: 'Commissioning clip',
    category: 'Commissioning',
    description: 'System testing and handover moments captured on site.',
    image: '/portfolio/ep-install-17.mp4',
    location: 'Ghana',
    mediaType: 'video',
  },
];

/** Featured reference projects (illustrative) + real install gallery */
export const portfolioPageItems: PortfolioPageItem[] = [
  ...installGallery,
  {
    id: 1,
    title: 'Commercial Office Solar — Kumasi',
    category: 'Commercial',
    description: '25 kW solar installation for a corporate office with monitoring.',
    image: '/website_images/portfolio-commercial-office-solar.png',
    location: 'Kumasi, Ghana',
    mediaType: 'image',
  },
  {
    id: 4,
    title: 'School Solar Project',
    category: 'Education',
    description: 'Off-grid solar for rural school — reliable power for learning.',
    image: '/website_images/portfolio-school-solar-project.png',
    location: 'Northern Region',
    mediaType: 'image',
  },
];
