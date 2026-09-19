import { convertToBaseUnit, formatDisplayUnit } from '../units/unitConverter.js';

/**
 * Calculates new stock level, display string, and status after an action.
 * 
 * @param {Object} params
 * @param {string} params.intent - 'ADD_STOCK' | 'REMOVE_STOCK' | 'SET_STOCK'
 * @param {number} params.currentStockBase - Existing stock in base unit
 * @param {number} params.quantity - Trade quantity
 * @param {string} params.unit - Trade unit
 * @param {Object} params.product - Product object
 * @returns {Object} { newStockBase, deltaBase, displayString, status, totalAmount }
 */
export function calculateStockChange({
  intent,
  currentStockBase = 0,
  quantity = 0,
  unit = 'kg',
  product = {}
}) {
  const deltaBase = convertToBaseUnit(quantity, unit, product);
  let newStockBase = currentStockBase;

  if (intent === 'ADD_STOCK') {
    newStockBase = currentStockBase + deltaBase;
  } else if (intent === 'REMOVE_STOCK') {
    newStockBase = Math.max(0, currentStockBase - deltaBase);
  } else if (intent === 'SET_STOCK') {
    newStockBase = deltaBase;
  }

  // Round to 2 decimal places to prevent floating point inaccuracies
  newStockBase = Math.round(newStockBase * 100) / 100;

  // Determine Stock Status
  const threshold = parseFloat(product.min_stock_threshold) || 10.0;
  let status = 'in_stock';
  if (newStockBase <= 0) {
    status = 'out_of_stock';
  } else if (newStockBase <= threshold) {
    status = 'low_stock';
  }

  // Calculate formatted human-readable display string
  const displayString = formatDisplayUnit(newStockBase, product);

  // Financial calculation
  const price = intent === 'ADD_STOCK' 
    ? (parseFloat(product.purchase_price) || 0)
    : (parseFloat(product.selling_price) || 0);

  // Total amount = base quantity * price per base unit
  const totalAmount = Math.round((deltaBase * price) * 100) / 100;

  return {
    newStockBase,
    deltaBase,
    displayString,
    status,
    totalAmount
  };
}
