import { Transaction } from '../models/Transaction.js';
import { InventoryService } from '../services/inventoryService.js';

export const transactionController = {
  async getTransactions(req, res) {
    try {
      const shopId = req.user.shop_id || (req.user.role === 'platform_admin' ? (req.query.shop_id || 1) : null);
      if (!shopId) {
        return res.status(400).json({ success: false, error: 'No shop assigned to user.' });
      }

      const limit = parseInt(req.query.limit) || 50;
      const transactions = Transaction.getAllByShop(shopId, limit);
      return res.json({ success: true, data: transactions });
    } catch (err) {
      console.error('Error fetching transactions:', err);
      return res.status(500).json({ success: false, error: 'Failed to retrieve transactions.' });
    }
  },

  async undo(req, res) {
    try {
      const { id } = req.params;
      const shopId = req.user.shop_id;

      // Staff cannot undo transactions, only Shop Owner and Platform Admin
      if (req.user.role === 'staff') {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Staff members cannot rollback transactions. Contact your Shop Owner.'
        });
      }

      const result = InventoryService.undoTransaction(parseInt(id), shopId, req.user.id);
      return res.json(result);
    } catch (err) {
      console.error('Error undoing transaction:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};
