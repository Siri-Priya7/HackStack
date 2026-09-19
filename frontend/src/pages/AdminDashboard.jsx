import React, { useState, useEffect } from 'react';
import { shopAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Store,
  Users,
  TrendingUp,
  Package,
  Search,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
  MapPin,
  Phone,
  Layers,
  Volume2
} from 'lucide-react';
import { speakText as speakAudio } from '../utils/speechService';
import { localizeEntity } from '../utils/transliterate';

export default function AdminDashboard() {
  const { user, language, t } = useAuth();
  const [stats, setStats] = useState(null);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadAdminData = async () => {
    try {
      const [statsRes, shopsRes] = await Promise.all([
        shopAPI.getPlatformStats(),
        shopAPI.getAllShops()
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (shopsRes.data.success) setShops(shopsRes.data.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleStatus = async (shopId, currentStatus) => {
    setUpdatingId(shopId);
    const targetShop = shops.find(s => s.id === shopId);
    const shopName = targetShop?.name || 'Shop';
    try {
      const res = await shopAPI.toggleShopStatus(shopId, !currentStatus);
      if (res.data.success) {
        const newStatus = !currentStatus ? 1 : 0;
        setShops(prev => prev.map(s => s.id === shopId ? { ...s, is_active: newStatus } : s));
        const statusMsg = language === 'hi-IN'
          ? (newStatus ? `${shopName} अब सक्रिय है।` : `${shopName} को निलंबित कर दिया गया है।`)
          : (newStatus ? `${shopName} is now active.` : `${shopName} has been suspended.`);
        speakAudio(statusMsg, language);
      }
    } catch (err) {
      console.error('Error toggling shop status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const speakPlatformOverview = () => {
    const totalShops = stats?.totalShops || shops.length || 0;
    const activeShops = stats?.activeShops || shops.filter(s => s.is_active).length || 0;
    const txCount = stats?.totalTransactions || 0;
    const msg = language === 'hi-IN'
      ? `प्लेटफॉर्म अवलोकन: कुल ${totalShops} पंजीकृत दुकानें, ${activeShops} सक्रिय, और कुल ${txCount} लेनदेन दर्ज हुए हैं।`
      : `Platform Admin overview: Total ${totalShops} registered shops, ${activeShops} currently active, with ${txCount} total transactions recorded.`;
    speakAudio(msg, language);
  };

  const filteredShops = shops.filter(s => {
    const term = searchTerm.toLowerCase();
    return (
      (s.name || '').toLowerCase().includes(term) ||
      (s.city || '').toLowerCase().includes(term) ||
      (s.owner_phone || '').includes(term) ||
      (s.owner_name || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 pb-20 md:pb-10 animate-fade-in max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 bg-purple-500/30 border border-purple-400/30 px-3 py-1 rounded-full text-xs font-black text-purple-200 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
            <span>{t('adminConsole')}</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {t('adminConsole')}
          </h1>
          <p className="text-xs sm:text-sm text-purple-200 mt-1">
            {t('adminSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={speakPlatformOverview}
            className="bg-purple-600/80 hover:bg-purple-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-purple-400/40 shadow-sm transition-all flex items-center gap-1.5"
            title="Listen to platform overview"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Speak Overview</span>
          </button>

          <button
            onClick={loadAdminData}
            className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('refresh')}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">{t('totalShops')}</span>
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {stats?.totalShops || shops.length}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">Active tenants</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">{t('totalUsers')}</span>
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {stats?.totalUsers || 0}
          </div>
          <span className="text-[11px] font-semibold text-slate-400">Owners & staff combined</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">{t('transactions')}</span>
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {stats?.totalTransactions || 0}
          </div>
          <span className="text-[11px] font-semibold text-purple-600">Voice & manual ledger</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Platform Volume</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{Math.round(stats?.totalRevenue || 0).toLocaleString('en-IN')}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">Total recorded sales</span>
        </div>
      </div>

      {/* Shops Directory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Header & Search */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900">
              {t('shopsDirectory')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('shopsDirectorySub')}
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search shops by name, city, phone..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Shop ID & Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Owner Contact</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4 text-center">Products</th>
                <th className="py-3 px-4 text-center">Users</th>
                <th className="py-3 px-4 text-center">Txns</th>
                <th className="py-3 px-4 text-right">Status / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredShops.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-400 font-semibold">
                    No shops found matching your search.
                  </td>
                </tr>
              ) : (
                filteredShops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 font-black flex items-center justify-center text-[10px]">
                          #{shop.id}
                        </span>
                        <div>
                          <div className="font-extrabold text-slate-900 text-sm">{localizeEntity(shop.name, language)}</div>
                          <div className="text-[10px] text-slate-400">Created: {new Date(shop.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span>{localizeEntity(shop.city, language) || 'India'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{localizeEntity(shop.address, language)}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800">{localizeEntity(shop.owner_name, language) || 'Owner'}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>+91 {shop.owner_phone}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[11px]">
                        {shop.preferred_language || 'hi-IN'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-extrabold text-slate-700">
                      {shop.product_count || 0}
                    </td>

                    <td className="py-3.5 px-4 text-center font-extrabold text-slate-700">
                      {shop.user_count || 1}
                    </td>

                    <td className="py-3.5 px-4 text-center font-extrabold text-slate-700">
                      {shop.transaction_count || 0}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(shop.id, shop.is_active)}
                        disabled={updatingId === shop.id}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                          shop.is_active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800'
                            : 'bg-rose-100 text-rose-800 hover:bg-emerald-100 hover:text-emerald-800'
                        }`}
                        title="Click to toggle shop active/suspended state"
                      >
                        {shop.is_active ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{t('active')}</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>{t('suspended')}</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
