#!/usr/bin/env node
/**
 * Migrate SQLite → PostgreSQL (safe, read-only on SQLite).
 *
 * - Reads SQLite with SELECT only (never modifies/deletes the SQLite file).
 * - Copies password_hash values as-is (never re-hashes).
 * - Inserts with ON CONFLICT DO NOTHING (does not overwrite existing Postgres rows).
 * - Preserves primary keys / FKs / draft_json / is_published / roles / timestamps.
 *
 * Usage:
 *   npm run db:backup
 *   DRY_RUN=1 npm run db:migrate                 # inventory only (no Postgres required)
 *   DATABASE_URL=... DRY_RUN=1 npm run db:migrate # plan against live URL without writes
 *   DATABASE_URL=... npm run db:migrate           # apply schema + insert missing rows
 *   DATABASE_URL=... npm run db:verify
 *
 * Optional:
 *   SQLITE_PATH=server/data/presentation.db
 *   PGSSL=false
 */
import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SQLITE_PATH =
  process.env.SQLITE_PATH || path.join(ROOT, 'server/data/presentation.db');
const SCHEMA_PATH = path.join(ROOT, 'server/sql/schema.postgres.sql');
const DRY_RUN = process.env.DRY_RUN === '1';

/** Parent tables first; children after; audit last. Legacy tables included. */
const TABLES = [
  'users',
  'portfolio_categories',
  'products',
  'pdi_statuses',
  'committee_periods',
  'backlog_systems',
  'initiatives', // legacy
  'executive_kpis', // legacy
  'executive_focus',
  'attention_items',
  'board_decisions', // legacy
  'outlook_pillars',
  'outlook_items',
  'app_settings',
  'process_tracks',
  'process_steps',
  'strategic_impacts',
  'committee_insights',
  'backlog_insights',
  'home_menu_items',
  'decision_proposals',
  'product_content_cards',
  'audit_logs',
];

function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

function redactUrl(url) {
  if (!url) return '(none)';
  try {
    const u = new URL(url);
    if (u.password) u.password = '***';
    return u.toString();
  } catch {
    return '(set)';
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!DRY_RUN && !databaseUrl) {
    console.error('DATABASE_URL is required (or set DRY_RUN=1 for inventory-only)');
    process.exit(1);
  }
  if (!fs.existsSync(SQLITE_PATH)) {
    console.error('SQLite file not found:', SQLITE_PATH);
    process.exit(1);
  }

  // SQLite: open read-write by API but we only SELECT — never write/delete.
  const sqlite = new DatabaseSync(SQLITE_PATH);

  console.log('[migrate] source:', SQLITE_PATH);
  console.log('[migrate] target:', redactUrl(databaseUrl));
  console.log('[migrate] dryRun:', DRY_RUN);
  console.log('[migrate] mode: INSERT ... ON CONFLICT DO NOTHING (no overwrite)');
  console.log('[migrate] password_hash: copied as-is (no re-hash)');

  let pool = null;
  if (databaseUrl && !DRY_RUN) {
    pool = new pg.Pool({
      connectionString: databaseUrl,
      ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
    });
    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    await pool.query(schema);
  } else if (databaseUrl && DRY_RUN) {
    console.log('[migrate] DRY_RUN with DATABASE_URL: no connection / no writes');
  }

  const counts = { source: {}, inserted: {}, skipped_or_existing: {}, target: {} };

  for (const table of TABLES) {
    let rows;
    try {
      rows = sqlite.prepare(`SELECT * FROM ${table}`).all();
    } catch (e) {
      console.warn('[migrate] skip missing table', table, e.message);
      continue;
    }
    counts.source[table] = rows.length;
    if (!rows.length) {
      console.log(`[migrate] ${table}: 0 rows`);
      counts.target[table] = DRY_RUN || !pool ? '(dry-run)' : 0;
      continue;
    }

    // Sanity: users must carry password_hash column unchanged
    if (table === 'users') {
      const missing = rows.filter((r) => !r.password_hash);
      if (missing.length) {
        throw new Error('users rows missing password_hash — abort');
      }
      const sample = String(rows[0].password_hash || '');
      if (!sample.startsWith('$2')) {
        console.warn('[migrate] warning: password_hash does not look like bcrypt');
      }
    }

    const cols = Object.keys(rows[0]);
    const colList = cols.map(quoteIdent).join(', ');
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
    const pk = table === 'app_settings' ? 'key' : 'id';

    // DO NOTHING: never overwrite existing Production rows on re-run
    const sql = `INSERT INTO ${table} (${colList}) VALUES (${placeholders})
                 ON CONFLICT (${pk}) DO NOTHING`;

    if (DRY_RUN || !pool) {
      counts.target[table] = '(dry-run)';
      console.log(`[migrate] ${table}: ${counts.source[table]} rows planned`);
      continue;
    }

    const client = await pool.connect();
    let inserted = 0;
    try {
      await client.query('BEGIN');
      for (const row of rows) {
        const values = cols.map((c) => row[c]);
        const r = await client.query(sql, values);
        inserted += r.rowCount || 0;
      }
      if (pk === 'id') {
        await client.query(
          `SELECT setval(
             pg_get_serial_sequence('${table}', 'id'),
             COALESCE((SELECT MAX(id) FROM ${table}), 1),
             true
           )`
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }

    const r = await pool.query(`SELECT COUNT(*)::int AS c FROM ${table}`);
    counts.target[table] = r.rows[0].c;
    counts.inserted[table] = inserted;
    counts.skipped_or_existing[table] = counts.source[table] - inserted;
    console.log(
      `[migrate] ${table}: source=${counts.source[table]} inserted=${inserted} total_pg=${counts.target[table]}`
    );
  }

  console.log('[migrate] done');
  console.log(JSON.stringify(counts, null, 2));

  sqlite.close();
  if (pool) await pool.end();
}

main().catch((err) => {
  console.error('[migrate] failed:', err.message);
  process.exit(1);
});
