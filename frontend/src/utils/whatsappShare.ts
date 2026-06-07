import { COMPANY } from '../data/companyContact';

export function buildWhatsAppShareUrl(message: string): string {
  return `${COMPANY.whatsappHref}?text=${encodeURIComponent(message)}`;
}

export const REFERRAL_WHATSAPP_MESSAGE =
  'Hi Energy Precisions! I would like to refer someone for a solar installation in Ghana. Please share referral steps and reward terms.';

export const REFERRAL_LEAD_WHATSAPP_TEMPLATE =
  'Hi Energy Precisions! I am referring a solar prospect:\n\nName:\nPhone:\nLocation:\nProperty type (home/business):\n\nThanks!';
