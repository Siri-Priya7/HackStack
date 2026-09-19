import { Product } from '../models/Product.js';
import { VisionService } from '../services/visionService.js';

export const productController = {
  async getProducts(req, res) {
    try {
      const shopId = req.user.shop_id || (req.user.role === 'platform_admin' ? (req.query.shop_id || 1) : null);
      if (!shopId) {
        return res.status(400).json({ success: false, error: 'No shop associated with user.' });
      }

      const products = Product.getAllByShop(shopId);
      return res.json({ success: true, data: products });
    } catch (err) {
      console.error('Error fetching products:', err);
      return res.status(500).json({ success: false, error: 'Failed to retrieve products.' });
    }
  },

  async getProductById(req, res) {
    try {
      const product = Product.findById(req.params.id);
      if (!product) {
        return res.status(404).json({ success: false, error: 'Product not found.' });
      }

      if (req.user.role !== 'platform_admin' && product.shop_id !== req.user.shop_id) {
        return res.status(403).json({ success: false, error: 'Unauthorized to view product from another shop.' });
      }

      return res.json({ success: true, data: product });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to retrieve product.' });
    }
  },

  async createProduct(req, res) {
    try {
      // Role enforcement: Shop Owner and Platform Admin only (Staff cannot add products)
      if (req.user.role === 'staff') {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Staff members cannot add new products. Contact your Shop Owner.'
        });
      }

      const shopId = req.user.shop_id;
      if (!shopId) {
        return res.status(400).json({ success: false, error: 'No shop associated with user.' });
      }

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
        barcode,
        image_url
      } = req.body;

      if (!name) {
        return res.status(400).json({ success: false, error: 'Product name is required.' });
      }

      const product = Product.create({
        shop_id: shopId,
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
        barcode,
        image_url: image_url || null
      });

      return res.status(201).json({ success: true, data: product });
    } catch (err) {
      console.error('Error creating product:', err);
      return res.status(500).json({ success: false, error: 'Failed to create product.' });
    }
  },

  async updateProduct(req, res) {
    try {
      if (req.user.role === 'staff') {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Staff members cannot modify product details. Contact your Shop Owner.'
        });
      }

      const existing = Product.findById(req.params.id);
      if (!existing || (req.user.role !== 'platform_admin' && existing.shop_id !== req.user.shop_id)) {
        return res.status(404).json({ success: false, error: 'Product not found or unauthorized.' });
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
      if (req.user.role === 'staff') {
        return res.status(403).json({
          success: false,
          error: 'Access denied: Staff members cannot delete products.'
        });
      }

      const existing = Product.findById(req.params.id);
      if (!existing || (req.user.role !== 'platform_admin' && existing.shop_id !== req.user.shop_id)) {
        return res.status(404).json({ success: false, error: 'Product not found or unauthorized.' });
      }

      Product.delete(req.params.id, req.user.shop_id);
      return res.json({ success: true, message: 'Product deleted successfully.' });
    } catch (err) {
      return res.status(500).json({ success: false, error: 'Failed to delete product.' });
    }
  },

  async detectImage(req, res) {
    try {
      const { imageBase64, imageUrl, itemHint, visualFeatures, language } = req.body;
      const detected = await VisionService.detectGroceryItem({
        imageBase64,
        imageUrl,
        itemHint,
        visualFeatures,
        language: language || req.user.preferred_language || 'en-IN'
      });
      return res.json({
        success: true,
        data: detected
      });
    } catch (err) {
      console.error('Image detection error:', err);
      return res.status(500).json({ success: false, error: 'Image detection failed.' });
    }
  }
};
