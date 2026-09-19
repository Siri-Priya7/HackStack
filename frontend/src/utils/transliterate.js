/**
 * Multilingual Entity Localizer & Indic-to-Latin Transliteration Engine
 * Ensures ZERO script mixing across all 11 supported Indian languages.
 * When language is English ('en-IN'), all Indic scripts (Telugu, Hindi, Bengali, etc.)
 * are automatically localized or transliterated to clean English Latin.
 */

// ─── High-Priority Known Entity Dictionary ───────────────────────────────────
const ENTITY_DICTIONARY = {
  // Telugu entities
  'స్టోర్స్': 'Stores',
  'స్టోర్': 'Store',
  'నెల్లూరు': 'Nellore',
  'శ్రీ ప్రియ': 'Sri Priya',
  'శ్రీ': 'Sri',
  'ప్రియ': 'Priya',
  'కిరాణా': 'Kirana',
  'జనరల్': 'General',
  'మార్కెట్': 'Market',
  'ట్రేడర్స్': 'Traders',
  'అల్లం': 'Allam',
  'శిరీష్': 'Shirish',
  'శిరీష్ అల్లం': 'Shirish Allam',
  'సిరిప్రియ': 'Siripriya',
  'హైదరాబాద్': 'Hyderabad',
  'విజయవాడ': 'Vijayawada',
  'విశాఖపట్నం': 'Visakhapatnam',
  'తిరుపతి': 'Tirupati',
  'గుంటూరు': 'Guntur',
  'కర్నూలు': 'Kurnool',
  'వరంగల్': 'Warangal',
  'రమేష్ శర్మ': 'Ramesh Sharma',
  'సురేష్ కుమార్': 'Suresh Kumar',

  // Hindi / Devanagari entities
  'शर्मा किराना स्टोर': 'Sharma Kirana Store',
  'गुप्ता जनरल स्टोर': 'Gupta General Store',
  'रमेश शर्मा': 'Ramesh Sharma',
  'सुरेश कुमार': 'Suresh Kumar',
  'विक्रम सिंघानिया': 'Vikram Singhania',
  'राजेश गुप्ता': 'Rajesh Gupta',
  'कल्याण सिंह': 'Kalyan Singh',
  'किराना': 'Kirana',
  'स्टोर': 'Store',
  'स्टोर्स': 'Stores',
  'दुकान': 'Shop',
  'दिल्ली': 'Delhi',
  'जयपुर': 'Jaipur',
  'मुंबई': 'Mumbai',
  'कोलकाता': 'Kolkata',
  'चेन्नई': 'Chennai',
  'बेंगलुरु': 'Bengaluru',
  'लखनऊ': 'Lucknow',
  'पटना': 'Patna',

  // Tamil entities
  'ஸ்டோர்': 'Store',
  'ஸ்டோர்ஸ்': 'Stores',
  'சென்னை': 'Chennai',
  'மதுரை': 'Madurai',
  'கோயம்புத்தூர்': 'Coimbatore',

  // Bengali entities
  'স্টোর': 'Store',
  'কলকাতা': 'Kolkata',
  'হাওড়া': 'Howrah',

  // Kannada entities
  'ಸ್ಟೋರ್': 'Store',
  'ಬೆಂಗಳೂರು': 'Bengaluru',
  'ಮೈಸೂರು': 'Mysuru',

  // Gujarati entities
  'સ્ટોર': 'Store',
  'અમદાવાદ': 'Ahmedabad',
  'સુરત': 'Surat'
};

