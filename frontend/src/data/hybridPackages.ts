/**
 * Turnkey hybrid lithium package tiers (marketing / Solar Packages page).
 * Update prices here and in marketing/hybrid-lithium-packages/packages.json for PDF export.
 * Smallest hybrid inverter tier: 6.5 kVA (matches catalog & sizing minimum).
 */
export type HybridPackage = {
  id: string;
  badge: string;
  kvaLabel: string;
  maxWatts: string;
  priceGhs: number;
  highlights: string[];
  components: string[];
  appliances: string;
};

export const HYBRID_PACKAGE_BRAND = {
  documentTitle: 'Hybrid Lithium Solar Packages',
  subtitle:
    'Turnkey packages for Ghana homes and businesses. Prices include supply, roof mounting, cables, protection, commissioning, and monitoring setup.',
  validityNote: 'Prices valid until December 2026. Final design is confirmed after a free site survey.',
  warrantyNote:
    'LiFePO₄ lithium storage · Manufacturer battery warranty · 2-year workmanship on installation.',
};

export const HYBRID_PACKAGES: HybridPackage[] = [
  {
    id: 'ep-6.5kva',
    badge: 'Essential',
    kvaLabel: '6.5 KVA',
    maxWatts: '5,500',
    priceGhs: 64900,
    highlights: ['Entry tier · flats & small homes'],
    components: [
      '6.5 kVA hybrid inverter',
      '5 kWh LiFePO₄ battery',
      'Battery management & monitoring',
      '570W tier-1 solar panels (6)',
      'DC/AC protection & changeover',
      'Roof mounting structure',
      'Cables, MC4, earthing & commissioning',
    ],
    appliances: 'Fridge, TV, fans, 15–20 LED lights, phone/laptop charging, small appliances.',
  },
  {
    id: 'ep-8kva',
    badge: 'Home',
    kvaLabel: '8 KVA',
    maxWatts: '6,500',
    priceGhs: 94900,
    highlights: ['Popular family home'],
    components: [
      '8 kVA hybrid inverter',
      '5 kWh LiFePO₄ batteries (2)',
      'Battery management & monitoring',
      '570W tier-1 solar panels (8)',
      'DC/AC protection & changeover',
      'Roof mounting structure',
      'Cables, MC4, earthing & commissioning',
    ],
    appliances:
      'Fridge, blender, sound system, iron, rice cooker, 1 AC (1–1.5 hp), 25 bulbs, 5 fans, 2 TVs, computers, printer.',
  },
  {
    id: 'ep-10kva',
    badge: 'Plus',
    kvaLabel: '10 KVA',
    maxWatts: '8,500',
    priceGhs: 159000,
    highlights: ['Large home or small office'],
    components: [
      '10 kVA hybrid inverter',
      '5 kWh LiFePO₄ batteries (4)',
      'Battery management & monitoring',
      '570W tier-1 solar panels (16)',
      'DC/AC protection & changeover',
      'Roof mounting structure',
      'Cables, MC4, earthing & commissioning',
    ],
    appliances:
      '2 fridges/freezers, blender, sound system, iron, microwave, 2 AC units, 30 bulbs, 4 fans, 2 TVs, office equipment.',
  },
  {
    id: 'ep-12kva',
    badge: 'Pro',
    kvaLabel: '12 KVA',
    maxWatts: '11,500',
    priceGhs: 209000,
    highlights: ['Executive home / boutique business'],
    components: [
      '12 kVA hybrid inverter',
      '5 kWh LiFePO₄ batteries (6)',
      'Battery management & monitoring',
      '570W Jinko / Longi panels (20)',
      'Dual MPPT where required, changeover',
      'Roof mounting structure',
      'Cables, MC4, earthing & commissioning',
    ],
    appliances:
      'Multiple fridges, blenders, sound system, iron, heater, rice cooker, 2 AC units, 30 bulbs, fans, TVs, office equipment.',
  },
  {
    id: 'ep-15kva',
    badge: 'Commercial',
    kvaLabel: '15 KVA',
    maxWatts: '14,500',
    priceGhs: 279000,
    highlights: ['Guest house · retail · church'],
    components: [
      '15 kVA hybrid inverter',
      '5 kWh LiFePO₄ batteries (8)',
      'Battery management & monitoring',
      '570W tier-1 panels (28)',
      'AC/DC distribution & changeover',
      'Roof mounting structure',
      'Cables, MC4, earthing & commissioning',
    ],
    appliances:
      'Heavy kitchen loads, 4 AC units, sound system, office equipment, lighting for commercial floors.',
  },
  {
    id: 'ep-20kva',
    badge: 'Power',
    kvaLabel: '20 KVA',
    maxWatts: '19,500',
    priceGhs: 369000,
    highlights: ['Hotel wing · office block'],
    components: [
      '10 kVA hybrid inverters (2, synchronized)',
      '5 kWh LiFePO₄ batteries (10)',
      'Battery management & monitoring',
      '570W tier-1 panels (36)',
      'AC/DC distribution & changeover',
      'Roof mounting structure',
      'Cables, MC4, earthing & commissioning',
    ],
    appliances:
      'Multiple AC units, commercial kitchen, fridges, office IT loads, event/sound systems, full-building lighting.',
  },
];

export const HYBRID_PACKAGE_FOOTER_POINTS = [
  'Every package uses hybrid inverters from 6.5 kVA upward — aligned with our catalog and professional sizing.',
  'Every package starts with a site survey — we confirm roof area, cable routes, and your real load before final BOM.',
  'Quoted and supported from our Accra office (Haatso, Ecomog) — projects across Ghana scheduled by appointment.',
  'Larger projects receive engineered load analysis, itemized quotations, and formal handover documentation.',
  'Typical payment: 30% deposit · 40% on delivery · 30% on commissioning (negotiable for commercial clients).',
];

export function formatGhs(amount: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 0,
  }).format(amount);
}
