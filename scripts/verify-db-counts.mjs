#!/usr/bin/env node
/**
 * Compare key table counts between SQLite source and Postgres target.
 * Usage: DATABASE_URL=... npm run db:verify
 */
import 'dotenv/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SQLITE_PATH = process.env.SQLITE_PATH || path.join(ROOT, 'server/data/presentation.db');

const TABLES = [
  'users',
  'products',
  'pdi_statuses',
  'committee_periods',
  'backlog_systems',
  'strategic_impacts',
  'committee_insights',
  'backlog_insights',
  'home_menu_items',
  'decision_proposals',
  'audit_logs',
  'portfolio_categories',
  'attention_items',
  'outlook_pillars',
  'process_tracks',
];

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL required');
    process.exit(1);
  }
  const sqlite = new DatabaseSync(SQLITE_PATH);
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
  });

  let ok = true;
  console.log('table | sqlite | postgres | match');
  for (const t of TABLES) {
    const s = sqlite.prepare(`SELECT COUNT(*) AS c FROM ${t}`).get().c;
    const p = (await pool.query(`SELECT COUNT(*)::int AS c FROM ${t}`)).rows[0].c;
    const match = Number(s) === Number(p);
    if (!match) ok = false;
    console.log(`${t} | ${s} | ${p} | ${match ? 'OK' : 'MISMATCH'}`);
  }

  const pubProducts = sqlite.prepare(`SELECT COUNT(*) AS c FROM products WHERE is_published = 1`).get().c;
  const pubProductsPg = (await pool.query(`SELECT COUNT(*)::int AS c FROM products WHERE is_published = 1`)).rows[0].c;
  console.log(`products published | ${pubProducts} | ${pubProductsPg} | ${pubProducts === pubProductsPg ? 'OK' : 'MISMATCH'}`);

  const admins = sqlite.prepare(`SELECT COUNT(*) AS c FROM users WHERE role = 'admin' AND is_active = 1`).get().c;
  const adminsPg = (await pool.query(`SELECT COUNT(*)::int AS c FROM users WHERE role = 'admin' AND is_active = 1`)).rows[0].c;
  console.log(`active admins | ${admins} | ${adminsPg} | ${admins === adminsPg ? 'OK' : 'MISMATCH'}`);

  sqlite.close();
  await pool.end();
  process.exit(ok ? 0 : 2);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
