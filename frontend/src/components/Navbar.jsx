import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, Mic, Package, AlertTriangle, History, Globe, LogOut, User as UserIcon } from 'lucide-react';

const LANGUAGES = [
  { code: 'hi-IN', label: 'हिन्दी', desc: 'Hindi' },
  { code: 'en-IN', label: 'English / Hinglish', desc: 'Indian English' },
  { code: 'ta-IN', label: 'தமிழ்', desc: 'Tamil' },
  { code: 'te-IN', label: 'తెలుగు', desc: 'Telugu' }
];

export default function Navbar({ activeTab, setActiveTab, onOpenVoiceModal }) {
  const { user, language, setLanguage, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: language === 'hi-IN' ? 'डैशबोर्ड' : 'Dashboard', icon: Store },
    { id: 'voice', label: language === 'hi-IN' ? 'बोलकर अपडेट' : 'Voice Assistant', icon: Mic, highlight: true },
    { id: 'inventory', label: language === 'hi-IN' ? 'सामान / स्टॉक' : 'Inventory', icon: Package },
    { id: 'alerts', label: language === 'hi-IN' ? 'अलर्ट' : 'Alerts', icon: AlertTriangle },
    { id: 'transactions', label: language === 'hi-IN' ? 'हिसाब-किताब' : 'Transactions', icon: History }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Store Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg sm:text-xl">
                  {user?.store_name || 'Apna Kirana'}
                </span>
                <span className="bg-orange-100 text-orange-700 text-[11px] font-bold px-1.5 py-0.5 rounded-full border border-orange-200">
                  VOICE
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {language === 'hi-IN' ? 'आवाज से चलने वाली आसान इन्वेंटरी' : 'Voice-First Kirana Inventory'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                    item.highlight
                      ? 'bg-orange-500 text-white shadow-sm shadow-orange-500/30 hover:bg-orange-600'
                      : isActive
                      ? 'bg-orange-50 text-orange-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${item.highlight ? 'text-white' : isActive ? 'text-orange-600' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Tools: Language Selector & User Profile */}
          <div className="flex items-center gap-2.5">
            {/* Language Switcher */}
            <div className="relative flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200">
              <Globe className="w-3.5 h-3.5 text-slate-500 ml-1 mr-1" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-1"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* User Pill */}
            <div className="flex items-center gap-2 bg-orange-50 text-orange-800 px-2.5 py-1.5 rounded-xl border border-orange-100 text-xs font-medium">
              <UserIcon className="w-3.5 h-3.5 text-orange-600" />
              <span className="hidden sm:inline font-bold">{user?.name?.split(' ')[0] || 'Shopkeeper'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 text-xs font-medium transition-all ${
                item.highlight
                  ? 'text-white bg-orange-500 p-2.5 -mt-5 rounded-full shadow-lg shadow-orange-500/40 border-4 border-white'
                  : isActive
                  ? 'text-orange-600 font-bold'
                  : 'text-slate-500'
              }`}
            >
              <Icon className={item.highlight ? 'w-6 h-6' : 'w-5 h-5'} />
              {!item.highlight && <span>{item.label}</span>}
            </button>
          );
        })}
      </div>
    </header>
  );
}
