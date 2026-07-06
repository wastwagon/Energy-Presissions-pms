/**
 * Turnkey hybrid lithium package tiers (marketing / Solar Packages page).
 * Copy source: marketing/hybrid-lithium-packages/package_copy.py + package_content.py
 * After tier changes: python3 sync_packages.py in marketing/hybrid-lithium-packages
 */
export type HybridPackage = {
  id: string;
  badge: string;
  kvaLabel: string;
  maxWatts: string;
  /** Shown on cards — explains kVA vs inverter vs panels without a sales call */
  customerNote: string;
  /** When stocked inverter exceeds load-tier badge (see package_copy.py) */
  inverterHeadroom?: string;
  /** Key BOM figures always visible on the card */
  specs: {
    inverter: string;
    storage: string;
    panels: string;
    solarKw: string;
  };
  priceGhs: number;
  highlights: string[];
  components: string[];
  appliances: string;
};

export const HYBRID_PACKAGE_READING_GUIDE = {
  title: 'How to read these packages',
  points: [
    'KVA on the badge = your load tier (how much you plan to run at once), not the inverter brand size.',
    'Watts shown (~0.85 × kVA) = continuous planning ceiling — stagger AC, iron, and heaters.',
    'Inverter line = equipment we stock; it may be larger than the kVA badge for AC starts and reliability.',
    'Panel count = sized to the kVA load tier, not to fill a larger inverter — survey may adjust.',
    'Hybrid = solar + lithium + grid (generator-ready); backup hours depend on battery size and night load.',
    'Pricing is tailored to your site — book a free assessment and we confirm the final BOM and quote after survey.',
  ],
} as const;

export const LOAD_CEILING_HELP =
  'Continuous planning figure (~0.85 power factor). Stagger heavy loads — do not exceed this together.';

export const HYBRID_PACKAGE_BRAND = {
  documentTitle: 'Hybrid Lithium Solar Packages',
  subtitle:
    'Hybrid solar with lithium backup (grid + generator ready). Turnkey supply, roof mounting, protection, commissioning, and monitoring.',
  validityNote:
    'Every project starts with a free site assessment — final design and pricing are confirmed after survey.',
  warrantyNote:
    'Premium 16 kWh LiFePO₄ batteries · 5-year battery warranty (manufacturer) · 2-year workmanship on installation.',
};

