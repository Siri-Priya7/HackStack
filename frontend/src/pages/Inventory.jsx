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
  AlertCircle,
  Volume2,
  Mic,
  Camera,
  Image as ImageIcon
} from 'lucide-react';
import { speakText as speakAudio } from '../utils/speechService';
import { PRESET_PRODUCT_IMAGES, getDefaultImageForCategory } from '../utils/productImages';

import CameraScannerModal from '../components/CameraScannerModal';

export default function Inventory() {
  const { language, t, isStaff } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isListeningName, setIsListeningName] = useState(false);

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
    reorder_quantity: 50,
    image_url: ''
  });
  const [creating, setCreating] = useState(false);

  // Auto-fill form when product is detected by AI camera
  const handleProductDetectedFromCamera = (detected) => {
    setNewProduct({
      name: detected.name || '',
      category: detected.category || 'Grains',
      regional_names: detected.regional_names || '',
      base_unit: detected.base_unit || 'kg',
      default_unit: detected.default_unit || 'bori',
      unit_size: detected.unit_size || 1,
      purchase_price: detected.purchase_price || 0,
      selling_price: detected.selling_price || 60,
      min_stock_threshold: detected.min_stock_threshold || 10,
      reorder_quantity: detected.reorder_quantity || 20,
      image_url: detected.image_url || ''
    });
    setIsAddModalOpen(true);
  };

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

  const getInventoryVoice = (lang, key, productName = '') => {
    const msgs = {
      'en-IN': {
        created: `${productName} added to your inventory.`,
        createErr: `Could not add product. Please try again.`,
        noItems: 'No items in inventory yet.'
      },
      'hi-IN': {
        created: `${productName} इन्वेंट्री में जोड़ा गया।`,
        createErr: `उत्पाद जोड़ने में समस्या आई।`,
        noItems: 'इन्वेंट्री में अभी कोई सामान नहीं है।'
      },
      'bn-IN': {
        created: `${productName} ইনভেন্টরিতে যোগ করা হয়েছে।`,
        createErr: `পণ্য যোগ করা যায়নি।`,
        noItems: 'ইনভেন্টরিতে কোনো আইটেম নেই।'
      },
      'mr-IN': {
        created: `${productName} यादीत जोडले.`,
        createErr: `उत्पादन जोडता आले नाही.`,
        noItems: 'यादीत अद्याप काही नाही.'
      },
      'te-IN': {
        created: `${productName} జాబితాకు జోడించబడింది.`,
        createErr: `ఉత్పత్తి జోడించడం సాధ్యం కాలేదు.`,
        noItems: 'జాబితాలో ఏమీ లేదు.'
      },
      'ta-IN': {
        created: `${productName} பட்டியலில் சேர்க்கப்பட்டது.`,
        createErr: `தயாரிப்பு சேர்க்க இயலவில்லை.`,
        noItems: 'பட்டியலில் எதுவும் இல்லை.'
      },
      'gu-IN': {
        created: `${productName} યાદીમાં ઉમેર્યા.`,
        createErr: `ઉત્પાદ ઉમેરી શકાયા નહીં.`,
        noItems: 'યાદીમાં હજી કંઈ નથી.'
      },
      'kn-IN': {
        created: `${productName} ಪಟ್ಟಿಗೆ ಸೇರಿಸಲಾಗಿದೆ.`,
        createErr: `ಉತ್ಪನ್ನ ಸೇರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.`,
        noItems: 'ಪಟ್ಟಿ ಖಾಲಿ ಇದೆ.'
      },
      'ml-IN': {
        created: `${productName} ലിസ്റ്റിൽ ചേർത്തു.`,
        createErr: `ഉൽപ്പന്നം ചേർക്കാൻ കഴിഞ്ഞില്ല.`,
        noItems: 'ലിസ്റ്റ് ഒഴിഞ്ഞിരിക്കുന്നു.'
      },
      'pa-IN': {
        created: `${productName} ਸੂਚੀ ਵਿੱਚ ਜੋੜਿਆ ਗਿਆ।`,
        createErr: `ਉਤਪਾਦ ਜੋੜਨਾ ਸੰਭਵ ਨਹੀਂ ਹੋਇਆ।`,
        noItems: 'ਸੂਚੀ ਵਿੱਚ ਕੁਝ ਨਹੀਂ ਹੈ।'
      },
      'or-IN': {
        created: `${productName} ତାଲିକାରେ ଯୋଡ଼ା ହୋଇଛି।`,
        createErr: `ଉତ୍ପାଦ ଯୋଡ଼ିବା ସମ୍ଭବ ହୋଇ ନାହିଁ।`,
        noItems: 'ତାଲିକା ଖାଲି ଅଛି।'
      }
    };
    return (msgs[lang] || msgs['en-IN'])[key] || (msgs['en-IN'])[key];
  };

  // 🎙️ Voice input for product name in Add Product modal
  const startVoiceNameInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = language || 'en-IN';
    recognition.continuous = false;

    recognition.onstart = () => setIsListeningName(true);
    recognition.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      setNewProduct(prev => ({ ...prev, name: spoken }));
    };
    recognition.onerror = () => setIsListeningName(false);
    recognition.onend = () => setIsListeningName(false);

    recognition.start();
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name.trim()) return;

    setCreating(true);
    try {
      const aliases = newProduct.regional_names
        .split(',')
        .map(a => a.trim().toLowerCase())
        .filter(Boolean);

      const resolvedImage = newProduct.image_url.trim() || getDefaultImageForCategory(newProduct.category, newProduct.name);

      const payload = {
        ...newProduct,
        image_url: resolvedImage,
        regional_names: aliases,
        unit_size: parseFloat(newProduct.unit_size) || 1,
        purchase_price: parseFloat(newProduct.purchase_price) || 0,
        selling_price: parseFloat(newProduct.selling_price) || 0,
        min_stock_threshold: parseFloat(newProduct.min_stock_threshold) || 10,
        reorder_quantity: parseFloat(newProduct.reorder_quantity) || 50
      };

      const res = await productAPI.createProduct(payload);
      if (res.data.success) {
        speakAudio(getInventoryVoice(language, 'created', newProduct.name), language);
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
          reorder_quantity: 50,
          image_url: ''
        });
        loadInventory();
      } else {
        speakAudio(getInventoryVoice(language, 'createErr'), language);
      }
    } catch (err) {
      console.error('Error creating product:', err);
      speakAudio(getInventoryVoice(language, 'createErr'), language);
    } finally {
      setCreating(false);
    }
  };

  // Remove deleted product from local state instantly (no refetch needed)
  const handleProductDeleted = (productId) => {
    setInventory(prev => prev.filter(item => item.product_id !== productId));
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

  const speakStockOverview = () => {
    if (inventory.length === 0) {
      speakAudio(getInventoryVoice(language, 'noItems'), language);
      return;
    }
    const lowStock = inventory.filter(i => i.status === 'low_stock').length;
    const outStock = inventory.filter(i => i.status === 'out_of_stock').length;
    const summaryMap = {
      'en-IN': `Inventory: ${inventory.length} products. ${lowStock} low stock, ${outStock} out of stock.`,
      'hi-IN': `इन्वेंट्री में ${inventory.length} उत्पाद हैं। ${lowStock} का स्टॉक कम है, ${outStock} खत्म हो चुके हैं।`,
      'bn-IN': `ইনভেন্টরিতে ${inventory.length}টি পণ্য। ${lowStock}টি কম, ${outStock}টি শেষ।`,
      'mr-IN': `यादीत ${inventory.length} उत्पादने. ${lowStock} कमी साठा, ${outStock} संपले.`,
      'te-IN': `జాబితాలో ${inventory.length} ఉత్పత్తులు. ${lowStock} తక్కువ, ${outStock} నిండుకున్నాయి.`,
      'ta-IN': `பட்டியலில் ${inventory.length} தயாரிப்புகள். ${lowStock} குறைவு, ${outStock} தீர்ந்தது.`,
      'gu-IN': `યાદીમાં ${inventory.length} ઉત્પાદ. ${lowStock} ઓછા, ${outStock} ખૂટ્યા.`,
      'kn-IN': `ಪಟ್ಟಿಯಲ್ಲಿ ${inventory.length} ಉತ್ಪನ್ನಗಳು. ${lowStock} ಕಡಿಮೆ, ${outStock} ಖಾಲಿ.`,
      'ml-IN': `ലിസ്റ്റിൽ ${inventory.length} ഉൽപ്പന്നങ്ങൾ. ${lowStock} കുറവ്, ${outStock} തീർന്നു.`,
      'pa-IN': `ਸੂਚੀ ਵਿੱਚ ${inventory.length} ਉਤਪਾਦ. ${lowStock} ਘੱਟ, ${outStock} ਖਤਮ.`,
      'or-IN': `ତାଲିକାରେ ${inventory.length} ଉତ୍ପାଦ. ${lowStock} କମ, ${outStock} ଶେଷ ହୋଇଛି.`
    };
    speakAudio(summaryMap[language] || summaryMap['en-IN'], language);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-10 animate-fade-in">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-7 h-7 text-orange-500" />
              <span>{t('inventory')}</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {t('stockOverview')}
            </p>
          </div>

          <button
            onClick={speakStockOverview}
            className="sm:hidden bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
            title="Listen to stock summary"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{language === 'hi-IN' ? 'सुनें' : 'Listen'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={speakStockOverview}
            className="hidden sm:flex bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 px-3.5 py-2 rounded-2xl text-xs font-bold items-center gap-1.5 shadow-sm transition-all"
            title="Listen to stock summary"
          >
            <Volume2 className="w-4 h-4" />
            <span>{language === 'hi-IN' ? 'स्टॉक सुनें' : 'Listen Stock'}</span>
          </button>

          {!isStaff ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCameraModalOpen(true)}
                className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md shadow-orange-500/25 transition-all hover:-translate-y-0.5 active:scale-95"
                title="Detect product with AI Camera"
              >
                <Camera className="w-4 h-4" />
                <span>{language === 'hi-IN' ? '📷 कैमरा स्कैन' : '📷 AI Camera'}</span>
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white font-bold px-4 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md shadow-slate-900/30 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addProduct')}</span>
              </button>
            </div>
          ) : (
            <div className="bg-blue-50 text-blue-800 border border-blue-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
              <span>Staff Access: Voice Stock Updates Enabled</span>
            </div>
          )}
        </div>
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
            placeholder={t('searchPlaceholder')}
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
          {[
            { key: 'All', label: t('allStatus') },
            { key: 'low_stock', label: `⚠️ ${t('lowStock')}` },
            { key: 'in_stock', label: `✅ ${t('inStock')}` }
          ].map((st) => (
            <button
              key={st.key}
              onClick={() => setSelectedStatus(st.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedStatus === st.key
                  ? 'bg-orange-500 text-white'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm font-semibold">
          {t('loadingInventory')}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {t('noProductsFound')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {t('noProductsFoundSub')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <ProductCard
              key={item.product_id}
              item={item}
              onStockUpdated={loadInventory}
              onDeleted={handleProductDeleted}
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
                {t('addProduct')}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* 📷 AI Camera Auto-Detect Shortcut */}
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsCameraModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 border border-orange-200 hover:border-orange-400 text-orange-900 font-extrabold py-2.5 px-4 rounded-2xl text-xs shadow-sm transition-all hover:bg-orange-100"
              >
                <Camera className="w-4 h-4 text-orange-600" />
                <span>📷 Auto-Detect Product with Camera & Voice</span>
              </button>

              {/* 📷 Product Photo Input & Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  📷 Product Photo
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                    <img
                      src={newProduct.image_url || getDefaultImageForCategory(newProduct.category, newProduct.name)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="url"
                    value={newProduct.image_url}
                    onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                    placeholder="https://... photo link (or pick below)"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Quick Photo Presets */}
                <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
                  {PRESET_PRODUCT_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setNewProduct({ ...newProduct, image_url: preset.url, category: preset.category })}
                      className="text-[10px] bg-slate-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 text-slate-700 px-2 py-1 rounded-lg font-bold whitespace-nowrap border border-slate-200 transition-colors"
                    >
                      {preset.label.split('/')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* 🎙️ Product Name with Voice Mic */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  🎙️ Product Name (Type or Speak) *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="e.g. Basmati Rice, Atta, Mustard Oil"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={startVoiceNameInput}
                    className={`absolute right-2 top-2 p-1.5 rounded-lg transition-all ${
                      isListeningName
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50'
                    }`}
                    title="Speak product name"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                {isListeningName && (
                  <p className="text-[10px] text-rose-600 font-bold mt-1 animate-pulse">
                    🎙️ Listening... Speak product name now
                  </p>
                )}
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
                  {creating ? 'Saving...' : t('saveProduct')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📷 AI Camera Scanner Modal */}
      <CameraScannerModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onProductDetected={handleProductDetectedFromCamera}
        language={language}
      />
    </div>
  );
}
