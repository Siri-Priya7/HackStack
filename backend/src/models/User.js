import db from '../config/db.js';
import bcrypt from 'bcryptjs';

export class User {
  static findById(id) {
    return db.prepare('SELECT id, name, store_name, phone, preferred_language, role, created_at FROM users WHERE id = ?').get(id);
  }

  static findByPhone(phone) {
    return db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);
  }

  static create({ name, store_name, phone, password, preferred_language = 'hi-IN' }) {
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const stmt = db.prepare(`
      INSERT INTO users (name, store_name, phone, password_hash, preferred_language)
      VALUES (?, ?, ?, ?, ?)
    `);
    const result = stmt.run(name, store_name || 'Apna Kirana Store', phone, password_hash, preferred_language);
    return this.findById(result.lastInsertRowid);
  }

  static updateLanguage(id, language) {
    db.prepare('UPDATE users SET preferred_language = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(language, id);
    return this.findById(id);
  }
}
