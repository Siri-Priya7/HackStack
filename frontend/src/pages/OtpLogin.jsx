import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAudioPrompt } from '../utils/translations';
import {
  Smartphone,
  Volume2,
  VolumeX,
  Mic,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

import { speakText as speakAudio, stopSpeaking } from '../utils/speechService';

export default function OtpLogin({ onBackToHome, onGoToOnboarding }) {
  const { sendOtp, verifyOtp, language, setLanguage, supportedLanguages, t } = useAuth();
  const [step, setStep] = useState(1); // 1 = Phone, 2 = OTP
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('');
  const [sentOtp, setSentOtp] = useState('123456');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isListeningPhone, setIsListeningPhone] = useState(false);

  // Robust Text to Speech helper aligned with current language
  const speakText = (text) => {
    if (!speechEnabled) return;
    speakAudio(text, language);
  };

  // Speak every question automatically when step changes or language changes.
  // sentOtp is included in deps so the OTP digits are always current when spoken.
  useEffect(() => {
    if (!speechEnabled) return;
    const timer = setTimeout(() => {
      if (step === 1) {
        speakAudio(getAudioPrompt(language, 'loginStep1'), language);
      } else if (step === 2) {
        speakAudio(getAudioPrompt(language, 'otpSent', sentOtp || '123456'), language);
      }
    }, 100); // small delay lets React batch all state updates before we speak
    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [step, language, sentOtp, speechEnabled]);

  // Voice recognition for speaking phone number
  const startPhoneListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = language || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListeningPhone(true);
    recognition.onend = () => setIsListeningPhone(false);

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      const digits = text.replace(/\D/g, '');
      if (digits.length >= 10) {
        setPhone(digits.slice(-10));
      } else if (digits.length > 0) {
        setPhone(digits);
      }
    };

    recognition.start();
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    if (!phone || phone.replace(/\D/g, '').length < 10) {
      const msg = getAudioPrompt(language, 'invalidPhone');
      setError(msg);
      speakText(msg);
      return;
    }

    setLoading(true);
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const res = await sendOtp(cleanPhone);
    setLoading(false);

    if (res.success) {
      setSentOtp(res.otp || '123456');
      setOtp(res.otp || '123456'); // prefill for easy evaluation
      setStep(2); // useEffect [step, language] will speak the OTP prompt — no duplicate here
    } else {
      const errMsg = res.error || 'Failed to send OTP.';
      setError(errMsg);
      speakText(errMsg);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setError(null);
    if (!otp || otp.length < 4) {
      const msg = getAudioPrompt(language, 'invalidOtp');
      setError(msg);
      speakText(msg);
      return;
    }

    setLoading(true);
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const res = await verifyOtp(cleanPhone, otp);
    setLoading(false);

    if (res.success) {
      speakText(getAudioPrompt(language, 'loginSuccess'));
      if (res.isNewUser) {
        onGoToOnboarding(cleanPhone);
      }
    } else {
      const errMsg = res.error || 'Invalid OTP code.';
      setError(errMsg);
      speakText(errMsg);
    }
  };

  const handleQuickDemoClick = (targetPhone, roleTitle, personName) => {
    setPhone(targetPhone);
    setError(null);
    const msg = getAudioPrompt(language, 'demoSelected', `${roleTitle} ${personName}`);
    speakText(msg);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-slate-50 to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 p-6 text-white text-center relative">
          <button
            onClick={onBackToHome}
            className="absolute top-5 left-5 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('home')}</span>
          </button>

          {/* Top Right Controls: Language Selector & Audio toggle */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-black/20 hover:bg-black/30 text-white text-[11px] font-bold rounded-xl px-2 py-1.5 focus:outline-none cursor-pointer border border-white/20"
            >
              {(supportedLanguages || []).map((l) => (
                <option key={l.code} value={l.code} className="text-slate-800">
                  {l.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setSpeechEnabled(!speechEnabled)}
              className="text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-xl transition-all"
              title={speechEnabled ? 'Voice Guidance Active' : 'Voice Muted'}
            >
              {speechEnabled ? <Volume2 className="w-4 h-4 text-amber-200" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/20 mx-auto flex items-center justify-center mb-2 shadow-inner">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-black tracking-tight">{t('mobileLoginTitle')}</h2>
          <p className="text-xs text-orange-100 mt-0.5">{t('mobileLoginSubtitle')}</p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          
          {/* Quick Demo Selector Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" />
              <span>{t('demoAccessText')}:</span>
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoClick('9876543210', t('roleOwnerTitle'), 'Ramesh')}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  phone === '9876543210'
                    ? 'border-orange-500 bg-orange-50 text-orange-950 font-black'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-orange-600">{t('roleOwnerTitle')}</div>
                <div className="text-xs font-extrabold truncate">Ramesh</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoClick('9111111111', t('roleStaffTitle'), 'Suresh')}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  phone === '9111111111'
                    ? 'border-blue-500 bg-blue-50 text-blue-950 font-black'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-blue-600">{t('roleStaffTitle')}</div>
                <div className="text-xs font-extrabold truncate">Suresh</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoClick('9000000000', t('roleAdminTitle'), 'Vikram')}
                className={`p-2.5 rounded-2xl border text-left transition-all ${
                  phone === '9000000000'
                    ? 'border-purple-500 bg-purple-50 text-purple-950 font-black'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="text-[10px] uppercase font-bold text-purple-600">{t('roleAdminTitle')}</div>
                <div className="text-xs font-extrabold truncate">Vikram</div>
              </button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3 flex items-start gap-2 text-xs font-bold text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Enter Mobile Number */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black text-slate-700">
                    {t('enterMobile')}
                  </label>
                  <button
                    type="button"
                    onClick={() => speakText(getAudioPrompt(language, 'loginStep1'))}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2 py-0.5 rounded-lg transition-colors border border-orange-200"
                    title="Listen to question"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{language === 'hi-IN' ? 'सवाल सुनें' : 'Listen Question'}</span>
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    maxLength="10"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-12 pr-12 py-3 text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="button"
                    onClick={startPhoneListening}
                    className={`absolute right-3 top-2.5 p-1.5 rounded-xl transition-all ${
                      isListeningPhone ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-400 hover:text-orange-600'
                    }`}
                    title="Speak phone number"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {t('enterMobileHelp')}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-3.5 rounded-2xl text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? t('sendingOtp') : t('sendOtp')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Step 2: Enter 6-digit OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-fade-in">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-black text-slate-700">
                    {t('enterOtp')}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const prompt = getAudioPrompt(language, 'otpSent', sentOtp || '123456');
                      speakText(prompt);
                    }}
                    className="text-[11px] font-bold text-orange-600 hover:underline flex items-center gap-1"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>{t('listenOtp')}</span>
                  </button>
                </div>

                <input
                  type="text"
                  maxLength="6"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-center text-2xl font-black tracking-widest text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />

                <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                  <span>{t('otpSentTo')} {phone}</span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="font-bold text-orange-600 hover:underline"
                  >
                    {t('changeNumber')}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-3.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? t('verifying') : t('verifyLogin')}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{t('resendOtp')}</span>
                </button>
              </div>
            </form>
          )}

          {/* New Shopkeeper Onboarding Link */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              {t('newShopPrompt')}{' '}
              <button
                type="button"
                onClick={() => onGoToOnboarding(phone)}
                className="font-black text-orange-600 hover:underline"
              >
                {t('voiceSetupLink')}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
