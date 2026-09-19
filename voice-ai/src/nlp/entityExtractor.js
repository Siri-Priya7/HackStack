/**
 * Entity Extractor for Multilingual Indian Trade Utterances
 * Extracts product, quantity, unit, and optional price.
 */

// Spoken number dictionary
const NUMBER_WORDS = {
  // Hindi / Hinglish
  'aadha': 0.5, 'adha': 0.5, 'half': 0.5, 'sawa': 1.25, 'dedh': 1.5, 'dhai': 2.5,
  'ek': 1, 'one': 1,
  'do': 2, 'two': 2,
  'teen': 3, 'three': 3,
  'chaar': 4, 'char': 4, 'four': 4,
  'paanch': 5, 'panch': 5, 'five': 5,
  'chhah': 6, 'che': 6, 'six': 6,
  'saat': 7, 'seven': 7,
  'aath': 8, 'ath': 8, 'eight': 8,
  'nau': 9, 'nine': 9,
  'das': 10, 'dus': 10, 'ten': 10,
  'gyarah': 11, 'eleven': 11,
  'baarah': 12, 'twelve': 12,
  'terah': 13, 'thirteen': 13,
  'chaudah': 14, 'fourteen': 14,
  'pandrah': 15, 'fifteen': 15,
  'solah': 16, 'sixteen': 16,
  'satrah': 17, 'seventeen': 17,
  'athaarah': 18, 'atharah': 18, 'eighteen': 18,
  'unnees': 19, 'nineteen': 19,
  'bees': 20, 'twenty': 20,
  'pachees': 25, 'twenty-five': 25,
  'tees': 30, 'thirty': 30,
  'chaalees': 40, 'chalis': 40, 'forty': 40,
  'pachaas': 50, 'pachas': 50, 'fifty': 50,
  'sau': 100, 'hundred': 100,
  // Devanagari Hindi
  'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पाँच': 5, 'पांच': 5, 'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
  'ग्यारह': 11, 'बारह': 12, 'पंद्रह': 15, 'बीस': 20, 'पच्चीस': 25, 'तीस': 30, 'पचास': 50, 'सौ': 100,
  'आधा': 0.5, 'डेढ़': 1.5, 'ढाई': 2.5
};

// Recognized trade unit keywords
const TRADE_UNITS = [
  'bori', 'bora', 'bag', 'bags', 'katta', 'kattal', 'thailee', 'moottai',
  'peti', 'carton', 'cartons', 'box', 'boxes', 'crate', 'crates',
  'packet', 'packets', 'pkt', 'pkts', 'pouch', 'pouches',
  'kilo', 'kg', 'kgs', 'kilogram', 'kilograms', 'gm', 'g', 'gram', 'grams',
  'quintal', 'palla',
  'dozen', 'dozens', 'darjan', 'darzon',
  'piece', 'pieces', 'pcs', 'pc', 'nag',
  'litre', 'liter', 'litres', 'l', 'ltr', 'ml'
];

/**
 * Extracts quantity (numeric or written words) from text.
 * @param {string} text 
 * @returns {number|null}
 */
export function extractQuantity(text = '') {
  const words = text.toLowerCase().split(/\s+/);

  // 1. Direct numeric check: e.g. "5", "2.5", "10"
  const numMatch = text.match(/\b(\d+(?:\.\d+)?)\b/);
  if (numMatch) {
    return parseFloat(numMatch[1]);
  }

  // 2. Spoken word matching
  for (const word of words) {
    const clean = word.replace(/[^a-z0-9\u0900-\u097F]/gi, '');
    if (NUMBER_WORDS[clean] !== undefined) {
      return NUMBER_WORDS[clean];
    }
  }

  return null;
}

/**
 * Extracts trade unit from text.
 * @param {string} text 
 * @returns {string|null}
 */
export function extractUnit(text = '') {
  const lower = text.toLowerCase();
  for (const unit of TRADE_UNITS) {
    const regex = new RegExp(`\\b${unit}\\b`, 'i');
    if (regex.test(lower)) {
      return unit;
    }
  }
  return null;
}

/**
 * Normalizes Indian transliterated phonetic variations:
 * e.g., 'cheeni' -> 'chini', 'doodh' -> 'dudh', 'aashirvaad' -> 'ashirvad'
 */
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

/**
 * Simple Levenshtein distance for fuzzy matching
 */
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
 * Matches an utterance against a list of products.
 * @param {string} text - Voice utterance
 * @param {Array} productCatalog - List of product objects
 * @returns {Object|null} matched product
 */
export function matchProduct(text = '', productCatalog = []) {
  if (!text || !productCatalog.length) return null;
  const lowerText = text.toLowerCase();
  const phoneticText = normalizePhonetic(lowerText);

  let bestMatch = null;
  let highestScore = 0;

  for (const prod of productCatalog) {
    // 1. Direct name match
    const prodName = prod.name.toLowerCase();
    if (lowerText.includes(prodName) || phoneticText.includes(normalizePhonetic(prodName))) {
      return prod;
    }

    // 2. Check aliases / regional names
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

      // Direct inclusion or phonetic inclusion
      if (cleanAlias.length > 2 && (lowerText.includes(cleanAlias) || phoneticText.includes(phoneticAlias))) {
        return prod;
      }
    }

    // 3. Token-level fuzzy similarity with phonetic comparison
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

/**
 * Parses all entities from an utterance given a product catalog.
 * @param {string} text - Spoken transcript
 * @param {Array} productCatalog - Available products
 * @returns {Object} { product, quantity, unit, rawNumber }
 */
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
