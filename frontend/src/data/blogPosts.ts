/**
 * Marketing articles — edit this file or replace with a CMS later.
 * Keep slugs stable for SEO when adding posts.
 */
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  readTime: string;
  paragraphs: string[];
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'site-assessment-before-solar-sizing',
    title: 'Why a site assessment matters before solar sizing',
    excerpt:
      'Accurate bills, roof or ground space, and how you use power all change the right system size — not just panel count.',
    date: '2026-04-01',
    readTime: '4 min read',
    paragraphs: [
      'Solar sizing is not guesswork. The same number of panels can be right for one home and wrong for another because tariffs, usage patterns, and available roof or ground space differ.',
      'A proper site assessment reviews your recent electricity consumption (or expected loads for a new build), shading, orientation, and whether you want backup during outages. That drives inverter and battery choices as much as it drives panel count.',
      'When you request a quote, sharing honest usage data and photos of your service entry and roof helps engineers avoid oversized systems you pay too much for — or undersized systems that disappoint.',
      'Energy Precisions combines load analysis with on-site or remote checks so proposals stay tied to what you actually need. When you are ready, start with a quote request and we will guide the rest.',
    ],
  },
  {
    slug: 'grid-tied-vs-hybrid-ghana',
    title: 'Grid-tied vs hybrid solar in Ghana: what to consider',
    excerpt:
      'Grid-tied systems maximise savings when the grid is stable; hybrid adds batteries for backup and smoother evening use.',
    date: '2026-04-03',
    readTime: '5 min read',
    paragraphs: [
      'Grid-tied solar feeds excess energy to the grid where net metering or export rules apply, reducing your bill when the sun is up. It is often the most cost-effective path when outages are rare and your goal is lower energy cost.',
      'Hybrid systems add battery storage so critical circuits — or the whole premises — can run when the grid drops. Batteries also help shift solar energy into the evening, which matters when peak tariffs or self-consumption goals dominate.',
      'In Ghana, grid reliability varies by area. If your operations or comfort depend on continuity, budgeting for a hybrid design early avoids expensive retrofits later.',
      'There is no universal winner: the right design matches your tariff, outage experience, budget, and maintenance appetite. We document assumptions clearly in every proposal so you can compare options on merit.',
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
