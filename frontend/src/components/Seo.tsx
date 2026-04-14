import { Helmet } from 'react-helmet-async';

export const SITE_ORIGIN = 'https://energyprecisions.com';

const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/website_images/Logo1-1-scaled-e1752479241874.png`;

export type SeoProps = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  ogImage?: string;
  /** Single JSON-LD object (e.g. WebApplication) serialized into a script tag. */
  jsonLd?: Record<string, unknown>;
};

function canonicalUrl(path: string): string {
  if (path === '/' || path === '') return `${SITE_ORIGIN}/`;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_ORIGIN}${p}`;
}

export function Seo({ title, description, path, noIndex, ogImage, jsonLd }: SeoProps) {
  const canonical = canonicalUrl(path);
  const pageTitle = title.includes('Energy Precisions') ? title : `${title} | Energy Precisions`;
  const image = ogImage || DEFAULT_OG_IMAGE;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {noIndex ? <meta name="robots" content="noindex,nofollow" /> : null}
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
    </Helmet>
  );
}
