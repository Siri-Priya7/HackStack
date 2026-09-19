/**
 * Multilingual Entity Extractor for Indian Trade Utterances
 * Extracts product, trade quantity (digits & spoken in 11 languages), units, and prices.
 */

// Comprehensive Spoken Number Dictionary across Indian Languages
const NUMBER_WORDS = {
  // English & Transliterated Hinglish
  'half': 0.5, 'aadha': 0.5, 'adha': 0.5, 'sawa': 1.25, 'dedh': 1.5, 'dhai': 2.5,
  'one': 1, 'ek': 1, 'onnu': 1, 'okati': 1, 'ondu': 1,
  'two': 2, 'do': 2, 'rendu': 2, 'eradu': 2, 'don': 2, 'dui': 2, 'be': 2,
  'three': 3, 'teen': 3, 'moonu': 3, 'moodu': 3, 'mooru': 3, 'tin': 3, 'tran': 3,
  'four': 4, 'chaar': 4, 'char': 4, 'naalu': 4, 'nalugu': 4, 'naalku': 4,
  'five': 5, 'paanch': 5, 'panch': 5, 'anju': 5, 'aidu': 5,
  'six': 6, 'chhah': 6, 'che': 6, 'aaru': 6, 'aar': 6,
  'seven': 7, 'saat': 7, 'yelu': 7, 'elu': 7,
  'eight': 8, 'aath': 8, 'ath': 8, 'ettu': 8, 'enimidi': 8,
  'nine': 9, 'nau': 9, 'onbadhu': 9, 'tommidi': 9, 'ombhatthu': 9,
  'ten': 10, 'das': 10, 'dus': 10, 'pathu': 10, 'padi': 10, 'hatthu': 10, 'daha': 10,
  'fifteen': 15, 'pandrah': 15, 'padhinaindhu': 15, 'padihedu': 15,
  'twenty': 20, 'bees': 20, 'irubadhu': 20, 'iravai': 20, 'ippatthu': 20, 'vees': 20,
  'twenty-five': 25, 'pachees': 25,
  'thirty': 30, 'tees': 30,
  'forty': 40, 'chalis': 40, 'chaalees': 40,
  'fifty': 50, 'pachaas': 50, 'pachas': 50, 'aimbadhu': 50, 'yaabhai': 50, 'aivatthu': 50, 'pannas': 50,
  'hundred': 100, 'sau': 100, 'nooru': 100, 'vanda': 100, 'shambhar': 100,

  // Devanagari Hindi & Marathi
  'एक': 1, 'दोन': 2, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाँच': 5, 'पांच': 5, 'पाच': 5,
  'छह': 6, 'सहा': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'नऊ': 9, 'दस': 10, 'दहा': 10,
  'पंद्रह': 15, 'पंधरा': 15, 'बीस': 20, 'वीस': 20, 'पच्चीस': 25, 'पंचवीस': 25,
  'तीस': 30, 'चालीस': 40, 'चाळीस': 40, 'पचास': 50, 'पन्नास': 50, 'सौ': 100, 'शंभर': 100,
  'आधा': 0.5, 'अर्धा': 0.5, 'डेढ़': 1.5, 'दीड': 1.5, 'ढाई': 2.5, 'अडीच': 2.5,

  // Bengali
  'এক': 1, 'দুই': 2, 'তিন': 3, 'চার': 4, 'পাঁচ': 5, 'ছয়': 6, 'সাত': 7, 'আট': 8, 'নয়': 9, 'দশ': 10,
  'পনের': 15, 'বিশ': 20, 'পঁচিশ': 25, 'ত্রিশ': 30, 'চল্লিশ': 40, 'পঞ্চাশ': 50, 'একশো': 100, 'দেড়': 1.5, 'আড়াই': 2.5,

  // Telugu
  'ఒకటి': 1, 'రెండు': 2, 'మూడు': 3, 'నాలుగు': 4, 'ఐదు': 5, 'ఆరు': 6, 'ఏడు': 7, 'ఎనిమిది': 8, 'తొమ్మిది': 9, 'పది': 10,
  'పదిహేను': 15, 'ఇరవై': 20, 'ఇరవైఐదు': 25, 'ముప్పై': 30, 'నలభై': 40, 'యాభై': 50, 'వంద': 100,

  // Tamil
  'ஒன்று': 1, 'இரண்டு': 2, 'மூன்று': 3, 'நான்கு': 4, 'ஐந்து': 5, 'ஆறு': 6, 'ஏழு': 7, 'எட்டு': 8, 'ஒன்பது': 9, 'பத்து': 10,
  'பதினைந்து': 15, 'இருபது': 20, 'இருபத்தைந்து': 25, 'முப்பது': 30, 'நாற்பது': 40, 'ஐம்பது': 50, 'நூறு': 100,

  // Gujarati
  'એક': 1, 'બે': 2, 'ત્રણ': 3, 'ચાર': 4, 'પાંચ': 5, 'છ': 6, 'સાત': 7, 'આઠ': 8, 'નવ': 9, 'દસ': 10,
  'પંદર': 15, 'વીસ': 20, 'પચ્ચીસ': 25, 'ત્રીસ': 30, 'ચાલીસ': 40, 'પચાસ': 50, 'સો': 100,

  // Kannada
  'ಒಂದು': 1, 'ಎರಡು': 2, 'ಮೂರು': 3, 'ನಾಲ್ಕು': 4, 'ಐದು': 5, 'ಆರು': 6, 'ಏಳು': 7, 'ಎಂಟು': 8, 'ಒಂಬತ್ತು': 9, 'ಹತ್ತು': 10,
  'ಹದಿನೈದು': 15, 'ಇಪ್ಪತ್ತು': 20, 'ಇಪ್ಪತ್ತೈದು': 25, 'ಮೂವತ್ತು': 30, 'ನಲವತ್ತು': 40, 'ಐವತ್ತು': 50, 'ನೂರು': 100,

  // Malayalam
  'ഒന്ന്': 1, 'രണ്ട്': 2, 'മൂന്ന്': 3, 'നാല്': 4, 'അഞ്ച്': 5, 'ആറ്': 6, 'ഏഴ്': 7, 'എട്ട്': 8, 'ഒമ്പത്': 9, 'പത്ത്': 10,
  'പതിനഞ്ച്': 15, 'ഇരുപത്': 20, 'ഇരുപത്തിയഞ്ച്': 25, 'മുപ്പത്': 30, 'നാല്പത്': 40, 'അമ്പത്': 50, 'നൂറ്': 100,

  // Punjabi
  'ਇੱਕ': 1, 'ਦੋ': 2, 'ਤਿੰਨ': 3, 'ਚਾਰ': 4, 'ਪੰਜ': 5, 'ਛੇ': 6, 'ਸੱਤ': 7, 'ਅੱਠ': 8, 'ਨੌਂ': 9, 'ਦਸ': 10,
  'ਪੰਦਰਾਂ': 15, 'ਵੀਹ': 20, 'ਪੰਝੀ': 25, 'ਤੀਹ': 30, 'ਚਾਲੀ': 40, 'ਪੰਜਾਹ': 50, 'ਸੌ': 100,

  // Odia
  'ଏକ': 1, 'ଦୁଇ': 2, 'ତିନି': 3, 'ଚାରି': 4, 'ପାଞ୍ଚ': 5, 'ଛଅ': 6, 'ସାତ': 7, 'ଆଠ': 8, 'ନଅ': 9, 'ଦଶ': 10,
  'ପନ୍ଦର': 15, 'କୋଡ଼ିଏ': 20, 'ପଚିଶ': 25, 'ତିରିଶ': 30, 'ଚାଳିଶ': 40, 'ପଚାଶ': 50, 'ଶହେ': 100
};

