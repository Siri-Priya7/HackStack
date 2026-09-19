import { formatDisplayUnit } from '../units/unitConverter.js';

/**
 * Calculates a smart reorder quantity in natural trade units for products needing restock.
 * 
 * @param {Object} item - { product, current_stock_base }
 * @returns {Object} Reorder suggestion details
 */
export function generateReorderSuggestion(item) {
  const product = item.product || item;
  const productName = product.name || item.product_name || item.name || 'Product';
  const currentBase = parseFloat(item.current_stock_base ?? product.current_stock_base ?? 0);
  const reorderBase = parseFloat(product.reorder_quantity) || 50.0;
  const unitSize = parseFloat(product.unit_size) || 1.0;
  const defaultUnit = product.default_unit || product.base_unit || 'kg';

  // Calculate trade units needed (e.g. how many bags/boris)
  let tradeQty = reorderBase;
  if (defaultUnit !== product.base_unit && unitSize > 1) {
    tradeQty = Math.ceil(reorderBase / unitSize);
  }

  const defaultUnitCap = defaultUnit.charAt(0).toUpperCase() + defaultUnit.slice(1);
  const suggestionText = `${tradeQty} ${defaultUnitCap} (${reorderBase} ${product.base_unit || 'kg'})`;

  return {
    productId: product.id || item.product_id,
    productName,
    category: product.category || item.product_category || 'General',
    currentStockDisplay: formatDisplayUnit(currentBase, product),
    suggestedQty: tradeQty,
    suggestedUnit: defaultUnit,
    suggestedBaseQty: reorderBase,
    estimatedCost: Math.round((reorderBase * (parseFloat(product.purchase_price) || 0)) * 100) / 100,
    suggestionText,
    summary: `Suggest ordering ${suggestionText} of ${productName}.`,
    spokenSummary: `${productName} ke liye ${tradeQty} ${defaultUnit} mangwane ka sujhav hai.`
  };
}
