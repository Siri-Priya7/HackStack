import assert from 'node:assert';
import { detectLanguage } from '../src/nlp/languageDetector.js';
import { parseIntent } from '../src/nlp/intentParser.js';
import { extractEntities, extractQuantity, extractUnit } from '../src/nlp/entityExtractor.js';
import { VoiceService } from '../src/services/voiceService.js';

const mockCatalog = [
  { id: 1, name: 'Basmati Rice', regional_names: '["chawal", "rice", "arisi"]', default_unit: 'bori', base_unit: 'kg', unit_size: 25 },
  { id: 3, name: 'Sugar (Chini)', regional_names: '["chini", "shakkar", "sugar"]', default_unit: 'bori', base_unit: 'kg', unit_size: 50 },
  { id: 6, name: 'Fresh Milk Packets', regional_names: '["doodh", "milk", "paal"]', default_unit: 'packet', base_unit: 'litre', unit_size: 0.5 },
  { id: 7, name: 'Eggs', regional_names: '["ande", "anda", "eggs"]', default_unit: 'dozen', base_unit: 'pcs', unit_size: 12 }
];

// Test 1: Language Detection
assert.strictEqual(detectLanguage('5 bori chawal add karo').language, 'hinglish');
assert.strictEqual(detectLanguage('पाँच बोरी चावल आया').language, 'hi');
assert.strictEqual(detectLanguage('Add 10 packets of milk').language, 'en');

// Test 2: Intent Parsing
assert.strictEqual(parseIntent('5 bori chawal aaya').intent, 'ADD_STOCK');
assert.strictEqual(parseIntent('10 packet doodh becha').intent, 'REMOVE_STOCK');
assert.strictEqual(parseIntent('Cheeni kitna bachi hai?').intent, 'QUERY_STOCK');
assert.strictEqual(parseIntent('Kya khatam ho raha hai?').intent, 'GET_ALERTS');
assert.strictEqual(parseIntent('Aaj ka hisab batao').intent, 'GET_SUMMARY');

// Test 3: Entity Extraction (numbers & units)
assert.strictEqual(extractQuantity('paanch bori chawal'), 5);
assert.strictEqual(extractQuantity('10 packet doodh'), 10);
assert.strictEqual(extractQuantity('aadha kilo chini'), 0.5);
assert.strictEqual(extractUnit('5 bori chawal'), 'bori');
assert.strictEqual(extractUnit('10 packet doodh'), 'packet');

// Test 4: End-to-End Voice Service
const voiceService = new VoiceService();

async function runTests() {
  const res1 = await voiceService.processVoiceCommand('5 bori chawal aaya', mockCatalog);
  assert.strictEqual(res1.intent, 'ADD_STOCK');
  assert.strictEqual(res1.product.name, 'Basmati Rice');
  assert.strictEqual(res1.quantity, 5);
  assert.strictEqual(res1.unit, 'bori');

  const res2 = await voiceService.processVoiceCommand('10 packet doodh becha', mockCatalog);
  assert.strictEqual(res2.intent, 'REMOVE_STOCK');
  assert.strictEqual(res2.product.name, 'Fresh Milk Packets');
  assert.strictEqual(res2.quantity, 10);
  assert.strictEqual(res2.unit, 'packet');

  const res3 = await voiceService.processVoiceCommand('Cheeni kitni bachi hai', mockCatalog);
  assert.strictEqual(res3.intent, 'QUERY_STOCK');
  assert.strictEqual(res3.product.name, 'Sugar (Chini)');

  console.log('✅ All Voice AI tests passed successfully!');
}

runTests();
