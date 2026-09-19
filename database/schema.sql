-- Voice-Based Inventory Management Database Schema
-- Compatible with SQLite3, PostgreSQL, and MySQL

-- Enable foreign keys for SQLite
PRAGMA foreign_keys = ON;

-- 1. Users Table (Shop owners / staff)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    store_name VARCHAR(150) NOT NULL DEFAULT 'Apna Kirana Store',
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'hi-IN', -- 'hi-IN', 'en-IN', 'ta-IN', 'te-IN', etc.
    role VARCHAR(20) DEFAULT 'owner',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table (Master catalog with regional aliases & trade unit specs)
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    regional_names TEXT NOT NULL DEFAULT '[]', -- JSON array of aliases: ["chawal", "rice", "arisi", "tandul"]
    base_unit VARCHAR(20) NOT NULL DEFAULT 'kg', -- 'kg', 'pcs', 'litre'
    default_unit VARCHAR(20) NOT NULL DEFAULT 'kg', -- 'bori', 'carton', 'packet', 'kg', 'dozen'
    unit_size REAL NOT NULL DEFAULT 1.0, -- Conversion factor to base_unit (e.g., 1 bori = 25 kg, 1 dozen = 12 pcs)
    purchase_price REAL DEFAULT 0.0,
    selling_price REAL NOT NULL DEFAULT 0.0,
    min_stock_threshold REAL NOT NULL DEFAULT 10.0, -- In base_unit
    reorder_quantity REAL NOT NULL DEFAULT 50.0, -- In base_unit
    barcode VARCHAR(50) DEFAULT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Inventory Table (Real-time stock tracking)
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL UNIQUE,
    current_stock_base REAL NOT NULL DEFAULT 0.0, -- Standardized quantity in base_unit (e.g., kg)
    current_stock_display VARCHAR(100) DEFAULT '', -- Human friendly trade unit string (e.g., "4 Bori 10 Kg")
    status VARCHAR(30) DEFAULT 'in_stock', -- 'in_stock', 'low_stock', 'out_of_stock', 'excess'
    last_restocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 4. Transactions Table (Full audit log of stock movements, with voice transcripts)
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'IN' (Restock), 'OUT' (Sale), 'ADJUST' (Count correction)
    quantity REAL NOT NULL, -- Spoken or entered trade quantity
    unit VARCHAR(30) NOT NULL, -- Trade unit ('bori', 'kg', 'packet', 'dozen', etc.)
    quantity_base REAL NOT NULL, -- Converted quantity in base_unit
    unit_price REAL DEFAULT 0.0,
    total_amount REAL DEFAULT 0.0,
    voice_transcript TEXT DEFAULT NULL, -- Exactly what the shopkeeper said
    language_detected VARCHAR(20) DEFAULT 'hinglish',
    source VARCHAR(20) DEFAULT 'voice', -- 'voice', 'manual', 'barcode'
    notes TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 5. Alerts Table (Low stock warnings & smart reorder prompts)
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- 'LOW_STOCK', 'OUT_OF_STOCK', 'REORDER_SUGGESTION'
    message TEXT NOT NULL,
    suggested_reorder_qty REAL DEFAULT 0.0,
    suggested_reorder_unit VARCHAR(30) DEFAULT 'kg',
    is_resolved INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME DEFAULT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_user_unresolved ON alerts(user_id, is_resolved);
