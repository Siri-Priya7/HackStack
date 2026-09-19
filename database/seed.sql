-- Seed Data for Voice-Based Inventory Management
-- Represents a typical Indian Kirana / General Store ("Sharma Kirana Store")

-- 1. Default Demo User (Password: "kirana123")
-- BCrypt hash for "kirana123"
INSERT OR IGNORE INTO users (id, name, store_name, phone, password_hash, preferred_language, role)
VALUES (
    1,
    'Ramesh Sharma',
    'Sharma Kirana & General Store',
    '9876543210',
    '$2b$10$wN9aJp9e5m1eB1O5hA8WDeu1B0h21QfA9jB6E6S2I8F9v0d6h9m9W',
    'hi-IN',
    'owner'
);

-- 2. Products Catalog with realistic regional aliases & packaging conversions
-- 1 bori chawal = 25 kg
-- 1 bori atta = 50 kg
-- 1 peti/carton tel = 12 litres
-- 1 darjan ande = 12 pcs
-- 1 peti sabun = 48 pcs

INSERT OR IGNORE INTO products (id, user_id, name, category, regional_names, base_unit, default_unit, unit_size, purchase_price, selling_price, min_stock_threshold, reorder_quantity)
VALUES 
(1, 1, 'Basmati Rice', 'Grains', '["chawal", "basmati", "rice", "arisi", "tandul", "biryani chawal"]', 'kg', 'bori', 25.0, 75.0, 95.0, 50.0, 100.0),
(2, 1, 'Wheat Flour (Atta)', 'Grains', '["atta", "gehu", "wheat flour", "gothumai", "chakki atta", "aashirvaad"]', 'kg', 'bori', 50.0, 32.0, 42.0, 100.0, 200.0),
(3, 1, 'Sugar (Chini)', 'Essentials', '["chini", "shakkar", "sugar", "sakkar", "seeni"]', 'kg', 'bori', 50.0, 38.0, 46.0, 50.0, 100.0),
(4, 1, 'Mustard Oil (Sarson Tel)', 'Oils', '["tel", "sarson tel", "oil", "mustard oil", "kachi ghani", "ennai"]', 'litre', 'peti', 12.0, 130.0, 160.0, 24.0, 48.0),
(5, 1, 'Toor Dal (Arhar)', 'Pulses', '["dal", "toor dal", "arhar", "tuvar", "paruppu", "arhar dal"]', 'kg', 'bori', 30.0, 120.0, 150.0, 30.0, 60.0),
(6, 1, 'Fresh Milk Packets', 'Dairy', '["doodh", "milk", "paal", "dudh", "amul doodh"]', 'litre', 'packet', 0.5, 27.0, 33.0, 15.0, 40.0),
(7, 1, 'Farm Fresh Eggs', 'Poultry', '["ande", "anda", "eggs", "muttai", "egg"]', 'pcs', 'dozen', 12.0, 5.0, 7.0, 36.0, 72.0),
(8, 1, 'Potatoes (Aloo)', 'Vegetables', '["aloo", "batata", "potato", "urulaikizhangu", "alu"]', 'kg', 'palla', 100.0, 18.0, 28.0, 50.0, 100.0),
(9, 1, 'Onions (Pyaaz)', 'Vegetables', '["pyaaz", "kanda", "onion", "vengayam", "pyaj"]', 'kg', 'palla', 100.0, 25.0, 38.0, 40.0, 100.0),
(10, 1, 'Tea (Chai Patti)', 'Beverages', '["chai", "chai patti", "tea", "chaya", "taj mahal", "red label"]', 'kg', 'packet', 0.25, 360.0, 480.0, 5.0, 15.0);

-- 3. Initial Inventory Stock Levels
-- Product 1 (Basmati Rice): 125 kg (5 bori) -> In Stock
-- Product 2 (Atta): 250 kg (5 bori) -> In Stock
-- Product 3 (Sugar): 8 kg -> CRITICALLY LOW (Threshold is 50 kg)
-- Product 4 (Mustard Oil): 12 litres (1 peti) -> LOW STOCK (Threshold is 24 L)
-- Product 5 (Toor Dal): 60 kg (2 bori) -> In Stock
-- Product 6 (Milk): 6 litres (12 packets) -> LOW STOCK (Threshold is 15 L)
-- Product 7 (Eggs): 60 pcs (5 dozen) -> In Stock
-- Product 8 (Potatoes): 140 kg -> In Stock
-- Product 9 (Onions): 20 kg -> LOW STOCK (Threshold is 40 kg)
-- Product 10 (Chai Patti): 4 kg (16 packets) -> LOW STOCK (Threshold is 5 kg)

