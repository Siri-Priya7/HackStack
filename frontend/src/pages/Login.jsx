import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, Phone, Lock, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

export default function Login({ onSwitchToRegister }) {
  const { login, loading } = useAuth();
  const [phone, setPhone] = useState('9876543210');
  const [password, setPassword] = useState('kirana123');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const res = await login(phone, password);
    if (!res.success) {
      setError(res.error);
    }
  };

  const handleQuickDemo = async () => {
    setPhone('9876543210');
    setPassword('kirana123');
    setError(null);
    await login('9876543210', 'kirana123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-slate-50 to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-200 p-8 space-y-6">
        
        {/* Logo & Store Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
            <Store className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Voice Inventory
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            आवाज से चलने वाली आसान इन्वेंटरी (Kirana Management)
          </p>
        </div>

        {/* 1-Click Demo Evaluation Button */}
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-center space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-orange-800 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Hackathon Judge / Instant Test Access</span>
          </span>
          <button
            type="button"
            onClick={handleQuickDemo}
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-md shadow-orange-500/25 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Login as Demo Store (Ramesh Sharma)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-rose-50 text-rose-700 text-xs font-semibold p-3 rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone Number (मोबाइल नंबर)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password (पासवर्ड)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-xs transition-colors shadow-sm"
          >
            {loading ? 'Logging in...' : 'Login to Store (लॉगिन करें)'}
          </button>
        </form>

        {/* Switch to Register */}
        <div className="text-center pt-2 text-xs text-slate-500">
          <span>नया खाता खोलना है? </span>
          <button
            onClick={onSwitchToRegister}
            className="font-bold text-orange-600 hover:underline"
          >
            Register New Store
          </button>
        </div>
      </div>
    </div>
  );
}
