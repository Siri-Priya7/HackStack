import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve database path relative to GigHackathon root
const dbPath = path.resolve(__dirname, '../../../database/inventory.db');
const schemaPath = path.resolve(__dirname, '../../../database/schema.sql');
const seedPath = path.resolve(__dirname, '../../../database/seed.sql');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(dbPath);

// Enable WAL mode for high concurrency & performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

/**
 * Initializes schema and seed data if database is new or empty
 */
export function initializeDatabase() {
  try {
    // Check if products table exists
    const tableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='products'").get();

    if (!tableCheck) {
      console.log('📦 Database initialized: executing schema.sql...');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        db.exec(schemaSql);
      }

      console.log('🌱 Seeding initial Kirana store data from seed.sql...');
      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        db.exec(seedSql);
      }
      console.log('✅ Database setup and seed complete.');
    } else {
      console.log('✅ Database connected to existing schema at:', dbPath);
    }
  } catch (err) {
    console.error('❌ Database initialization error:', err);
  }
}

// Auto-run init on import
initializeDatabase();

export default db;
