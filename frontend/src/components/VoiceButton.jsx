import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, AlertCircle, CheckCircle, RefreshCw, Sparkles, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { inventoryAPI } from '../services/api';
import { speakText as speakAudio, stopSpeaking } from '../utils/speechService';

function getSampleChips(language) {
  if (language === 'hi-IN') {
    return ['5 बोरी चावल ऐड करो', '10 पैकेट दूध बेचा', 'चीनी कितनी बची है?', '2 बोरी आटा आया', 'आज का हिसाब बताओ'];
  }
  if (language === 'mr-IN') {
    return ['5 गोणी तांदूळ आले', '10 पाकीट दूध विकले', 'साखर किती उरली आहे?', 'आजचा हिशोब सांगा'];
  }
  if (language === 'bn-IN') {
    return ['৫ বস্তা চাল এসেছে', '১০ প্যাকেট দুধ বিক্রি', 'চিনি কতটুকু আছে?', 'আজকের হিসাব দেখাও'];
  }
  if (language === 'te-IN') {
    return ['5 బస్తాల బియ్యం చేర్చు', '10 ప్యాకెట్ల పాలు అమ్మాను', 'చక్కెర ఎంత మిగిలింది?', 'నేటి లెక్క చెప్పు'];
  }
  if (language === 'ta-IN') {
    return ['5 மூட்டை அரிசி சேர்', '10 பாக்கெட் பால் விற்றது', 'சர்க்கரை எவ்வளவு உள்ளது?', 'இன்றைய கணக்கு காட்டு'];
  }
  if (language === 'gu-IN') {
    return ['5 બોરી ચોખા ઉમેરો', '10 પેકેટ દૂધ વેચ્યું', 'ખાંડ કેટલી બાકી છે?', 'આજનો હિસાબ બતાવો'];
  }
  if (language === 'kn-IN') {
    return ['5 ಚೀಲ ಅಕ್ಕಿ ಸೇರಿಸಿ', '10 ಪ್ಯಾಕೆಟ್ ಹಾಲು ಮಾರಾಟ', 'ಸಕ್ಕರೆ ಎಷ್ಟು ಉಳಿದಿದೆ?', 'ಇಂದಿನ ಲೆಕ್ಕ ತೋರಿಸಿ'];
  }
  if (language === 'ml-IN') {
    return ['5 ചാക്ക് അരി ചേർക്കൂ', '10 പാക്കറ്റ് പാൽ വിറ്റു', 'പഞ്ചസാര എത്ര ബാക്കിയുണ്ട്?', 'ഇന്നത്തെ കണക്ക് പറയൂ'];
  }
  if (language === 'pa-IN') {
    return ['5 ਬੋਰੀ ਚੌਲ ਜੋੜੋ', '10 ਪੈਕਟ ਦੁੱਧ ਵੇਚਿਆ', 'ਖੰਡ ਕਿੰਨੀ ਬਚੀ ਹੈ?', 'ਅੱਜ ਦਾ ਹਿਸਾਬ ਦੱਸੋ'];
  }
  if (language === 'or-IN') {
    return ['5 ବସ୍ତା ଚାଉଳ ଯୋଡନ୍ତୁ', '10 ପ୍ୟାକେଟ କ୍ଷୀର ବିକ୍ରି', 'ଚିନି କେତେ ବାକି ଅଛି?', 'ଆଜିର ହିସାବ ଦେଖାନ୍ତୁ'];
  }
  // Default: English
  return ['Add 5 bags of rice', 'Sold 10 packets of milk', 'How much sugar is left?', 'Add 2 bags of wheat flour', 'Show today summary'];
}

