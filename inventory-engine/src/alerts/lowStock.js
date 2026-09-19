import { formatDisplayUnit } from '../units/unitConverter.js';

/**
 * Evaluates whether an inventory item has reached low or critical stock levels.
 * 
 * @param {Object} item - { product, current_stock_base }
 * @returns {Object|null} Alert object if triggered, otherwise null
 */
export function checkLowStock(item) {
  const product = item.product || item;
  const productName = product.name || item.product_name || item.name || 'Product';
  const currentBase = parseFloat(item.current_stock_base ?? product.current_stock_base ?? 0);
  const threshold = parseFloat(product.min_stock_threshold) || 10.0;

  if (currentBase <= 0) {
    return {
      productId: product.id || item.product_id,
      productName,
      alertType: 'OUT_OF_STOCK',
      severity: 'critical',
      currentStockBase: currentBase,
      displayStock: formatDisplayUnit(currentBase, product),
      threshold,
      message: `${productName} is completely OUT OF STOCK! Immediate restock needed.`,
      spokenMessage: `${productName} ka stock poora khatam ho gaya hai! Turant order karein.`
    };
  }

  if (currentBase <= threshold) {
    const displayStock = formatDisplayUnit(currentBase, product);
    return {
      productId: product.id || item.product_id,
      productName,
      alertType: 'LOW_STOCK',
      severity: 'warning',
      currentStockBase: currentBase,
      displayStock,
      threshold,
      message: `${productName} is running low! Only ${displayStock} left (Min: ${threshold} ${product.base_unit || 'kg'}).`,
      spokenMessage: `Dhyan dein, ${productName} kam ho raha hai. Sirf ${displayStock} bacha hai.`
    };
  }

  return null;
}

/**
 * Scans an entire list of inventory items and returns all active low-stock alerts.
 * 
 * @param {Array} inventoryList 
 * @returns {Array} List of active alert objects
 */
export function scanLowStockItems(inventoryList = []) {
  const alerts = [];
  for (const item of inventoryList) {
    const alert = checkLowStock(item);
    if (alert) {
      alerts.push(alert);
    }
  }
  return alerts;
}
