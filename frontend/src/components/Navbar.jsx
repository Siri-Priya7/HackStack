import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Store, Mic, Package, AlertTriangle, History,
  Globe, LogOut, User as UserIcon, ShieldCheck, Users
} from 'lucide-react';
import { localizeEntity } from '../utils/transliterate';

export default function Navbar({ activeTab, setActiveTab, onGoHome }) {
  const { user, language, setLanguage, logout, t, supportedLanguages, isAdmin, isOwner, isStaff } = useAuth();

  const navItems = isAdmin
    ? [{ id: 'admin-dashboard', label: 'Platform', icon: ShieldCheck, highlight: true }]
    : isStaff
    ? [
        { id: 'dashboard',     label: t('dashboard'),       icon: Store },
        { id: 'voice',         label: t('voiceAssistant'),  icon: Mic,    highlight: true },
        { id: 'inventory',     label: t('inventory'),       icon: Package },
        { id: 'transactions',  label: t('transactions'),    icon: History }
      ]
    : [
        { id: 'dashboard',    label: t('dashboard'),       icon: Store },
        { id: 'voice',        label: t('voiceAssistant'),  icon: Mic,    highlight: true },
        { id: 'inventory',    label: t('inventory'),       icon: Package },
        { id: 'alerts',       label: t('alerts'),          icon: AlertTriangle },
        { id: 'transactions', label: t('transactions'),    icon: History },
        { id: 'staff',        label: t('staff'),           icon: Users }
      ];

  const roleBadge = isAdmin
    ? { label: 'Admin',  cls: 'bg-purple-100 text-purple-800 border-purple-200' }
    : isStaff
    ? { label: 'Staff',  cls: 'bg-blue-100   text-blue-800   border-blue-200'   }
    : { label: 'Owner',  cls: 'bg-orange-100 text-orange-800 border-orange-200' };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">

          {/* ── Brand ── */}
          <button
            className="flex items-center gap-2.5 min-w-0 flex-shrink-0"
            onClick={() => setActiveTab(isAdmin ? 'admin-dashboard' : 'dashboard')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25 flex-shrink-0">
              {isAdmin ? <ShieldCheck className="w-5 h-5" /> : <Store className="w-5 h-5" />}
            </div>
            <div className="hidden sm:block min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-sm sm:text-base truncate max-w-[160px]">
                  {isAdmin ? 'Central Admin' : (localizeEntity(user?.store_name, language) || 'Apna Kirana')}
                </span>
                <span className={`badge border ${roleBadge.cls} hidden md:inline-flex`}>
                  {roleBadge.label}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-none mt-0.5 hidden lg:block">
                {isAdmin ? 'Platform Management' : (localizeEntity(user?.shop_city, language) || t('subtitle'))}
              </p>
            </div>
          </button>

          {/* ── Desktop Nav ── */}
          <nav className="hidden md:flex items-center gap-0.5 flex-1 justify-center">
            {navItems.map(({ id, label, icon: Icon, highlight }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    highlight
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30 hover:bg-orange-600'
                      : active
                      ? 'bg-orange-50 text-orange-600'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${highlight ? 'text-white' : active ? 'text-orange-500' : 'text-slate-400'}`} />
                  <span>{label}</span>
                </button>
              );
            })}
          </nav>

          {/* ── Right Controls ── */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Language picker */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl px-2 py-1.5 border border-slate-200">
              <Globe className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer max-w-[72px] sm:max-w-none"
              >
                {supportedLanguages.map(l => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </div>

            {/* User pill — desktop only */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold">
              <UserIcon className="w-3.5 h-3.5" />
              <span className="max-w-[80px] truncate">{localizeEntity(user?.name, language)?.split(' ')[0] || 'User'}</span>
            </div>

            {/* Logout */}
            <button
              onClick={() => { logout(); if (onGoHome) onGoHome(); }}
              className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <div className="md:hidden mobile-nav fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-end justify-around px-1 pt-1 pb-1">
          {navItems.map(({ id, label, icon: Icon, highlight }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all flex-1 max-w-[72px] ${
                  highlight
                    ? 'text-white bg-orange-500 -mt-4 rounded-2xl shadow-lg shadow-orange-500/40 border-2 border-white px-3 py-2.5'
                    : active
                    ? 'text-orange-600'
                    : 'text-slate-400'
                }`}
              >
                <Icon className={highlight ? 'w-6 h-6' : 'w-5 h-5'} />
                {!highlight && (
                  <span className="text-[9px] font-bold leading-tight truncate w-full text-center">
                    {label.split(' ')[0]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
