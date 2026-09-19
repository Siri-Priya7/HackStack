/**
 * Multilingual Intent Parser for Indian Retail Voice Commands
 * Covers Hindi, Hinglish, Bengali, Marathi, Telugu, Tamil, Gujarati, Kannada, Malayalam, Punjabi, Odia, English.
 */

const INTENT_PATTERNS = {
  ADD_STOCK: [
    /\b(add|added|receive|received|restock|restocked|inward|brought|bought|plus)\b/i,
    /\b(aaya|aayi|aaye|aagaya|aagayi|daalo|dalo|jodo|add\s*karo|stock\s*aaya|inward|kharida|mangwaya|plus)\b/i,
    // Hindi & Marathi
    /(आया|आई|आए|जोड़ो|जोड़ो|डालो|स्टॉक\s*आया|खरीदा|प्लस|आले|टाका|वाढवा)/,
    // Bengali
    /(এলো|এসেছে|যোগ\s*করো|ঢোকাও|কিনলাম|যোগ)/,
    // Telugu
    /(వచ్చింది|వేయి|చేర్చు|కొన్నాను|చేర్చండి)/,
    // Tamil
    /(வந்தது|சேர்த்துகொள்|சேர்|வாங்கினேன்)/,
    // Gujarati
    /(આવ્યું|ઉમેરો|નાખો|ખરીદ્યું)/,
    // Kannada
    /(ಬಂತು|ಸೇರಿಸಿ|ಹಾಕಿ|ಕೊಂಡೆ)/,
    // Malayalam
    /(വന്നു|ചേർക്കുക|വാങ്ങി)/,
    // Punjabi
    /(ਆਇਆ|ਜੋੜੋ|ਪਾਓ|ਖਰੀਦਿਆ)/,
    // Odia
    /(ଆସିଲା|ଯୋଡ଼ନ୍ତୁ|କିଣିଲି)/
  ],
  REMOVE_STOCK: [
    /\b(sell|sold|remove|removed|minus|deduct|out|dispense|give|gave|took)\b/i,
    /\b(becha|bika|bik\s*gaya|de\s*diya|nikalo|nikala|hatao|kam\s*karo|minus|out|gaya|gayi|de\s*do|ammanu|vitren)\b/i,
    // Hindi & Marathi
    /(बेचा|बिका|बिक\s*गया|दे\s*दिया|निकाला|निकालो|कम\s*करो|माइनस|हटाओ|विकले|काढले|दिले)/,
    // Bengali
    /(বিক্রি|বেচেছি|দাও|কমাও)/,
    // Telugu
    /(అమ్మాను|అమ్మబడింది|తీయి|తగ్గించు)/,
    // Tamil
    /(விற்றது|விற்றேன்|கொடு|குறை)/,
    // Gujarati
    /(વેચ્યું|વેચાઈ\s*ગયું|આપ્યું|કાઢો)/,
    // Kannada
    /(ಮಾರಿದೆ|ಮಾರಾಟ|ತೆಗೆಯಿರಿ|ಕೊಡಿ)/,
    // Malayalam
    /(വിറ്റു|കൊടുത്തു|എടുത്തു)/,
    // Punjabi
    /(ਵੇਚਿਆ|ਦਿੱਤਾ|ਘਟਾਓ)/,
    // Odia
    /(ବିକ୍ରି|ବିକିଲି|କାଢନ୍ତୁ)/
  ],
  GET_ALERTS: [
    /\b(alert|alerts|running\s*out|running\s*low|low\s*stock|shortage|reorder\s*needed)\b/i,
    /\b(khatam|kam\s*hai|kya\s*mangwana|alert|alerts|low\s*stock|shortage|kya\s*khatam)\b/i,
    /(खत्म|अलर्ट|कम\s*है|क्या\s*मंगवाना|कमी|संपले|শেষ|హెచ్చరిక|எச்சரிக்கை|ચેતવણી|ಎಚ್ಚರಿಕೆ|മുന്നറിയിപ്പ്|ਚਿਤਾਵਨੀ)/
  ],
  GET_SUMMARY: [
    /\b(summary|overview|daily\s*report|total\s*stock|business\s*today|today's\s*summary)\b/i,
    /\b(summary|hisab|hisaab|aaj\s*ka\s*hisab|dukaan\s*ka\s*haal|report|overall)\b/i,
    /(हिसाब|समरी|आज\s*का\s*हिसाब|दुकान\s*का\s*हाल|हिशोब|হিসাব|లావాదేవీలు|வரவு\s*செலவு|હિસાબ|ವರದಿ|വിവരം|ਵੇਰਵਾ)/
  ],
  QUERY_STOCK: [
    /\b(how\s*much|how\s*many|check|status|inquiry|query|quantity|what\s*is\s*the\s*stock)\b/i,
    /\b(kitna|kitni|kitne|bacha|bachi|bache|kya\s*hai|check\s*karo|batao|dikhao|status)\b/i,
    // Across 11 scripts
    /(कितना|कितनी|कितने|बचा|बची|बचे|चेक\s*करो|बताओ|दिखाओ|किती|কত\s*আছে|ఎంత\s*ఉంది|எவ்வளவு\s*இருக்கு|કેટલું\s*છે|ಎಷ್ಟು\s*ಇದೆ|എത്രയുണ്ട്|ਕਿੰਨਾ\s*ਹੈ|କେତେ\s*ଅଛି)/
  ]
};

export function parseIntent(utterance = '') {
  if (!utterance || typeof utterance !== 'string') {
    return { intent: 'QUERY_STOCK', confidence: 0.5 };
  }

  const text = utterance.toLowerCase().trim();

  // 1. Check summary & alerts
  for (const regex of INTENT_PATTERNS.GET_SUMMARY) {
    if (regex.test(text)) return { intent: 'GET_SUMMARY', confidence: 0.95 };
  }
  for (const regex of INTENT_PATTERNS.GET_ALERTS) {
    if (regex.test(text)) return { intent: 'GET_ALERTS', confidence: 0.92 };
  }

  // 2. Check mutations
  for (const regex of INTENT_PATTERNS.ADD_STOCK) {
    if (regex.test(text)) return { intent: 'ADD_STOCK', confidence: 0.94 };
  }
  for (const regex of INTENT_PATTERNS.REMOVE_STOCK) {
    if (regex.test(text)) return { intent: 'REMOVE_STOCK', confidence: 0.94 };
  }

  // 3. Check query
  for (const regex of INTENT_PATTERNS.QUERY_STOCK) {
    if (regex.test(text)) return { intent: 'QUERY_STOCK', confidence: 0.90 };
  }

  if (/\d+/.test(text)) {
    return { intent: 'ADD_STOCK', confidence: 0.60 };
  }

  return { intent: 'QUERY_STOCK', confidence: 0.50 };
}
