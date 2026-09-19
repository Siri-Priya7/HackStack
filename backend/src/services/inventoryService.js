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
   * @param {number} shopId - Store tenant ID
   * @param {number} userId - User ID (Shop Owner or Staff)
   * @param {boolean} dryRun - If true, only parse without mutating DB
   * @param {string} preferredLanguage - Selected UI language (e.g. 'en-IN', 'hi-IN')
   * @returns {Promise<Object>} Execution result
   */
  static async handleVoiceCommand(transcript, shopId, userId, dryRun = false, preferredLanguage = 'en-IN') {
    // 1. Get active products catalog for entity matching (scoped to shop)
    const products = Product.getAllByShop(shopId);

    // 2. Parse voice command using Voice AI service
    const parsed = await defaultVoiceService.processVoiceCommand(transcript, products);

    const activeLang = preferredLanguage || parsed.language || 'en-IN';
    const isEnglish = activeLang.startsWith('en') || (!activeLang.startsWith('hi') && !activeLang.startsWith('bn') && !activeLang.startsWith('mr'));

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error || 'Could not understand voice command.',
        spokenFeedback: isEnglish ? 'Please say the command again, could not understand.' : 'कृपया दोबारा बोलें, समझ नहीं आया।'
      };
    }

    const { intent, product, quantity, unit } = parsed;
    const effectiveLanguage = isEnglish ? 'en-IN' : (activeLang.startsWith('hi') ? 'hi-IN' : 'hinglish');

    // 3. Handle Non-Mutating Intents
    if (intent === 'GET_SUMMARY') {
      const allInventory = Inventory.getAllByShop(shopId);
      const todayTxs = Transaction.getTodayByShop(shopId);
      const summary = generateInventorySummary(allInventory, todayTxs);

      const spokenFeedback = isEnglish
        ? summary.voiceSummary.english
        : (activeLang.startsWith('hi') ? summary.voiceSummary.hindi : summary.voiceSummary.hinglish);

      return {
        success: true,
        action: 'GET_SUMMARY',
        data: summary,
        spokenFeedback
      };
    }

    if (intent === 'GET_ALERTS') {
      const allInventory = Inventory.getAllByShop(shopId);
      const alerts = scanLowStockItems(allInventory);
      const suggestions = alerts.map(a => generateReorderSuggestion(a));

      let spoken = '';
      if (alerts.length === 0) {
        spoken = isEnglish ? 'All stock levels are healthy. No alerts.' : 'सारा स्टॉक ठीक है, कोई अलर्ट नहीं है।';
      } else {
        spoken = isEnglish
          ? `${alerts.length} item${alerts.length > 1 ? 's' : ''} running low: ` + alerts.map(a => a.productName).join(', ')
          : `${alerts.length} सामान कम हैं: ` + alerts.map(a => a.productName).join(', ');
      }

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
          error: isEnglish ? 'Which product do you want to check?' : 'कौन सा सामान चेक करना है?',
          spokenFeedback: isEnglish ? 'Please say the product name clearly.' : 'कृपया सामान का नाम दोबारा बोलें।'
        };
      }

      const inv = Inventory.getByProductId(product.id);
      const currentStock = inv ? inv.current_stock_base : 0;
      const display = formatDisplayUnit(currentStock, product);

      const spoken = isEnglish
        ? `Current stock for ${product.name} is ${display}.`
        : `${product.name} का स्टॉक अभी ${display} है।`;

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
        error: isEnglish ? 'Product not identified. Please state the product name.' : 'सामान पहचान में नहीं आया। कृपया नाम बोलें।',
        spokenFeedback: isEnglish ? 'Product not recognized. Please speak again.' : 'सामान का नाम समझ नहीं आया। दोबारा बोलें।'
      };
    }

    const currentInv = Inventory.getByProductId(product.id);
    const currentBase = currentInv ? parseFloat(currentInv.current_stock_base) : 0;

    // Execute via Inventory Engine logic with effectiveLanguage
    const opResult = executeStockOperation({
      intent,
      product,
      quantity,
      unit,
      transcript,
      language: effectiveLanguage
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
        shop_id: shopId,
        user_id: userId,
        product_id: product.id,
        type: intent === 'ADD_STOCK' ? 'IN' : 'OUT',
        quantity,
        unit,
        quantity_base: opResult.data.deltaBase,
        unit_price: intent === 'ADD_STOCK' ? product.purchase_price : product.selling_price,
        total_amount: opResult.data.totalAmount,
        voice_transcript: transcript,
        language_detected: activeLang,
        source: 'voice'
      });

      // Update Alerts table if stock level crossed threshold
      if (opResult.data.status === 'low_stock' || opResult.data.status === 'out_of_stock') {
        const alertMsg = `${product.name} is low on stock (${opResult.data.displayString}).`;
        const reorderSug = generateReorderSuggestion({ product, current_stock_base: opResult.data.newStockBase });

        db.prepare(`
          INSERT INTO alerts (shop_id, product_id, alert_type, message, suggested_reorder_qty, suggested_reorder_unit)
          VALUES (?, ?, ?, ?, ?, ?)
        `).run(shopId, product.id, 'LOW_STOCK', alertMsg, reorderSug.suggestedQty, reorderSug.suggestedUnit);
      } else {
        // Resolve prior alerts if restocked
        db.prepare(`
          UPDATE alerts SET is_resolved = 1, resolved_at = CURRENT_TIMESTAMP
          WHERE shop_id = ? AND product_id = ? AND is_resolved = 0
        `).run(shopId, product.id);
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
  static undoTransaction(transactionId, shopId, userId) {
    const tx = Transaction.findById(transactionId);
    if (!tx || (shopId && tx.shop_id !== shopId)) {
      throw new Error('Transaction not found or unauthorized for this shop.');
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