// Trade Units across Indian languages
const TRADE_UNITS = [
  'bori', 'bora', 'bag', 'bags', 'katta', 'kattal', 'thailee', 'moottai',
  'বোরি', 'পোস্তা', 'थैली', 'மூட்டை', 'సంచి', 'ಚೀಲ', 'ചാക്ക്',
  'peti', 'carton', 'cartons', 'box', 'boxes', 'crate', 'crates',
  'પેટી', 'ಪೆಟ್ಟಿಗೆ', 'పెట్టె', 'பெட்டி', 'പെട്ടി',
  'packet', 'packets', 'pkt', 'pkts', 'pouch', 'pouches',
  'প্যাকেট', 'பாக்கெட்', 'ప్యాకెట్', 'ಪ್ಯಾಕೆಟ್', 'പാക്കറ്റ്',
  'kilo', 'kg', 'kgs', 'kilogram', 'kilograms', 'gm', 'g', 'gram', 'grams',
  'किलो', 'কেজি', 'கிலோ', 'కిలో', 'ಕಿಲೋ', 'കിലോ',
  'quintal', 'palla',
  'dozen', 'dozens', 'darjan', 'darzon', 'दर्जन', 'డజను', 'டஜன்', 'ಡಜನ್', 'ഡസൻ',
  'piece', 'pieces', 'pcs', 'pc', 'nag', 'नग', 'పీస్', 'துண்டு', 'ತುಂಡು',
  'litre', 'liter', 'litres', 'l', 'ltr', 'ml', 'लीटर', 'লিটার', 'லிட்டர்', 'లీటరు', 'ಲೀಟರ್', 'ലിറ്റർ'
];

