/**
 * Multilingual Language & Script Detector for Indian Languages
 * Supports: Hindi, Marathi, Bengali, Tamil, Telugu, Kannada, Malayalam, Gujarati, Punjabi, Odia, Hinglish, English.
 */

const SCRIPT_REGEXES = [
  { script: 'bn', regex: /[\u0980-\u09FF]/ }, // Bengali / Assamese
  { script: 'pa', regex: /[\u0A00-\u0A7F]/ }, // Gurmukhi (Punjabi)
  { script: 'gu', regex: /[\u0A80-\u0AFF]/ }, // Gujarati
  { script: 'or', regex: /[\u0B00-\u0B7F]/ }, // Odia
  { script: 'ta', regex: /[\u0B80-\u0BFF]/ }, // Tamil
  { script: 'te', regex: /[\u0C00-\u0C7F]/ }, // Telugu
  { script: 'kn', regex: /[\u0C80-\u0CFF]/ }, // Kannada
  { script: 'ml', regex: /[\u0D00-\u0D7F]/ }, // Malayalam
  { script: 'hi', regex: /[\u0900-\u097F]/ }  // Devanagari (Hindi / Marathi)
];

const REGIONAL_MARKERS = {
  mr: ['आले', 'टाका', 'विकले', 'आहे', 'नाही', 'पाहिजे', 'तांदूळ', 'साखर'],
  bn: ['এলো', 'যোগ', 'বিক্রি', 'আছে', 'কত', 'চাল', 'চিনি', 'তেল'],
  te: ['వచ్చింది', 'వేయి', 'అమ్మాను', 'ఉంది', 'ఎంత', 'బియ్యం', 'నూనె'],
  ta: ['வந்தது', 'சேர்', 'விற்றது', 'இருக்கு', 'எவ்வளவு', 'அரிசி', 'எண்ணெய்'],
  gu: ['આવ્યું', 'ઉમેરો', 'વેચ્યું', 'છે', 'કેટલું', 'ચોખા', 'ખાંડ'],
  kn: ['ಬಂತು', 'ಸೇರಿಸಿ', 'ಮಾರಿದೆ', 'ಇದೆ', 'ಎಷ್ಟು', 'ಅಕ್ಕಿ', 'ಎಣ್ಣೆ'],
  ml: ['വന്നു', 'ചേർക്കുക', 'വിറ്റു', 'ഉണ്ട്', 'എത്ര', 'അരി', 'പഞ്ചസാര'],
  pa: ['ਆਇਆ', 'ਜੋੜੋ', 'ਵੇਚਿਆ', 'ਹੈ', 'ਕਿੰਨਾ', 'ਚੌਲ', 'ਖੰਡ']
};

const HINGLISH_MARKERS = [
  'karo', 'aaya', 'aayi', 'aaye', 'becha', 'bika', 'diya', 'liya',
  'hai', 'hain', 'mein', 'kitna', 'kitni', 'bacha', 'dalo', 'daalo',
  'kam', 'zyada', 'mangwao', 'bhejo', 'bori', 'bora', 'katta',
  'chini', 'chawal', 'atta', 'tel', 'doodh', 'pyaaz', 'aloo', 'ande',
  'rupaye', 'paisa', 'dukaan', 'add', 'sell', 'stock'
];

/**
 * Detects language family and script
 * @param {string} text 
 * @returns {Object} { language: string, confidence: number }
 */
export function detectLanguage(text = '') {
  if (!text || typeof text !== 'string') {
    return { language: 'en-IN', confidence: 1.0 };
  }

  const clean = text.trim();

  // 1. Script checks across all Indian Unicode blocks
  for (const { script, regex } of SCRIPT_REGEXES) {
    if (regex.test(clean)) {
      // If Devanagari, distinguish Marathi from Hindi
      if (script === 'hi') {
        const isMarathi = REGIONAL_MARKERS.mr.some(m => clean.includes(m));
        return { language: isMarathi ? 'mr-IN' : 'hi-IN', confidence: 0.96 };
      }
      return { language: `${script}-IN`, confidence: 0.96 };
    }
  }

  // 2. Transliterated / Romanized checks
  const words = clean.toLowerCase().split(/\s+/);
  let hinglishScore = 0;
  for (const word of words) {
    if (HINGLISH_MARKERS.includes(word)) hinglishScore++;
  }

  if (hinglishScore > 0) {
    return { language: 'en-IN', dialect: 'hinglish', confidence: 0.90 };
  }

  return { language: 'en-IN', confidence: 0.85 };
}
