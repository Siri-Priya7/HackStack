import { Inventory } from '../models/Inventory.js';
import { Transaction } from '../models/Transaction.js';
import { Product } from '../models/Product.js';
import { InventoryService } from '../services/inventoryService.js';
import {
  generateInventorySummary,
  scanLowStockItems,
  generateReorderSuggestion
} from '../../../inventory-engine/src/index.js';

export const inventoryController = {
  async getInventory(req, res) {
    try {
      const shopId = req.user.shop_id || (req.user.role === 'platform_admin' ? (req.query.shop_id || 1) : null);
      if (!shopId) {
        return res.status(400).json({ success: false, error: 'No shop assigned to user.' });
      }

      const items = Inventory.getAllByShop(shopId);
      return res.json({ success: true, data: items });
    } catch (err) {
      console.error('Error fetching inventory:', err);
      return res.status(500).json({ success: false, error: 'Failed to retrieve inventory.' });
    }
  },

  async getInventorySummary(req, res) {
    try {
      const shopId = req.user.shop_id || (req.user.role === 'platform_admin' ? (req.query.shop_id || 1) : null);
      if (!shopId) {
        return res.status(400).json({ success: false, error: 'No shop assigned to user.' });
      }

      const inventoryList = Inventory.getAllByShop(shopId);
      const todayTransactions = Transaction.getTodayByShop(shopId);
      const summary = generateInventorySummary(inventoryList, todayTransactions);

      return res.json({ success: true, data: summary });
    } catch (err) {
      console.error('Error generating summary:', err);
      return res.status(500).json({ success: false, error: 'Failed to generate inventory summary.' });
    }
  },

  async processVoiceCommand(req, res) {
    try {
      const { transcript, dryRun, language: bodyLang } = req.body;
      const lang = bodyLang || req.headers['accept-language'] || req.user?.preferred_language || 'en-IN';
      const shopId = req.user.shop_id;

      if (!shopId) {
        return res.status(400).json({
          success: false,
          error: 'Voice commands must be executed within a valid shop context.',
          spokenFeedback: lang?.startsWith('hi') ? 'दुकान खाता आवश्यक है।' : 'Shop account required.'
        });
      }

      if (!transcript) {
        return res.status(400).json({
          success: false,
          error: 'Voice transcript is required.',
          spokenFeedback: lang?.startsWith('hi') ? 'कृपया कुछ बोलें।' : 'Please speak a command.'
        });
      }

      const result = await InventoryService.handleVoiceCommand(transcript, shopId, req.user.id, dryRun, lang);
      return res.json(result);
    } catch (err) {
      console.error('Voice processing error:', err);
      const isHi = (req.body?.language || req.headers['accept-language'] || '')?.startsWith('hi');
      return res.status(500).json({
        success: false,
        error: 'Error processing voice command: ' + err.message,
        spokenFeedback: isHi ? 'कमांड प्रोसेस करने में समस्या आई।' : 'Error processing voice command.'
      });
    }
  },

  async quickAdjust(req, res) {
    try {
      const { productId, type, quantity, unit, language: bodyLang } = req.body;
      const lang = bodyLang || req.headers['accept-language'] || req.user?.preferred_language || 'en-IN';
      const shopId = req.user.shop_id;
      const product = Product.findById(productId);

      if (!product || (req.user.role !== 'platform_admin' && product.shop_id !== shopId)) {
        return res.status(404).json({ success: false, error: 'Product not found or unauthorized.' });
      }

      const isEnglish = !lang?.startsWith('hi');
      const voiceCommand = isEnglish
        ? (type === 'IN' ? `Add ${quantity} ${unit} of ${product.name}` : `Sold ${quantity} ${unit} of ${product.name}`)
        : `${quantity} ${unit} ${product.name} ${type === 'IN' ? 'जोड़ो' : 'बेचा'}`;

      const result = await InventoryService.handleVoiceCommand(
        voiceCommand,
        shopId,
        req.user.id,
        false,
        lang
      );

      return res.json(result);
    } catch (err) {
      console.error('Quick adjust error:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getAlerts(req, res) {
    try {
      const shopId = req.user.shop_id || (req.user.role === 'platform_admin' ? (req.query.shop_id || 1) : null);
      if (!shopId) {
        return res.status(400).json({ success: false, error: 'No shop assigned to user.' });
      }

      const inventoryList = Inventory.getAllByShop(shopId);
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
