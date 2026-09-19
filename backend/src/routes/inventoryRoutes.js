import express from 'express';
import { inventoryController } from '../controllers/inventoryController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', inventoryController.getInventory);
router.get('/summary', inventoryController.getInventorySummary);
router.get('/alerts', inventoryController.getAlerts);
router.post('/voice', inventoryController.processVoiceCommand);
router.post('/quick-adjust', inventoryController.quickAdjust);

export default router;
