/** Matches backend catalog_unit_price (PMS quote rules for one SKU). */
export function catalogLineUnitPrice(
  product: { catalog_unit_price?: number; base_price?: number } | undefined | null
): number {
  if (!product) return 0;
  const u = product.catalog_unit_price ?? product.base_price;
  return typeof u === 'number' && !Number.isNaN(u) ? u : 0;
}
