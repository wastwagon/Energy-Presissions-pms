import { COMPANY } from '../data/companyContact';
import { SITE_ORIGIN } from '../components/Seo';

export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: COMPANY.name,
    description: COMPANY.tagline,
    url: COMPANY.website,
    telephone: COMPANY.phone,
    email: COMPANY.emailPrimary,
    address: {
      '@type': 'PostalAddress',
      streetAddress: COMPANY.addressLine1,
      addressLocality: 'Accra',
      addressCountry: 'GH',
    },
    areaServed: { '@type': 'Country', name: 'Ghana' },
    image: `${SITE_ORIGIN}${COMPANY.logoSrc}`,
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
