import express from 'express';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Mobile OTP Authentication
router.post('/otp/send', authController.sendOtp);
router.post('/otp/verify', authController.verifyOtp);

// Voice-Guided Onboarding
router.post('/onboard', authController.voiceOnboard);

// Traditional / Fallback Login
router.post('/login', authController.login);

// Profile & Preferences
router.get('/profile', authMiddleware, authController.getProfile);
router.post('/language', authMiddleware, authController.updateLanguage);

export default router;
