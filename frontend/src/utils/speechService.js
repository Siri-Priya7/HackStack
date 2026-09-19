/**
 * Universal Multilingual Speech Service
 * 
 * Provides crystal-clear native speech for all 11 Indian languages:
 * 1. Primary: High-fidelity audio streaming via /api/voice/tts (Telugu, Hindi, Tamil,
 *    Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, English).
 * 2. Secondary: Fallback to HTML5 SpeechSynthesis with native voice detection and
 *    Chromium race-condition & garbage-collection fixes.
 */

let activeUtterance = null;
let currentAudio = null;
let isUnlocked = false;

// Preload browser speech voices if available
let voices = [];
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  voices = window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
  };

  // Browser Autoplay Policy Unlock on first user gesture
  const unlockAudio = () => {
    if (isUnlocked) return;
    try {
      // Unlock Web Audio & SpeechSynthesis
      const silentUtterance = new SpeechSynthesisUtterance(' ');
      silentUtterance.volume = 0.01;
      window.speechSynthesis.speak(silentUtterance);

      // Unlock HTML5 Audio
      const silentAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA');
      silentAudio.play().catch(() => {});

      isUnlocked = true;
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    } catch (e) {}
  };

  window.addEventListener('click', unlockAudio, { once: true });
  window.addEventListener('touchstart', unlockAudio, { once: true });
  window.addEventListener('keydown', unlockAudio, { once: true });
}

/**
 * Find matching native voice in browser for language code.
 * IMPORTANT: Strictly returns null for non-English languages if no regional voice exists,
 * preventing English voices (like Microsoft David) from attempting to read Indic script.
 */
function getMatchingBrowserVoice(langCode) {
  if (!voices || voices.length === 0) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      voices = window.speechSynthesis.getVoices();
    }
  }
  if (!voices || voices.length === 0) return null;

  const prefix = (langCode || 'en').split('-')[0].toLowerCase();
  const isEnglish = prefix === 'en';

  // 1. Exact match e.g. 'hi-IN', 'ta-IN', 'te-IN'
  let match = voices.find(v => v.lang === langCode || v.lang.replace('_', '-') === langCode);
  if (match) return match;

  // 2. Language prefix match e.g. 'hi', 'ta', 'te', 'bn'
  match = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
  if (match) return match;

  // If this is English, match Indian English or any English
  if (isEnglish) {
    match = voices.find(v => v.lang === 'en-IN' || v.lang === 'en_IN');
    if (match) return match;
    return voices.find(v => v.lang.toLowerCase().startsWith('en')) || null;
  }

  // Never assign English voice to non-English text
  return null;
}

/**
 * Speak via browser SpeechSynthesis fallback
 */
function speakViaSpeechSynthesis(text, langCode, options = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  try {
    window.speechSynthesis.cancel();

    setTimeout(() => {
      try {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = langCode || 'en-IN';
        utterance.rate = options.rate || 0.90;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;

        const voice = getMatchingBrowserVoice(langCode);
        if (voice) {
          utterance.voice = voice;
        }

        activeUtterance = utterance;
        window._activeUtterance = utterance;

        utterance.onstart = () => {
          if (options.onStart) options.onStart();
        };

        utterance.onend = () => {
          activeUtterance = null;
          window._activeUtterance = null;
          if (options.onEnd) options.onEnd();
        };

        utterance.onerror = (e) => {
          activeUtterance = null;
          window._activeUtterance = null;
          if (options.onError) options.onError(e);
        };

        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('SpeechSynthesis error:', e);
      }
    }, 50);
  } catch (err) {
    console.warn('SpeechSynthesis init error:', err);
  }
}

/**
 * Main Speak Function: Streams authentic audio for ALL 11 languages
 */
export function speakText(text, langCode = 'en-IN', options = {}) {
  if (!text || !text.trim()) return;
  const cleanText = text.trim();

  // Stop any ongoing speech
  stopSpeaking();

  const isLocalHost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
  
  // Base URL for backend TTS
  const backendBase = isLocalHost ? 'http://localhost:5000' : '';
  const ttsUrl = `${backendBase}/api/voice/tts?text=${encodeURIComponent(cleanText)}&lang=${encodeURIComponent(langCode)}`;

  try {
    const audio = new Audio(ttsUrl);
    currentAudio = audio;
    audio.volume = options.volume || 1.0;

    audio.onplay = () => {
      if (options.onStart) options.onStart();
    };

    audio.onended = () => {
      if (currentAudio === audio) currentAudio = null;
      if (options.onEnd) options.onEnd();
    };

    audio.onerror = () => {
      console.warn('Backend audio streaming unavailable, falling back to SpeechSynthesis.');
      if (currentAudio === audio) currentAudio = null;
      speakViaSpeechSynthesis(cleanText, langCode, options);
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Autoplay restrictions or network fallback
        console.warn('Audio play restricted or failed, falling back to SpeechSynthesis:', err);
        if (currentAudio === audio) currentAudio = null;
        speakViaSpeechSynthesis(cleanText, langCode, options);
      });
    }
  } catch (err) {
    console.warn('Audio element error, falling back:', err);
    speakViaSpeechSynthesis(cleanText, langCode, options);
  }
}

/**
 * Stop any currently playing audio or speech synthesis
 */
export function stopSpeaking() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio = null;
    } catch (e) {}
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
      activeUtterance = null;
      window._activeUtterance = null;
    } catch (e) {}
  }
}

/**
 * Check if voice is currently playing
 */
export function isSpeaking() {
  if (currentAudio && !currentAudio.paused) {
    return true;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
