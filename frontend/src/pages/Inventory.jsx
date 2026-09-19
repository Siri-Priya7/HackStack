import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventoryAPI, productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import {
  Package,
  Search,
  Plus,
  Filter,
  X,
  Sparkles,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function Inventory() {
  const { language } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Grains',
    regional_names: '',
    base_unit: 'kg',
    default_unit: 'bori',
    unit_size: 25,
    purchase_price: 50,
    selling_price: 65,
    min_stock_threshold: 25,
    reorder_quantity: 50
  });
  const [creating, setCreating] = useState(false);

  const loadInventory = async () => {
    try {
      const res = await inventoryAPI.getInventory();
      if (res.data.success) {
        setInventory(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;

    setCreating(true);
    try {
      const aliases = newProduct.regional_names
        .split(',')
        .map(a => a.trim().toLowerCase())
        .filter(Boolean);

      const payload = {
        ...newProduct,
        regional_names: aliases,
        unit_size: parseFloat(newProduct.unit_size) || 1,
        purchase_price: parseFloat(newProduct.purchase_price) || 0,
        selling_price: parseFloat(newProduct.selling_price) || 0,
        min_stock_threshold: parseFloat(newProduct.min_stock_threshold) || 10,
        reorder_quantity: parseFloat(newProduct.reorder_quantity) || 50
      };

      const res = await productAPI.createProduct(payload);
      if (res.data.success) {
        setIsAddModalOpen(false);
        setNewProduct({
          name: '',
          category: 'Grains',
          regional_names: '',
          base_unit: 'kg',
          default_unit: 'bori',
          unit_size: 25,
          purchase_price: 50,
          selling_price: 65,
          min_stock_threshold: 25,
          reorder_quantity: 50
        });
        loadInventory();
      }
    } catch (err) {
      console.error('Error creating product:', err);
    } finally {
      setCreating(false);
    }
  };

  // Filter logic
  const categories = ['All', ...new Set(inventory.map(item => item.product_category || 'General'))];

  const filteredItems = inventory.filter(item => {
    const pName = (item.product_name || '').toLowerCase();
    const sTerm = searchTerm.toLowerCase().trim();

    // Check regional aliases in search
    const aliases = Array.isArray(item.regional_names) ? item.regional_names : [];
    const aliasMatch = aliases.some(a => a.toLowerCase().includes(sTerm));

    const matchesSearch = !sTerm || pName.includes(sTerm) || aliasMatch;
    const matchesCategory = selectedCategory === 'All' || item.product_category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-10 animate-fade-in">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Package className="w-7 h-7 text-orange-500" />
            <span>{language === 'hi-IN' ? 'सामान और स्टॉक लिस्ट' : 'Stock & Inventory Catalog'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'hi-IN'
              ? 'दुकान के सभी सामान, उनकी बोरी/पेटी की गिनती और स्टॉक की स्थिति'
              : 'Browse all products, packaging sizes, and current balances'}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md shadow-orange-500/30 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'hi-IN' ? '+ नया सामान जोड़ें' : '+ Add New Product'}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              language === 'hi-IN'
                ? 'सामान खोजें (जैसे: चावल, चीनी, तेल, आटा, chawal, atta)...'
                : 'Search products by name or regional alias (e.g. rice, chawal, atta, oil)...'
            }
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}

          <div className="h-4 w-[1px] bg-slate-200 mx-1"></div>

          {/* Status quick toggle */}
          {['All', 'low_stock', 'in_stock'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedStatus === st
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
              }`}
            >
              {st === 'All' ? 'All Status' : st === 'low_stock' ? '⚠️ Low Stock' : '✅ In Stock'}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm font-semibold">
          Loading inventory...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {language === 'hi-IN' ? 'कोई सामान नहीं मिला' : 'No products match your search'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Try searching for Hindi or English terms like "chawal", "atta", "milk".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <ProductCard
              key={item.product_id}
              item={item}
              onStockUpdated={loadInventory}
              language={language}
            />
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-extrabold text-base">
                {language === 'hi-IN' ? 'नया सामान जोड़ें (Add Product)' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Product Name (e.g. Basmati Rice, Atta) *
                </label>
                <input
                  type="text"
                  required
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Regional Voice Aliases (comma separated: chawal, rice, arisi)
                </label>
                <input
                  type="text"
                  value={newProduct.regional_names}
                  onChange={(e) => setNewProduct({ ...newProduct, regional_names: e.target.value })}
                  placeholder="chawal, rice, tandul, biryani chawal"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="Grains">Grains (अनाज)</option>
                    <option value="Essentials">Essentials (किराना)</option>
                    <option value="Dairy">Dairy (दूध/दही)</option>
                    <option value="Oils">Oils (तेल/घी)</option>
                    <option value="Pulses">Pulses (दालें)</option>
                    <option value="Vegetables">Vegetables (सब्जियां)</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Default Trade Unit
                  </label>
                  <select
                    value={newProduct.default_unit}
                    onChange={(e) => setNewProduct({ ...newProduct, default_unit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="bori">Bori / Bag (बोरी)</option>
                    <option value="peti">Peti / Carton (पेटी)</option>
                    <option value="packet">Packet (पैकेट)</option>
                    <option value="dozen">Dozen (दर्जन)</option>
                    <option value="quintal">Quintal / Palla</option>
                    <option value="kg">Kilogram (kg)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    1 {newProduct.default_unit} Size ({newProduct.base_unit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newProduct.unit_size}
                    onChange={(e) => setNewProduct({ ...newProduct, unit_size: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Selling Price (₹/{newProduct.base_unit})
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newProduct.selling_price}
                    onChange={(e) => setNewProduct({ ...newProduct, selling_price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Low Stock Alert Limit ({newProduct.base_unit})
                  </label>
                  <input
                    type="number"
                    value={newProduct.min_stock_threshold}
                    onChange={(e) => setNewProduct({ ...newProduct, min_stock_threshold: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Reorder Qty ({newProduct.base_unit})
                  </label>
                  <input
                    type="number"
                    value={newProduct.reorder_quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, reorder_quantity: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md shadow-orange-500/30"
                >
                  {creating ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
