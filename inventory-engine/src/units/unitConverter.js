import { UNIT_TYPES, normalizeUnit } from './unitDefinitions.js';
export { normalizeUnit, UNIT_TYPES };

/**
 * Converts a given quantity in a specific trade unit to the product's base unit.
 *
 * @param {number} quantity - Quantity spoken or entered (e.g. 5)
 * @param {string} unit - Spoken unit (e.g. 'bori', 'peti', 'kg', 'dozen')
 * @param {Object} product - Product metadata { base_unit, default_unit, unit_size }
 * @returns {number} Standardized quantity in base unit
 */
export function convertToBaseUnit(quantity, unit, product = {}) {
  const numQty = parseFloat(quantity) || 0;
  const canonicalUnit = normalizeUnit(unit);
  const baseUnit = product.base_unit || 'kg';
  const unitSize = parseFloat(product.unit_size) || 1.0;

  // 1. Direct match with product's base unit
  if (canonicalUnit === baseUnit) {
    return numQty;
  }

  // 2. Custom Packaging Trade Units (Bori, Peti, Packet)
  if (canonicalUnit === 'bori' || canonicalUnit === 'peti' || canonicalUnit === 'packet') {
    // If the product's default unit matches this packaging unit, use product's custom unit_size
    if (product.default_unit === canonicalUnit) {
      return numQty * unitSize;
    }
    // Fallback to default multiplier for that packaging type
    const defaultMult = UNIT_TYPES[canonicalUnit]?.defaultMultiplier || unitSize;
    return numQty * defaultMult;
  }

  // 3. Counting units (Dozen -> Pcs)
  if (canonicalUnit === 'dozen') {
    return numQty * 12.0;
  }

  // 4. Metric Mass conversions
  if (canonicalUnit === 'quintal') {
    return numQty * 100.0;
  }
  if (canonicalUnit === 'ton') {
    return numQty * 1000.0;
  }
  if (canonicalUnit === 'g') {
    return numQty / 1000.0;
  }

  // 5. Volume conversions
  if (canonicalUnit === 'ml') {
    return numQty / 1000.0;
  }

  // 6. Generic unit definition multiplier if exists
  const def = UNIT_TYPES[canonicalUnit];
  if (def && def.multiplierToBase) {
    return numQty * def.multiplierToBase;
  }

  // Default fallback: assume 1:1 if unknown
  return numQty;
}

/**
 * Formats base quantity into a familiar, natural trade unit string for the shopkeeper.
 * e.g., 125 kg rice (bori=25kg) -> "5 Bori (125 kg)"
 * e.g., 85 kg rice (bori=25kg) -> "3 Bori 10 kg"
 * e.g., 60 pcs eggs (dozen=12) -> "5 Dozen (60 Pcs)"
 *
 * @param {number} baseQuantity - Total stock in base units
 * @param {Object} product - Product metadata { base_unit, default_unit, unit_size }
 * @returns {string} Human-friendly trade description
 */
export function formatDisplayUnit(baseQuantity, product = {}) {
  const qty = Math.round((parseFloat(baseQuantity) || 0) * 100) / 100;
  const baseUnit = product.base_unit || 'kg';
  const defaultUnit = product.default_unit || baseUnit;
  const unitSize = parseFloat(product.unit_size) || 1.0;

  if (qty <= 0) {
    return `0 ${baseUnit}`;
  }

  // If default packaging is Bori / Peti / Dozen with a defined size > 1
  if (defaultUnit !== baseUnit && unitSize > 1) {
    const fullPackages = Math.floor(qty / unitSize);
    const remainder = Math.round((qty % unitSize) * 100) / 100;

    const unitNameCapitalized = defaultUnit.charAt(0).toUpperCase() + defaultUnit.slice(1);

    if (fullPackages > 0 && remainder === 0) {
      return `${fullPackages} ${unitNameCapitalized} (${qty} ${baseUnit})`;
    } else if (fullPackages > 0 && remainder > 0) {
      return `${fullPackages} ${unitNameCapitalized} ${remainder} ${baseUnit}`;
    } else {
      return `${remainder} ${baseUnit}`;
    }
  }

  // Simple base unit presentation
  return `${qty} ${baseUnit}`;
}
