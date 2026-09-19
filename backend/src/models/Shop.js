import db from '../config/db.js';

export class Shop {
  static findById(id) {
    return db.prepare('SELECT * FROM shops WHERE id = ?').get(id);
  }

  static findByPhone(phone) {
    return db.prepare('SELECT * FROM shops WHERE owner_phone = ?').get(phone);
  }

  static getAll() {
    return db.prepare(`
      SELECT 
        s.*,
        u.name as owner_name,
        (SELECT COUNT(*) FROM products WHERE shop_id = s.id AND is_active = 1) as product_count,
        (SELECT COUNT(*) FROM users WHERE shop_id = s.id AND is_active = 1) as user_count,
        (SELECT COUNT(*) FROM transactions WHERE shop_id = s.id) as transaction_count
      FROM shops s
      LEFT JOIN users u ON u.shop_id = s.id AND u.role = 'shop_owner'
      ORDER BY s.created_at DESC
    `).all();
  }

  static create({ name, address = '', city = '', owner_phone, preferred_language = 'hi-IN' }) {
    const stmt = db.prepare(`
      INSERT INTO shops (name, address, city, owner_phone, preferred_language)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, address, city, owner_phone, preferred_language);
    return this.findById(result.lastInsertRowid);
  }

  static updateStatus(id, isActive) {
    db.prepare('UPDATE shops SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(isActive ? 1 : 0, id);
    return this.findById(id);
  }

  static getPlatformStats() {
    const totalShops = db.prepare('SELECT COUNT(*) as count FROM shops WHERE is_active = 1').get().count;
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = 1').get().count;
    const totalTransactions = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
    const totalRevenue = db.prepare("SELECT COALESCE(SUM(total_amount), 0) as total FROM transactions WHERE type = 'OUT'").get().total;

    return {
      totalShops,
      totalUsers,
      totalTransactions,
      totalRevenue
    };
  }
}
