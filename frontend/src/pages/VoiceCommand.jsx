import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { inventoryAPI } from '../services/api';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Send,
  CheckCircle,
  AlertCircle,
  Layers,
  ArrowRight,
  TrendingUp,
  Package,
  RefreshCw
} from 'lucide-react';
import { speakText as speakAudio, stopSpeaking } from '../utils/speechService';

export default function VoiceCommand() {
  const { language, setLanguage, t, supportedLanguages } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [ttsEnabled, setTtsEnabled] = useState(true);

  const recognitionRef = useRef(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language || 'hi-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg(null);
      };

      recognition.onresult = (event) => {
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          }
        }
        if (final) {
          setTranscript(final);
          executeVoice(final);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setErrorMsg(`Voice input: ${event.error}. You can also type or use test buttons.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const speak = (text) => {
    if (ttsEnabled && text) {
      speakAudio(text, language || 'hi-IN');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setErrorMsg(null);
      setResult(null);
      setTranscript('');
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = language || 'hi-IN';
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Start error:', e);
        }
      }
    }
  };

  const executeVoice = async (textToRun) => {
    const query = textToRun || transcript || manualInput;
    if (!query.trim()) return;

    if (recognitionRef.current) recognitionRef.current.stop();
    setIsListening(false);
    setProcessing(true);
    setErrorMsg(null);

    try {
      const res = await inventoryAPI.sendVoiceCommand(query);
      if (res.data.success) {
        setResult(res.data);
        if (res.data.spokenFeedback) {
          speak(res.data.spokenFeedback);
        }
      } else {
        setErrorMsg(res.data.error || 'Could not understand voice command.');
        if (res.data.spokenFeedback) {
          speak(res.data.spokenFeedback);
        }
      }
    } catch (err) {
      console.error('Voice API error:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to process voice command.');
    } finally {
      setProcessing(false);
    }
  };

  const sampleCategories = language === 'hi-IN' ? [
    {
      title: 'स्टॉक आया (Restock)',
      color: 'emerald',
      commands: [
        '5 बोरी चावल ऐड करो',
        '2 बोरी आटा स्टॉक में डालो',
        '10 पेटी सरसों तेल आया',
        '5 दर्जन अंडे खरीदा'
      ]
    },
    {
      title: 'बिक्री हुई (Sales)',
      color: 'rose',
      commands: [
        '10 पैकेट दूध बेचा',
        '5 किलो चीनी ग्राहक को दिया',
        '1 बोरी चावल बेचा',
        '1 पेटी तेल बिका'
      ]
    },
    {
      title: 'स्टॉक चेक करें',
      color: 'blue',
      commands: [
        'चावल कितना बचा है?',
        'चीनी कितनी बची है?',
        'दूध का स्टॉक बताओ',
        'आलू कितना है?'
      ]
    },
    {
      title: 'हिसाब और अलर्ट',
      color: 'amber',
      commands: [
        'क्या खत्म हो रहा है?',
        'आज का हिसाब बताओ',
        'दुकान का सारांश दिखाओ',
        'Low stock alert'
      ]
    }
  ] : [
    {
      title: 'Restock / Inward Stock',
      color: 'emerald',
      commands: [
        'Add 5 bags of rice',
        'Add 2 bags of wheat flour to stock',
        '10 cartons of mustard oil received',
        'Purchased 5 dozen eggs'
      ]
    },
    {
      title: 'Sales / Outward Stock',
      color: 'rose',
      commands: [
        'Sold 10 packets of milk',
        'Gave 5 kg sugar to customer',
        'Sold 1 bag of rice',
        '1 carton of oil sold'
      ]
    },
    {
      title: 'Stock Inquiry',
      color: 'blue',
      commands: [
        'How much rice is left?',
        'How much sugar is remaining?',
        'What is the milk stock?',
        'How many potatoes do we have?'
      ]
    },
    {
      title: 'Alerts & Reports',
      color: 'amber',
      commands: [
        'What is running out?',
        "Show today's summary",
        'Show store summary',
        'Low stock alert'
      ]
    }
  ];

  return (
    <div className="space-y-6 pb-20 md:pb-10 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto">
        <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 text-xs font-extrabold px-3 py-1 rounded-full mb-2">
          <Sparkles className="w-3.5 h-3.5 text-orange-600" />
          <span>{t('voiceAssistant').toUpperCase()} STUDIO</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {language === 'hi-IN' ? 'आवाज से इन्वेंटरी कंट्रोल' : 'Voice-Powered Inventory Control'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {language === 'hi-IN'
            ? 'बोलें और देखें कैसे AI आपकी आवाज को व्यापारिक इकाइयों (बोरी, पेटी, दर्जन, किलो) में बदलता है।'
            : 'Speak naturally in your preferred language. The AI understands trade units like bags, cartons, and dozens.'}
        </p>
      </div>

      {/* Main Mic Interactive Panel */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Top Controls: Audio Response Toggle & Language */}
        <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-6">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{t('languageLabel') || (language === 'hi-IN' ? 'भाषा' : 'Language')}:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-100 rounded-lg px-2.5 py-1 text-slate-800 font-bold focus:outline-none cursor-pointer"
            >
              {(supportedLanguages || []).map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label} ({lang.desc})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setTtsEnabled(!ttsEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-colors ${
              ttsEnabled ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-400'
            }`}
          >
            {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{ttsEnabled ? (language === 'hi-IN' ? 'आवाज प्रतिक्रिया: चालू' : 'Voice Response: ON') : (language === 'hi-IN' ? 'म्यूट' : 'Muted')}</span>
          </button>
        </div>

        {/* Pulsating Microphone Center */}
        <div className="relative my-4">
          {isListening && (
            <>
              <div className="absolute -inset-6 rounded-full bg-orange-500/20 animate-ping"></div>
              <div className="absolute -inset-3 rounded-full bg-orange-400/30 animate-pulse"></div>
            </>
          )}

          <button
            onClick={toggleListening}
            disabled={processing}
            className={`relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center text-white shadow-2xl transition-all ${
              isListening
                ? 'bg-rose-500 shadow-rose-500/40 scale-105 animate-pulse'
                : processing
                ? 'bg-amber-500 shadow-amber-500/40'
                : 'bg-gradient-to-tr from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-orange-500/40 hover:scale-105 active:scale-95'
            }`}
          >
            {processing ? (
              <RefreshCw className="w-12 h-12 animate-spin" />
            ) : isListening ? (
              <Mic className="w-12 h-12 animate-bounce" />
            ) : (
              <Mic className="w-12 h-12" />
            )}
          </button>
        </div>

        {/* State Label */}
        <p className="text-sm font-extrabold text-slate-800 mt-4">
          {processing
            ? t('processing')
            : isListening
            ? t('listening')
            : t('clickToSpeak')}
        </p>

        {/* Real-time Spoken Transcript Box */}
        <div className="w-full max-w-xl mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[64px] text-center flex items-center justify-center">
          {transcript ? (
            <p className="text-base font-extrabold text-slate-900">
              "{transcript}"
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              {language === 'hi-IN'
                ? 'उदाहरण: "5 बोरी चावल आया" या "10 पैकेट दूध बेचा"'
                : 'Say something like: "Add 5 bags of rice" or "Sold 10 packets of milk"'}
            </p>
          )}
        </div>

        {/* Type / Text Fallback Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            executeVoice(manualInput);
          }}
          className="w-full max-w-xl mt-4 flex gap-2"
        >
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder={language === 'hi-IN' ? 'या यहाँ लिखकर टेस्ट करें...' : 'Or type a voice command to simulate...'}
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            disabled={!manualInput.trim() || processing}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm"
          >
            <span>Run</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Error Alert */}
        {errorMsg && (
          <div className="w-full max-w-xl mt-4 bg-rose-50 border border-rose-200 rounded-2xl p-4 text-left flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-900">Command Not Understood</h4>
              <p className="text-xs text-rose-700 mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Visual Entity Breakdown Card */}
        {result && (
          <div className="w-full max-w-xl mt-6 bg-slate-900 text-white rounded-3xl p-6 shadow-xl text-left animate-slide-up">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span className="font-extrabold text-sm text-emerald-400">
                  Execution Complete
                </span>
              </div>
              <span className="text-[11px] font-bold bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg">
                Intent: {result.action || result.parsed?.intent}
              </span>
            </div>

            {/* Voice Confirmation Text */}
            <div className="mt-4 bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700/60">
              <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider block mb-1">
                Spoken Confirmation Audio:
              </span>
              <p className="text-sm font-semibold text-slate-100 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <span>"{result.spokenFeedback}"</span>
              </p>
            </div>

            {/* Extracted Entities Grid */}
            {result.operation && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                <div className="bg-slate-800/60 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Product</span>
                  <span className="text-xs font-extrabold text-white truncate block">
                    {result.product?.name}
                  </span>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Spoken Qty</span>
                  <span className="text-xs font-extrabold text-white block">
                    {result.operation.tradeQuantity} {result.operation.tradeUnit}
                  </span>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Standard Delta</span>
                  <span className="text-xs font-extrabold text-emerald-400 block">
                    +{result.operation.deltaBase} {result.product?.base_unit}
                  </span>
                </div>

                <div className="bg-slate-800/60 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">New Balance</span>
                  <span className="text-xs font-extrabold text-white block">
                    {result.operation.displayString}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Categorized Test Commands Bank */}
      <div className="space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Layers className="w-5 h-5 text-orange-500" />
          <span>{language === 'hi-IN' ? 'रेडीमेड सैंपल कमांड्स' : 'Click to Test Sample Commands'}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sampleCategories.map((cat, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                {cat.title}
              </h3>
              <div className="space-y-2">
                {cat.commands.map((cmd, cIdx) => (
                  <button
                    key={cIdx}
                    onClick={() => {
                      setTranscript(cmd);
                      executeVoice(cmd);
                    }}
                    className="w-full text-left bg-slate-50 hover:bg-orange-50 hover:text-orange-900 border border-slate-200/80 hover:border-orange-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 transition-all flex items-center justify-between group"
                  >
                    <span>{cmd}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
