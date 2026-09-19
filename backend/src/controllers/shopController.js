import { Shop } from '../models/Shop.js';
import { User } from '../models/User.js';

export const shopController = {
  // Platform Admin Endpoints
  async getAllShops(req, res) {
    try {
      const shops = Shop.getAll();
      return res.json({ success: true, data: shops });
    } catch (err) {
      console.error('Error fetching all shops:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch shops.' });
    }
  },

  async getPlatformStats(req, res) {
    try {
      const stats = Shop.getPlatformStats();
      return res.json({ success: true, data: stats });
    } catch (err) {
      console.error('Error fetching platform stats:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch platform statistics.' });
    }
  },

  async toggleShopStatus(req, res) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const updated = Shop.updateStatus(id, isActive);
      return res.json({ success: true, data: updated });
    } catch (err) {
      console.error('Error toggling shop status:', err);
      return res.status(500).json({ success: false, error: 'Failed to update shop status.' });
    }
  },

  // Shop Owner: Staff Management Endpoints
  async getShopStaff(req, res) {
    try {
      const shopId = req.user.shop_id;
      if (!shopId) {
        return res.status(400).json({ success: false, error: 'No shop associated with current user.' });
      }

      const staff = User.getStaffByShop(shopId);
      return res.json({ success: true, data: staff });
    } catch (err) {
      console.error('Error fetching shop staff:', err);
      return res.status(500).json({ success: false, error: 'Failed to fetch staff members.' });
    }
  },

  async addStaff(req, res) {
    try {
      const shopId = req.user.shop_id;
      const { name, phone, preferred_language = 'hi-IN' } = req.body;

      if (!name || !phone) {
        return res.status(400).json({ success: false, error: 'Staff name and mobile number are required.' });
      }

      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const newStaff = User.addStaff({
        shop_id: shopId,
        name: name.trim(),
        phone: cleanPhone,
        preferred_language
      });

      return res.status(201).json({
        success: true,
        message: `Staff member ${name} added successfully. They can login with mobile ${cleanPhone} and OTP.`,
        data: newStaff
      });
    } catch (err) {
      console.error('Error adding staff:', err);
      return res.status(400).json({ success: false, error: err.message || 'Failed to add staff member.' });
    }
  },

  async removeStaff(req, res) {
    try {
      const shopId = req.user.shop_id;
      const { id } = req.params;

      User.removeStaff(id, shopId);
      return res.json({ success: true, message: 'Staff member removed successfully.' });
    } catch (err) {
      console.error('Error removing staff:', err);
      return res.status(500).json({ success: false, error: 'Failed to remove staff member.' });
    }
  },

  async getShopProfile(req, res) {
    try {
      const shopId = req.user.shop_id;
      if (!shopId) {
        return res.status(404).json({ success: false, error: 'No shop found.' });
      }
      const shop = Shop.findById(shopId);
      return res.json({ success: true, data: shop });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Error fetching shop profile.' });
    }
  }
};
