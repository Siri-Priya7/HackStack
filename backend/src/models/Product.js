import db from '../config/db.js';

export class Product {
  static getAllByUser(userId) {
    const rows = db.prepare('SELECT * FROM products WHERE user_id = ? AND is_active = 1 ORDER BY name ASC').all(userId);
    return rows.map(r => ({
      ...r,
      regional_names: typeof r.regional_names === 'string' ? JSON.parse(r.regional_names || '[]') : r.regional_names
    }));
  }

  static findById(id) {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!row) return null;
    return {
      ...row,
      regional_names: typeof row.regional_names === 'string' ? JSON.parse(row.regional_names || '[]') : row.regional_names
    };
  }

  static create({
    user_id,
    name,
    category = 'General',
    regional_names = [],
    base_unit = 'kg',
    default_unit = 'kg',
    unit_size = 1.0,
    purchase_price = 0,
    selling_price = 0,
    min_stock_threshold = 10,
    reorder_quantity = 50,
    barcode = null
  }) {
    const regionalJson = JSON.stringify(Array.isArray(regional_names) ? regional_names : [regional_names]);
    const stmt = db.prepare(`
      INSERT INTO products (
        user_id, name, category, regional_names, base_unit, default_unit, unit_size,
        purchase_price, selling_price, min_stock_threshold, reorder_quantity, barcode
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      user_id, name, category, regionalJson, base_unit, default_unit, unit_size,
      purchase_price, selling_price, min_stock_threshold, reorder_quantity, barcode
    );

    // Initialize inventory record for this product
    db.prepare(`
      INSERT INTO inventory (user_id, product_id, current_stock_base, current_stock_display, status)
      VALUES (?, ?, 0.0, '0 ${base_unit}', 'out_of_stock')
    `).run(user_id, result.lastInsertRowid);

    return this.findById(result.lastInsertRowid);
  }

  static update(id, data) {
    const current = this.findById(id);
    if (!current) return null;

    const regionalJson = data.regional_names ? JSON.stringify(data.regional_names) : JSON.stringify(current.regional_names);

    db.prepare(`
      UPDATE products SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        regional_names = ?,
        base_unit = COALESCE(?, base_unit),
        default_unit = COALESCE(?, default_unit),
        unit_size = COALESCE(?, unit_size),
        purchase_price = COALESCE(?, purchase_price),
        selling_price = COALESCE(?, selling_price),
        min_stock_threshold = COALESCE(?, min_stock_threshold),
        reorder_quantity = COALESCE(?, reorder_quantity),
        barcode = COALESCE(?, barcode),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      data.name, data.category, regionalJson, data.base_unit, data.default_unit,
      data.unit_size, data.purchase_price, data.selling_price, data.min_stock_threshold,
      data.reorder_quantity, data.barcode, id
    );

    return this.findById(id);
  }

  static delete(id) {
    return db.prepare('UPDATE products SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
  }
}
