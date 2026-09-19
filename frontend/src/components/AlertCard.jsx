import React, { useState } from 'react';
import { AlertTriangle, ShoppingCart, Check, ArrowRight } from 'lucide-react';
import { inventoryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { localizeEntity } from '../utils/transliterate';

export default function AlertCard({ alert, onResolved, language = 'hi-IN' }) {
  const { t } = useAuth();
  const [ordering, setOrdering] = useState(false);
  const [ordered, setOrdered] = useState(false);

  const isCritical = alert.alertType === 'OUT_OF_STOCK' || alert.severity === 'critical';

  const handleQuickRestock = async () => {
    if (!alert.productId) return;
    setOrdering(true);
    try {
      // Execute restock command via voice/inventory service
      const qty = alert.suggestedQty || alert.suggested_reorder_qty || 2;
      const unit = alert.suggestedUnit || alert.suggested_reorder_unit || 'bori';
      await inventoryAPI.quickAdjust(alert.productId, 'IN', qty, unit);
      setOrdered(true);
      if (onResolved) {
        setTimeout(() => onResolved(alert), 1200);
      }
    } catch (err) {
      console.error('Restock error:', err);
    } finally {
      setOrdering(false);
    }
  };

  return (
    <div className={`rounded-2xl border p-4 transition-all ${
      isCritical 
        ? 'bg-rose-50/70 border-rose-200' 
        : 'bg-amber-50/70 border-amber-200'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-xl mt-0.5 ${
            isCritical ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-slate-900 text-base">
                {localizeEntity(alert.productName, language) || alert.message}
              </h4>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                isCritical ? 'bg-rose-200 text-rose-800' : 'bg-amber-200 text-amber-800'
              }`}>
                {isCritical ? t('outOfStock') : t('lowStock')}
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-1 font-medium">
              {alert.message}
            </p>

            {alert.suggestionText && (
              <div className="mt-2 text-xs font-bold text-slate-800 bg-white/80 border border-slate-200/60 rounded-lg px-2.5 py-1.5 inline-flex items-center gap-1.5">
                <span className="text-orange-600">💡 {t('suggestedReorder') || 'Reorder'}:</span>
                <span>{alert.suggestionText}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div>
          {ordered ? (
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-100 font-bold px-3 py-1.5 rounded-xl text-xs">
              <Check className="w-4 h-4" />
              <span>{t('ordered')}</span>
            </span>
          ) : (
            <button
              onClick={handleQuickRestock}
              disabled={ordering}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition-colors shadow-sm"
            >
              <ShoppingCart className="w-3.5 h-3.5 text-orange-400" />
              <span>
                {ordering 
                  ? '...' 
                  : t('quickReorder')}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
