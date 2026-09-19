import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detect if running in Vercel Serverless environment
const isVercel = Boolean(process.env.VERCEL);

const cwd = process.cwd();

function findDatabaseAsset(subpath) {
  const candidates = [
    path.join(cwd, subpath),
    path.join(cwd, 'backend', subpath),
    path.resolve(__dirname, '../../', subpath),
    path.resolve(__dirname, '../../../', subpath)
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return path.resolve(__dirname, '../../', subpath);
}

const baseDbPath = findDatabaseAsset('database/inventory.db');
const schemaPath = findDatabaseAsset('database/schema.sql');
const seedPath = findDatabaseAsset('database/seed.sql');

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

import { schemaSql, seedSql } from './initialData.js';

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
    // Check if essential tables exist (users and products)
    const userTableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='users'").get();
    const productTableCheck = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='products'").get();

    if (!userTableCheck || !productTableCheck) {
      console.log('📦 Database tables missing or incomplete: applying schema and seeds...');
      db.exec(schemaSql);

      console.log('🌱 Seeding initial Kirana store data...');
      try {
        db.exec(seedSql);
      } catch (seedErr) {
        console.warn('Seed notice:', seedErr.message);
      }
      console.log('✅ Database setup and seed complete.');
    } else {
      console.log('✅ Database connected to existing schema at:', dbPath);
    }

    // Ensure image_url column exists in products (schema upgrade safeguard)
    try {
      db.exec("ALTER TABLE products ADD COLUMN image_url TEXT DEFAULT NULL");
    } catch (e) {
      // Column already exists
    }
  } catch (err) {
    console.error('❌ Database initialization error:', err);
  }
}

// Auto-run init on import
initializeDatabase();

export default db;