/**
 * Extracts quantity from text across 11 Indian scripts or numeric digits
 */
export function extractQuantity(text = '') {
  // 1. Direct numeric check
  const numMatch = text.match(/\b(\d+(?:\.\d+)?)\b/);
  if (numMatch) {
    return parseFloat(numMatch[1]);
  }

  // 2. Unicode digits check (e.g. Hindi/Bengali numerals: ১, २, ৩, etc.)
  const indicDigits = {
    '०': 0, '१': 1, '२': 2, '३': 3, '४': 4, '५': 5, '६': 6, '७': 7, '८': 8, '९': 9,
    '০': 0, '১': 1, '২': 2, '৩': 3, '৪': 4, '৫': 5, '৬': 6, '৭': 7, '৮': 8, '৯': 9,
    '౦': 0, '౧': 1, '౨': 2, '౩': 3, '౪': 4, '౫': 5, '౬': 6, '౭': 7, '౮': 8, '౯': 9,
    '೦': 0, '೧': 1, '೨': 2, '೩': 3, '೪': 4, '೫': 5, '೬': 6, '೭': 7, '೮': 8, '೯': 9
  };

  for (const char of text) {
    if (indicDigits[char] !== undefined) {
      return indicDigits[char];
    }
  }

  // 3. Spoken word matching
  const words = text.toLowerCase().split(/\s+/);
  for (const word of words) {
    const clean = word.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
    if (NUMBER_WORDS[clean] !== undefined) {
      return NUMBER_WORDS[clean];
    }
  }

  return null;
}

/**
 * Extracts trade unit from text
 */
