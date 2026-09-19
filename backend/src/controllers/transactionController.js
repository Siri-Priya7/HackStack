import { Transaction } from '../models/Transaction.js';
import { InventoryService } from '../services/inventoryService.js';

export const transactionController = {
  async getTransactions(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const transactions = Transaction.getAllByUser(req.user.id, limit);
      return res.json({ success: true, data: transactions });
    } catch (err) {
      console.error('Error fetching transactions:', err);
      return res.status(500).json({ success: false, error: 'Failed to retrieve transactions.' });
    }
  },

  async undo(req, res) {
    try {
      const { id } = req.params;
      const result = InventoryService.undoTransaction(parseInt(id), req.user.id);
      return res.json(result);
    } catch (err) {
      console.error('Error undoing transaction:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};
