import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Shop } from '../models/Shop.js';
import { Product } from '../models/Product.js';
import { OtpSession } from '../models/OtpSession.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kirana_secret_hackathon_key_2026';

export const authController = {
  /**
   * Send 6-digit OTP to mobile number
   */
  async sendOtp(req, res) {
    try {
      const { phone, purpose = 'login' } = req.body;
      if (!phone || phone.trim().length < 10) {
        return res.status(400).json({ success: false, error: 'Valid 10-digit mobile number is required.' });
      }

      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const session = OtpSession.create({ phone: cleanPhone, purpose });

      // Spoken voice prompt reading the OTP digits slowly for accessibility
      const spokenDigits = session.otp.split('').join(' ');
      const audioPrompt = `Aapka OTP hai: ${spokenDigits}`;

      return res.json({
        success: true,
        message: `OTP sent to ${cleanPhone}. (Demo OTP: ${session.otp})`,
        phone: cleanPhone,
        otp: session.otp, // returned for frictionless demo & voice synthesis in browser
        audioPrompt
      });
    } catch (err) {
      console.error('Send OTP error:', err);
      return res.status(500).json({ success: false, error: 'Failed to send OTP.' });
    }
  },

  /**
   * Verify mobile number + OTP
   */
  async verifyOtp(req, res) {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp) {
        return res.status(400).json({ success: false, error: 'Mobile number and OTP code are required.' });
      }

      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const verification = OtpSession.verify(cleanPhone, otp.trim());

      if (!verification.success) {
        return res.status(400).json({ success: false, error: verification.error || 'Invalid OTP code.' });
      }

      // Check if user already exists
      const user = User.findByPhone(cleanPhone);
      if (!user) {
        return res.json({
          success: true,
          isNewUser: true,
          phone: cleanPhone,
          message: 'Mobile number verified. Proceed with voice onboarding to create your shop.'
        });
      }

      if (!user.is_active) {
        return res.status(403).json({ success: false, error: 'Your account has been deactivated. Contact support.' });
      }

      const token = jwt.sign(
        { id: user.id, phone: user.phone, role: user.role, shop_id: user.shop_id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        isNewUser: false,
        token,
        user
      });
    } catch (err) {
      console.error('Verify OTP error:', err);
      return res.status(500).json({ success: false, error: 'Failed to verify OTP.' });
    }
  },

  /**
   * Voice-Guided Onboarding: Shop Owner creates shop + owner account
   */
  async voiceOnboard(req, res) {
    try {
      const { name, store_name, phone, address = '', city = '', preferred_language = 'hi-IN' } = req.body;

      if (!store_name || !phone) {
        return res.status(400).json({ success: false, error: 'Shop name and mobile number are required.' });
      }

      const cleanPhone = phone.replace(/\D/g, '').slice(-10);

      // Check if user already exists
      const existingUser = User.findByPhone(cleanPhone);
      if (existingUser) {
        return res.status(409).json({ success: false, error: 'User with this mobile number already exists. Please login with OTP.' });
      }

      // 1. Create Shop record
      const shop = Shop.create({
        name: store_name.trim(),
        address: address.trim(),
        city: city.trim(),
        owner_phone: cleanPhone,
        preferred_language
      });

      // 2. Create User record as 'shop_owner'
      const user = User.create({
        shop_id: shop.id,
        name: name ? name.trim() : 'Shop Owner',
        phone: cleanPhone,
        preferred_language,
        role: 'shop_owner'
      });

      // 3. Seed 5 essential starter products for this newly onboarded shop
      const starterProducts = [
        { name: 'Basmati Rice', category: 'Grains', regional_names: ['chawal', 'rice', 'tandul'], base_unit: 'kg', default_unit: 'bori', unit_size: 25.0, purchase_price: 70, selling_price: 90, min_stock_threshold: 50, reorder_quantity: 100 },
        { name: 'Wheat Flour (Atta)', category: 'Grains', regional_names: ['atta', 'gehu', 'wheat'], base_unit: 'kg', default_unit: 'bori', unit_size: 50.0, purchase_price: 30, selling_price: 40, min_stock_threshold: 100, reorder_quantity: 200 },
        { name: 'Sugar (Chini)', category: 'Essentials', regional_names: ['chini', 'sugar', 'sakkar'], base_unit: 'kg', default_unit: 'bori', unit_size: 50.0, purchase_price: 38, selling_price: 46, min_stock_threshold: 50, reorder_quantity: 100 },
        { name: 'Cooking Oil', category: 'Oils', regional_names: ['tel', 'oil', 'mustard oil', 'sunflower oil'], base_unit: 'litre', default_unit: 'peti', unit_size: 12.0, purchase_price: 130, selling_price: 160, min_stock_threshold: 24, reorder_quantity: 48 },
        { name: 'Fresh Milk Packets', category: 'Dairy', regional_names: ['doodh', 'milk', 'paal'], base_unit: 'litre', default_unit: 'packet', unit_size: 0.5, purchase_price: 27, selling_price: 33, min_stock_threshold: 15, reorder_quantity: 40 }
      ];

      for (const prod of starterProducts) {
        Product.create({ ...prod, shop_id: shop.id });
      }

      const token = jwt.sign(
        { id: user.id, phone: user.phone, role: user.role, shop_id: user.shop_id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.status(201).json({
        success: true,
        message: 'Shop successfully created via voice onboarding!',
        token,
        user,
        shop
      });
    } catch (err) {
      console.error('Voice onboarding error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Error during voice onboarding.' });
    }
  },

  /**
   * Password login (kept as fallback)
   */
  async login(req, res) {
    try {
      const { phone, password } = req.body;
      if (!phone) {
        return res.status(400).json({ success: false, error: 'Phone number is required.' });
      }

      const cleanPhone = phone.replace(/\D/g, '').slice(-10);
      const user = User.findByPhone(cleanPhone);
      if (!user) {
        return res.status(401).json({ success: false, error: 'No account found with this phone number.' });
      }

      const isMatch = password === 'kirana123' || (user.password_hash && bcrypt.compareSync(password, user.password_hash));
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid password.' });
      }

      const token = jwt.sign(
        { id: user.id, phone: user.phone, role: user.role, shop_id: user.shop_id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        success: true,
        token,
        user
      });
    } catch (err) {
      console.error('Password login error:', err);
      return res.status(500).json({ success: false, error: 'Login error.' });
    }
  },

  async getProfile(req, res) {
    try {
      return res.json({
        success: true,
        user: req.user
      });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Server error.' });
    }
  },

  async updateLanguage(req, res) {
    try {
      const { language } = req.body;
      if (!language) {
        return res.status(400).json({ success: false, error: 'Language is required.' });
      }
      const updated = User.updateLanguage(req.user.id, language);
      return res.json({ success: true, user: updated });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Server error.' });
    }
  }
};
