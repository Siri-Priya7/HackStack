import assert from 'node:assert';
import { convertToBaseUnit, formatDisplayUnit, normalizeUnit } from '../src/units/unitConverter.js';
import { calculateStockChange } from '../src/stock/stockCalculator.js';
import { validateCommand } from '../src/validation/commandValidator.js';
import { generateReorderSuggestion } from '../src/alerts/reorderSuggestion.js';

// Test 1: Unit normalization
assert.strictEqual(normalizeUnit('bori'), 'bori');
assert.strictEqual(normalizeUnit('bora'), 'bori');
assert.strictEqual(normalizeUnit('katta'), 'bori');
assert.strictEqual(normalizeUnit('kilo'), 'kg');
assert.strictEqual(normalizeUnit('darjan'), 'dozen');

// Test 2: Bori conversion for Rice (1 bori = 25kg)
const riceProduct = { id: 1, name: 'Basmati Rice', base_unit: 'kg', default_unit: 'bori', unit_size: 25.0, min_stock_threshold: 50 };
assert.strictEqual(convertToBaseUnit(5, 'bori', riceProduct), 125.0);
assert.strictEqual(convertToBaseUnit(10, 'kg', riceProduct), 10.0);

// Test 3: Dozen conversion for Eggs (1 dozen = 12 pcs)
const eggsProduct = { id: 7, name: 'Eggs', base_unit: 'pcs', default_unit: 'dozen', unit_size: 12.0 };
assert.strictEqual(convertToBaseUnit(3, 'dozen', eggsProduct), 36.0);

// Test 4: Display format
assert.strictEqual(formatDisplayUnit(125, riceProduct), '5 Bori (125 kg)');
assert.strictEqual(formatDisplayUnit(85, riceProduct), '3 Bori 10 kg');
assert.strictEqual(formatDisplayUnit(36, eggsProduct), '3 Dozen (36 pcs)');

// Test 5: Stock calculation
const change = calculateStockChange({
  intent: 'ADD_STOCK',
  currentStockBase: 125,
  quantity: 2,
  unit: 'bori',
  product: riceProduct
});
assert.strictEqual(change.newStockBase, 175);
assert.strictEqual(change.displayString, '7 Bori (175 kg)');

// Test 6: Validation
const invalidRemoval = validateCommand({
  intent: 'REMOVE_STOCK',
  product: riceProduct,
  quantity: 10,
  unit: 'bori' // 250kg > 125kg
}, 125);
assert.strictEqual(invalidRemoval.isValid, false);

console.log('✅ All Inventory Engine tests passed successfully!');
