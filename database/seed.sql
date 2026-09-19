-- Seed Data for Multi-Tenant Voice Inventory System
-- Roles: Platform Admin, Shop Owner, Staff
-- Multi-Tenancy: Shop 1 ("Sharma Kirana Store") & Shop 2 ("Gupta Provision Store")

-- 1. Shops (Tenants)
INSERT OR IGNORE INTO shops (id, name, address, city, owner_phone, preferred_language, is_active)
VALUES 
(1, 'Sharma Kirana & General Store', 'Shop 12, Main Bazar, Chandni Chowk', 'Delhi', '9876543210', 'hi-IN', 1),
(2, 'Gupta Provision Store', 'Gala 4, Andheri Kurla Road', 'Mumbai', '9820011223', 'mr-IN', 1);

-- 2. Users (Role-Based)
-- Demo Accounts:
-- Platform Admin: Phone 9000000000 (manages entire platform)
-- Shop Owner (Shop 1): Phone 9876543210 (manages Sharma Kirana, staff, products)
-- Staff (Shop 1): Phone 9111111111 (performs stock operations for Sharma Kirana)
-- Shop Owner (Shop 2): Phone 9820011223 (manages Gupta Provision)

INSERT OR IGNORE INTO users (id, shop_id, name, phone, password_hash, preferred_language, role, is_active)
VALUES 
(1, NULL, 'Vikram Singhania', '9000000000', '$2b$10$wN9aJp9e5m1eB1O5hA8WDeu1B0h21QfA9jB6E6S2I8F9v0d6h9m9W', 'en-IN', 'platform_admin', 1),
(2, 1, 'Ramesh Sharma', '9876543210', '$2b$10$wN9aJp9e5m1eB1O5hA8WDeu1B0h21QfA9jB6E6S2I8F9v0d6h9m9W', 'hi-IN', 'shop_owner', 1),
(3, 1, 'Suresh Kumar', '9111111111', '$2b$10$wN9aJp9e5m1eB1O5hA8WDeu1B0h21QfA9jB6E6S2I8F9v0d6h9m9W', 'hi-IN', 'staff', 1),
(4, 2, 'Rajesh Gupta', '9820011223', '$2b$10$wN9aJp9e5m1eB1O5hA8WDeu1B0h21QfA9jB6E6S2I8F9v0d6h9m9W', 'mr-IN', 'shop_owner', 1);

-- 3. Products Catalog for Shop 1 (Sharma Kirana)
INSERT OR IGNORE INTO products (id, shop_id, name, category, regional_names, base_unit, default_unit, unit_size, purchase_price, selling_price, min_stock_threshold, reorder_quantity)
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

-- Products Catalog for Shop 2 (Gupta Provision - completely isolated)
INSERT OR IGNORE INTO products (id, shop_id, name, category, regional_names, base_unit, default_unit, unit_size, purchase_price, selling_price, min_stock_threshold, reorder_quantity)
VALUES 
(11, 2, 'Kolam Rice', 'Grains', '["kolam", "tandul", "bhat", "rice"]', 'kg', 'bori', 25.0, 60.0, 78.0, 50.0, 100.0),
(12, 2, 'Groundnut Oil (Shengdana Tel)', 'Oils', '["shengdana tel", "groundnut oil", "tel"]', 'litre', 'peti', 15.0, 150.0, 185.0, 30.0, 60.0),
(13, 2, 'Jaggery (Gud)', 'Essentials', '["gud", "gul", "jaggery"]', 'kg', 'packet', 1.0, 45.0, 60.0, 20.0, 50.0);

-- 4. Initial Inventory for Shop 1 (Sharma Kirana)
INSERT OR IGNORE INTO inventory (id, shop_id, product_id, current_stock_base, current_stock_display, status, last_restocked_at)
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

