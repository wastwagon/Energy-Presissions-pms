/**
 * Turnkey hybrid lithium package tiers (marketing / Solar Packages page).
 * Source of truth for copy: marketing/hybrid-lithium-packages/package_content.py
 * Run enrich on packages.json after tier changes (see package_sizing.py).
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
    'Hybrid solar with lithium backup (grid + generator ready). Turnkey supply, roof mounting, protection, commissioning, and monitoring.',
  validityNote: 'Prices valid until December 2026. Final design is confirmed after a free site survey.',
  warrantyNote:
    'Premium 16 kWh LiFePO₄ batteries · 5-year battery warranty (manufacturer) · 2-year workmanship on installation.',
};

export const HYBRID_PACKAGES: HybridPackage[] = [
  {
    id: 'ep-6.5kva',
    badge: 'Essential',
    kvaLabel: '6.5 KVA',
    maxWatts: '5,500',
    priceGhs: 140900,
    highlights: ['Entry tier · flats & small homes'],
    components: [
      '6.5 kVA hybrid inverter',
      '16 kWh LiFePO₄ battery',
      'Battery management & monitoring',
      '570W tier-1 solar panels (15)',
      'DC/AC protection & changeover',
      'Roof mounting structure',
      'Cables, MC4, earthing & commissioning',
    ],
    appliances:
      'Fridge, TV, standing fans, router, 15–20 LED lights, phone and laptop charging, blender or kettle (one at a time). No air conditioning — add a higher tier for AC.',
  },
  {
    id: 'ep-8kva',
    badge: 'Home',
    kvaLabel: '8 KVA',
    maxWatts: '6,800',
    priceGhs: 190900,
    highlights: ['Popular family home'],
    components: [
      '8 kVA hybrid inverter',
      '16 kWh LiFePO₄ batteries (2)',
      'Battery management & monitoring',
      '570W tier-1 solar panels (19)',
      'DC/AC protection & changeover',
      'Roof mounting structure',
      'Cables, MC4, earthing & commissioning',
    ],
    appliances:
      'Fridge, rice cooker, blender, iron (staggered), 1 split AC (1–1.5 hp), 25 LED bulbs, 4–5 fans, 2 TVs, home Wi‑Fi, 2–3 laptops or computers, printer.',
  },
  {
    id: 'ep-10kva',
    badge: 'Plus',
    kvaLabel: '10 KVA',
    maxWatts: '8,500',
    priceGhs: 229900,
    highlights: ['Large home or small office'],
    components: [
      '10 kVA hybrid inverter',
      '16 kWh LiFePO₄ batteries (3)',
      'Battery management & monitoring',
      '570W tier-1 solar panels (23)',
      'DC/AC protection & changeover',
      'Roof mounting structure',
      'Cables, MC4, earthing & commissioning',
    ],
    appliances:
      '2 fridges or fridge + freezer, rice cooker or microwave, blender, iron (staggered), up to 2 split AC (1–1.5 hp, not together on full cool), 30 LED bulbs, 4–5 fans, 2 TVs, small office (PCs, printer, router).',
  },
  {
    id: 'ep-12kva',
    badge: 'Pro',
    kvaLabel: '12 KVA',
    maxWatts: '10,200',
    priceGhs: 280900,
    highlights: ['Executive home · boutique office'],
    components: [
      '12 kVA hybrid inverter',
      '16 kWh LiFePO₄ batteries (4)',
      'Battery management & monitoring',
      '570W Jinko / Longi panels (28)',
      'Dual MPPT where required, changeover',
      'Roof mounting structure',
      'Cables, MC4, earthing & commissioning',
    ],
    appliances:
      '2 fridges/freezers, kitchen blender, rice cooker, iron and heater (staggered), 2–3 split AC (1–1.5 hp — alternate with kitchen peaks, not all on full cool), 30+ LED bulbs, 4–5 fans, 2–3 TVs, home office or shop POS and computers.',
  },
  {
    id: 'ep-15kva',
    badge: 'Commercial',
    kvaLabel: '15 KVA',
    maxWatts: '12,800',
    priceGhs: 344900,
    highlights: ['Guest house · shop · church hall'],
    components: [
      '15 kVA hybrid inverter',
      '16 kWh LiFePO₄ batteries (5)',
      'Battery management & monitoring',
      '570W tier-1 panels (35)',
      'AC/DC distribution & changeover',
      'Roof mounting structure',
      'Cables, MC4, earthing & commissioning',
    ],
    appliances:
      'Several guest rooms, commercial fridge, kitchen appliances (staggered), up to 4 split AC (1–1.5 hp) with load management, sound system, reception PCs, security and corridor lighting, small water pump or booster (if within survey load).',
  },
  {
    id: 'ep-20kva',
    badge: 'Power',
    kvaLabel: '20 KVA',
    maxWatts: '17,000',
    priceGhs: 447900,
    highlights: ['Hotel wing · office block · multi-tenant'],
    components: [
      '10 kVA hybrid inverters (2, synchronized)',
      '16 kWh LiFePO₄ batteries (6)',
      'Battery management & monitoring',
      '570W tier-1 panels (46)',
      'AC/DC distribution & changeover',
      'Roof mounting structure',
      'Cables, MC4, earthing & commissioning',
    ],
    appliances:
      'Multiple guest-room AC (1–1.5 hp, staggered across rooms), commercial kitchen peaks, laundry alternated with AC, fridges, IT/server room on dedicated circuit, event or hall lighting — engineered load schedule on survey.',
  },
];

export const HYBRID_PACKAGE_FOOTER_POINTS = [
  'Hybrid systems — solar plus lithium backup with ECG/grid and generator; off-grid only when engineered on survey.',
  'Load ceilings use ~0.85 power factor — stagger AC, iron, and heater; do not run all heavy loads at once.',
  'Panel counts match each inverter at max DC/AC ratio (1.3) with 570 W modules.',
  'Storage uses 16 kWh LiFePO₄ modules; site survey confirms module count and backup hours.',
  'Quoted from our Accra office (Haatso, Ecomog) — installs across Ghana by appointment.',
  'Larger projects receive engineered load analysis, itemized quotations, and formal handover.',
  'Typical payment: 30% deposit · 40% on delivery · 30% on commissioning (negotiable for commercial clients).',
];

export function formatGhs(amount: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 0,
  }).format(amount);
}
