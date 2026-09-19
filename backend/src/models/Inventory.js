import db from '../config/db.js';

export class Inventory {
  static getAllByUser(userId) {
    const rows = db.prepare(`
      SELECT 
        i.*,
        p.name as product_name,
        p.category as product_category,
        p.regional_names,
        p.base_unit,
        p.default_unit,
        p.unit_size,
        p.purchase_price,
        p.selling_price,
        p.min_stock_threshold,
        p.reorder_quantity
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE i.user_id = ? AND p.is_active = 1
      ORDER BY 
        CASE 
          WHEN i.status = 'out_of_stock' THEN 1
          WHEN i.status = 'low_stock' THEN 2
          ELSE 3
        END,
        p.name ASC
    `).all(userId);

    return rows.map(r => ({
      ...r,
      regional_names: typeof r.regional_names === 'string' ? JSON.parse(r.regional_names || '[]') : r.regional_names
    }));
  }

  static getByProductId(productId) {
    const row = db.prepare(`
      SELECT 
        i.*,
        p.name as product_name,
        p.category as product_category,
        p.regional_names,
        p.base_unit,
        p.default_unit,
        p.unit_size,
        p.purchase_price,
        p.selling_price,
        p.min_stock_threshold,
        p.reorder_quantity
      FROM inventory i
      JOIN products p ON i.product_id = p.id
      WHERE i.product_id = ?
    `).get(productId);

    if (!row) return null;
    return {
      ...row,
      regional_names: typeof row.regional_names === 'string' ? JSON.parse(row.regional_names || '[]') : row.regional_names
    };
  }

  static updateStock(productId, { current_stock_base, current_stock_display, status }) {
    db.prepare(`
      UPDATE inventory SET
        current_stock_base = ?,
        current_stock_display = ?,
        status = ?,
        updated_at = CURRENT_TIMESTAMP,
        last_restocked_at = CASE WHEN current_stock_base > (SELECT current_stock_base FROM inventory WHERE product_id = ?) THEN CURRENT_TIMESTAMP ELSE last_restocked_at END
      WHERE product_id = ?
    `).run(current_stock_base, current_stock_display, status, productId, productId);

    return this.getByProductId(productId);
  }

  static getLowStock(userId) {
    return this.getAllByUser(userId).filter(item => 
      item.status === 'low_stock' || item.status === 'out_of_stock'
    );
  }
}