-- Initial Inventory for Shop 2 (Gupta Provision)
INSERT OR IGNORE INTO inventory (id, shop_id, product_id, current_stock_base, current_stock_display, status, last_restocked_at)
VALUES
(11, 2, 11, 200.0, '8 Bori (200 kg)', 'in_stock', datetime('now', '-1 days')),
(12, 2, 12, 45.0, '3 Peti (45 Litre)', 'in_stock', datetime('now', '-2 days')),
(13, 2, 13, 15.0, '15 Packets (15 kg)', 'low_stock', datetime('now', '-4 days'));

-- 5. Initial Sample Transactions for Shop 1
INSERT OR IGNORE INTO transactions (id, shop_id, user_id, product_id, type, quantity, unit, quantity_base, unit_price, total_amount, voice_transcript, language_detected, source, created_at)
VALUES
(1, 1, 2, 1, 'IN', 5.0, 'bori', 125.0, 75.0, 9375.0, '5 bori basmati chawal aaya', 'hinglish', 'voice', datetime('now', '-2 days')),
(2, 1, 3, 2, 'IN', 5.0, 'bori', 250.0, 32.0, 8000.0, 'Paanch bori aashirvaad atta stock mein add karo', 'hinglish', 'voice', datetime('now', '-3 days')),
(3, 1, 3, 6, 'OUT', 8.0, 'packet', 4.0, 33.0, 264.0, 'Aath packet doodh becha', 'hinglish', 'voice', datetime('now', '-4 hours')),
(4, 1, 2, 1, 'OUT', 10.0, 'kg', 10.0, 95.0, 950.0, 'Dus kilo chawal customer ko diya', 'hinglish', 'voice', datetime('now', '-2 hours')),
(5, 1, 3, 3, 'OUT', 5.0, 'kg', 5.0, 46.0, 230.0, 'Paanch kilo chini becha', 'hinglish', 'voice', datetime('now', '-1 hours'));

-- Initial Sample Transactions for Shop 2
INSERT OR IGNORE INTO transactions (id, shop_id, user_id, product_id, type, quantity, unit, quantity_base, unit_price, total_amount, voice_transcript, language_detected, source, created_at)
VALUES
(6, 2, 4, 11, 'IN', 8.0, 'bori', 200.0, 60.0, 12000.0, '8 bori kolam tandul aale', 'marathi', 'voice', datetime('now', '-1 days')),
(7, 2, 4, 13, 'OUT', 5.0, 'packet', 5.0, 60.0, 300.0, '5 kilo gul vikla', 'marathi', 'voice', datetime('now', '-3 hours'));

-- 6. Alerts for Shop 1
INSERT OR IGNORE INTO alerts (id, shop_id, product_id, alert_type, message, suggested_reorder_qty, suggested_reorder_unit, is_resolved, created_at)
VALUES
(1, 1, 3, 'LOW_STOCK', 'Sugar (Chini) is running critically low! Only 8 kg remaining. Daily demand is high.', 2.0, 'bori', 0, datetime('now', '-1 hours')),
(2, 1, 4, 'LOW_STOCK', 'Mustard Oil (Sarson Tel) is down to 1 Peti (12 Litre). Reorder threshold is 24 Litre.', 2.0, 'peti', 0, datetime('now', '-3 hours')),
(3, 1, 6, 'LOW_STOCK', 'Milk packets are almost finished! Only 12 packets (6 Litre) left for evening sales.', 40.0, 'packet', 0, datetime('now', '-30 minutes')),
(4, 1, 9, 'LOW_STOCK', 'Onions (Pyaaz) stock is only 20 kg. Threshold is 40 kg.', 1.0, 'quintal', 0, datetime('now', '-5 hours'));

-- Alerts for Shop 2
INSERT OR IGNORE INTO alerts (id, shop_id, product_id, alert_type, message, suggested_reorder_qty, suggested_reorder_unit, is_resolved, created_at)
VALUES
(5, 2, 13, 'LOW_STOCK', 'Jaggery (Gul) is down to 15 kg. Minimum threshold is 20 kg.', 20.0, 'packet', 0, datetime('now', '-4 hours'));