export const HYBRID_PACKAGES: HybridPackage[] = [
  {
    id: 'ep-6.5kva',
    badge: 'Essential',
    kvaLabel: '6.5 KVA',
    maxWatts: '5,500',
    customerNote:
      '6.5 KVA tier with a matching 6.5 kW inverter. Fifteen panels are sized for this load — no air conditioning in this tier; upgrade if you need AC.',
    specs: {
      inverter: '6.5 kW hybrid (1)',
      storage: '16 kWh LiFePO₄ (1 module)',
      panels: '15 × 570W tier-1',
      solarKw: '8.55 kW DC',
    },
    priceGhs: 140900,
    highlights: ['Entry tier · flats & small homes'],
    components: [
      '6.5 kW hybrid inverter (1)',
      '16 kWh LiFePO₄ lithium battery (1)',
      'Battery management & monitoring (1)',
      '570W tier-1 solar panels (15)',
      'DC protection, changeover & AC distribution',
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
    inverterHeadroom: '+25% inverter headroom · AC motor starts',
    customerNote:
      'Badge is 8 KVA (~6,800 W planned use). We install one 10 kW inverter (stocked) for AC starts — still plan within ~6,800 W continuous. Nineteen panels match the 8 KVA tier, not 10 kW maximum.',
    specs: {
      inverter: '10 kW hybrid (1)',
      storage: '32 kWh LiFePO₄ (2 modules)',
      panels: '19 × 570W tier-1',
      solarKw: '10.83 kW DC',
    },
    priceGhs: 194900,
    highlights: ['Popular family home'],
    components: [
      '10 kW hybrid inverter (1)',
      '16 kWh LiFePO₄ lithium batteries (2)',
      'Battery management & monitoring (1)',
      '570W tier-1 solar panels (19)',
      'DC protection, changeover & AC distribution',
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
    customerNote:
      '10 KVA tier with one 10 kW inverter — aligned. Run up to ~8,500 W continuous; do not run two split AC units on full cool at the same time.',
    specs: {
      inverter: '10 kW hybrid (1)',
      storage: '48 kWh LiFePO₄ (3 modules)',
      panels: '23 × 570W tier-1',
      solarKw: '13.11 kW DC',
    },
    priceGhs: 229900,
    highlights: ['Large home or small office'],
    components: [
      '10 kW hybrid inverter (1)',
      '16 kWh LiFePO₄ lithium batteries (3)',
      'Battery management & monitoring (1)',
      '570W tier-1 solar panels (23)',
      'DC protection, changeover & AC distribution',
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
    inverterHeadroom: '+8% inverter headroom · dual 6.5 kW sync',
    customerNote:
      '12 KVA tier (~10,200 W planned use). Two 6.5 kW inverters work together (~13 kW available). Twenty-eight panels are sized for 12 KVA load, not 13 kW inverter maximum.',
    specs: {
      inverter: '2 × 6.5 kW hybrid (~13 kW sync)',
      storage: '64 kWh LiFePO₄ (4 modules)',
      panels: '28 × 570W Jinko / Longi',
      solarKw: '15.96 kW DC',
    },
    priceGhs: 286900,
    highlights: ['Executive home · boutique office'],
    components: [
      '6.5 kW hybrid inverters (2, synchronized)',
      '16 kWh LiFePO₄ lithium batteries (4)',
      'Battery management & monitoring (1)',
      '570W Jinko / Longi solar panels (28)',
      'DC protection, dual MPPT where required, changeover',
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
    inverterHeadroom: '+33% inverter headroom · dual 10 kW sync',
    customerNote:
      '15 KVA tier (~12,800 W planned use). Two 10 kW inverters (synchronized, stocked) handle peaks; thirty-five panels are sized for 15 KVA — less solar than the 20 KVA tier on the same inverter pair.',
    specs: {
      inverter: '2 × 10 kW hybrid (20 kW sync)',
      storage: '80 kWh LiFePO₄ (5 modules)',
      panels: '35 × 570W tier-1',
      solarKw: '19.95 kW DC',
    },
    priceGhs: 353900,
    highlights: ['Guest house · shop · church hall'],
    components: [
      '10 kW hybrid inverters (2, synchronized)',
      '16 kWh LiFePO₄ lithium batteries (5)',
      'Battery management & monitoring (1)',
      '570W tier-1 solar panels (35)',
      'AC/DC distribution boards & changeover',
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
    customerNote:
      '20 KVA tier (~17,000 W planned use) with two 10 kW inverters. Forty-six panels match this load; guest-house and hotel loads need a written load schedule on survey.',
    specs: {
      inverter: '2 × 10 kW hybrid (20 kW sync)',
      storage: '96 kWh LiFePO₄ (6 modules)',
      panels: '46 × 570W tier-1',
      solarKw: '26.22 kW DC',
    },
    priceGhs: 447900,
    highlights: ['Hotel wing · office block · multi-tenant'],
    components: [
      '10 kW hybrid inverters (2, synchronized)',
      '16 kWh LiFePO₄ lithium batteries (6)',
      'Battery management & monitoring (1)',
      '570W tier-1 solar panels (46)',
      'AC/DC distribution boards & changeover',
      'Roof mounting structure',
      'Cables, MC4, earthing & commissioning',
    ],
    appliances:
      'Multiple guest-room AC (1–1.5 hp, staggered across rooms), commercial kitchen peaks, laundry alternated with AC, fridges, IT/server room on dedicated circuit, event or hall lighting — engineered load schedule on survey.',
  },
];

/** Default brochure prices — editable via CMS packages → tier_prices on deploy sync. */
export const HYBRID_PACKAGE_TIER_PRICE_DEFAULTS: Record<string, number> = Object.fromEntries(
  HYBRID_PACKAGES.map((pkg) => [pkg.id, pkg.priceGhs]),
);

export const HYBRID_PACKAGE_FOOTER_POINTS = [
  'Hybrid systems combine solar, lithium storage, and ECG/grid (generator-ready where fitted). Full off-grid only when engineered on survey.',
  'Connected load ceilings use ~0.85 power factor. Stagger split AC, iron, kettle, and water heater — never assume all peaks run together.',
  'A larger inverter than the kVA badge is normal: it covers motor starts and growth while you still plan within the stated watt ceiling.',
  'Solar panel counts follow the package load tier (kVA), not the inverter nameplate — avoids paying for PV you cannot use on that load.',
  'Storage uses stocked 16 kWh LiFePO₄ modules; night backup hours depend on your load — survey confirms module count.',
  'Commercial and Power tiers need a load schedule on survey; brochure lists are typical examples, not unlimited simultaneous use.',
  'Larger projects receive engineered BOM, load analysis, and itemised quotation from Energy Precisions.',
  'Typical payment: 30% deposit · 40% on delivery · 30% on commissioning (negotiable for commercial clients).',
];

export function resolveHybridPackages(
  tierPrices?: Record<string, number>,
): HybridPackage[] {
  if (!tierPrices || Object.keys(tierPrices).length === 0) {
    return HYBRID_PACKAGES;
  }
  return HYBRID_PACKAGES.map((pkg) => ({
    ...pkg,
    priceGhs: tierPrices[pkg.id] ?? pkg.priceGhs,
  }));
}

export function formatGhs(amount: number): string {
  return new Intl.NumberFormat('en-GH', {
    style: 'currency',
    currency: 'GHS',
    maximumFractionDigits: 0,
  }).format(amount);
}
