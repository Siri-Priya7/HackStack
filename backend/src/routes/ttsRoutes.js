import express from 'express';
import https from 'https';

const router = express.Router();

// Memory cache for synthesized audio buffers: key -> Buffer
const audioCache = new Map();

// Map UI language codes to TTS language tags
const LANG_MAP = {
  'en-IN': 'en',
  'en': 'en',
  'hi-IN': 'hi',
  'hi': 'hi',
  'te-IN': 'te',
  'te': 'te',
  'ta-IN': 'ta',
  'ta': 'ta',
  'bn-IN': 'bn',
  'bn': 'bn',
  'mr-IN': 'mr',
  'mr': 'mr',
  'gu-IN': 'gu',
  'gu': 'gu',
  'kn-IN': 'kn',
  'kn': 'kn',
  'ml-IN': 'ml',
  'ml': 'ml',
  'pa-IN': 'pa',
  'pa': 'pa',
  'or-IN': 'bn' // Odia fallback to Bengali/Hindi audio phonetics
};

/**
 * GET /api/voice/tts
 * Query params:
 *  - text: text to synthesize
 *  - lang: language code (e.g. 'te-IN', 'hi-IN', 'ta-IN', 'en-IN')
 */
router.get('/tts', async (req, res) => {
  const text = (req.query.text || '').trim();
  const rawLang = (req.query.lang || 'en-IN').trim();

  if (!text) {
    return res.status(400).json({ error: 'Text parameter is required' });
  }

  const ttsLang = LANG_MAP[rawLang] || (rawLang.split('-')[0].toLowerCase()) || 'en';
  const cacheKey = `${ttsLang}:::${text}`;

  // Serve from cache if available
  if (audioCache.has(cacheKey)) {
    const cachedBuffer = audioCache.get(cacheKey);
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(cachedBuffer);
  }

  try {
    const encodedText = encodeURIComponent(text.slice(0, 200));
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${ttsLang}&client=tw-ob`;

    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (ttsRes) => {
      if (ttsRes.statusCode !== 200) {
        return res.status(ttsRes.statusCode || 500).json({
          error: 'Failed to synthesize speech',
          statusCode: ttsRes.statusCode
        });
      }

      const chunks = [];
      ttsRes.on('data', chunk => chunks.push(chunk));
      ttsRes.on('end', () => {
        const audioBuffer = Buffer.concat(chunks);
        
        // Cache up to 200 items in memory
        if (audioCache.size > 200) {
          const firstKey = audioCache.keys().next().value;
          audioCache.delete(firstKey);
        }
        audioCache.set(cacheKey, audioBuffer);

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.send(audioBuffer);
      });
    }).on('error', (err) => {
      console.warn('TTS streaming error:', err.message);
      res.status(500).json({ error: 'TTS network error', message: err.message });
    });
  } catch (error) {
    console.error('TTS Route Exception:', error);
    res.status(500).json({ error: 'Internal TTS service error' });
  }
});

export default router;
