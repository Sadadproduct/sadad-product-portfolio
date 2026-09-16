#!/usr/bin/env node
/**
 * Migrate SQLite → PostgreSQL (idempotent upsert by primary key).
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/migrate-sqlite-to-postgres.mjs
 *   npm run db:migrate
 *
 * Optional:
 *   SQLITE_PATH=server/data/presentation.db
 *   DRY_RUN=1
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

const TABLES = [
  'users',
  'portfolio_categories',
  'products',
  'pdi_statuses',
  'committee_periods',
  'backlog_systems',
  'initiatives',
  'executive_kpis',
  'executive_focus',
  'attention_items',
  'board_decisions',
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
  'audit_logs',
];

function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }
  if (!fs.existsSync(SQLITE_PATH)) {
    console.error('SQLite file not found:', SQLITE_PATH);
    process.exit(1);
  }

  const sqlite = new DatabaseSync(SQLITE_PATH);
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
  });

  console.log('[migrate] source:', SQLITE_PATH);
  console.log('[migrate] target: PostgreSQL (DATABASE_URL set)');
  console.log('[migrate] dryRun:', DRY_RUN);

  const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
  if (!DRY_RUN) {
    await pool.query(schema);
  }

  const counts = { source: {}, target: {} };

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
      continue;
    }

    const cols = Object.keys(rows[0]);
    const colList = cols.map(quoteIdent).join(', ');
    const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
    const pk = table === 'app_settings' ? 'key' : 'id';
    const updateCols = cols
      .filter((c) => c !== pk)
      .map((c) => `${quoteIdent(c)} = EXCLUDED.${quoteIdent(c)}`)
      .join(', ');

    const sql =
      table === 'app_settings'
        ? `INSERT INTO ${table} (${colList}) VALUES (${placeholders})
           ON CONFLICT (${pk}) DO UPDATE SET ${updateCols}`
        : `INSERT INTO ${table} (${colList}) VALUES (${placeholders})
           ON CONFLICT (${pk}) DO UPDATE SET ${updateCols}`;

    if (!DRY_RUN) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const row of rows) {
          const values = cols.map((c) => row[c]);
          await client.query(sql, values);
        }
        // Reset identity sequence for integer PKs
        if (pk === 'id') {
          await client.query(
            `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM ${table}), 1), true)`
          );
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    }

    if (!DRY_RUN) {
      const r = await pool.query(`SELECT COUNT(*)::int AS c FROM ${table}`);
      counts.target[table] = r.rows[0].c;
    } else {
      counts.target[table] = '(dry-run)';
    }
    console.log(`[migrate] ${table}: ${counts.source[table]} → ${counts.target[table]}`);
  }

  console.log('[migrate] done');
  console.log(JSON.stringify(counts, null, 2));

  sqlite.close();
  await pool.end();
}

main().catch((err) => {
  console.error('[migrate] failed:', err.message);
  process.exit(1);
});
