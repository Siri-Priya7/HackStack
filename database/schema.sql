-- Voice-Based Inventory Management Database Schema
-- Multi-Tenant Architecture with Role-Based Access Control (RBAC)
-- Roles: 'platform_admin', 'shop_owner', 'staff'

PRAGMA foreign_keys = ON;

-- 1. Shops Table (Tenants)
CREATE TABLE IF NOT EXISTS shops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(150) NOT NULL,
    address VARCHAR(255) DEFAULT '',
    city VARCHAR(100) DEFAULT '',
    owner_phone VARCHAR(20) NOT NULL,
    preferred_language VARCHAR(10) DEFAULT 'hi-IN',
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Users Table (Role-Based: Platform Admin, Shop Owner, Staff)
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER DEFAULT NULL, -- NULL for platform_admin, valid shop_id for shop_owner/staff
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) DEFAULT NULL,
    preferred_language VARCHAR(10) DEFAULT 'hi-IN',
    role VARCHAR(20) NOT NULL DEFAULT 'shop_owner' CHECK(role IN ('platform_admin', 'shop_owner', 'staff')),
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

-- 3. OTP Sessions Table (Mobile Number + OTP login / onboarding)
CREATE TABLE IF NOT EXISTS otp_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone VARCHAR(20) NOT NULL,
    otp VARCHAR(10) NOT NULL,
    purpose VARCHAR(30) DEFAULT 'login', -- 'login', 'onboard'
    metadata TEXT DEFAULT NULL, -- JSON data like shop name during onboarding
    expires_at DATETIME NOT NULL,
    is_verified INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Products Table (Scoped per shop)
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER NOT NULL,
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL DEFAULT 'General',
    regional_names TEXT NOT NULL DEFAULT '[]', -- JSON array of aliases: ["chawal", "rice", "arisi", "tandul"]
    base_unit VARCHAR(20) NOT NULL DEFAULT 'kg', -- 'kg', 'pcs', 'litre'
    default_unit VARCHAR(20) NOT NULL DEFAULT 'kg', -- 'bori', 'peti', 'packet', 'kg', 'dozen'
    unit_size REAL NOT NULL DEFAULT 1.0, -- Conversion factor to base_unit (e.g., 1 bori = 25 kg)
    purchase_price REAL DEFAULT 0.0,
    selling_price REAL NOT NULL DEFAULT 0.0,
    min_stock_threshold REAL NOT NULL DEFAULT 10.0, -- In base_unit
    reorder_quantity REAL NOT NULL DEFAULT 50.0, -- In base_unit
    barcode VARCHAR(50) DEFAULT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE
);

-- 5. Inventory Table (Real-time stock tracking per shop)
CREATE TABLE IF NOT EXISTS inventory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL UNIQUE,
    current_stock_base REAL NOT NULL DEFAULT 0.0, -- Standardized quantity in base_unit (e.g., kg)
    current_stock_display VARCHAR(100) DEFAULT '', -- Human friendly trade unit string (e.g., "5 Bori (125 kg)")
    status VARCHAR(30) DEFAULT 'in_stock', -- 'in_stock', 'low_stock', 'out_of_stock'
    last_restocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 6. Transactions Table (Full audit log of stock movements, with shop_id, user_id, transcripts)
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL, -- Shop Owner or Staff who performed the action
    product_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL, -- 'IN' (Restock), 'OUT' (Sale), 'ADJUST' (Correction)
    quantity REAL NOT NULL, -- Spoken or entered trade quantity
    unit VARCHAR(30) NOT NULL, -- Trade unit ('bori', 'kg', 'packet', 'dozen', etc.)
    quantity_base REAL NOT NULL, -- Converted quantity in base_unit
    unit_price REAL DEFAULT 0.0,
    total_amount REAL DEFAULT 0.0,
    voice_transcript TEXT DEFAULT NULL, -- Exactly what was spoken
    language_detected VARCHAR(20) DEFAULT 'hinglish',
    source VARCHAR(20) DEFAULT 'voice', -- 'voice', 'manual', 'barcode'
    notes TEXT DEFAULT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 7. Alerts Table (Low stock warnings & smart reorder prompts per shop)
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- 'LOW_STOCK', 'OUT_OF_STOCK', 'REORDER_SUGGESTION'
    message TEXT NOT NULL,
    suggested_reorder_qty REAL DEFAULT 0.0,
    suggested_reorder_unit VARCHAR(30) DEFAULT 'kg',
    is_resolved INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME DEFAULT NULL,
    FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_users_shop ON users(shop_id);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_products_shop ON products(shop_id);
CREATE INDEX IF NOT EXISTS idx_inventory_shop ON inventory(shop_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_shop ON transactions(shop_id, created_at);
CREATE INDEX IF NOT EXISTS idx_alerts_shop_unresolved ON alerts(shop_id, is_resolved);
CREATE INDEX IF NOT EXISTS idx_otp_phone ON otp_sessions(phone);
