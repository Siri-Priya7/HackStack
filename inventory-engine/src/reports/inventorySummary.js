import { scanLowStockItems } from '../alerts/lowStock.js';

/**
 * Generates an executive summary of the inventory in plain shopkeeper language.
 * 
 * @param {Array} inventoryList - Full list of inventory items with product info
 * @param {Array} transactionsToday - List of transactions recorded today
 * @returns {Object} Structured report and plain language voice summaries
 */
export function generateInventorySummary(inventoryList = [], transactionsToday = []) {
  const totalProducts = inventoryList.length;
  let totalStockValue = 0;
  let outOfStockCount = 0;
  let lowStockCount = 0;

  for (const item of inventoryList) {
    const product = item.product || item;
    const currentBase = parseFloat(item.current_stock_base ?? 0);
    const threshold = parseFloat(product.min_stock_threshold ?? 10);
    const sellPrice = parseFloat(product.selling_price ?? 0);

    totalStockValue += (currentBase * sellPrice);

    if (currentBase <= 0) {
      outOfStockCount++;
    } else if (currentBase <= threshold) {
      lowStockCount++;
    }
  }

  // Today's transaction metrics
  let salesCount = 0;
  let salesAmount = 0;
  let restockCount = 0;

  for (const tx of transactionsToday) {
    if (tx.type === 'OUT') {
      salesCount++;
      salesAmount += parseFloat(tx.total_amount ?? 0);
    } else if (tx.type === 'IN') {
      restockCount++;
    }
  }

  // Generate plain voice summary in Hinglish, Hindi, and English
  const lowItems = scanLowStockItems(inventoryList);
  const lowNames = lowItems.slice(0, 3).map(i => i.productName).join(', ');

  let voiceHinglish = `Dukaan mein kul ${totalProducts} items hain. `;
  if (lowStockCount > 0 || outOfStockCount > 0) {
    voiceHinglish += `${lowStockCount + outOfStockCount} items ka stock kam hai, jaise ${lowNames}. `;
  } else {
    voiceHinglish += `Saara stock theek hai. `;
  }
  voiceHinglish += `Aaj kul ₹${Math.round(salesAmount)} ki bikri hui hai.`;

  let voiceHindi = `दुकान में कुल ${totalProducts} सामान हैं। `;
  if (lowStockCount > 0 || outOfStockCount > 0) {
    voiceHindi += `${lowStockCount + outOfStockCount} सामान कम हैं। `;
  }
  voiceHindi += `आज कुल ₹${Math.round(salesAmount)} की बिक्री हुई।`;

  return {
    metrics: {
      totalProducts,
      totalStockValue: Math.round(totalStockValue),
      outOfStockCount,
      lowStockCount,
      inStockCount: totalProducts - (outOfStockCount + lowStockCount),
      todaySalesCount: salesCount,
      todaySalesAmount: Math.round(salesAmount),
      todayRestockCount: restockCount
    },
    alerts: lowItems,
    voiceSummary: {
      hinglish: voiceHinglish,
      hindi: voiceHindi,
      english: `Store has ${totalProducts} products with ₹${Math.round(totalStockValue)} total value. ${lowStockCount + outOfStockCount} items need attention. Today's sales: ₹${Math.round(salesAmount)}.`
    }
  };
}
