/**
 * Language Detector for Indian Retail Voice Input
 * Classifies between Devanagari Hindi, Romanized Hinglish, English, and Regional scripts.
 */

const HINDI_DEVANAGARI_REGEX = /[\u0900-\u097F]/;
const TAMIL_REGEX = /[\u0B80-\u0BFF]/;
const TELUGU_REGEX = /[\u0C00-\u0C7F]/;

const HINGLISH_MARKERS = [
  'karo', 'aaya', 'aayi', 'aaye', 'becha', 'bika', 'diya', 'liya',
  'hai', 'hain', 'mein', 'kitna', 'kitni', 'bacha', 'dalo', 'daalo',
  'kam', 'zyada', 'mangwao', 'bhejo', 'bori', 'bora', 'katta',
  'chini', 'chawal', 'atta', 'tel', 'doodh', 'pyaaz', 'aloo', 'ande',
  'rupaye', 'paisa', 'dukaan'
];

/**
 * Detects the language family and dialect of the input text.
 * @param {string} text 
 * @returns {Object} { language: 'hi' | 'hinglish' | 'ta' | 'te' | 'en', confidence: number }
 */
export function detectLanguage(text = '') {
  if (!text || typeof text !== 'string') {
    return { language: 'en', confidence: 1.0 };
  }

  const clean = text.trim();

  // 1. Script checks
  if (HINDI_DEVANAGARI_REGEX.test(clean)) {
    return { language: 'hi', confidence: 0.95 };
  }
  if (TAMIL_REGEX.test(clean)) {
    return { language: 'ta', confidence: 0.95 };
  }
  if (TELUGU_REGEX.test(clean)) {
    return { language: 'te', confidence: 0.95 };
  }

  // 2. Hinglish vs English check
  const words = clean.toLowerCase().split(/\s+/);
  let hinglishCount = 0;

  for (const word of words) {
    if (HINGLISH_MARKERS.includes(word)) {
      hinglishCount++;
    }
  }

  if (hinglishCount > 0) {
    const confidence = Math.min(0.95, 0.6 + (hinglishCount * 0.15));
    return { language: 'hinglish', confidence };
  }

  return { language: 'en', confidence: 0.85 };
}
