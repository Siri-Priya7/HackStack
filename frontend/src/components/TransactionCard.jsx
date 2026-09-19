import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, RotateCcw, Mic, Check } from 'lucide-react';
import { transactionAPI } from '../services/api';

export default function TransactionCard({ tx, onUndone, language = 'hi-IN' }) {
  const [undoing, setUndoing] = useState(false);
  const [undone, setUndone] = useState(false);

  const isAdd = tx.type === 'IN';

  const handleUndo = async () => {
    if (!window.confirm(language === 'hi-IN' ? 'क्या आप इस एंट्री को वापस (Undo) करना चाहते हैं?' : 'Undo this stock transaction?')) {
      return;
    }
    setUndoing(true);
    try {
      const res = await transactionAPI.undoTransaction(tx.id);
      if (res.data.success) {
        setUndone(true);
        if (onUndone) {
          setTimeout(() => onUndone(tx.id), 800);
        }
      }
    } catch (err) {
      console.error('Undo error:', err);
      alert(err.response?.data?.error || 'Could not undo transaction.');
    } finally {
      setUndoing(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow transition-all flex items-center justify-between gap-4 ${undone ? 'opacity-40 line-through' : ''}`}>
      {/* Icon & Details */}
      <div className="flex items-center gap-3.5">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isAdd ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
        }`}>
          {isAdd ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-extrabold text-slate-900 text-sm">
              {tx.product_name || 'Item'}
            </h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              isAdd ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {isAdd ? (language === 'hi-IN' ? 'स्टॉक आया' : 'Restock') : (language === 'hi-IN' ? 'बिका' : 'Sold')}
            </span>
          </div>

          {/* Voice Spoken Transcript Badge */}
          {tx.voice_transcript && (
            <div className="flex items-center gap-1 text-slate-600 text-xs font-medium mt-1">
              <Mic className="w-3 h-3 text-orange-500" />
              <span className="italic text-slate-700">"{tx.voice_transcript}"</span>
            </div>
          )}

          <p className="text-[11px] text-slate-400 mt-1">
            {formatDate(tx.created_at)}
          </p>
        </div>
      </div>

      {/* Quantities & Undo Action */}
      <div className="text-right flex flex-col items-end">
        <div className={`text-base font-black ${isAdd ? 'text-emerald-700' : 'text-slate-900'}`}>
          {isAdd ? '+' : '-'}{tx.quantity} {tx.unit}
        </div>
        
        {tx.total_amount > 0 && (
          <span className="text-xs font-semibold text-slate-500">
            ₹{Math.round(tx.total_amount)}
          </span>
        )}

        {!undone && (
          <button
            onClick={handleUndo}
            disabled={undoing}
            className="mt-1 flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors"
            title="Undo this transaction"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{undoing ? '...' : (language === 'hi-IN' ? 'वापस लें' : 'Undo')}</span>
          </button>
        )}
      </div>
    </div>
  );
}