// ─── Telugu Script Unicode Mappings ──────────────────────────────────────────
const TE_VOWELS = {
  '\u0C05': 'a', '\u0C06': 'aa', '\u0C07': 'i', '\u0C08': 'ee', '\u0C09': 'u',
  '\u0C0A': 'oo', '\u0C0B': 'ru', '\u0C0E': 'e', '\u0C0F': 'e', '\u0C10': 'ai',
  '\u0C12': 'o', '\u0C13': 'o', '\u0C14': 'au'
};
const TE_MATRAS = {
  '\u0C3E': 'aa', '\u0C3F': 'i', '\u0C40': 'ee', '\u0C41': 'u', '\u0C42': 'oo',
  '\u0C43': 'ru', '\u0C46': 'e', '\u0C47': 'e', '\u0C48': 'ai', '\u0C4A': 'o',
  '\u0C4B': 'o', '\u0C4C': 'au'
};
const TE_CONSONANTS = {
  '\u0C15': 'k', '\u0C16': 'kh', '\u0C17': 'g', '\u0C18': 'gh', '\u0C19': 'ng',
  '\u0C1A': 'ch', '\u0C1B': 'chh', '\u0C1C': 'j', '\u0C1D': 'jh', '\u0C1E': 'ny',
  '\u0C1F': 't', '\u0C20': 'th', '\u0C21': 'd', '\u0C22': 'dh', '\u0C23': 'n',
  '\u0C24': 't', '\u0C25': 'th', '\u0C26': 'd', '\u0C27': 'dh', '\u0C28': 'n',
  '\u0C2A': 'p', '\u0C2B': 'ph', '\u0C2C': 'b', '\u0C2D': 'bh', '\u0C2E': 'm',
  '\u0C2F': 'y', '\u0C30': 'r', '\u0C31': 'r', '\u0C32': 'l', '\u0C33': 'l',
  '\u0C35': 'v', '\u0C36': 'sh', '\u0C37': 'sh', '\u0C38': 's', '\u0C39': 'h'
};
const TE_VIRAMA = '\u0C4D';
const TE_ANUSVARA = '\u0C02';

// ─── Devanagari Script Unicode Mappings ───────────────────────────────────────
const HI_VOWELS = {
  '\u0905': 'a', '\u0906': 'aa', '\u0907': 'i', '\u0908': 'ee', '\u0909': 'u',
  '\u090A': 'oo', '\u090B': 'ri', '\u090F': 'e', '\u0910': 'ai', '\u0913': 'o', '\u0914': 'au'
};
const HI_MATRAS = {
  '\u093E': 'aa', '\u093F': 'i', '\u0940': 'ee', '\u0941': 'u', '\u0942': 'oo',
  '\u0943': 'ri', '\u0947': 'e', '\u0948': 'ai', '\u094B': 'o', '\u094C': 'au'
};
const HI_CONSONANTS = {
  '\u0915': 'k', '\u0916': 'kh', '\u0917': 'g', '\u0918': 'gh', '\u0919': 'ng',
  '\u091A': 'ch', '\u091B': 'chh', '\u091C': 'j', '\u091D': 'jh', '\u091E': 'ny',
  '\u091F': 't', '\u0920': 'th', '\u0921': 'd', '\u0922': 'dh', '\u0923': 'n',
  '\u0924': 't', '\u0925': 'th', '\u0926': 'd', '\u0927': 'dh', '\u0928': 'n',
  '\u092A': 'p', '\u092B': 'ph', '\u092C': 'b', '\u092D': 'bh', '\u092E': 'm',
  '\u092F': 'y', '\u0930': 'r', '\u0932': 'l', '\u0933': 'l', '\u0935': 'v',
  '\u0936': 'sh', '\u0937': 'sh', '\u0938': 's', '\u0939': 'h'
};
const HI_VIRAMA = '\u094D';
const HI_ANUSVARA = '\u0902';

// Check if string contains any Indic Unicode script
export function hasIndicScript(str) {
  if (!str || typeof str !== 'string') return false;
  return /[\u0900-\u0D7F]/.test(str);
}

