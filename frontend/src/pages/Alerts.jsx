import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventoryAPI } from '../services/api';
import AlertCard from '../components/AlertCard';
import {
  AlertTriangle,
  ShoppingCart,
  CheckCircle,
  Package,
  TrendingDown,
  FileSpreadsheet
} from 'lucide-react';

export default function Alerts() {
  const { language } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAlerts = async () => {
    try {
      const res = await inventoryAPI.getAlerts();
      if (res.data.success) {
        setAlerts(res.data.data.alerts || []);
        setSuggestions(res.data.data.suggestions || []);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const totalEstimatedCost = suggestions.reduce((acc, s) => acc + (s.estimatedCost || 0), 0);

  return (
    <div className="space-y-6 pb-20 md:pb-10 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <AlertTriangle className="w-7 h-7 text-rose-500" />
          <span>{language === 'hi-IN' ? 'स्टॉक अलर्ट और रीऑर्डर लिस्ट' : 'Stock Alerts & Smart Reorder List'}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {language === 'hi-IN'
            ? 'जो सामान खत्म हो रहा है उसकी लिस्ट और मंडी/सप्लायर से क्या मंगवाना है उसका सटीक हिसाब'
            : 'Track items running low and automatically generate supplier restock quantities in trade packaging units'}
        </p>
      </div>

      {/* Procurement Summary Banner */}
      {suggestions.length > 0 && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider">
              {language === 'hi-IN' ? 'मंडी / सप्लायर ऑर्डर लिस्ट' : 'Wholesale Procurement Estimate'}
            </span>
            <h3 className="text-xl sm:text-2xl font-black mt-1">
              {suggestions.length} {language === 'hi-IN' ? 'सामानों का रीऑर्डर जरूरी है' : 'Items need restocking'}
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Estimated wholesale replenishment cost: ₹{totalEstimatedCost.toLocaleString('en-IN')}
            </p>
          </div>

          <div className="text-right">
            <span className="bg-orange-500 text-white font-extrabold text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5 shadow-md shadow-orange-500/30">
              <ShoppingCart className="w-4 h-4" />
              <span>{suggestions.length} Products</span>
            </span>
          </div>
        </div>
      )}

      {/* Active Alerts List */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-900">
          {language === 'hi-IN' ? 'सक्रिय चेतावनियाँ (Active Alerts)' : 'Active Warnings'}
        </h2>

        {loading ? (
          <div className="text-center py-12 text-slate-400 text-sm font-semibold">
            Checking stock levels...
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">
              {language === 'hi-IN' ? 'बधाई! सारा स्टॉक पर्याप्त है' : 'All Stock is Healthy!'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              No products are currently below their minimum threshold limits.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert, idx) => (
              <AlertCard
                key={idx}
                alert={alert}
                onResolved={loadAlerts}
                language={language}
              />
            ))}
          </div>
        )}
      </div>

      {/* Suggested Reorder Breakdown Table */}
      {suggestions.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-orange-500" />
            <span>{language === 'hi-IN' ? 'सप्लायर को भेजने के लिए पर्ची (Wholesale Order Sheet)' : 'Suggested Supplier Order Sheet'}</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-3">Product</th>
                  <th className="py-3 px-3">Remaining</th>
                  <th className="py-3 px-3">Suggested Order</th>
                  <th className="py-3 px-3">Est. Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {suggestions.map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-extrabold text-slate-900">
                      {s.productName}
                    </td>
                    <td className="py-3 px-3 text-rose-600 font-semibold">
                      {s.currentStockDisplay}
                    </td>
                    <td className="py-3 px-3 font-bold text-orange-700">
                      {s.suggestionText}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">
                      ₹{s.estimatedCost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
