import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, 'data');
const DB_PATH = process.env.DB_PATH || path.join(DATA_DIR, 'presentation.db');
const PG_SCHEMA_PATH = path.join(__dirname, 'sql', 'schema.postgres.sql');

const { Pool } = pg;

/** Convert SQLite-style `?` placeholders to Postgres `$1..$n`. */
function toPgPlaceholders(sql) {
  let i = 0;
  return sql.replace(/\?/g, () => `$${++i}`);
}

/** Normalize datetime('now') and ON CONFLICT excluded → EXCLUDED for Postgres. */
function toPgSql(sql) {
  return sql
    .replace(/datetime\('now'\)/gi, 'NOW()')
    .replace(/\bexcluded\./gi, 'EXCLUDED.');
}

function makeStatementApi(db, sql) {
  return {
    all: (...params) => db.all(sql, params),
    get: (...params) => db.get(sql, params),
    run: (...params) => db.run(sql, params),
  };
}

function wrapSqlite(raw) {
  const db = {
    dialect: 'sqlite',
    sqlNow: `datetime('now')`,
    prepare(sql) {
      return makeStatementApi(db, sql);
    },
    async all(sql, params = []) {
      return raw.prepare(sql).all(...params);
    },
    async get(sql, params = []) {
      return raw.prepare(sql).get(...params);
    },
    async run(sql, params = []) {
      const info = raw.prepare(sql).run(...params);
      return { lastInsertRowid: Number(info.lastInsertRowid), changes: Number(info.changes) };
    },
    async exec(sql) {
      raw.exec(sql);
    },
    async health() {
      await db.get('SELECT 1 AS ok');
      return true;
    },
    async close() {
      try {
        raw.close();
      } catch {
        /* ignore */
      }
    },
  };
  return db;
}

function wrapPostgres(pool) {
  const db = {
    dialect: 'postgres',
    sqlNow: 'NOW()',
    prepare(sql) {
      return makeStatementApi(db, sql);
    },
    async all(sql, params = []) {
      const q = toPgPlaceholders(toPgSql(sql));
      const r = await pool.query(q, params);
      return r.rows;
    },
    async get(sql, params = []) {
      const rows = await db.all(sql, params);
      return rows[0];
    },
    async run(sql, params = []) {
      let q = toPgPlaceholders(toPgSql(sql));
      const trimmed = q.trim();
      const isInsert = /^INSERT\s+/i.test(trimmed);
      const hasReturning = /\bRETURNING\b/i.test(trimmed);
      if (isInsert && !hasReturning) {
        q = `${q.replace(/;?\s*$/, '')} RETURNING id`;
      }
      const r = await pool.query(q, params);
      const lastInsertRowid = r.rows?.[0]?.id != null ? Number(r.rows[0].id) : 0;
      return { lastInsertRowid, changes: r.rowCount ?? 0 };
    },
    async exec(sql) {
      await pool.query(toPgSql(sql));
    },
    async health() {
      await pool.query('SELECT 1');
      return true;
    },
    async close() {
      await pool.end();
    },
  };
  return db;
}

async function tableCols(db, table) {
  if (db.dialect === 'postgres') {
    const rows = await db.all(
      `SELECT column_name AS name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = ?`,
      [table]
    );
    return rows.map((c) => c.name);
  }
  return (await db.all(`PRAGMA table_info(${table})`)).map((c) => c.name);
}

async function ensureColumn(db, table, column, ddl) {
  const cols = await tableCols(db, table);
  if (!cols.includes(column)) {
    await db.exec(`ALTER TABLE ${table} ADD COLUMN ${ddl}`);
  }
}

