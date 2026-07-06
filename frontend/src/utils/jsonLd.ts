import type { SiteContact } from './resolveSiteConfig';
import { SITE_ORIGIN } from '../components/Seo';

export function localBusinessJsonLd(contact: SiteContact) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: contact.name,
    description: contact.tagline,
    url: contact.website,
    telephone: contact.phone,
    email: contact.emailPrimary,
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.addressLine1,
      addressLocality: 'Accra',
      addressCountry: 'GH',
    },
    areaServed: { '@type': 'Country', name: 'Ghana' },
    image: `${SITE_ORIGIN}${contact.logoSrc}`,
  };
}

export function faqPageJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export function productJsonLd(product: {
  id: number | string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  inStock?: boolean;
  brand?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.name,
    image: product.image,
    brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
    offers: {
      '@type': 'Offer',
      url: `${SITE_ORIGIN}/products/${product.id}`,
      priceCurrency: 'GHS',
      price: product.price,
      availability:
        product.inStock === false
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
    },
  };
}
