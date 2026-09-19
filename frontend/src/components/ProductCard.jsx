import React, { useState } from 'react';
import { Package, AlertCircle, Plus, Minus, Tag, TrendingUp, Check } from 'lucide-react';
import { inventoryAPI } from '../services/api';

export const STATUS_CONFIG = {
  in_stock: {
    label: 'In Stock',
    hiLabel: 'स्टॉक में है',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500'
  },
  low_stock: {
    label: 'Low Stock',
    hiLabel: 'कम स्टॉक',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500'
  },
  out_of_stock: {
    label: 'Out of Stock',
    hiLabel: 'खत्म है',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
    dot: 'bg-rose-500'
  }
};

export default function ProductCard({ item, onStockUpdated, language = 'hi-IN' }) {
  const [loading, setLoading] = useState(false);
  const [adjustQty, setAdjustQty] = useState(1);

  const product = item.product || item;
  const currentBase = parseFloat(item.current_stock_base ?? product.current_stock_base ?? 0);
  const statusKey = item.status || 'in_stock';
  const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.in_stock;

  const defaultUnit = product.default_unit || product.base_unit || 'kg';
  const aliases = Array.isArray(product.regional_names)
    ? product.regional_names
    : typeof product.regional_names === 'string'
    ? JSON.parse(product.regional_names || '[]')
    : [];

  const handleQuickAdjust = async (type) => {
    setLoading(true);
    try {
      const res = await inventoryAPI.quickAdjust(product.id, type, adjustQty, defaultUnit);
      if (res.data.success && onStockUpdated) {
        onStockUpdated(res.data);
      }
    } catch (err) {
      console.error('Quick adjust error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between">
      {/* Top Details & Badges */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {product.category || 'General'}
            </span>
            <h3 className="font-extrabold text-slate-900 text-lg leading-tight mt-0.5">
              {product.name}
            </h3>
          </div>
          
          {/* Status Badge */}
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`}></span>
            <span>{language === 'hi-IN' ? statusCfg.hiLabel : statusCfg.label}</span>
          </span>
        </div>

        {/* Regional Aliases Pills */}
        {aliases.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {aliases.slice(0, 3).map((alias, idx) => (
              <span
                key={idx}
                className="bg-slate-100 text-slate-600 text-[10px] font-medium px-2 py-0.5 rounded-md"
              >
                {alias}
              </span>
            ))}
          </div>
        )}

        {/* Stock Metrics Card */}
        <div className="mt-4 bg-slate-50 border border-slate-100 rounded-xl p-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-500 font-medium">
              {language === 'hi-IN' ? 'उपलब्ध स्टॉक (Available)' : 'Current Stock'}:
            </span>
            <span className="text-base font-extrabold text-slate-900">
              {item.current_stock_display || `${currentBase} ${product.base_unit}`}
            </span>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
            <span>
              {language === 'hi-IN' ? 'बिक्री मूल्य' : 'Price'}:{' '}
              <strong className="text-slate-900">₹{product.selling_price}/{product.base_unit}</strong>
            </span>
            <span className="text-[11px] text-slate-400">
              Min: {product.min_stock_threshold} {product.base_unit}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Bar (+ / - in trade units) */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <span>1 {defaultUnit}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleQuickAdjust('OUT')}
            disabled={loading || currentBase <= 0}
            className="flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 disabled:opacity-40 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors border border-rose-200/80"
            title="Deduct 1 unit"
          >
            <Minus className="w-3.5 h-3.5" />
            <span>{language === 'hi-IN' ? 'बेचा' : 'Sell'}</span>
          </button>

          <button
            onClick={() => handleQuickAdjust('IN')}
            disabled={loading}
            className="flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-1.5 rounded-xl text-xs transition-colors border border-emerald-200/80"
            title="Add 1 unit"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'hi-IN' ? 'आया' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
