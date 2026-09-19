import { Inventory } from '../models/Inventory.js';
import { Transaction } from '../models/Transaction.js';
import { Product } from '../models/Product.js';
import { InventoryService } from '../services/inventoryService.js';
import {
  generateInventorySummary,
  scanLowStockItems,
  generateReorderSuggestion,
  calculateStockChange
} from '../../../inventory-engine/src/index.js';

export const inventoryController = {
  async getInventory(req, res) {
    try {
      const items = Inventory.getAllByUser(req.user.id);
      return res.json({ success: true, data: items });
    } catch (err) {
      console.error('Error fetching inventory:', err);
      return res.status(500).json({ success: false, error: 'Failed to retrieve inventory.' });
    }
  },

  async getInventorySummary(req, res) {
    try {
      const inventoryList = Inventory.getAllByUser(req.user.id);
      const todayTransactions = Transaction.getTodayByUser(req.user.id);
      const summary = generateInventorySummary(inventoryList, todayTransactions);

      return res.json({ success: true, data: summary });
    } catch (err) {
      console.error('Error generating summary:', err);
      return res.status(500).json({ success: false, error: 'Failed to generate inventory summary.' });
    }
  },

  async processVoiceCommand(req, res) {
    try {
      const { transcript, dryRun } = req.body;

      if (!transcript) {
        return res.status(400).json({
          success: false,
          error: 'Voice transcript is required.',
          spokenFeedback: 'Kripya kuch bolein.'
        });
      }

      const result = await InventoryService.handleVoiceCommand(transcript, req.user.id, dryRun);
      return res.json(result);
    } catch (err) {
      console.error('Voice processing error:', err);
      return res.status(500).json({
        success: false,
        error: 'Error processing voice command: ' + err.message,
        spokenFeedback: 'Voice command process karne mein error aaya.'
      });
    }
  },

  async quickAdjust(req, res) {
    try {
      const { productId, type, quantity, unit } = req.body;
      const product = Product.findById(productId);
      if (!product || product.user_id !== req.user.id) {
        return res.status(404).json({ success: false, error: 'Product not found.' });
      }

      const intent = type === 'IN' ? 'ADD_STOCK' : 'REMOVE_STOCK';
      const fakeTranscript = `Manual ${type}: ${quantity} ${unit} ${product.name}`;

      const result = await InventoryService.handleVoiceCommand(
        `${quantity} ${unit} ${product.name} ${type === 'IN' ? 'add karo' : 'becha'}`,
        req.user.id,
        false
      );

      return res.json(result);
    } catch (err) {
      console.error('Quick adjust error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getAlerts(req, res) {
    try {
      const inventoryList = Inventory.getAllByUser(req.user.id);
      const alerts = scanLowStockItems(inventoryList);
      const suggestions = alerts.map(a => generateReorderSuggestion(a));

      return res.json({
        success: true,
        data: {
          alerts,
          suggestions
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to fetch alerts.' });
    }
  }
};
