import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../services/api';
import TransactionCard from '../components/TransactionCard';
import { History, ArrowDownLeft, ArrowUpRight, RotateCcw, Filter } from 'lucide-react';

export default function Transactions() {
  const { language } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  const loadTransactions = async () => {
    try {
      const res = await transactionAPI.getTransactions(100);
      if (res.data.success) {
        setTransactions(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filtered = transactions.filter((tx) => {
    if (filterType === 'IN') return tx.type === 'IN';
    if (filterType === 'OUT') return tx.type === 'OUT';
    return true;
  });

  return (
    <div className="space-y-6 pb-20 md:pb-10 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-7 h-7 text-orange-500" />
            <span>{language === 'hi-IN' ? 'हिसाब-किताब और लेन-देन' : 'Transaction History & Audit Log'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'hi-IN'
              ? 'आवाज से और मैन्युअल रूप से जोड़े गए सभी स्टॉक का पूरा ब्योरा'
              : 'Complete ledger of all voice and manual stock additions, sales, and corrections'}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1 rounded-2xl shadow-sm">
          {[
            { id: 'ALL', label: language === 'hi-IN' ? 'सभी (All)' : 'All' },
            { id: 'IN', label: language === 'hi-IN' ? 'स्टॉक आया (+)' : 'Restock (+)' },
            { id: 'OUT', label: language === 'hi-IN' ? 'बिक्री (-)' : 'Sales (-)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                filterType === tab.id
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transaction List */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm font-semibold">
          Loading transaction ledger...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            {language === 'hi-IN' ? 'कोई लेन-देन नहीं मिला' : 'No transactions recorded yet'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Speak a command like "5 bori chawal add karo" to see your first entry here!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((tx) => (
            <TransactionCard
              key={tx.id}
              tx={tx}
              onUndone={loadTransactions}
              language={language}
            />
          ))}
        </div>
      )}
    </div>
  );
}
