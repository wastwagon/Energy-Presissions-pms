/** Normalized marketing topics accepted by POST /contact/submit */
export type ContactTopic = 'referral' | 'estimate' | 'load';

export function normalizeContactTopic(raw: string | null): ContactTopic | undefined {
  if (!raw) return undefined;
  const t = raw.toLowerCase().trim();
  if (t === 'referral') return 'referral';
  if (t === 'estimate' || t === 'solar-estimate') return 'estimate';
  if (t === 'load' || t === 'load-calculator' || t === 'appliances') return 'load';
  return undefined;
}

export const CONTACT_TOPIC_MESSAGE_HINTS: Record<ContactTopic, string> = {
  referral:
    "I'm interested in the Solar Champions / referral program. Please share how referrals work and next steps.",
  estimate:
    'I used the online solar estimate tool and would like a proper site assessment and quote.',
  load:
    'I used the website appliance load calculator and would like an engineered review and quote.',
};

export const CONTACT_TOPIC_BANNERS: Record<
  ContactTopic,
  { title: string; body: string }
> = {
  referral: {
    title: 'Referral program',
    body: 'You came from the Solar Champions page. Tell us about the property or person you have in mind—we will follow up with how the program works.',
  },
  estimate: {
    title: 'After the online estimate',
    body: 'You used the ballpark solar calculator. Add any site details below (location, roof type, monthly bill) so we can prepare a real quote.',
  },
  load: {
    title: 'After the load calculator',
    body: 'You built an indicative appliance list on our site. Add your location, roof or site type, and anything we should know — our engineers will validate load and design on site.',
  },
};
