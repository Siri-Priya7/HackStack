import { validateCommand } from '../validation/commandValidator.js';
import { calculateStockChange } from './stockCalculator.js';
import { formatDisplayUnit } from '../units/unitConverter.js';

/**
 * Orchestrates an inventory stock operation.
 * 
 * @param {Object} command - { intent, product, quantity, unit, price, notes, transcript, language }
 * @param {number} currentStockBase - Existing base stock
 * @returns {Object} { success, data, message, error }
 */
export function executeStockOperation(command, currentStockBase = 0) {
  // 1. Validation
  const validation = validateCommand(command, currentStockBase);
  if (!validation.isValid) {
    return {
      success: false,
      error: validation.error,
      spokenFeedback: validation.error
    };
  }

  const { intent, product, quantity, unit, transcript, language = 'hinglish' } = command;

  // 2. Query Intent
  if (intent === 'QUERY_STOCK') {
    const display = formatDisplayUnit(currentStockBase, product);
    let message = `${product.name} ka current stock ${display} hai.`;
    if (language === 'hi') {
      message = `${product.name} का वर्तमान स्टॉक ${display} है।`;
    } else if (language === 'en') {
      message = `Current stock for ${product.name} is ${display}.`;
    }

    return {
      success: true,
      data: {
        currentStockBase,
        displayString: display,
        product
      },
      message,
      spokenFeedback: message
    };
  }

  // 3. Stock Mutation (ADD, REMOVE, SET)
  const calc = calculateStockChange({
    intent,
    currentStockBase,
    quantity,
    unit,
    product
  });

  // 4. Generate natural shopkeeper voice confirmation
  let spokenFeedback = '';
  if (intent === 'ADD_STOCK') {
    spokenFeedback = `${quantity} ${unit} ${product.name} stock mein add ho gaya. Ab kul ${calc.displayString} hai.`;
  } else if (intent === 'REMOVE_STOCK') {
    spokenFeedback = `${quantity} ${unit} ${product.name} sell ho gaya. Ab bacha hai ${calc.displayString}.`;
  } else {
    spokenFeedback = `${product.name} ka stock ab ${calc.displayString} update ho gaya hai.`;
  }

  return {
    success: true,
    data: {
      productId: product.id,
      previousStockBase: currentStockBase,
      newStockBase: calc.newStockBase,
      deltaBase: calc.deltaBase,
      displayString: calc.displayString,
      status: calc.status,
      totalAmount: calc.totalAmount,
      tradeQuantity: quantity,
      tradeUnit: unit
    },
    message: spokenFeedback,
    spokenFeedback
  };
}
