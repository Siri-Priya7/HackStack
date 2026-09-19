import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Store,
  Mic,
  ShieldCheck,
  Users,
  Smartphone,
  Sparkles,
  ArrowRight,
  Package,
  Layers,
  CheckCircle2,
  Volume2,
  Lock,
  ChevronRight
} from 'lucide-react';

export default function LandingPage({ onSelectAuthView }) {
  const { loginWithRoleDemo, language, setLanguage, supportedLanguages, t } = useAuth();

  const handleQuickDemo = async (role) => {
    await loginWithRoleDemo(role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/70 via-slate-50 to-amber-50/50 flex flex-col text-slate-800">
      
      {/* Top Clean Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/90 border-b border-orange-100 px-4 sm:px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-slate-900 tracking-tight">{t('appName')}</span>
              <span className="text-[10px] bg-orange-100 text-orange-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">Multi-Tenant</span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">{t('subtitle')}</p>
          </div>
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-2.5 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer max-w-[110px] sm:max-w-none"
          >
            {supportedLanguages.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>

          {/* Direct Login Button */}
          <button
            onClick={() => onSelectAuthView('otp-login')}
            className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Smartphone className="w-3.5 h-3.5 text-orange-400" />
            <span>{t('otpLoginBtn')}</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-8 pt-12 pb-16 max-w-5xl mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 bg-orange-100/90 border border-orange-200 text-orange-900 px-4 py-1.5 rounded-full text-xs font-extrabold mb-6 shadow-sm">
          <Sparkles className="w-4 h-4 text-orange-600" />
          <span>{t('landingTagline')}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
          {t('landingHeadline')}, <br />
          <span className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent">
            {t('landingHeadlineSpan')}
          </span>
        </h1>

        <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          {t('landingSubheadline')}
        </p>

        {/* Primary Interactive CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
          <button
            onClick={() => onSelectAuthView('voice-onboard')}
            className="w-full sm:w-auto flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black px-6 py-4 rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2.5 text-sm sm:text-base group transition-all hover:-translate-y-0.5"
          >
            <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span>{t('voiceSetupBtn')}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onSelectAuthView('otp-login')}
            className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 font-extrabold px-6 py-4 rounded-2xl shadow-sm flex items-center justify-center gap-2 text-sm sm:text-base transition-all hover:-translate-y-0.5"
          >
            <Smartphone className="w-4 h-4 text-orange-500" />
            <span>{t('otpLoginBtn')}</span>
          </button>
        </div>

        {/* Trade Units Strip */}
        <div className="mt-12 pt-6 border-t border-slate-200/60 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-bold text-slate-600">
          <span className="flex items-center gap-2"><Package className="w-4 h-4 text-orange-500" /> {t('tradeBori')}</span>
          <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-amber-500" /> {t('tradePeti')}</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> {t('tradePacket')}</span>
          <span className="flex items-center gap-2"><Volume2 className="w-4 h-4 text-blue-500" /> {t('tradeQuintal')}</span>
        </div>
      </section>

      {/* Role-Based Showcase & Instant 1-Click Evaluation Grid */}
      <section className="px-4 sm:px-8 py-10 max-w-6xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="text-xs font-black text-orange-600 uppercase tracking-wider">{t('roleSelectionTitle')}</span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {t('roleSelectionDesc')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Shop Owner */}
          <div className="bg-white rounded-3xl border border-orange-200 p-6 shadow-sm hover:shadow-md hover:border-orange-400 transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl">
              {t('roleOwnerBadge')}
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-4 font-bold">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">{t('roleOwnerTitle')}</h3>
              <p className="text-xs font-semibold text-orange-600 mt-0.5">Ramesh Sharma • Sharma Kirana Store</p>
              
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {t('roleOwnerSub')}
              </p>
            </div>

            <button
              onClick={() => handleQuickDemo('shop_owner')}
              className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3 rounded-2xl text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>{t('loginAsOwner')} (9876543210)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Staff */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-slate-400 transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-slate-900 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl">
              {t('roleStaffBadge')}
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 font-bold">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">{t('roleStaffTitle')}</h3>
              <p className="text-xs font-semibold text-blue-600 mt-0.5">Suresh Kumar • Sharma Kirana Store</p>
              
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {t('roleStaffSub')}
              </p>
            </div>

            <button
              onClick={() => handleQuickDemo('staff')}
              className="mt-6 w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold py-3 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>{t('loginAsStaff')} (9111111111)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Platform Admin */}
          <div className="bg-white rounded-3xl border border-purple-200 p-6 shadow-sm hover:shadow-md hover:border-purple-400 transition-all flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-purple-700 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl">
              {t('roleAdminBadge')}
            </div>
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4 font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900">{t('roleAdminTitle')}</h3>
              <p className="text-xs font-semibold text-purple-700 mt-0.5">Vikram Singhania • Platform Level</p>
              
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {t('roleAdminSub')}
              </p>
            </div>

            <button
              onClick={() => handleQuickDemo('platform_admin')}
              className="mt-6 w-full bg-purple-700 hover:bg-purple-800 text-white font-extrabold py-3 rounded-2xl text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>{t('loginAsAdmin')} (9000000000)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6 px-4 text-center text-xs text-slate-500">
        <p className="font-semibold">{t('appName')} • {t('subtitle')}</p>
        <p className="text-[11px] text-slate-400 mt-1">Hackathon 2026 • Multi-Tenant RBAC</p>
      </footer>
    </div>
  );
}
