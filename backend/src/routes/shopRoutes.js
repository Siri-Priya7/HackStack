import express from 'express';
import { shopController } from '../controllers/shopController.js';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Platform Admin Routes (Requires role: 'platform_admin')
router.get('/admin/shops', authMiddleware, requireRole('platform_admin'), shopController.getAllShops);
router.get('/admin/stats', authMiddleware, requireRole('platform_admin'), shopController.getPlatformStats);
router.patch('/admin/shops/:id/status', authMiddleware, requireRole('platform_admin'), shopController.toggleShopStatus);

// Shop Owner Staff Management Routes (Requires role: 'shop_owner')
router.get('/staff', authMiddleware, requireRole('shop_owner'), shopController.getShopStaff);
router.post('/staff', authMiddleware, requireRole('shop_owner'), shopController.addStaff);
router.delete('/staff/:id', authMiddleware, requireRole('shop_owner'), shopController.removeStaff);

// Current Shop Profile (Shop Owner & Staff)
router.get('/profile', authMiddleware, shopController.getShopProfile);

export default router;
