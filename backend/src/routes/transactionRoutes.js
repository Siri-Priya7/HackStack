import express from 'express';
import { transactionController } from '../controllers/transactionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', transactionController.getTransactions);
router.post('/:id/undo', transactionController.undo);

export default router;
