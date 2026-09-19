import { detectLanguage } from '../nlp/languageDetector.js';
import { parseIntent } from '../nlp/intentParser.js';
import { extractEntities } from '../nlp/entityExtractor.js';
import { INVENTORY_SYSTEM_PROMPT } from '../prompts/inventoryPrompt.js';

/**
 * Unified Voice Processing Service
 * Analyzes natural spoken transcripts in Indian mixed languages and extracts actionable inventory commands.
 */
export class VoiceService {
  constructor(options = {}) {
    this.geminiApiKey = options.geminiApiKey || process.env.GEMINI_API_KEY || null;
  }

  /**
   * Main entry point for processing a voice transcript.
   * 
   * @param {string} transcript - Spoken user utterance (e.g. "5 bori chawal aaya")
   * @param {Array} productCatalog - List of active products from database
   * @returns {Promise<Object>} Structured parsed command
   */
  async processVoiceCommand(transcript, productCatalog = []) {
    if (!transcript || typeof transcript !== 'string' || !transcript.trim()) {
      return {
        success: false,
        error: 'Empty voice transcript provided.',
        rawTranscript: ''
      };
    }

    const cleanTranscript = transcript.trim();

    // 1. Language Detection
    const langInfo = detectLanguage(cleanTranscript);

    // 2. Intent Parsing (Local Fast Rule/NLP Engine)
    const intentResult = parseIntent(cleanTranscript);

    // 3. Entity Extraction (Product, Quantity, Trade Unit)
    const entityResult = extractEntities(cleanTranscript, productCatalog);

    // 4. If high confidence in rule engine, return directly (Zero Latency < 5ms)
    if (intentResult.intent && (intentResult.intent === 'GET_SUMMARY' || intentResult.intent === 'GET_ALERTS' || entityResult.product)) {
      return {
        success: true,
        source: 'local_nlp',
        intent: intentResult.intent,
        product: entityResult.product,
        quantity: entityResult.quantity,
        unit: entityResult.unit,
        rawTranscript: cleanTranscript,
        language: langInfo.language,
        confidence: Math.round((intentResult.confidence * 0.95) * 100) / 100,
        requiresConfirmation: !entityResult.hasExplicitQuantity && intentResult.intent === 'ADD_STOCK'
      };
    }

    // 5. Optional Gemini AI Fallback for highly ambiguous phrasing
    if (this.geminiApiKey) {
      try {
        const aiResult = await this._callGeminiParser(cleanTranscript, productCatalog);
        if (aiResult) {
          return {
            ...aiResult,
            source: 'gemini_ai',
            rawTranscript: cleanTranscript
          };
        }
      } catch (err) {
        console.warn('Gemini fallback error, falling back to local NLP:', err.message);
      }
    }

    // 6. Return best effort local result
    return {
      success: true,
      source: 'local_nlp_fuzzy',
      intent: intentResult.intent,
      product: entityResult.product,
      quantity: entityResult.quantity,
      unit: entityResult.unit,
      rawTranscript: cleanTranscript,
      language: langInfo.language,
      confidence: 0.70,
      requiresConfirmation: true
    };
  }

  /**
   * Internal Gemini API caller for unstructured utterances
   */
  async _callGeminiParser(transcript, productCatalog) {
    // Basic HTTP call or SDK if key provided
    const productList = productCatalog.map(p => p.name).join(', ');
    const prompt = `${INVENTORY_SYSTEM_PROMPT}\nAvailable Store Products: [${productList}]\nUser Voice Transcript: "${transcript}"\nOutput JSON:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    if (!response.ok) return null;
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text);
    // Map back to catalog product
    let matchedProd = null;
    if (parsed.productName) {
      matchedProd = productCatalog.find(p => 
        p.name.toLowerCase().includes(parsed.productName.toLowerCase())
      ) || null;
    }

    return {
      success: true,
      intent: parsed.intent || 'QUERY_STOCK',
      product: matchedProd,
      quantity: parsed.quantity || 1,
      unit: parsed.unit || 'kg',
      language: parsed.language || 'hinglish',
      confidence: parsed.confidence || 0.90
    };
  }
}

export const defaultVoiceService = new VoiceService();
