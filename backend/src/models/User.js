import db from '../config/db.js';
import bcrypt from 'bcryptjs';

export class User {
  static findById(id) {
    return db.prepare(`
      SELECT 
        u.id, 
        u.shop_id, 
        u.name, 
        u.phone, 
        u.preferred_language, 
        u.role, 
        u.is_active, 
        u.created_at,
        s.name as store_name,
        s.address as shop_address,
        s.city as shop_city,
        s.preferred_language as shop_language
      FROM users u
      LEFT JOIN shops s ON u.shop_id = s.id
      WHERE u.id = ?
    `).get(id);
  }

  static findByPhone(phone) {
    return db.prepare(`
      SELECT 
        u.id, 
        u.shop_id, 
        u.name, 
        u.phone, 
        u.password_hash,
        u.preferred_language, 
        u.role, 
        u.is_active, 
        u.created_at,
        s.name as store_name,
        s.address as shop_address,
        s.city as shop_city
      FROM users u
      LEFT JOIN shops s ON u.shop_id = s.id
      WHERE u.phone = ?
    `).get(phone);
  }

  static create({ shop_id = null, name, phone, password = null, preferred_language = 'hi-IN', role = 'shop_owner' }) {
    let password_hash = null;
    if (password) {
      const salt = bcrypt.genSaltSync(10);
      password_hash = bcrypt.hashSync(password, salt);
    }

    const stmt = db.prepare(`
      INSERT INTO users (shop_id, name, phone, password_hash, preferred_language, role)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(shop_id, name, phone, password_hash, preferred_language, role);
    return this.findById(result.lastInsertRowid);
  }

  static getStaffByShop(shopId) {
    return db.prepare(`
      SELECT id, shop_id, name, phone, preferred_language, role, is_active, created_at
      FROM users
      WHERE shop_id = ? AND role = 'staff' AND is_active = 1
      ORDER BY name ASC
    `).all(shopId);
  }

  static addStaff({ shop_id, name, phone, preferred_language = 'hi-IN' }) {
    const existing = this.findByPhone(phone);
    if (existing) {
      if (existing.shop_id === shop_id) {
        // Reactivate if inactive
        db.prepare('UPDATE users SET is_active = 1, role = "staff" WHERE id = ?').run(existing.id);
        return this.findById(existing.id);
      }
      throw new Error('User with this mobile number is already registered with another shop or role.');
    }

    return this.create({
      shop_id,
      name,
      phone,
      preferred_language,
      role: 'staff'
    });
  }

  static removeStaff(userId, shopId) {
    return db.prepare('UPDATE users SET is_active = 0 WHERE id = ? AND shop_id = ? AND role = "staff"').run(userId, shopId);
  }

  static updateLanguage(id, language) {
    db.prepare('UPDATE users SET preferred_language = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(language, id);
    return this.findById(id);
  }
}
