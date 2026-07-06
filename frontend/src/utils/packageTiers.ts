import type { CmsPackageTier } from '../types/cms';
import { HYBRID_PACKAGES, type HybridPackage } from '../data/hybridPackages';
import type { CmsWarrantySummary } from '../types/cms';

export function hybridPackageToCmsTier(pkg: HybridPackage): CmsPackageTier {
  return {
    id: pkg.id,
    badge: pkg.badge,
    kva_label: pkg.kvaLabel,
    max_watts: pkg.maxWatts,
    customer_note: pkg.customerNote,
    inverter_headroom: pkg.inverterHeadroom,
    specs: {
      inverter: pkg.specs.inverter,
      storage: pkg.specs.storage,
      panels: pkg.specs.panels,
      solar_kw: pkg.specs.solarKw,
    },
    highlights: [...pkg.highlights],
    components: [...pkg.components],
    appliances: pkg.appliances,
  };
}

export function cmsTierToHybridPackage(tier: CmsPackageTier, priceGhs: number): HybridPackage {
  return {
    id: tier.id,
    badge: tier.badge,
    kvaLabel: tier.kva_label,
    maxWatts: tier.max_watts,
    customerNote: tier.customer_note,
    inverterHeadroom: tier.inverter_headroom,
    specs: {
      inverter: tier.specs.inverter,
      storage: tier.specs.storage,
      panels: tier.specs.panels,
      solarKw: tier.specs.solar_kw,
    },
    priceGhs,
    highlights: [...(tier.highlights || [])],
    components: [...(tier.components || [])],
    appliances: tier.appliances,
  };
}

export const DEFAULT_CMS_PACKAGE_TIERS: CmsPackageTier[] = HYBRID_PACKAGES.map(hybridPackageToCmsTier);

export function resolvePackageTiers(
  cmsTiers?: CmsPackageTier[],
  tierPrices?: Record<string, number>,
): HybridPackage[] {
  const base = cmsTiers?.length ? cmsTiers : DEFAULT_CMS_PACKAGE_TIERS;
  const priceMap = tierPrices && Object.keys(tierPrices).length > 0 ? tierPrices : undefined;
  const bundledById = Object.fromEntries(HYBRID_PACKAGES.map((p) => [p.id, p.priceGhs]));

  return base.map((tier) => {
    const price = priceMap?.[tier.id] ?? bundledById[tier.id] ?? 0;
    return cmsTierToHybridPackage(tier, price);
  });
}

/** Short warranty line for package cards — matches global + packages CMS. */
export function formatHybridWarrantyNote(
  pageNote: string | undefined,
  _global: CmsWarrantySummary,
): string {
  const trimmed = pageNote?.trim();
  if (trimmed) return trimmed;
  return 'Premium 16 kWh LiFePO₄ batteries · 5-year battery warranty (manufacturer) · 2-year workmanship on installation.';
}
