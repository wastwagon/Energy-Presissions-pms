import { QuoteItem } from '../types';

/** Match backend equipment_services_subtotals_for_items (no product join). */
export function splitEquipmentServices(items: QuoteItem[]): {
  equipment: number;
  services: number;
} {
  let equipment = 0;
  let services = 0;

  for (const item of items) {
    const desc = item.description || '';
    const upper = desc.toUpperCase();
    const isLumpBos =
      desc.includes('Balance of System') ||
      upper.includes('BOS) -') ||
      upper.includes('BOS -') ||
      upper.trim().startsWith('BOS ');
    const isCoreEquipment =
      (upper.includes('PANEL') && !upper.includes('LABEL')) ||
      upper.includes('INVERTER') ||
      (upper.includes('BATTERY') && (upper.includes('KWH') || upper.includes('AH'))) ||
      upper.includes('MOUNTING') ||
      upper.includes('MNT-RAIL') ||
      upper.includes('RAIL-SET') ||
      upper.includes('RAIL-18FT');

    const total = item.total_price || 0;
    if (isCoreEquipment || isLumpBos) {
      equipment += total;
    } else {
      services += total;
    }
  }

  return { equipment, services };
}

export function sumLineItems(items: QuoteItem[]): number {
  return items.reduce((sum, item) => sum + (item.total_price || 0), 0);
}