async function migrateSqlite(db) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin','editor')),
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT,
      detail TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS portfolio_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      icon_key TEXT NOT NULL DEFAULT 'Layers',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL,
      nature TEXT NOT NULL,
      kpi TEXT NOT NULL,
      description TEXT DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (category_id) REFERENCES portfolio_categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pdi_statuses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      value INTEGER NOT NULL DEFAULT 0,
      color TEXT NOT NULL DEFAULT '#9CA3AF',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS committee_periods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      year_label TEXT NOT NULL,
      hours INTEGER NOT NULL DEFAULT 0,
      approvals INTEGER NOT NULL DEFAULT 0,
      completed INTEGER NOT NULL DEFAULT 0,
      in_progress INTEGER NOT NULL DEFAULT 0,
      not_completed INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS backlog_systems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      in_progress INTEGER NOT NULL DEFAULT 0,
      unstarted INTEGER NOT NULL DEFAULT 0,
      canceled INTEGER NOT NULL DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 0,
      rate TEXT NOT NULL DEFAULT '0%',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS initiatives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '',
      icon_key TEXT NOT NULL DEFAULT 'Rocket',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS executive_kpis (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      value TEXT NOT NULL,
      label TEXT NOT NULL,
      note TEXT DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS executive_focus (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      text TEXT NOT NULL,
      action TEXT DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS attention_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      text TEXT NOT NULL,
      level TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS board_decisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      no TEXT NOT NULL,
      title TEXT NOT NULL,
      question TEXT NOT NULL,
      evidence TEXT NOT NULL,
      outcome TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS outlook_pillars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      num TEXT NOT NULL,
      title TEXT NOT NULL,
      icon_key TEXT NOT NULL DEFAULT 'Target',
      color TEXT NOT NULL DEFAULT 'from-[#0057A8] to-[#002B5C]',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS outlook_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pillar_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (pillar_id) REFERENCES outlook_pillars(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS process_tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      num TEXT NOT NULL,
      title TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS process_steps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      track_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      icon_key TEXT NOT NULL DEFAULT 'Settings',
      color TEXT NOT NULL DEFAULT 'navy',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (track_id) REFERENCES process_tracks(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS strategic_impacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      text TEXT NOT NULL DEFAULT '',
      icon_key TEXT NOT NULL DEFAULT 'TrendingUp',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      draft_json TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS committee_insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      text TEXT NOT NULL DEFAULT '',
      icon_key TEXT NOT NULL DEFAULT 'Target',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      draft_json TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS backlog_insights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      insight_key TEXT NOT NULL DEFAULT 'manual',
      title TEXT NOT NULL,
      text TEXT NOT NULL DEFAULT '',
      icon_key TEXT NOT NULL DEFAULT 'CheckCircle',
      tone TEXT NOT NULL DEFAULT 'emerald',
      is_auto INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      draft_json TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS home_menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      view_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      preview TEXT NOT NULL DEFAULT '',
      preview_source TEXT NOT NULL DEFAULT 'manual',
      icon_key TEXT NOT NULL DEFAULT 'Layers',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      draft_json TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS decision_proposals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT 'پیشنهاد تصمیم',
      text TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      is_published INTEGER NOT NULL DEFAULT 1,
      draft_json TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active, is_published);
    CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
  `);

  await ensureColumn(db, 'users', 'last_login_at', 'last_login_at TEXT');
  await ensureColumn(db, 'audit_logs', 'user_name', 'user_name TEXT');
  await ensureColumn(db, 'audit_logs', 'user_role', 'user_role TEXT');
  await ensureColumn(db, 'audit_logs', 'entity_name', 'entity_name TEXT');
  await ensureColumn(db, 'audit_logs', 'success', 'success INTEGER NOT NULL DEFAULT 1');

  const draftTables = [
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
    'process_tracks',
    'strategic_impacts',
    'committee_insights',
    'backlog_insights',
    'home_menu_items',
    'decision_proposals',
  ];
  for (const t of draftTables) {
    await ensureColumn(db, t, 'draft_json', 'draft_json TEXT');
  }

  try {
    await db
      .prepare(`UPDATE attention_items SET text = ? WHERE title = ?`)
      .run(
        'نبود ظرفیت اختصاص‌یافته و قابل‌اندازه‌گیری برای تحویل هر محصول، محدودیت ظرفیت موجود، امکان ظرفیت‌سنجی و برنامه‌ریزی دقیق به تفکیک محصول را محدود کرده و در نتیجه قابلیت پیش‌بینی زمان و تعهد تحویل کاهش یافته است.',
        'تمرکز روی گلوگاه‌های تحویل'
      );
    await db
      .prepare(`UPDATE attention_items SET text = ? WHERE title = ?`)
      .run(
        'ایجاد سازوکار تصمیم‌گیری سریع، شفاف و داده‌محور با مالکیت مشخص، اولویت‌بندی مبتنی بر ارزش کسب‌وکار و سنجش اثربخشی تصمیمات بر اساس خروجی واقعی.',
        'اثربخشی تصمیمات'
      );
    await db.prepare(`UPDATE executive_focus SET action = '' WHERE title IN ('رشد', 'یکپارچگی', 'تحقق ارزش')`).run();
  } catch {
    /* ignore if tables empty during first migrate */
  }

  await seedEditorialContentIfEmpty(db);
}

async function migratePostgres(db) {
  const schema = fs.readFileSync(PG_SCHEMA_PATH, 'utf8');
  await db.exec(schema);
  await seedEditorialContentIfEmpty(db);
}

async function seedEditorialContentIfEmpty(db) {
  const impacts = await db.prepare('SELECT COUNT(*) AS c FROM strategic_impacts').get();
  if (Number(impacts?.c || 0) === 0) {
    const ins = db.prepare(
      `INSERT INTO strategic_impacts (title, text, icon_key, sort_order) VALUES (?, ?, ?, ?)`
    );
    for (const r of [
      ['درآمد', 'ایجاد جریان‌های درآمدی جدید از اعتبار، BNPL و خدمات ارزش‌افزوده', 'TrendingUp', 1],
      ['رشد', 'افزایش ارزش سبد خدمات سداد برای پذیرندگان و توسعه بازارهای جدید', 'Rocket', 2],
      ['بهره‌وری', 'کاهش توسعه‌های موازی و ایجاد زیرساخت‌های قابل استفاده مجدد', 'Settings', 3],
      ['آینده کسب‌وکار', 'ایجاد بستر حرکت از Payment Provider به Financial & Business Platform', 'Target', 4],
    ]) {
      await ins.run(...r);
    }
  }

  const cis = await db.prepare('SELECT COUNT(*) AS c FROM committee_insights').get();
  if (Number(cis?.c || 0) === 0) {
    const ins = db.prepare(
      `INSERT INTO committee_insights (title, text, icon_key, sort_order) VALUES (?, ?, ?, ?)`
    );
    await ins.run(
      'تمرکز حاکمیت محصول',
      'اثربخشی کمیته‌ها را باید از «تعداد مصوبه» به «تحقق خروجی» منتقل کرد؛ با پایش دوره‌ای مصوبات باز، تعیین مالک اجرا و بستن حلقه تصمیم تا نتیجه کسب‌وکار.',
      'Target',
      1
    );
    await ins.run(
      'نفرساعت',
      'مجموع نفرساعت بر اساس میانگین ۲۰ نفر حضور در هر جلسه محاسبه شده است.',
      'Clock',
      2
    );
  }

  const bis = await db.prepare('SELECT COUNT(*) AS c FROM backlog_insights').get();
  if (Number(bis?.c || 0) === 0) {
    const ins = db.prepare(
      `INSERT INTO backlog_insights (insight_key, title, text, icon_key, tone, is_auto, sort_order) VALUES (?, ?, ?, ?, ?, 1, ?)`
    );
    await ins.run('highest_completion', 'بالاترین نرخ تکمیل', '', 'CheckCircle', 'emerald', 1);
    await ins.run('most_active', 'بیشترین حجم کار فعال', '', 'AlertTriangle', 'amber', 2);
    await ins.run('needs_attention', 'نیازمند توجه', '', 'Activity', 'red', 3);
  }

  const home = await db.prepare('SELECT COUNT(*) AS c FROM home_menu_items').get();
  if (Number(home?.c || 0) === 0) {
    const ins = db.prepare(
      `INSERT INTO home_menu_items (view_id, title, description, preview, preview_source, icon_key, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    const rows = [
      ['executive', 'خلاصه مدیریتی', 'تصویر فشرده‌ای از وضعیت، عملکرد و تمرکزهای کلیدی', 'نمای یک‌صفحه‌ای مدیرعامل', 'manual', 'Gauge', 1],
      ['portfolio', 'پرتفوی محصولات', 'سبد محصولات و تفکیک محصولات کلیدی، نوآورانه و توانمندساز', '', 'products', 'Layers', 2],
      ['pdi', 'تقاضا و PDI', 'حجم تقاضا، وضعیت رسیدگی و نقاط تمرکز', '', 'pdi', 'Inbox', 3],
      ['committees', 'حاکمیت و تصمیمات محصول', 'تصمیمات، میزان اجرا و اثربخشی مصوبات', '', 'committees', 'Users', 4],
      ['backlog', 'تحویل و ظرفیت اجرا', 'بک‌لاگ، نرخ تحقق و نقاط نیازمند توجه', '', 'backlog', 'ListTodo', 5],
      ['process', 'حاکمیت چرخه محصول', 'از فرصت و ایده تا تحقق ارزش کسب‌وکار', 'Value Delivery', 'manual', 'GitBranch', 6],
      ['attention', 'موارد نیازمند تصمیم', 'موضوعاتی که برای تسریع مسیر نیازمند توجه مدیریت هستند', '۳ محور مدیریتی', 'manual', 'AlertTriangle', 7],
      ['outlook', 'چشم‌انداز و جهت‌گیری', 'تمرکز مدیریت محصول در افق پیش‌رو', '۳ محور استراتژیک', 'manual', 'Target', 8],
    ];
    for (const r of rows) await ins.run(...r);
  }

  const props = await db.prepare('SELECT COUNT(*) AS c FROM decision_proposals').get();
  if (Number(props?.c || 0) === 0) {
    const setting = await db.prepare(`SELECT value FROM app_settings WHERE key = 'attention_suggestion'`).get();
    const suggestion =
      setting?.value ||
      'تمرکز ظرفیت توسعه بر اولویت‌های دارای ارزش کسب‌وکار، تعریف SLA برای تقاضا و ایجاد مسیر مشخص برای رفع وابستگی‌های بین‌واحدی.';
    await db
      .prepare(`INSERT INTO decision_proposals (title, text, sort_order) VALUES (?, ?, 1)`)
      .run('پیشنهاد تصمیم', suggestion);
  }
}

/**
 * Open DB: PostgreSQL when DATABASE_URL is set (Production/Preview),
 * otherwise local SQLite for Development.
 */
export async function openDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl) {
    const pool = new Pool({
      connectionString: databaseUrl,
      ssl: process.env.PGSSL === 'false' ? false : { rejectUnauthorized: false },
      max: Number(process.env.PG_POOL_MAX || 5),
    });
    const db = wrapPostgres(pool);
    await migratePostgres(db);
    return db;
  }

  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SQLITE_PROD !== '1') {
    throw new Error('DATABASE_URL is required in production (SQLite is not supported on Vercel)');
  }

  // Dynamic import so Vercel production (Postgres-only) never loads node:sqlite
  const { DatabaseSync } = await import('node:sqlite');
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const raw = new DatabaseSync(DB_PATH);
  raw.exec('PRAGMA foreign_keys = ON;');
  raw.exec('PRAGMA journal_mode = WAL;');
  const db = wrapSqlite(raw);
  await migrateSqlite(db);
  return db;
}

/** Audit from server auth identity only — never trust client-sent user/role. */
export async function writeAudit(db, { userId, action, entity, entityId, entityName, success = true, detail }) {
  let userName = null;
  let userRole = null;
  if (userId) {
    const u = await db.prepare('SELECT name, email, role FROM users WHERE id = ?').get(userId);
    if (u) {
      userName = u.name || u.email;
      userRole = u.role;
    }
  }
  await db
    .prepare(
      `INSERT INTO audit_logs (user_id, action, entity, entity_id, entity_name, user_name, user_role, success, detail)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      userId ?? null,
      action,
      entity,
      entityId != null ? String(entityId) : null,
      entityName ?? null,
      userName,
      userRole,
      success ? 1 : 0,
      detail ?? null
    );
}

export function audit(db, args) {
  return writeAudit(db, args);
}

export function rowLabel(row) {
  if (!row) return null;
  return row.name || row.title || row.year_label || row.label || row.slug || row.no || null;
}

export { DB_PATH, DATA_DIR };
