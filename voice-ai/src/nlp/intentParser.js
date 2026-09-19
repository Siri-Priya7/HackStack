/**
 * Intent Parser for Multilingual Indian Inventory Voice Commands
 * Resolves natural spoken utterances to system intents.
 */

const INTENT_PATTERNS = {
  ADD_STOCK: [
    /\b(add|added|receive|received|restock|restocked|inward|brought|bought|plus)\b/i,
    /\b(aaya|aayi|aaye|aagaya|aagayi|daalo|dalo|jodo|add\s*karo|stock\s*aaya|inward|kharida|mangwaya|plus)\b/i,
    /(आया|आई|आए|जोड़ो|जोड़ो|डालो|स्टॉक\s*आया|खरीदा|प्लस)/
  ],
  REMOVE_STOCK: [
    /\b(sell|sold|remove|removed|minus|deduct|out|dispense|give|gave|took)\b/i,
    /\b(becha|bika|bik\s*gaya|de\s*diya|nikalo|nikala|hatao|kam\s*karo|minus|out|gaya|gayi|de\s*do)\b/i,
    /(बेचा|बिका|बिक\s*गया|दे\s*दिया|निकाला|निकालो|कम\s*करो|माइनस|हटाओ)/
  ],
  GET_ALERTS: [
    /\b(alert|alerts|running\s*out|running\s*low|low\s*stock|shortage|reorder\s*needed)\b/i,
    /\b(khatam|kam\s*hai|kya\s*mangwana|alert|alerts|low\s*stock|shortage|kya\s*khatam)\b/i,
    /(खत्म|अलर्ट|कम\s*है|क्या\s*मंगवाना|कमी)/
  ],
  GET_SUMMARY: [
    /\b(summary|overview|daily\s*report|total\s*stock|business\s*today|today's\s*summary)\b/i,
    /\b(summary|hisab|hisaab|aaj\s*ka\s*hisab|dukaan\s*ka\s*haal|report|overall)\b/i,
    /(हिसाब|समरी|आज\s*का\s*हिसाब|दुकान\s*का\s*हाल)/
  ],
  QUERY_STOCK: [
    /\b(how\s*much|how\s*many|check|status|inquiry|query|quantity|what\s*is\s*the\s*stock)\b/i,
    /\b(kitna|kitni|kitne|bacha|bachi|bache|kya\s*hai|check\s*karo|batao|dikhao|status)\b/i,
    /(कितना|कितनी|कितने|बचा|बची|बचे|चेक\s*करो|बताओ|दिखाओ)/
  ]
};

/**
 * Parses the intent from an utterance.
 * @param {string} utterance - Spoken transcript
 * @returns {Object} { intent: string, confidence: number }
 */
export function parseIntent(utterance = '') {
  if (!utterance || typeof utterance !== 'string') {
    return { intent: 'QUERY_STOCK', confidence: 0.5 };
  }

  const text = utterance.toLowerCase().trim();

  // 1. Check specific patterns with priority:
  // Summary & Alerts check first if specific keywords match
  for (const regex of INTENT_PATTERNS.GET_SUMMARY) {
    if (regex.test(text)) {
      return { intent: 'GET_SUMMARY', confidence: 0.95 };
    }
  }

  for (const regex of INTENT_PATTERNS.GET_ALERTS) {
    if (regex.test(text)) {
      return { intent: 'GET_ALERTS', confidence: 0.92 };
    }
  }

  // Check ADD before QUERY (e.g. "5 bori chawal aaya" contains "aaya" for ADD)
  for (const regex of INTENT_PATTERNS.ADD_STOCK) {
    if (regex.test(text)) {
      return { intent: 'ADD_STOCK', confidence: 0.94 };
    }
  }

  // Check REMOVE
  for (const regex of INTENT_PATTERNS.REMOVE_STOCK) {
    if (regex.test(text)) {
      return { intent: 'REMOVE_STOCK', confidence: 0.94 };
    }
  }

  // Check QUERY
  for (const regex of INTENT_PATTERNS.QUERY_STOCK) {
    if (regex.test(text)) {
      return { intent: 'QUERY_STOCK', confidence: 0.90 };
    }
  }

  // Default heuristic: If contains numbers, default to ADD_STOCK if affirmative, else QUERY
  if (/\d+/.test(text)) {
    return { intent: 'ADD_STOCK', confidence: 0.60 };
  }

  return { intent: 'QUERY_STOCK', confidence: 0.50 };
}
