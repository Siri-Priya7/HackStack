import db from '../config/db.js';

export class Transaction {
  static getAllByShop(shopId, limit = 50) {
    return db.prepare(`
      SELECT 
        t.*,
        p.name as product_name,
        p.category as product_category,
        p.base_unit,
        u.name as user_name,
        u.role as user_role
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.shop_id = ?
      ORDER BY t.created_at DESC
      LIMIT ?
    `).all(shopId, limit);
  }

  // Alias for backward compatibility
  static getAllByUser(shopOrUserId, limit = 50) {
    return this.getAllByShop(shopOrUserId, limit);
  }

  static getTodayByShop(shopId) {
    return db.prepare(`
      SELECT * FROM transactions 
      WHERE shop_id = ? AND date(created_at) = date('now', 'localtime')
      ORDER BY created_at DESC
    `).all(shopId);
  }

  static getTodayByUser(shopOrUserId) {
    return this.getTodayByShop(shopOrUserId);
  }

  static create({
    shop_id,
    user_id,
    product_id,
    type, // 'IN', 'OUT', 'ADJUST'
    quantity,
    unit,
    quantity_base,
    unit_price = 0,
    total_amount = 0,
    voice_transcript = null,
    language_detected = 'hinglish',
    source = 'voice',
    notes = null
  }) {
    const targetShopId = shop_id || 1;
    const stmt = db.prepare(`
      INSERT INTO transactions (
        shop_id, user_id, product_id, type, quantity, unit, quantity_base,
        unit_price, total_amount, voice_transcript, language_detected, source, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      targetShopId, user_id, product_id, type, quantity, unit, quantity_base,
      unit_price, total_amount, voice_transcript, language_detected, source, notes
    );

    return db.prepare('SELECT * FROM transactions WHERE id = ?').get(result.lastInsertRowid);
  }

  static findById(id) {
    return db.prepare('SELECT * FROM transactions WHERE id = ?').get(id);
  }

  static delete(id) {
    return db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
  }
}
