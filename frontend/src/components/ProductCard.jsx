import React, { useState, useRef } from 'react';
import {
  Package, AlertCircle, Plus, Minus, Trash2, Edit3, Volume2, Mic, Check,
  ChevronUp, ChevronDown, Image as ImageIcon, Camera, X
} from 'lucide-react';
import { inventoryAPI, productAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { speakText as speakAudio } from '../utils/speechService';
import { localizeEntity } from '../utils/transliterate';
import { PRESET_PRODUCT_IMAGES, getDefaultImageForCategory } from '../utils/productImages';

const STATUS_CONFIG = {
  in_stock: {
    labelKey: 'inStock',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500'
  },
  low_stock: {
    labelKey: 'lowStock',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500'
  },
  out_of_stock: {
    labelKey: 'outOfStock',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500'
  }
};

// Multilingual voice feedback for stock actions
function getVoiceFeedback(lang, action, qty, unit, productName) {
  const map = {
    'en-IN': {
      restocked: `${qty} ${unit} of ${productName} added to stock.`,
      sold:      `${qty} ${unit} of ${productName} sold and recorded.`,
      deleted:   `${productName} has been removed from inventory.`,
      deleteErr: `Could not delete ${productName}. Please try again.`,
      adjustErr: `Could not update stock for ${productName}.`,
      updated:   `${productName} details have been updated.`
    },
    'hi-IN': {
      restocked: `${productName} में ${qty} ${unit} जोड़ा गया।`,
      sold:      `${productName} के ${qty} ${unit} बिके और दर्ज हुए।`,
      deleted:   `${productName} इन्वेंट्री से हटा दिया गया।`,
      deleteErr: `${productName} हटाने में समस्या आई। दोबारा कोशिश करें।`,
      adjustErr: `${productName} का स्टॉक अपडेट नहीं हो सका।`,
      updated:   `${productName} की जानकारी अपडेट हो गई।`
    },
    'te-IN': {
      restocked: `${productName}కి ${qty} ${unit} జోడించబడింది.`,
      sold:      `${productName} యొక్క ${qty} ${unit} అమ్మబడింది.`,
      deleted:   `${productName} జాబితా నుండి తొలగించబడింది.`,
      deleteErr: `${productName} తొలగించడం సాధ్యం కాలేదు.`,
      adjustErr: `${productName} స్టాక్ నవీకరించబడలేదు.`,
      updated:   `${productName} వివరాలు నవీకరించబడ్డాయి.`
    },
    'ta-IN': {
      restocked: `${productName}க்கு ${qty} ${unit} சேர்க்கப்பட்டது.`,
      sold:      `${productName} இன் ${qty} ${unit} விற்கப்பட்டது.`,
      deleted:   `${productName} பட்டியலிலிருந்து நீக்கப்பட்டது.`,
      deleteErr: `${productName} நீக்க இயலவில்லை.`,
      adjustErr: `${productName} இருப்பு புதுப்பிக்கப்படவில்லை.`,
      updated:   `${productName} விவரங்கள் புதுப்பிக்கப்பட்டன.`
    },
    'bn-IN': {
      restocked: `${productName}-এ ${qty} ${unit} যোগ করা হয়েছে।`,
      sold:      `${productName}-এর ${qty} ${unit} বিক্রি হয়েছে।`,
      deleted:   `${productName} ইনভেন্টরি থেকে সরানো হয়েছে।`,
      deleteErr: `${productName} সরাতে সমস্যা হয়েছে।`,
      adjustErr: `${productName}-এর স্টক আপডেট হয়নি।`,
      updated:   `${productName}-এর বিবরণ আপডেট করা হয়েছে।`
    },
    'mr-IN': {
      restocked: `${productName} मध्ये ${qty} ${unit} जोडले.`,
      sold:      `${productName} चे ${qty} ${unit} विकले आणि नोंदवले.`,
      deleted:   `${productName} यादीतून काढले.`,
      deleteErr: `${productName} काढता आले नाही.`,
      adjustErr: `${productName} चा साठा अपडेट झाला नाही.`,
      updated:   `${productName} चे तपशील अपडेट झाले.`
    },
    'gu-IN': {
      restocked: `${productName}માં ${qty} ${unit} ઉમેર્યા.`,
      sold:      `${productName}ના ${qty} ${unit} વેચાયા અને નોંધ્યા.`,
      deleted:   `${productName} યાદીમાંથી કાઢ્યા.`,
      deleteErr: `${productName} કાઢી શકાયા નહીં.`,
      adjustErr: `${productName}નો સ્ટૉક અપડેટ ન થઈ શક્યો.`,
      updated:   `${productName}ની વિગતો અપડેટ થઈ.`
    },
    'kn-IN': {
      restocked: `${productName}ಗೆ ${qty} ${unit} ಸೇರಿಸಲಾಗಿದೆ.`,
      sold:      `${productName}ನ ${qty} ${unit} ಮಾರಾಟವಾಗಿದೆ.`,
      deleted:   `${productName} ಪಟ್ಟಿಯಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ.`,
      deleteErr: `${productName} ತೆಗೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.`,
      adjustErr: `${productName} ಸ್ಟಾಕ್ ಅಪ್‌ಡೇಟ್ ಆಗಲಿಲ್ಲ.`,
      updated:   `${productName} ವಿವರಗಳನ್ನು ನವೀಕರಿಸಲಾಗಿದೆ.`
    },
    'ml-IN': {
      restocked: `${productName}-ൽ ${qty} ${unit} ചേർത്തു.`,
      sold:      `${productName}-ന്റെ ${qty} ${unit} വിറ്റു.`,
      deleted:   `${productName} ലിസ്റ്റിൽ നിന്ന് നീക്കി.`,
      deleteErr: `${productName} നീക്കാൻ കഴിഞ്ഞില്ല.`,
      adjustErr: `${productName}-ന്റെ സ്റ്റോക്ക് അപ്‌ഡേറ്റ് ആയില്ല.`,
      updated:   `${productName}-ന്റെ വിവരങ്ങൾ അപ്‌ഡേറ്റുചെയ്‌തു.`
    },
    'pa-IN': {
      restocked: `${productName} ਵਿੱਚ ${qty} ${unit} ਜੋੜਿਆ ਗਿਆ।`,
      sold:      `${productName} ਦੇ ${qty} ${unit} ਵਿਕੇ ਅਤੇ ਦਰਜ ਹੋਏ।`,
      deleted:   `${productName} ਸੂਚੀ ਵਿੱਚੋਂ ਹਟਾਇਆ ਗਿਆ।`,
      deleteErr: `${productName} ਨੂੰ ਹਟਾਉਣਾ ਸੰਭਵ ਨਹੀਂ ਹੋਇਆ।`,
      adjustErr: `${productName} ਦਾ ਸਟਾਕ ਅਪਡੇਟ ਨਹੀਂ ਹੋਇਆ।`,
      updated:   `${productName} ਦਾ ਵੇਰਵਾ ਅਪਡੇਟ ਕੀਤਾ ਗਿਆ।`
    },
    'or-IN': {
      restocked: `${productName}ରେ ${qty} ${unit} ଯୋଡ଼ା ହୋଇଛି।`,
      sold:      `${productName}ର ${qty} ${unit} ବିକ୍ରି ହୋଇଛି।`,
      deleted:   `${productName} ତାଲିକାରୁ ହଟାଯାଇଛି।`,
      deleteErr: `${productName} ହଟାଯାଇ ପାରିଲା ନାହିଁ।`,
      adjustErr: `${productName}ର ଷ୍ଟକ୍ ଅପଡେଟ ହୋଇ ପାରିଲା ନାହିଁ।`,
      updated:   `${productName} ବିବରଣୀ ଅପଡେଟ ହୋଇଛି।`
    }
  };
  const langMap = map[lang] || map['en-IN'];
  return langMap[action] || map['en-IN'][action];
}

export default function ProductCard({ item, onStockUpdated, onDeleted, language = 'en-IN' }) {
  const { t, isStaff } = useAuth();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [adjustQty, setAdjustQty] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isVoiceAdjusting, setIsVoiceAdjusting] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Edit state for Shop Owner
  const [editForm, setEditForm] = useState({
    name: '',
    default_unit: '',
    selling_price: '',
    purchase_price: '',
    min_stock_threshold: '',
    image_url: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [isListeningName, setIsListeningName] = useState(false);

  // Normalise product shape
  const product = {
    id:                  item.product_id   || item.id,
    name:                item.product_name || item.name,
    category:            item.product_category || item.category || 'General',
    base_unit:           item.base_unit    || 'kg',
    default_unit:        item.default_unit || item.base_unit || 'kg',
    unit_size:           item.unit_size,
    purchase_price:      item.purchase_price  || 0,
    selling_price:       item.selling_price   || 0,
    min_stock_threshold: item.min_stock_threshold || 10,
    regional_names:      item.regional_names  || [],
    image_url:           item.image_url || item.product?.image_url || getDefaultImageForCategory(item.product_category || item.category, item.product_name || item.name)
  };

  const currentBase = parseFloat(item.current_stock_base ?? 0);
  const statusKey   = item.status || 'in_stock';
  const statusCfg   = STATUS_CONFIG[statusKey] || STATUS_CONFIG.in_stock;
  const defaultUnit = product.default_unit;

  const aliases = Array.isArray(product.regional_names)
    ? product.regional_names
    : (() => { try { return JSON.parse(product.regional_names || '[]'); } catch { return []; } })();

  // 🔊 Hear stock information
  const handleHearStock = () => {
    const dispName = localizeEntity(product.name, language);
    const stockDisplay = item.current_stock_display || `${currentBase} ${product.base_unit}`;
    const statusMsg = t(statusCfg.labelKey);

    const speechText = language === 'hi-IN'
      ? `${dispName}। स्टॉक: ${stockDisplay}। कीमत: ₹${product.selling_price} प्रति ${product.base_unit}। स्थिति: ${statusMsg}।`
      : language === 'te-IN'
      ? `${dispName}। నిల్వ: ${stockDisplay}। ధర: ₹${product.selling_price} ప్రతి ${product.base_unit}కి। స్థితి: ${statusMsg}।`
      : `${dispName}. Current stock: ${stockDisplay}. Price: ₹${product.selling_price} per ${product.base_unit}. Status: ${statusMsg}.`;

    speakAudio(speechText, language);
  };

  // 🎙️ Voice Quick Adjust on Card
  const handleVoiceAdjust = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language || 'en-IN';
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsVoiceAdjusting(true);
    };

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript.toLowerCase();
      // Simple parse for number and action
      let qty = 1;
      const numMatch = text.match(/\d+/);
      if (numMatch) qty = parseInt(numMatch[0]);

      if (text.includes('add') || text.includes('restock') || text.includes('जोड़ो') || text.includes('చేర్చు')) {
        handleQuickAdjust('IN', qty);
      } else if (text.includes('sell') || text.includes('sold') || text.includes('बेचा') || text.includes('అమ్ము')) {
        handleQuickAdjust('OUT', qty);
      } else {
        // Default restock
        handleQuickAdjust('IN', qty);
      }
    };

    recognition.onerror = () => {
      setIsVoiceAdjusting(false);
    };

    recognition.onend = () => {
      setIsVoiceAdjusting(false);
    };

    recognition.start();
  };

  const handleQuickAdjust = async (type, customQty = null) => {
    if (loading) return;
    const qtyToUse = customQty !== null ? customQty : adjustQty;
    setLoading(true);
    try {
      const res = await inventoryAPI.quickAdjust(product.id, type, qtyToUse, defaultUnit);
      if (res.data.success) {
        const feedback = getVoiceFeedback(language, type === 'IN' ? 'restocked' : 'sold', qtyToUse, defaultUnit, localizeEntity(product.name, language));
        speakAudio(feedback, language);
        if (onStockUpdated) onStockUpdated(res.data);
      } else {
        speakAudio(getVoiceFeedback(language, 'adjustErr', qtyToUse, defaultUnit, localizeEntity(product.name, language)), language);
      }
    } catch (err) {
      console.error('Quick adjust error:', err);
      speakAudio(getVoiceFeedback(language, 'adjustErr', qtyToUse, defaultUnit, localizeEntity(product.name, language)), language);
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Edit Modal Handlers (Shop Owner only)
  const openEditModal = () => {
    setEditForm({
      name: product.name,
      default_unit: product.default_unit,
      selling_price: product.selling_price,
      purchase_price: product.purchase_price,
      min_stock_threshold: product.min_stock_threshold,
      image_url: product.image_url || ''
    });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    try {
      const payload = {
        name: editForm.name.trim(),
        default_unit: editForm.default_unit,
        selling_price: parseFloat(editForm.selling_price) || 0,
        purchase_price: parseFloat(editForm.purchase_price) || 0,
        min_stock_threshold: parseFloat(editForm.min_stock_threshold) || 10,
        image_url: editForm.image_url.trim() || null
      };
      const res = await productAPI.updateProduct(product.id, payload);
      if (res.data.success) {
        speakAudio(getVoiceFeedback(language, 'updated', 0, '', localizeEntity(payload.name, language)), language);
        setIsEditModalOpen(false);
        if (onStockUpdated) onStockUpdated(res.data);
      }
    } catch (err) {
      console.error('Failed to update product:', err);
      alert('Error saving product changes.');
    } finally {
      setSavingEdit(false);
    }
  };

  // 🎙️ Voice input for product name in Edit modal
  const startEditVoiceName = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = language || 'en-IN';
    recognition.continuous = false;

    recognition.onstart = () => setIsListeningName(true);
    recognition.onresult = (e) => {
      const spoken = e.results[0][0].transcript;
      setEditForm(prev => ({ ...prev, name: spoken }));
    };
    recognition.onerror = () => setIsListeningName(false);
    recognition.onend = () => setIsListeningName(false);

    recognition.start();
  };

  // 🗑️ Delete Handler (Shop Owner only)
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await productAPI.deleteProduct(product.id);
      if (res.data.success) {
        speakAudio(getVoiceFeedback(language, 'deleted', 0, '', localizeEntity(product.name, language)), language);
        if (onDeleted) onDeleted(product.id);
      } else {
        speakAudio(getVoiceFeedback(language, 'deleteErr', 0, '', localizeEntity(product.name, language)), language);
        setConfirmDelete(false);
      }
    } catch (err) {
      console.error('Delete error:', err);
      speakAudio(getVoiceFeedback(language, 'deleteErr', 0, '', localizeEntity(product.name, language)), language);
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const displayImage = !imageError && product.image_url
    ? product.image_url
    : getDefaultImageForCategory(product.category, product.name);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group">
      
      {/* ── Product Picture & Top Controls ── */}
      <div className="relative w-full h-36 sm:h-40 bg-slate-100 overflow-hidden">
        <img
          src={displayImage}
          alt={product.name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Gradient Overlay for badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm">
            {product.category || 'General'}
          </span>
        </div>

        {/* Action icons on top right: Hear Stock & Owner Controls */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          {/* 🔊 Hear Stock Information Button */}
          <button
            onClick={handleHearStock}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-slate-800 hover:bg-white hover:text-orange-600 shadow-md flex items-center justify-center transition-transform active:scale-90"
            title="Hear stock information"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* 🎙️ Quick Voice Action on Card */}
          <button
            onClick={handleVoiceAdjust}
            className={`w-8 h-8 rounded-full backdrop-blur-md shadow-md flex items-center justify-center transition-all ${
              isVoiceAdjusting
                ? 'bg-rose-500 text-white animate-pulse scale-110'
                : 'bg-white/90 text-slate-800 hover:bg-white hover:text-orange-600'
            }`}
            title="Say quantity (e.g. 'Add 2' or 'Sell 1')"
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* 👤 Owner Only: ✏️ Edit Button */}
          {!isStaff && (
            <button
              onClick={openEditModal}
              className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-md text-slate-700 hover:bg-white hover:text-blue-600 shadow-md flex items-center justify-center transition-transform active:scale-90"
              title="Edit product details"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* 👤 Owner Only: 🗑️ Delete Button */}
          {!isStaff && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className={`w-8 h-8 rounded-full backdrop-blur-md shadow-md flex items-center justify-center transition-all ${
                confirmDelete
                  ? 'bg-rose-600 text-white animate-pulse scale-110'
                  : 'bg-white/90 text-slate-700 hover:bg-white hover:text-rose-600'
              }`}
              title={confirmDelete ? 'Click again to confirm delete' : 'Delete product'}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Product Title on Banner Bottom */}
        <div className="absolute bottom-2.5 left-3 right-3 z-10 flex items-baseline justify-between text-white">
          <h3 className="font-black text-base sm:text-lg tracking-tight truncate drop-shadow-md">
            {localizeEntity(product.name, language)}
          </h3>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold backdrop-blur-md border shadow-sm ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
            <span>{t(statusCfg.labelKey)}</span>
          </span>
        </div>
      </div>

      {/* ── Details & Stock Stats ── */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Two-Tap Delete Warning */}
          {confirmDelete && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-2 text-center text-xs font-bold text-rose-700 mb-2 animate-fade-in flex items-center justify-between">
              <span>⚠️ Tap 🗑 again to confirm</span>
              <button
                onClick={() => setConfirmDelete(false)}
                className="underline text-[11px] text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Aliases */}
          {aliases.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {aliases.slice(0, 3).map((alias, idx) => (
                <span
                  key={idx}
                  className="bg-slate-100 text-slate-600 text-[10px] font-semibold px-2 py-0.5 rounded-md"
                >
                  {alias}
                </span>
              ))}
            </div>
          )}

          {/* Metrics Pill Grid */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-xs text-slate-500 font-medium">{t('inStock')}:</span>
              <span className="text-base font-extrabold text-slate-900">
                {item.current_stock_display || `${currentBase} ${product.base_unit}`}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
              <span>
                Price: <strong className="text-slate-900 font-black">₹{product.selling_price}/{product.base_unit}</strong>
              </span>
              <span className="text-[11px] text-slate-400">
                Min: {product.min_stock_threshold} {product.base_unit}
              </span>
            </div>
          </div>
        </div>

        {/* ── Quick Action Bar (Staff & Owner) ── */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
          {/* Quantity Stepper */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-semibold">
              Qty ({defaultUnit})
            </span>
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-0.5 border border-slate-200">
              <button
                onClick={() => setAdjustQty(q => Math.max(1, q - 1))}
                className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center shadow-xs"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <span className="w-8 text-center text-xs font-black text-slate-900">{adjustQty}</span>
              <button
                onClick={() => setAdjustQty(q => q + 1)}
                className="w-6 h-6 rounded-lg bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center shadow-xs"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action Buttons (+ / -) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickAdjust('OUT')}
              disabled={loading || currentBase <= 0}
              className="flex-1 flex items-center justify-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 disabled:opacity-40 font-black px-3 py-2 rounded-xl text-xs transition-all border border-rose-200"
            >
              <Minus className="w-3.5 h-3.5" />
              <span>{t('sellUnit')}</span>
            </button>

            <button
              onClick={() => handleQuickAdjust('IN')}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black px-3 py-2 rounded-xl text-xs transition-all border border-emerald-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('restockUnit')}</span>
            </button>
          </div>

          {loading && (
            <div className="text-center text-[10px] text-orange-500 font-bold animate-pulse">
              Updating stock...
            </div>
          )}
        </div>
      </div>

      {/* ── Edit Product Modal (Shop Owner only) ── */}
      {isEditModalOpen && !isStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-orange-400" />
                <span>Edit Product Details</span>
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Product Photo Preview & Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  📷 Product Photo URL
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                    <img
                      src={editForm.image_url || getDefaultImageForCategory(product.category, editForm.name)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="url"
                    value={editForm.image_url}
                    onChange={(e) => setEditForm({ ...editForm, image_url: e.target.value })}
                    placeholder="https://... image link"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                {/* Quick Preset Selector */}
                <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1">
                  {PRESET_PRODUCT_IMAGES.slice(0, 6).map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, image_url: preset.url })}
                      className="text-[10px] bg-slate-100 hover:bg-orange-50 text-slate-700 px-2 py-1 rounded-lg font-bold whitespace-nowrap border border-slate-200"
                    >
                      {preset.label.split('/')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Name with 🎙️ Voice Mic */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  🎙️ Product Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-10 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={startEditVoiceName}
                    className={`absolute right-2 top-2 p-1.5 rounded-lg transition-all ${
                      isListeningName
                        ? 'bg-rose-500 text-white animate-pulse'
                        : 'text-slate-400 hover:text-orange-500'
                    }`}
                    title="Speak product name"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Units & Pricing */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    📦 Trade Unit
                  </label>
                  <select
                    value={editForm.default_unit}
                    onChange={(e) => setEditForm({ ...editForm, default_unit: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="bori">Bori / Bag</option>
                    <option value="peti">Peti / Carton</option>
                    <option value="packet">Packet</option>
                    <option value="dozen">Dozen</option>
                    <option value="quintal">Quintal</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="litre">Litre (L)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    💰 Selling Price (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.selling_price}
                    onChange={(e) => setEditForm({ ...editForm, selling_price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Min Stock Level */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    ⚠️ Low Stock Limit ({product.base_unit})
                  </label>
                  <input
                    type="number"
                    value={editForm.min_stock_threshold}
                    onChange={(e) => setEditForm({ ...editForm, min_stock_threshold: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Purchase Price (₹)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={editForm.purchase_price}
                    onChange={(e) => setEditForm({ ...editForm, purchase_price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2 rounded-xl text-xs shadow-md shadow-orange-500/30"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