INSERT OR IGNORE INTO inventory (id, user_id, product_id, current_stock_base, current_stock_display, status, last_restocked_at)
VALUES
(1, 1, 1, 125.0, '5 Bori (125 kg)', 'in_stock', datetime('now', '-2 days')),
(2, 1, 2, 250.0, '5 Bori (250 kg)', 'in_stock', datetime('now', '-3 days')),
(3, 1, 3, 8.0, '8 kg (0 Bori)', 'low_stock', datetime('now', '-10 days')),
(4, 1, 4, 12.0, '1 Peti (12 Litre)', 'low_stock', datetime('now', '-5 days')),
(5, 1, 5, 60.0, '2 Bori (60 kg)', 'in_stock', datetime('now', '-1 days')),
(6, 1, 6, 6.0, '12 Packets (6 Litre)', 'low_stock', datetime('now', '-12 hours')),
(7, 1, 7, 60.0, '5 Dozen (60 Pcs)', 'in_stock', datetime('now', '-1 days')),
(8, 1, 8, 140.0, '1 Quintal 40 kg', 'in_stock', datetime('now', '-4 days')),
(9, 1, 9, 20.0, '20 kg', 'low_stock', datetime('now', '-6 days')),
(10, 1, 10, 4.0, '16 Packets (4 kg)', 'low_stock', datetime('now', '-7 days'));

-- 4. Initial Sample Transactions (Demonstrating Voice Commands Spoken)
INSERT OR IGNORE INTO transactions (id, user_id, product_id, type, quantity, unit, quantity_base, unit_price, total_amount, voice_transcript, language_detected, source, created_at)
VALUES
(1, 1, 1, 'IN', 5.0, 'bori', 125.0, 75.0, 9375.0, '5 bori basmati chawal aaya', 'hinglish', 'voice', datetime('now', '-2 days')),
(2, 1, 2, 'IN', 5.0, 'bori', 250.0, 32.0, 8000.0, 'Paanch bori aashirvaad atta stock mein add karo', 'hinglish', 'voice', datetime('now', '-3 days')),
(3, 1, 6, 'OUT', 8.0, 'packet', 4.0, 33.0, 264.0, 'Aath packet doodh becha', 'hinglish', 'voice', datetime('now', '-4 hours')),
(4, 1, 1, 'OUT', 10.0, 'kg', 10.0, 95.0, 950.0, 'Dus kilo chawal customer ko diya', 'hinglish', 'voice', datetime('now', '-2 hours')),
(5, 1, 3, 'OUT', 5.0, 'kg', 5.0, 46.0, 230.0, 'Paanch kilo chini becha', 'hinglish', 'voice', datetime('now', '-1 hours'));

-- 5. Active Alerts
INSERT OR IGNORE INTO alerts (id, user_id, product_id, alert_type, message, suggested_reorder_qty, suggested_reorder_unit, is_resolved, created_at)
VALUES
(1, 1, 3, 'LOW_STOCK', 'Sugar (Chini) is running critically low! Only 8 kg remaining. Daily demand is high.', 2.0, 'bori', 0, datetime('now', '-1 hours')),
(2, 1, 4, 'LOW_STOCK', 'Mustard Oil (Sarson Tel) is down to 1 Peti (12 Litre). Reorder threshold is 24 Litre.', 2.0, 'peti', 0, datetime('now', '-3 hours')),
(3, 1, 6, 'LOW_STOCK', 'Milk packets are almost finished! Only 12 packets (6 Litre) left for evening sales.', 40.0, 'packet', 0, datetime('now', '-30 minutes')),
(4, 1, 9, 'LOW_STOCK', 'Onions (Pyaaz) stock is only 20 kg. Threshold is 40 kg.', 1.0, 'quintal', 0, datetime('now', '-5 hours'));
