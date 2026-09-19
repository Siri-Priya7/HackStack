import { convertToBaseUnit } from '../units/unitConverter.js';

export const VALID_INTENTS = [
  'ADD_STOCK',
  'REMOVE_STOCK',
  'QUERY_STOCK',
  'GET_ALERTS',
  'GET_SUMMARY',
  'SET_STOCK'
];

/**
 * Validates an inventory action command before applying it to the database.
 * 
 * @param {Object} command - { intent, productId, product, quantity, unit, price }
 * @param {number} currentStockBase - Current stock in base unit
 * @returns {Object} { isValid: boolean, error?: string, warnings?: string[] }
 */
export function validateCommand(command, currentStockBase = 0) {
  const { intent, product, quantity, unit } = command;

  // 1. Validate Intent
  if (!intent || !VALID_INTENTS.includes(intent)) {
    return {
      isValid: false,
      error: `Unrecognized action. Expected one of: ${VALID_INTENTS.join(', ')}`
    };
  }

  // Query and reporting actions don't require quantity checks
  if (intent === 'QUERY_STOCK' || intent === 'GET_ALERTS' || intent === 'GET_SUMMARY') {
    return { isValid: true };
  }

  // 2. Validate Product
  if (!product) {
    return {
      isValid: false,
      error: 'Product could not be identified from the command.'
    };
  }

  // 3. Validate Quantity
  const numQty = parseFloat(quantity);
  if (isNaN(numQty) || numQty <= 0) {
    return {
      isValid: false,
      error: 'Quantity must be a positive number greater than 0.'
    };
  }

  if (numQty > 10000) {
    return {
      isValid: false,
      error: 'Quantity seems unusually large. Please verify the amount.'
    };
  }

  // 4. Validate Stock Availability for Deductions / Sales
  if (intent === 'REMOVE_STOCK') {
    const requiredBase = convertToBaseUnit(numQty, unit, product);
    if (requiredBase > currentStockBase) {
      return {
        isValid: false,
        error: `Insufficient stock! You have ${currentStockBase} ${product.base_unit}, but trying to sell ${requiredBase} ${product.base_unit}.`
      };
    }
  }

  return { isValid: true };
}
