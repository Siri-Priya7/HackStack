import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAudioPrompt } from '../utils/translations';
import { speakText as speakAudio, stopSpeaking } from '../utils/speechService';
import {
  Mic,
  Volume2,
  VolumeX,
  Store,
  MapPin,
  User,
  Smartphone,
  Globe,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function VoiceOnboarding({ onBackToHome, initialPhone = '' }) {
  const { voiceOnboard, language, setLanguage, supportedLanguages, t } = useAuth();
  
  // Wizard steps: 1 = Shop Name, 2 = Owner Name, 3 = City/Address, 4 = Language, 5 = Mobile & OTP
  const [currentStep, setCurrentStep] = useState(1);
  const [isListening, setIsListening] = useState(false);
  const [audioPromptActive, setAudioPromptActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    store_name: '',
    name: '',
    city: '',
    phone: initialPhone || '9812345678',
    otp: '123456',
    preferred_language: language || 'en-IN'
  });

  const recognitionRef = useRef(null);

  // Robust Text-To-Speech helper
  const speakText = (text) => {
    if (!audioPromptActive) return;
    speakAudio(text, formData.preferred_language || language || 'en-IN');
  };

  // Step audio prompts via getAudioPrompt for pure target language
  const triggerStepAudio = (step, customLang) => {
    if (!audioPromptActive) return;
    const lang = customLang || formData.preferred_language || language || 'en-IN';
    if (step === 1) speakAudio(getAudioPrompt(lang, 'onboardWelcome'), lang);
    if (step === 2) speakAudio(getAudioPrompt(lang, 'onboardStep2'), lang);
    if (step === 3) speakAudio(getAudioPrompt(lang, 'onboardStep3'), lang);
    if (step === 4) speakAudio(getAudioPrompt(lang, 'onboardStep4'), lang);
    if (step === 5) speakAudio(getAudioPrompt(lang, 'onboardStep5'), lang);
  };

  // Track preferred_language in a ref so triggerStepAudio always reads the latest value
  // WITHOUT re-triggering the useEffect (which caused double voice on Step 4 language select)
  const preferredLangRef = useRef(formData.preferred_language);
  useEffect(() => {
    preferredLangRef.current = formData.preferred_language;
  }, [formData.preferred_language]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Use the ref value so we get the current language without it being a dep
      const lang = preferredLangRef.current || language || 'en-IN';
      if (!audioPromptActive) return;
      if (currentStep === 1) speakAudio(getAudioPrompt(lang, 'onboardWelcome'), lang);
      if (currentStep === 2) speakAudio(getAudioPrompt(lang, 'onboardStep2'), lang);
      if (currentStep === 3) speakAudio(getAudioPrompt(lang, 'onboardStep3'), lang);
      if (currentStep === 4) speakAudio(getAudioPrompt(lang, 'onboardStep4'), lang);
      if (currentStep === 5) speakAudio(getAudioPrompt(lang, 'onboardStep5'), lang);
    }, 120);
    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
  }, [currentStep, audioPromptActive]);

  // Speech Recognition setup
  const startListeningForField = (field) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser. Please type.');
      return;
    }

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch(e) {}
    }

    const recognition = new SpeechRecognition();
    recognition.lang = formData.preferred_language || language || 'en-IN';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => setIsListening(false);

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim();
      if (transcript) {
        if (field === 'phone') {
          const digits = transcript.replace(/\D/g, '');
          if (digits.length >= 10) {
            setFormData(prev => ({ ...prev, phone: digits.slice(-10) }));
          } else {
            setFormData(prev => ({ ...prev, phone: digits }));
          }
        } else {
          setFormData(prev => ({ ...prev, [field]: transcript }));
          const lang = formData.preferred_language || language || 'en-IN';
          speakText(getAudioPrompt(lang, 'heard', transcript));
        }
      }
    };

    recognition.onerror = (e) => {
      console.warn('Recognition error:', e.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleNextStep = () => {
    setError(null);
    if (currentStep === 1 && !formData.store_name.trim()) {
      setError(language === 'hi-IN' ? 'कृपया दुकान का नाम बोलें या लिखें।' : 'Please speak or type your shop name.');
      return;
    }
    if (currentStep === 2 && !formData.name.trim()) {
      setFormData(prev => ({ ...prev, name: 'Shop Owner' }));
    }
    if (currentStep === 5) {
      handleSubmitOnboarding();
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleSubmitOnboarding = async () => {
    if (!formData.store_name.trim()) {
      setError(language === 'hi-IN' ? 'दुकान का नाम आवश्यक है।' : 'Shop name is required.');
      setCurrentStep(1);
      return;
    }
    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
      setError(language === 'hi-IN' ? 'सही 10 अंकों का मोबाइल नंबर दर्ज करें।' : 'Valid 10-digit mobile number is required.');
      return;
    }

    setLoading(true);
    setError(null);

    const res = await voiceOnboard({
      store_name: formData.store_name,
      name: formData.name || 'Shop Owner',
      city: formData.city,
      address: formData.city,
      phone: formData.phone.replace(/\D/g, '').slice(-10),
      preferred_language: formData.preferred_language
    });

    setLoading(false);

    if (res.success) {
      const lang = formData.preferred_language || language || 'en-IN';
      speakText(getAudioPrompt(lang, 'onboardSuccess', formData.store_name));
    } else {
      setError(res.error || 'Failed to create shop.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-slate-50 to-amber-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 p-6 text-white relative">
          <div className="flex items-center justify-between">
            <button
              onClick={onBackToHome}
              className="text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('back')}</span>
            </button>

            {/* Language & Audio guidance controls */}
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => {
                  setFormData({ ...formData, preferred_language: e.target.value });
                  setLanguage(e.target.value);
                }}
                className="bg-black/20 hover:bg-black/30 text-white text-[11px] font-bold rounded-xl px-2 py-1.5 focus:outline-none cursor-pointer border border-white/20"
              >
                {(supportedLanguages || []).map((l) => (
                  <option key={l.code} value={l.code} className="text-slate-800">
                    {l.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setAudioPromptActive(!audioPromptActive)}
                className="text-white/80 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold"
                title="Toggle voice guidance"
              >
                {audioPromptActive ? <Volume2 className="w-4 h-4 text-amber-200" /> : <VolumeX className="w-4 h-4" />}
                <span className="hidden sm:inline">{audioPromptActive ? 'Voice ON' : 'Muted'}</span>
              </button>
            </div>
          </div>

          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>{t('onboardingTitle')}</span>
            </span>
            <h2 className="text-2xl font-black">
              {t('stepOf')} {currentStep} / 5
            </h2>
            <p className="text-xs text-orange-100 mt-1">
              {t('onboardingSubtitle')}
            </p>
          </div>

          {/* Progress bar */}
          <div className="mt-4 w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-white h-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Wizard Body */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* Error Message */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs font-bold text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Shop Name */}
          {currentStep === 1 && (
            <div className="space-y-4 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 mx-auto flex items-center justify-center">
                <Store className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {t('step1Title')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('step1Desc')}
                </p>
                <button
                  type="button"
                  onClick={() => triggerStepAudio(1)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1 rounded-full shadow-sm mt-2 transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{language === 'hi-IN' ? 'सवाल सुनें' : 'Listen Question'}</span>
                </button>
              </div>

              {/* Big Mic Center */}
              <div className="py-3">
                <button
                  type="button"
                  onClick={() => startListeningForField('store_name')}
                  className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white shadow-xl transition-all ${
                    isListening
                      ? 'bg-rose-500 animate-pulse scale-110 shadow-rose-500/40'
                      : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30'
                  }`}
                >
                  <Mic className="w-8 h-8" />
                </button>
                <p className="text-xs font-bold text-slate-600 mt-2">
                  {isListening ? (language === 'hi-IN' ? 'सुन रहा हूँ...' : 'Listening... speak now') : t('clickToSpeak')}
                </p>
              </div>

              <div>
                <input
                  type="text"
                  value={formData.store_name}
                  onChange={(e) => setFormData({ ...formData, store_name: e.target.value })}
                  placeholder={t('step1Placeholder')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-black text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: Owner Name */}
          {currentStep === 2 && (
            <div className="space-y-4 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
                <User className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {t('step2Title')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('step2Desc')}
                </p>
                <button
                  type="button"
                  onClick={() => triggerStepAudio(2)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1 rounded-full shadow-sm mt-2 transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{language === 'hi-IN' ? 'सवाल सुनें' : 'Listen Question'}</span>
                </button>
              </div>

              <div className="py-3">
                <button
                  type="button"
                  onClick={() => startListeningForField('name')}
                  className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white shadow-xl transition-all ${
                    isListening
                      ? 'bg-rose-500 animate-pulse scale-110 shadow-rose-500/40'
                      : 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30'
                  }`}
                >
                  <Mic className="w-8 h-8" />
                </button>
                <p className="text-xs font-bold text-slate-600 mt-2">
                  {isListening ? (language === 'hi-IN' ? 'सुन रहा हूँ...' : 'Listening... speak now') : t('clickToSpeak')}
                </p>
              </div>

              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('step2Placeholder')}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-black text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          {/* Step 3: City / Area */}
          {currentStep === 3 && (
            <div className="space-y-4 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {t('step3Title')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('step3Desc')}
                </p>
                <button
                  type="button"
                  onClick={() => triggerStepAudio(3)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full shadow-sm mt-2 transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{language === 'hi-IN' ? 'सवाल सुनें' : 'Listen Question'}</span>
                </button>
              </div>

              <div className="py-3">
                <button
                  type="button"
                  onClick={() => startListeningForField('city')}
                  className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-white shadow-xl transition-all ${
                    isListening
                      ? 'bg-rose-500 animate-pulse scale-110 shadow-rose-500/40'
                      : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'
                  }`}
                >
                  <Mic className="w-8 h-8" />
                </button>
                <p className="text-xs font-bold text-slate-600 mt-2">
                  {isListening ? (language === 'hi-IN' ? 'सुन रहा हूँ...' : 'Listening... speak now') : t('clickToSpeak')}
                </p>
              </div>

              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder={t('step3Placeholder')}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-black text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}

          {/* Step 4: Choose Language */}
          {currentStep === 4 && (
            <div className="space-y-4 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 mx-auto flex items-center justify-center">
                <Globe className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {t('step4Title')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('step4Desc')}
                </p>
                <button
                  type="button"
                  onClick={() => triggerStepAudio(4)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1 rounded-full shadow-sm mt-2 transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{language === 'hi-IN' ? 'सवाल सुनें' : 'Listen Question'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1">
                {supportedLanguages.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, preferred_language: l.code });
                      setLanguage(l.code);
                      speakAudio(getAudioPrompt(l.code, 'selectedLanguage', l.label), l.code);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      formData.preferred_language === l.code
                        ? 'border-orange-500 bg-orange-50 font-black text-orange-950 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="text-sm font-extrabold">{l.label}</div>
                    <div className="text-[11px] text-slate-500">{l.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Mobile Number */}
          {currentStep === 5 && (
            <div className="space-y-4 text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 mx-auto flex items-center justify-center">
                <Smartphone className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {t('step5Title')}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('step5Desc')}
                </p>
                <button
                  type="button"
                  onClick={() => triggerStepAudio(5)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1 rounded-full shadow-sm mt-2 transition-all"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{language === 'hi-IN' ? 'सवाल सुनें' : 'Listen Question'}</span>
                </button>
              </div>

              <div>
                <input
                  type="tel"
                  maxLength="10"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                  placeholder="9812345678"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-lg font-black text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Store:</span>
                  <span className="font-extrabold text-slate-900">{formData.store_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">Owner:</span>
                  <span className="font-extrabold text-slate-900">{formData.name || 'Shop Owner'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-bold">City:</span>
                  <span className="font-extrabold text-slate-900">{formData.city || 'Not specified'}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('previous')}</span>
              </button>
            ) : <div></div>}

            <button
              type="button"
              disabled={loading}
              onClick={handleNextStep}
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black px-6 py-3 rounded-2xl text-xs sm:text-sm shadow-md shadow-orange-500/20 transition-all flex items-center gap-2"
            >
              <span>{loading ? '...' : (currentStep === 5 ? t('launchShop') : t('next'))}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
