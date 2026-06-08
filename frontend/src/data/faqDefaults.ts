import extracted from './extracted_content.json';

export type FaqItem = { question: string; answer: string };

/** Bundled FAQ fallback — canonical source: extracted_content.json */
export function getDefaultFaqs(): FaqItem[] {
  const faqs = (extracted as { faqs?: FaqItem[] }).faqs;
  if (!Array.isArray(faqs)) return [];
  return faqs.filter((f) => f?.question?.trim() && f?.answer?.trim());
}
