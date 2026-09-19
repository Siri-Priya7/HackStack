import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventoryAPI, transactionAPI } from '../services/api';
import StockCard from '../components/StockCard';
import ProductCard from '../components/ProductCard';
import AlertCard from '../components/AlertCard';
import TransactionCard from '../components/TransactionCard';
import VoiceButton from '../components/VoiceButton';
import {
  Package,
  IndianRupee,
  AlertTriangle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
  Volume2
} from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  const { user, language } = useAuth();
  const [summary, setSummary] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [sumRes, invRes, txRes] = await Promise.all([
        inventoryAPI.getSummary(),
        inventoryAPI.getInventory(),
        transactionAPI.getTransactions(5)
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.data);
      if (invRes.data.success) setInventory(invRes.data.data);
      if (txRes.data.success) setTransactions(txRes.data.data);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const activeAlerts = summary?.alerts || [];
  const metrics = summary?.metrics || {
    totalProducts: 0,
    totalStockValue: 0,
    lowStockCount: 0,
    todaySalesAmount: 0
  };

  return (
    <div className="space-y-6 pb-20 md:pb-10 animate-fade-in">
      {/* Hero Store Greeting & Big Voice Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-orange-500/15">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-white mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>{language === 'hi-IN' ? 'नमस्ते' : 'Welcome back'}, {user?.name || 'Shopkeeper'}!</span>
            </span>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {user?.store_name || 'Sharma Kirana Store'}
            </h1>
            <p className="text-orange-100 text-xs sm:text-sm mt-2 leading-relaxed">
              {language === 'hi-IN'
                ? 'माइक दबाकर बोलें — स्टॉक जोड़ें, बेचें या हिसाब पूछें।'
                : 'Manage your Kirana stock completely by voice. Add stock, record sales, and check balances without typing.'}
            </p>
          </div>

          {/* Large Voice Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <VoiceButton
              onCommandSuccess={loadData}
              className="w-full sm:w-auto bg-white text-orange-600 hover:bg-orange-50 font-black shadow-xl"
            />
          </div>
        </div>

        {/* Spoken Store Summary Bar */}
        {summary?.voiceSummary && (
          <div className="relative z-10 mt-6 pt-5 border-t border-white/20 flex items-start gap-2.5 text-xs text-orange-50 font-medium">
            <Volume2 className="w-4 h-4 text-amber-200 flex-shrink-0 mt-0.5" />
            <p className="italic">
              "{language === 'hi-IN' ? summary.voiceSummary.hindi : summary.voiceSummary.hinglish}"
            </p>
          </div>
        )}

        {/* Decorative Background Circles */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <StockCard
          title={language === 'hi-IN' ? 'कुल सामान' : 'Total Items'}
          value={metrics.totalProducts}
          subtitle={language === 'hi-IN' ? `${metrics.inStockCount || 0} स्टॉक में उपलब्ध` : `${metrics.inStockCount || 0} in good stock`}
          icon={Package}
          color="blue"
          language={language}
        />
        <StockCard
          title={language === 'hi-IN' ? 'कुल स्टॉक मूल्य' : 'Stock Value'}
          value={`₹${metrics.totalStockValue?.toLocaleString('en-IN') || 0}`}
          subtitle={language === 'hi-IN' ? 'अनुमानित बिक्री मूल्य' : 'Estimated retail value'}
          icon={IndianRupee}
          color="emerald"
          language={language}
        />
        <StockCard
          title={language === 'hi-IN' ? 'कम स्टॉक वाले' : 'Low Stock Alerts'}
          value={metrics.lowStockCount + (metrics.outOfStockCount || 0)}
          subtitle={language === 'hi-IN' ? 'तुरंत रीऑर्डर करें' : 'Needs attention'}
          icon={AlertTriangle}
          color="rose"
          language={language}
        />
        <StockCard
          title={language === 'hi-IN' ? 'आज की बिक्री' : "Today's Sales"}
          value={`₹${metrics.todaySalesAmount?.toLocaleString('en-IN') || 0}`}
          subtitle={language === 'hi-IN' ? `${metrics.todaySalesCount || 0} ट्रांजैक्शन आज` : `${metrics.todaySalesCount || 0} sales recorded`}
          icon={TrendingUp}
          color="orange"
          language={language}
        />
      </div>

      {/* Active Alerts Banner */}
      {activeAlerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>{language === 'hi-IN' ? 'स्टॉक अलर्ट (जरूरी सामान)' : 'Urgent Restock Alerts'}</span>
              <span className="bg-rose-100 text-rose-800 text-xs px-2 py-0.5 rounded-full font-bold">
                {activeAlerts.length}
              </span>
            </h2>
            <button
              onClick={() => setActiveTab('alerts')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>{language === 'hi-IN' ? 'सब देखें' : 'View All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeAlerts.slice(0, 2).map((alert, idx) => (
              <AlertCard
                key={idx}
                alert={alert}
                onResolved={loadData}
                language={language}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Inventory Highlights & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Popular Inventory Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-orange-500" />
              <span>{language === 'hi-IN' ? 'दुकान का मुख्य सामान' : 'Stock Overview'}</span>
            </h2>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>{language === 'hi-IN' ? 'पूरी लिस्ट देखें' : 'Full Catalog'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {inventory.slice(0, 4).map((item) => (
              <ProductCard
                key={item.product_id}
                item={item}
                onStockUpdated={loadData}
                language={language}
              />
            ))}
          </div>
        </div>

        {/* Right 1 Col: Recent Voice & Manual Transactions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-900">
              {language === 'hi-IN' ? 'हाल की गतिविधियां' : 'Recent Transactions'}
            </h2>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>{language === 'hi-IN' ? 'पूरा हिसाब' : 'All'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center text-slate-400 text-xs">
                No recent transactions recorded today.
              </div>
            ) : (
              transactions.map((tx) => (
                <TransactionCard
                  key={tx.id}
                  tx={tx}
                  onUndone={loadData}
                  language={language}
                />
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