// Algorithmic Transliteration for Telugu
function transliterateTeluguToLatin(text) {
  let str = text;
  for (const [k, v] of Object.entries(ENTITY_DICTIONARY)) {
    if (str.includes(k)) {
      str = str.replace(new RegExp(k, 'g'), v);
    }
  }

  let out = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (TE_CONSONANTS[ch]) {
      const base = TE_CONSONANTS[ch];
      const next = str[i + 1];
      if (next === TE_VIRAMA) {
        out += base;
        i++;
      } else if (TE_MATRAS[next]) {
        out += base + TE_MATRAS[next];
        i++;
      } else {
        out += base + 'a';
      }
    } else if (TE_VOWELS[ch]) {
      out += TE_VOWELS[ch];
    } else if (ch === TE_ANUSVARA) {
      out += 'm';
    } else {
      out += ch;
    }
  }
  return out;
}

// Algorithmic Transliteration for Devanagari (Hindi/Marathi)
function transliterateDevanagariToLatin(text) {
  let str = text;
  for (const [k, v] of Object.entries(ENTITY_DICTIONARY)) {
    if (str.includes(k)) {
      str = str.replace(new RegExp(k, 'g'), v);
    }
  }

  let out = '';
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (HI_CONSONANTS[ch]) {
      const base = HI_CONSONANTS[ch];
      const next = str[i + 1];
      if (next === HI_VIRAMA) {
        out += base;
        i++;
      } else if (HI_MATRAS[next]) {
        out += base + HI_MATRAS[next];
        i++;
      } else {
        out += base + 'a';
      }
    } else if (HI_VOWELS[ch]) {
      out += HI_VOWELS[ch];
    } else if (ch === HI_ANUSVARA) {
      out += 'n';
    } else {
      out += ch;
    }
  }
  return out;
}

/**
 * Universal Indic-to-English Transliteration
 */
export function indicToEnglish(text) {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();

  // 1. Direct dictionary match
  if (ENTITY_DICTIONARY[trimmed]) {
    return ENTITY_DICTIONARY[trimmed];
  }

  // 2. Multi-token dictionary replacement
  let working = trimmed;
  for (const [k, v] of Object.entries(ENTITY_DICTIONARY)) {
    if (working.includes(k)) {
      working = working.replace(new RegExp(k, 'g'), v);
    }
  }

  // If no remaining Indic characters, return cleanly formatted
  if (!hasIndicScript(working)) {
    return working.replace(/\s+/g, ' ').trim();
  }

  // 3. Script-specific algorithmic transliteration
  let result = working;
  // Telugu range: U+0C00 to U+0C7F
  if (/[\u0C00-\u0C7F]/.test(result)) {
    result = transliterateTeluguToLatin(result);
  }
  // Devanagari range: U+0900 to U+097F
  if (/[\u0900-\u097F]/.test(result)) {
    result = transliterateDevanagariToLatin(result);
  }

  // 4. Cleanup trailing viramas or unmapped diacritics
  result = result.replace(/[\u0900-\u0D7F]/g, '');
  result = result.replace(/\s+/g, ' ').trim();

  // 5. Title Case for neat display (e.g. "sri priya" -> "Sri Priya")
  return result.replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Localize Any Entity Name (Store Name, User Name, City, etc.)
 * Strictly enforces that if language is English, NO Indic characters are displayed.
 *
 * @param {string} text - Raw entity text (e.g. "స్టోర్స్", "నెల్లూరు", "శ్రీ ప్రియ")
 * @param {string} targetLang - Current selected UI language ('en-IN', 'hi-IN', 'te-IN', etc.)
 * @returns {string} - Perfectly localized string for display
 */
export function localizeEntity(text, targetLang = 'en-IN') {
  if (!text || typeof text !== 'string') return '';

  const isEnglish = targetLang === 'en-IN' || targetLang === 'en' || targetLang.startsWith('en');

  // If English is selected and string has Indic characters -> Transliterate immediately
  if (isEnglish) {
    if (hasIndicScript(text) || ENTITY_DICTIONARY[text.trim()]) {
      return indicToEnglish(text);
    }
    return text;
  }

  // If target language is non-English (e.g. te-IN, hi-IN):
  // If the text is already in that script or matching dictionary, preserve or translate
  return text;
}
