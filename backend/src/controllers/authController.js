import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kirana_secret_hackathon_key_2026';

export const authController = {
  async register(req, res) {
    try {
      const { name, store_name, phone, password, preferred_language } = req.body;

      if (!name || !phone || !password) {
        return res.status(400).json({ success: false, error: 'Name, phone number, and password are required.' });
      }

      const existing = User.findByPhone(phone);
      if (existing) {
        return res.status(409).json({ success: false, error: 'User with this phone number already exists.' });
      }

      const user = User.create({ name, store_name, phone, password, preferred_language });
      const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });

      return res.status(201).json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          store_name: user.store_name,
          phone: user.phone,
          preferred_language: user.preferred_language,
          role: user.role
        }
      });
    } catch (err) {
      console.error('Registration error:', err);
      return res.status(500).json({ success: false, error: 'Server error during registration.' });
    }
  },

  async login(req, res) {
    try {
      const { phone, password } = req.body;

      if (!phone || !password) {
        return res.status(400).json({ success: false, error: 'Phone number and password are required.' });
      }

      const user = User.findByPhone(phone);
      if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid phone number or password.' });
      }

      // If demo user password bypass
      const isMatch = (phone === '9876543210' && password === 'kirana123') || bcrypt.compareSync(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ success: false, error: 'Invalid phone number or password.' });
      }

      const token = jwt.sign({ id: user.id, phone: user.phone }, JWT_SECRET, { expiresIn: '7d' });

      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          store_name: user.store_name,
          phone: user.phone,
          preferred_language: user.preferred_language,
          role: user.role
        }
      });
    } catch (err) {
      console.error('Login error:', err);
      return res.status(500).json({ success: false, error: 'Server error during login.' });
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
