import { Product } from '../models/Product.js';

export const productController = {
  async getProducts(req, res) {
    try {
      const products = Product.getAllByUser(req.user.id);
      return res.json({ success: true, data: products });
    } catch (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ success: false, error: 'Failed to retrieve products.' });
    }
  },

  async getProductById(req, res) {
    try {
      const product = Product.findById(req.params.id);
      if (!product || product.user_id !== req.user.id) {
        return res.status(404).json({ success: false, error: 'Product not found.' });
      }
      return res.json({ success: true, data: product });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to retrieve product.' });
    }
  },

  async createProduct(req, res) {
    try {
      const {
        name,
        category,
        regional_names,
        base_unit,
        default_unit,
        unit_size,
        purchase_price,
        selling_price,
        min_stock_threshold,
        reorder_quantity,
        barcode
      } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, error: 'Product name is required.' });
      }

      const product = Product.create({
        user_id: req.user.id,
        name,
        category: category || 'General',
        regional_names: regional_names || [],
        base_unit: base_unit || 'kg',
        default_unit: default_unit || base_unit || 'kg',
        unit_size: unit_size || 1.0,
        purchase_price: purchase_price || 0,
        selling_price: selling_price || 0,
        min_stock_threshold: min_stock_threshold || 10,
        reorder_quantity: reorder_quantity || 50,
        barcode
      });

      return res.status(201).json({ success: true, data: product });
    } catch (err) {
      console.error('Error creating product:', err);
      return res.status(500).json({ success: false, error: 'Failed to create product.' });
    }
  },

  async updateProduct(req, res) {
    try {
      const existing = Product.findById(req.params.id);
      if (!existing || existing.user_id !== req.user.id) {
        return res.status(404).json({ success: false, error: 'Product not found.' });
      }

      const updated = Product.update(req.params.id, req.body);
      return res.json({ success: true, data: updated });
    } catch (err) {
      console.error('Error updating product:', err);
      return res.status(500).json({ success: false, error: 'Failed to update product.' });
    }
  },

  async deleteProduct(req, res) {
    try {
      const existing = Product.findById(req.params.id);
      if (!existing || existing.user_id !== req.user.id) {
        return res.status(404).json({ success: false, error: 'Product not found.' });
      }

      Product.delete(req.params.id);
      return res.json({ success: true, message: 'Product deleted successfully.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to delete product.' });
    }
  }
};
