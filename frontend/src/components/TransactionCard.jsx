import React, { useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, RotateCcw, Mic, Check } from 'lucide-react';
import { transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { localizeEntity } from '../utils/transliterate';

export default function TransactionCard({ tx, onUndone, language = 'hi-IN' }) {
  const { t, isStaff } = useAuth();
  const [undoing, setUndoing] = useState(false);
  const [undone, setUndone] = useState(false);
  const [confirmUndo, setConfirmUndo] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const isAdd = tx.type === 'IN';

  const handleUndo = async () => {
    if (!confirmUndo) {
      setConfirmUndo(true);
      return;
    }
    setUndoing(true);
    setErrorMsg(null);
    try {
      const res = await transactionAPI.undoTransaction(tx.id);
      if (res.data.success) {
        setUndone(true);
        setConfirmUndo(false);
        if (onUndone) {
          setTimeout(() => onUndone(tx.id), 800);
        }
      }
    } catch (err) {
      console.error('Undo error:', err);
      setErrorMsg(err.response?.data?.error || 'Could not undo transaction.');
      setConfirmUndo(false);
      setTimeout(() => setErrorMsg(null), 3500);
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
              {localizeEntity(tx.product_name, language) || 'Item'}
            </h4>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
              isAdd ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {isAdd ? t('inStock') : t('todaySales')}
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

        {!undone && !isStaff && (
          <div className="mt-1 flex items-center gap-1.5">
            {confirmUndo ? (
              <div className="flex items-center gap-1.5 animate-fade-in">
                <button
                  onClick={handleUndo}
                  disabled={undoing}
                  className="px-2 py-0.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-bold shadow-sm"
                >
                  {undoing ? '...' : 'Confirm?'}
                </button>
                <button
                  onClick={() => setConfirmUndo(false)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 font-medium"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={handleUndo}
                disabled={undoing}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-rose-600 transition-colors"
                title="Undo this transaction"
              >
                <RotateCcw className="w-3 h-3" />
                <span>{undoing ? '...' : t('undo')}</span>
              </button>
            )}
          </div>
        )}

        {errorMsg && (
          <p className="text-[10px] text-rose-500 font-semibold mt-1 animate-fade-in">
            {errorMsg}
          </p>
        )}
      </div>
    </div>
  );
}
