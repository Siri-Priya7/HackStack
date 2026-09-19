import { Product } from '../models/Product.js';
import { Inventory } from '../models/Inventory.js';
import { Transaction } from '../models/Transaction.js';
import db from '../config/db.js';

// Import from Inventory Engine and Voice AI modules
import {
  executeStockOperation,
  convertToBaseUnit,
  formatDisplayUnit,
  scanLowStockItems,
  generateReorderSuggestion,
  generateInventorySummary
} from '../../../inventory-engine/src/index.js';

import { defaultVoiceService } from '../../../voice-ai/src/index.js';

export class InventoryService {
  /**
   * Processes a voice transcript, extracts intent and entities, executes the inventory changes,
   * logs the transaction, updates alerts, and returns the response with spoken feedback.
   *
   * @param {string} transcript - Spoken phrase (e.g., "5 bori chawal add karo")
   * @param {number} userId - Store owner user ID
   * @param {boolean} dryRun - If true, only parse without mutating DB
   * @returns {Promise<Object>} Execution result
   */
  static async handleVoiceCommand(transcript, userId, dryRun = false) {
    // 1. Get active products catalog for entity matching
    const products = Product.getAllByUser(userId);

    // 2. Parse voice command using Voice AI service
    const parsed = await defaultVoiceService.processVoiceCommand(transcript, products);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error || 'Could not understand voice command.',
        spokenFeedback: 'Kripya dobara bolein, samajh nahi aaya.'
      };
    }

    const { intent, product, quantity, unit, language } = parsed;

    // 3. Handle Non-Mutating Intents
    if (intent === 'GET_SUMMARY') {
      const allInventory = Inventory.getAllByUser(userId);
      const todayTxs = Transaction.getTodayByUser(userId);
      const summary = generateInventorySummary(allInventory, todayTxs);

      return {
        success: true,
        action: 'GET_SUMMARY',
        data: summary,
        spokenFeedback: summary.voiceSummary[language] || summary.voiceSummary.hinglish
      };
    }

    if (intent === 'GET_ALERTS') {
      const allInventory = Inventory.getAllByUser(userId);
      const alerts = scanLowStockItems(allInventory);
      const suggestions = alerts.map(a => generateReorderSuggestion(a));

      let spoken = alerts.length === 0 
        ? 'Saara stock theek hai, koi alert nahi hai.'
        : `${alerts.length} items ka stock kam hai: ` + alerts.map(a => a.productName).join(', ');

      return {
        success: true,
        action: 'GET_ALERTS',
        alerts,
        suggestions,
        spokenFeedback: spoken
      };
    }

    if (intent === 'QUERY_STOCK') {
      if (!product) {
        return {
          success: false,
          error: 'Kaun sa product check karna hai? Naam clear nahi hua.',
          spokenFeedback: 'Kaun sa product check karna hai? Naam dobara bolein.'
        };
      }

      const inv = Inventory.getByProductId(product.id);
      const currentStock = inv ? inv.current_stock_base : 0;
      const display = formatDisplayUnit(currentStock, product);

      const spoken = `${product.name} ka stock abhi ${display} hai.`;
      return {
        success: true,
        action: 'QUERY_STOCK',
        product,
        currentStockBase: currentStock,
        displayString: display,
        spokenFeedback: spoken
      };
    }

    // 4. Handle Stock Mutation (ADD_STOCK or REMOVE_STOCK)
    if (!product) {
      return {
        success: false,
        error: 'Product identify nahi hua. Kripya product ka naam bolein.',
        spokenFeedback: 'Product ka naam samajh nahi aaya. Dobara bolein.'
      };
    }

    const currentInv = Inventory.getByProductId(product.id);
    const currentBase = currentInv ? parseFloat(currentInv.current_stock_base) : 0;

    // Execute via Inventory Engine logic
    const opResult = executeStockOperation({
      intent,
      product,
      quantity,
      unit,
      transcript,
      language
    }, currentBase);

    if (!opResult.success) {
      return {
        success: false,
        error: opResult.error,
        spokenFeedback: opResult.spokenFeedback
      };
    }

    // If dry run (e.g. previewing before confirm in UI)
    if (dryRun) {
      return {
        success: true,
        dryRun: true,
        parsed,
        operation: opResult.data,
        spokenFeedback: opResult.spokenFeedback
      };
    }

    // 5. Commit to Database inside SQLite Transaction
    const executeTx = db.transaction(() => {
      // Update inventory table
      Inventory.updateStock(product.id, {
        current_stock_base: opResult.data.newStockBase,
        current_stock_display: opResult.data.displayString,
        status: opResult.data.status
      });

      // Insert transaction record
      const txRecord = Transaction.create({
        user_id: userId,
        product_id: product.id,
        type: intent === 'ADD_STOCK' ? 'IN' : 'OUT',
        quantity,
        unit,
        quantity_base: opResult.data.deltaBase,
        unit_price: intent === 'ADD_STOCK' ? product.purchase_price : product.selling_price,
        total_amount: opResult.data.totalAmount,
        voice_transcript: transcript,
        language_detected: language,
        source: 'voice'
      });

      // Update Alerts table if stock level crossed threshold
      if (opResult.data.status === 'low_stock' || opResult.data.status === 'out_of_stock') {
        const alertMsg = `${product.name} is low on stock (${opResult.data.displayString}).`;
        const reorderSug = generateReorderSuggestion({ product, current_stock_base: opResult.data.newStockBase });

        db.prepare(`
          INSERT INTO alerts (user_id, product_id, alert_type, message, suggested_reorder_qty, suggested_reorder_unit)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(userId, product.id, 'LOW_STOCK', alertMsg, reorderSug.suggestedQty, reorderSug.suggestedUnit);
      } else {
        // Resolve prior alerts if restocked
        db.prepare(`
          UPDATE alerts SET is_resolved = 1, resolved_at = CURRENT_TIMESTAMP
          WHERE product_id = ? AND is_resolved = 0
        `).run(product.id);
      }

      return txRecord;
    });

    const loggedTx = executeTx();

    return {
      success: true,
      action: intent,
      product,
      operation: opResult.data,
      transaction: loggedTx,
      spokenFeedback: opResult.spokenFeedback
    };
  }

  /**
   * Rollback / Undo a transaction
   */
  static undoTransaction(transactionId, userId) {
    const tx = Transaction.findById(transactionId);
    if (!tx || tx.user_id !== userId) {
      throw new Error('Transaction not found or unauthorized.');
    }

    const inv = Inventory.getByProductId(tx.product_id);
    if (!inv) throw new Error('Product inventory not found.');

    const undoBase = parseFloat(tx.quantity_base);
    let newStockBase = inv.current_stock_base;

    if (tx.type === 'IN') {
      // Revert restock by subtracting
      newStockBase = Math.max(0, newStockBase - undoBase);
    } else if (tx.type === 'OUT') {
      // Revert sale by adding back
      newStockBase += undoBase;
    }

    const product = Product.findById(tx.product_id);
    const display = formatDisplayUnit(newStockBase, product);
    const threshold = parseFloat(product.min_stock_threshold) || 10;
    const status = newStockBase <= 0 ? 'out_of_stock' : (newStockBase <= threshold ? 'low_stock' : 'in_stock');

    const runUndo = db.transaction(() => {
      Inventory.updateStock(product.id, {
        current_stock_base: newStockBase,
        current_stock_display: display,
        status
      });

      Transaction.delete(transactionId);
    });

    runUndo();

    return {
      success: true,
      message: `Transaction #${transactionId} undone. ${product.name} stock restored to ${display}.`
    };
  }
}
