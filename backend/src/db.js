import pg from 'pg';
import { DATABASE_URL } from './config.js';

const isLocal = DATABASE_URL.includes('localhost') || DATABASE_URL.includes('127.0.0.1');

const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

export function query(text, params) {
  return pool.query(text, params);
}

export async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cameras (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT,
      stream_url TEXT,
      status TEXT NOT NULL DEFAULT 'offline',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      camera_id INTEGER REFERENCES cameras (id) ON DELETE CASCADE,
      threat_type TEXT NOT NULL,
      severity TEXT NOT NULL,
      confidence REAL NOT NULL,
      snapshot TEXT,
      acknowledged BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  await pool.query('CREATE INDEX IF NOT EXISTS idx_events_created ON events (created_at)');
  await pool.query('CREATE INDEX IF NOT EXISTS idx_events_type ON events (threat_type)');
}

export default pool;