export function extractUnit(text = '') {
  const lower = text.toLowerCase();
  for (const unit of TRADE_UNITS) {
    if (lower.includes(unit.toLowerCase())) {
      // Return normalized English canonical token
      if (['বোরি', 'পোস্তা', 'மூட்டை', 'సంచి', 'ಚೀಲ', 'ചാക്ക്', 'bora', 'katta', 'kattal'].includes(unit)) return 'bori';
      if (['પેટી', 'ಪೆಟ್ಟಿಗೆ', 'పెట్టె', 'பெட்டி', 'പെട്ടി', 'carton', 'box'].includes(unit)) return 'peti';
      if (['প্যাকেট', 'பாக்கெட்', 'ప్యాకెట్', 'ಪ್ಯಾಕೆಟ್', 'പാക്കറ്റ്', 'pouch'].includes(unit)) return 'packet';
      if (['दर्जन', 'డజను', 'டஜன்', 'ಡಜನ್', 'ഡസൻ', 'darjan'].includes(unit)) return 'dozen';
      if (['किलो', 'কেজি', 'கிலோ', 'కిలో', 'ಕಿಲೋ', 'കിലോ', 'kilo'].includes(unit)) return 'kg';
      if (['लीटर', 'লিটার', 'லிட்டர்', 'లీటరు', 'ಲೀಟರ್', 'ലിറ്റർ', 'liter'].includes(unit)) return 'litre';
      return unit;
    }
  }
  return null;
}

function normalizePhonetic(str = '') {
  return str.toLowerCase()
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/aa/g, 'a')
    .replace(/bh/g, 'b')
    .replace(/dh/g, 'd')
    .replace(/th/g, 't')
    .replace(/sh/g, 's')
    .replace(/kh/g, 'k')
    .replace(/gh/g, 'g')
    .replace(/jh/g, 'j')
    .replace(/ph/g, 'f')
    .replace(/v/g, 'w')
    .replace(/nn/g, 'n')
    .replace(/ll/g, 'l');
}

function levenshteinDistance(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

/**
 * Matches an utterance against a list of products using multi-language aliases
 */
export function matchProduct(text = '', productCatalog = []) {
  if (!text || !productCatalog.length) return null;
  const lowerText = text.toLowerCase();
  const phoneticText = normalizePhonetic(lowerText);

  let bestMatch = null;
  let highestScore = 0;

  for (const prod of productCatalog) {
    const prodName = prod.name.toLowerCase();
    if (lowerText.includes(prodName) || phoneticText.includes(normalizePhonetic(prodName))) {
      return prod;
    }

    let aliases = [];
    if (Array.isArray(prod.regional_names)) {
      aliases = prod.regional_names;
    } else if (typeof prod.regional_names === 'string') {
      try {
        aliases = JSON.parse(prod.regional_names);
      } catch (e) {
        aliases = [prod.regional_names];
      }
    }

    for (const alias of aliases) {
      const cleanAlias = alias.toLowerCase().trim();
      const phoneticAlias = normalizePhonetic(cleanAlias);

      if (cleanAlias.length >= 2 && (lowerText.includes(cleanAlias) || phoneticText.includes(phoneticAlias))) {
        return prod;
      }
    }

    const tokens = lowerText.split(/\s+/);
    for (const token of tokens) {
      if (token.length < 3) continue;
      const normToken = normalizePhonetic(token);

      for (const alias of [prodName, ...aliases]) {
        const cleanAlias = alias.toLowerCase().trim();
        const normAlias = normalizePhonetic(cleanAlias);

        const dist = levenshteinDistance(normToken, normAlias);
        const maxLen = Math.max(normToken.length, normAlias.length);
        const similarity = 1 - (dist / maxLen);

        if (similarity > 0.65 && similarity > highestScore) {
          highestScore = similarity;
          bestMatch = prod;
        }
      }
    }
  }

  return bestMatch;
}

export function extractEntities(text = '', productCatalog = []) {
  const quantity = extractQuantity(text);
  const rawUnit = extractUnit(text);
  const matchedProduct = matchProduct(text, productCatalog);

  return {
    product: matchedProduct,
    quantity: quantity ?? 1,
    unit: rawUnit ?? (matchedProduct ? (matchedProduct.default_unit || matchedProduct.base_unit) : 'kg'),
    hasExplicitQuantity: quantity !== null,
    hasExplicitUnit: rawUnit !== null
  };
}
