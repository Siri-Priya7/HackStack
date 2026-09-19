# Database Documentation

This directory contains the database design and initial seed data for the **Voice-Based Inventory Management System**.

## Schema Overview

The database is designed to handle Indian trade units, multilingual product aliases, real-time stock balances, and voice audit trails.

### Tables

1. **`users`**
   - Stores shop owner and staff accounts.
   - Fields: `id`, `name`, `store_name`, `phone`, `password_hash`, `preferred_language` (`hi-IN`, `en-IN`, `ta-IN`, etc.), `role`, `created_at`, `updated_at`.

2. **`products`**
   - Core product catalog with flexible Indian packaging conversion.
   - Fields: `id`, `user_id`, `name`, `category`, `regional_names` (JSON string array e.g., `["chawal", "rice", "arisi"]`), `base_unit` (`kg`, `pcs`, `litre`), `default_unit` (`bori`, `peti`, `dozen`, `packet`), `unit_size` (multiplier to base unit), `purchase_price`, `selling_price`, `min_stock_threshold`, `reorder_quantity`, `is_active`.

3. **`inventory`**
   - Current stock state maintained in both exact standard base units and user-friendly trade representations.
   - Fields: `id`, `user_id`, `product_id`, `current_stock_base`, `current_stock_display` (e.g., `"5 Bori 10 kg"`), `status` (`in_stock`, `low_stock`, `out_of_stock`, `excess`), `last_restocked_at`.

4. **`transactions`**
   - Immutable audit trail of every stock addition, sale, and count adjustment.
   - Fields: `id`, `user_id`, `product_id`, `type` (`IN`, `OUT`, `ADJUST`), `quantity`, `unit`, `quantity_base`, `unit_price`, `total_amount`, `voice_transcript` (exact sentence spoken by the user), `language_detected`, `source` (`voice`, `manual`), `created_at`.

5. **`alerts`**
   - Live warnings for low stock and automated reorder suggestions.
   - Fields: `id`, `user_id`, `product_id`, `alert_type`, `message`, `suggested_reorder_qty`, `suggested_reorder_unit`, `is_resolved`, `created_at`.

## Usage & Initialization

### SQLite (Default Zero-Configuration Mode)
The Node.js backend initializes `database/inventory.db` automatically on startup if the database file does not already exist, executing `schema.sql` followed by `seed.sql`.

To initialize manually:
```bash
sqlite3 database/inventory.db < database/schema.sql
sqlite3 database/inventory.db < database/seed.sql
```

### PostgreSQL / MySQL
The SQL statements use standard SQL syntax compatible with PostgreSQL and MySQL with minor dialect changes (e.g. `SERIAL` instead of `AUTOINCREMENT`).