export default function VoiceButton({ onCommandSuccess, className = '' }) {
  const { language, t } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [processing, setProcessing] = useState(false);
  const [responseFeedback, setResponseFeedback] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualInput, setManualInput] = useState('');

  const recognitionRef = useRef(null);

  // Initialize SpeechRecognition if supported in browser
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
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }
        if (interim) setInterimTranscript(interim);
        if (final) {
          setTranscript(final);
          setInterimTranscript('');
          handleProcessVoice(final);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setErrorMsg(`Voice recognition: ${event.error}. You can also type or choose sample commands.`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  // Text-To-Speech response output via universal speechService
  const speakResponse = (text) => {
    if (text) {
      speakAudio(text, language || 'hi-IN');
    }
  };

  const startListening = () => {
    setErrorMsg(null);
    setResponseFeedback(null);
    setTranscript('');
    setInterimTranscript('');
    setIsModalOpen(true);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = language || 'hi-IN';
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Recognition start error:', e);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleProcessVoice = async (textToProcess) => {
    const text = textToProcess || transcript || manualInput;
    if (!text.trim()) return;

    stopListening();
    setProcessing(true);
    setErrorMsg(null);

    try {
      const res = await inventoryAPI.sendVoiceCommand(text);
      if (res.data.success) {
        setResponseFeedback(res.data);
        if (res.data.spokenFeedback) {
          speakResponse(res.data.spokenFeedback);
        }
        if (onCommandSuccess) {
          onCommandSuccess(res.data);
        }
      } else {
        setErrorMsg(res.data.error || 'Could not understand command.');
        if (res.data.spokenFeedback) {
          speakResponse(res.data.spokenFeedback);
        }
      }
    } catch (err) {
      console.error('Command API error:', err);
      setErrorMsg(err.response?.data?.error || 'Failed to communicate with inventory backend.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      {/* Floating / Inline Trigger Button */}
      <button
        onClick={startListening}
        className={`group relative flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold px-5 py-3.5 rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all ${className}`}
      >
        <div className="relative">
          <Mic className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
        </div>
        <span className="text-sm tracking-wide">
          {t('speakToUpdate')}
        </span>
      </button>

      {/* Voice Assistant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white text-center relative">
              <button
                onClick={() => {
                  stopListening();
                  setIsModalOpen(false);
                }}
                className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full p-1.5 transition-colors"
              >
                ✕
              </button>
              <h3 className="text-lg font-extrabold tracking-tight">
                {t('voiceAssistant')}
              </h3>
              <p className="text-xs text-orange-100 mt-1">
                {t('clickToSpeak')}
              </p>
            </div>

            {/* Mic Pulse Center */}
            <div className="p-6 flex flex-col items-center justify-center">
              <div className="relative my-4">
                {isListening && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-orange-400 opacity-20 animate-ping"></div>
                    <div className="absolute -inset-4 rounded-full bg-orange-500 opacity-15 animate-pulse"></div>
                  </>
                )}
                <button
                  onClick={isListening ? stopListening : startListening}
                  disabled={processing}
                  className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
                    isListening
                      ? 'bg-rose-500 shadow-rose-500/40 animate-bounce'
                      : processing
                      ? 'bg-amber-500 shadow-amber-500/40'
                      : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/40'
                  }`}
                >
                  {processing ? (
                    <RefreshCw className="w-10 h-10 animate-spin" />
                  ) : isListening ? (
                    <Mic className="w-10 h-10 animate-pulse" />
                  ) : (
                    <Mic className="w-10 h-10" />
                  )}
                </button>
              </div>

              {/* Status Indicator */}
              <p className="text-sm font-semibold text-slate-700 mt-2">
                {processing
                  ? t('processing')
                  : isListening
                  ? t('listening')
                  : t('clickToSpeak')}
              </p>

              {/* Live Transcript Box */}
              <div className="w-full mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[70px] text-center flex items-center justify-center">
                {interimTranscript ? (
                  <p className="text-slate-500 italic text-sm animate-pulse">"{interimTranscript}"</p>
                ) : transcript ? (
                  <p className="text-slate-800 font-bold text-base">"{transcript}"</p>
                ) : (
                  <p className="text-slate-400 text-xs">
                    {language === 'hi-IN' ? 'नमूना: "5 बोरी चावल जोड़ो", "2 पैकेट दूध बेचा"' : 'Sample: "Add 5 bags of rice", "Sold 2 packets of milk"'}
                  </p>
                )}
              </div>

              {/* Success Feedback Card */}
              {responseFeedback && (
                <div className="w-full mt-4 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-left animate-slide-up">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900">
                        {responseFeedback.action} Successful
                      </h4>
                      <p className="text-xs text-emerald-700 mt-1 font-medium">
                        {responseFeedback.spokenFeedback || responseFeedback.message}
                      </p>
                      {responseFeedback.operation && (
                        <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-emerald-800">
                          <span className="bg-emerald-200/60 px-2 py-0.5 rounded-md">
                            New Stock: {responseFeedback.operation.displayString}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errorMsg && (
                <div className="w-full mt-4 bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-left flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-rose-700 font-medium">{errorMsg}</p>
                </div>
              )}

              {/* Manual Input Fallback */}
              <div className="w-full mt-5 pt-4 border-t border-slate-100">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleProcessVoice(manualInput);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder={t('clickToSpeak')}
                    className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="submit"
                    disabled={!manualInput.trim() || processing}
                    className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>

              {/* Quick Sample Voice Chips */}
              <div className="w-full mt-4">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('sampleChips')}:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {getSampleChips(language).map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setTranscript(chip);
                        handleProcessVoice(chip);
                      }}
                      className="bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200/60 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Trade units: Bori, Peti, Dozen, Packet, Quintal</span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-700 font-bold hover:underline"
              >
                Close ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
