import db from '../config/db.js';

export class Transaction {
  static getAllByUser(userId, limit = 50) {
    return db.prepare(`
      SELECT 
        t.*,
        p.name as product_name,
        p.category as product_category,
        p.base_unit
      FROM transactions t
      JOIN products p ON t.product_id = p.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
      LIMIT ?
    `).all(userId, limit);
  }

  static getTodayByUser(userId) {
    return db.prepare(`
      SELECT * FROM transactions 
      WHERE user_id = ? AND date(created_at) = date('now', 'localtime')
      ORDER BY created_at DESC
    `).all(userId);
  }

  static create({
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
    const stmt = db.prepare(`
      INSERT INTO transactions (
        user_id, product_id, type, quantity, unit, quantity_base,
        unit_price, total_amount, voice_transcript, language_detected, source, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      user_id, product_id, type, quantity, unit, quantity_base,
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
