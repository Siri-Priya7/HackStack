import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect if running in Vercel Serverless environment
const isVercel = Boolean(process.env.VERCEL);

// Resolve database paths (supports local dev and Vercel serverless /var/task)
const cwd = process.cwd();
const baseDbPath = fs.existsSync(path.join(cwd, 'database/inventory.db'))
  ? path.join(cwd, 'database/inventory.db')
  : path.resolve(__dirname, '../../../database/inventory.db');

const schemaPath = fs.existsSync(path.join(cwd, 'database/schema.sql'))
  ? path.join(cwd, 'database/schema.sql')
  : path.resolve(__dirname, '../../../database/schema.sql');

const seedPath = fs.existsSync(path.join(cwd, 'database/seed.sql'))
  ? path.join(cwd, 'database/seed.sql')
  : path.resolve(__dirname, '../../../database/seed.sql');

// On Vercel Lambda, the deployment filesystem is read-only, but /tmp is fully writable
const dbPath = isVercel
  ? path.join('/tmp', 'inventory.db')
  : (process.env.DATABASE_PATH ? path.resolve(process.env.DATABASE_PATH) : baseDbPath);

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// On Vercel cold-start, copy pre-seeded database into /tmp/inventory.db
if (isVercel && !fs.existsSync(dbPath)) {
  if (fs.existsSync(baseDbPath)) {
    try {
      fs.copyFileSync(baseDbPath, dbPath);
      console.log('✅ Copied seeded database to /tmp/inventory.db for Vercel');
    } catch (err) {
      console.warn('Could not copy db to /tmp, will initialize from schema:', err.message);
    }
  }
}

export const db = new Database(dbPath);

// Enable WAL mode for high concurrency & performance
try {
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
} catch (e) {
  console.warn('Pragma warning:', e.message);
}

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
