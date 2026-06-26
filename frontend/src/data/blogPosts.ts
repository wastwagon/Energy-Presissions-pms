/**
 * Marketing articles — edit this file or replace with a CMS later.
 * Keep slugs stable for SEO when adding posts.
 */
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  readTime: string;
  /** Path under frontend/public or full URL — editable in admin CMS later */
  featuredImage: string;
  paragraphs: string[];
}

export const BLOG_CATEGORIES = ['All', 'Planning', 'Systems', 'Ghana'] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

const DEFAULT_BLOG_IMAGE = '/website_images/services-commercial-solar.png';

export const blogPosts: BlogPost[] = [
  {
    slug: 'grid-tied-vs-hybrid-ghana',
    title: 'Grid-tied vs hybrid solar in Ghana: what to consider',
    excerpt:
      'Grid-tied systems maximise savings when the grid is stable; hybrid adds batteries for backup and smoother evening use.',
    category: 'Systems',
    date: '2026-04-03',
    readTime: '5 min read',
    featuredImage: '/website_images/services-commercial-solar.png',
    paragraphs: [
      'Grid-tied solar feeds excess energy to the grid where net metering or export rules apply, reducing your bill when the sun is up. It is often the most cost-effective path when outages are rare and your goal is lower energy cost.',
      'Hybrid systems add battery storage so critical circuits — or the whole premises — can run when the grid drops. Batteries also help shift solar energy into the evening, which matters when peak tariffs or self-consumption goals dominate.',
      'In Ghana, grid reliability varies by area. If your operations or comfort depend on continuity, budgeting for a hybrid design early avoids expensive retrofits later.',
      'There is no universal winner: the right design matches your tariff, outage experience, budget, and maintenance appetite. We document assumptions clearly in every proposal so you can compare options on merit.',
    ],
  },
  {
    slug: 'site-assessment-before-solar-sizing',
    title: 'Why a site assessment matters before solar sizing',
    excerpt:
      'Accurate bills, roof or ground space, and how you use power all change the right system size — not just panel count.',
    category: 'Planning',
    date: '2026-04-01',
    readTime: '4 min read',
    featuredImage: '/portfolio/ep-install-01.jpg',
    paragraphs: [
      'Solar sizing is not guesswork. The same number of panels can be right for one home and wrong for another because tariffs, usage patterns, and available roof or ground space differ.',
      'A proper site assessment reviews your recent electricity consumption (or expected loads for a new build), shading, orientation, and whether you want backup during outages. That drives inverter and battery choices as much as it drives panel count.',
      'When you request a quote, sharing honest usage data and photos of your service entry and roof helps engineers avoid oversized systems you pay too much for — or undersized systems that disappoint.',
      'Energy Precisions combines load analysis with on-site or remote checks so proposals stay tied to what you actually need. When you are ready, start with a quote request and we will guide the rest.',
    ],
  },
  {
    slug: 'ecg-tariffs-solar-offset-ghana',
    title: 'How ECG tariffs affect your solar savings in Ghana',
    excerpt:
      'Your tariff band, time-of-use charges, and consumption pattern determine how much solar actually reduces your monthly bill.',
    category: 'Ghana',
    date: '2026-03-28',
    readTime: '5 min read',
    featuredImage: '/portfolio/ep-install-02.jpg',
    paragraphs: [
      'Solar savings are not a flat percentage off your bill. ECG residential and commercial tariffs use tiered consumption blocks, and some accounts face time-of-use or demand-related charges that change when self-consumption matters most.',
      'A system sized only on annual kWh can miss the point if most of your usage happens at night or during peak bands. Engineers should model when you consume power, not just how much.',
      'Export or net-metering arrangements — where available — also shape payback. Understanding what you are credited for when panels over-produce is part of an honest financial picture.',
      'Before you commit, ask for a savings estimate tied to your actual tariff class and recent bills. That is how you avoid proposals that look good on paper but under-deliver after installation.',
    ],
  },
  {
    slug: 'battery-backup-sizing-critical-loads',
    title: 'Battery backup sizing: which loads matter most',
    excerpt:
      'Backing up everything is expensive. Prioritising critical circuits keeps hybrid systems practical and affordable.',
    category: 'Systems',
    date: '2026-03-25',
    readTime: '4 min read',
    featuredImage: '/website_images/services-battery-storage-solutions.png',
    paragraphs: [
      'Batteries are priced by usable kWh and peak power output. Trying to run every appliance during an outage — air conditioning, ovens, water heaters — quickly multiplies battery and inverter cost.',
      'Most homes and small businesses get better value by defining critical loads: lights, fans, internet, refrigeration, security, and selected sockets. Commercial sites might add cash registers, servers, or pumps.',
      'Load prioritisation also affects wiring. A hybrid design may use a dedicated backup distribution board so essential circuits switch cleanly when the grid drops.',
      'We document which loads are in scope, expected runtime at night, and recharge behaviour so you know what backup actually means for your site — not just a battery kWh number on a quote.',
    ],
  },
  {
    slug: 'commercial-solar-payback-ghana',
    title: 'Commercial solar payback timelines in Ghana',
    excerpt:
      'Rising tariffs and daytime operations make many Ghanaian businesses strong candidates for rooftop solar — if payback is modelled honestly.',
    category: 'Planning',
    date: '2026-03-22',
    readTime: '6 min read',
    featuredImage: '/website_images/services-industrial-solar.png',
    paragraphs: [
      'Commercial payback depends on installed cost per kWp, self-consumption rate, tariff escalation, and any financing cost. Businesses that use power mainly during sunlight hours often see the fastest returns.',
      'Rooftop space, structural loading, and ECG connection capacity can limit or expand what is feasible. A site walk identifies these constraints before you budget capex.',
      'Maintenance, inverter replacement reserves, and insurance should sit inside a 15–20 year model — not be ignored to make payback look shorter.',
      'Energy Precisions provides transparent assumptions in commercial proposals so finance teams can compare solar against diesel backup, genset fuel, or doing nothing.',
    ],
  },
  {
    slug: 'solar-maintenance-ghana-climate',
    title: 'Solar maintenance checklist for Ghana\'s climate',
    excerpt:
      'Heat, dust, and seasonal rains affect performance. Simple upkeep protects generation and extends equipment life.',
    category: 'Systems',
    date: '2026-03-18',
    readTime: '4 min read',
    featuredImage: '/website_images/services-maintenance-monitoring.png',
    paragraphs: [
      'Panels lose output when dust and debris build up — especially near construction sites, unpaved roads, or harmattan dust. Gentle cleaning with water and a soft brush restores yield without scratching glass.',
      'Inverters and batteries need ventilation and periodic inspection. Error codes, unusual fan noise, or swelling battery cases should be addressed early rather than after a failure.',
      'After heavy storms, check for loose mounting, water ingress at roof penetrations, and damaged DC cabling. Ghana\'s rainy season makes good installation workmanship as important as equipment quality.',
      'A light annual service — visual inspection, connection checks, and performance review — catches most issues before they become costly downtime.',
    ],
  },
  {
    slug: 'net-metering-ghana-homeowners',
    title: 'Net metering in Ghana: what homeowners should know',
    excerpt:
      'Export rules and metering arrangements shape how much credit you receive when your system sends power back to the grid.',
    category: 'Ghana',
    date: '2026-03-15',
    readTime: '5 min read',
    featuredImage: '/portfolio/ep-install-05.jpg',
    paragraphs: [
      'Net metering allows eligible customers to offset consumption with solar export, but eligibility, application steps, and crediting rules depend on current ECG and PURC policy — which can evolve.',
      'Bi-directional metering and approved interconnection are required. Installing panels without the correct meter and utility sign-off can create billing disputes or safety issues.',
      'Self-consumption still delivers the highest certain value: using solar on-site avoids buying grid power at retail rates. Export credits may be lower or subject to caps.',
      'Work with an installer who handles interconnection paperwork and sets realistic expectations on export revenue — not just headline panel wattage.',
    ],
  },
  {
    slug: 'mono-vs-poly-panels-ghana',
    title: 'Monocrystalline vs polycrystalline panels in Ghana',
    excerpt:
      'Panel type affects roof space, cost, and efficiency. Climate and available area usually matter more than marketing labels.',
    category: 'Planning',
    date: '2026-03-12',
    readTime: '4 min read',
    featuredImage: '/portfolio/ep-install-08.jpg',
    paragraphs: [
      'Monocrystalline panels typically offer higher efficiency per square metre — useful when roof space is limited. Polycrystalline modules can be cost-competitive when you have ample mounting area.',
      'In Ghana\'s strong irradiance, both technologies perform well when installed with correct tilt, orientation, and minimal shading. Cheap panels with poor warranties are a bigger risk than the cell type alone.',
      'Temperature coefficient and degradation rate matter in hot climates. Quality Tier-1 manufacturers publish data that engineers use in long-term yield estimates.',
      'Choose based on verified datasheets, warranty terms, and total system design — not colour or buzzwords on a brochure.',
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

/** Resolve featured image from CMS value or local fallback by slug. */
export function resolveBlogFeaturedImage(slug: string, cmsImage?: string | null): string {
  const trimmed = cmsImage?.trim();
  if (trimmed) return trimmed;
  return getBlogPost(slug)?.featuredImage || DEFAULT_BLOG_IMAGE;
}
