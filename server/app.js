import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { openDb, writeAudit, rowLabel } from './db.js';
import { seedIfEmpty, validateDb } from './seed.js';
import { buildPresentation } from './presentation.js';
import {
  authRequired,
  requireRole,
  signToken,
  comparePassword,
  hashPassword,
  COOKIE_NAME,
  makeAuthResolver,
  cookieOptions,
  validatePasswordPolicy,
  assertAuthConfig,
} from './auth.js';
import {
  securityHeaders,
  loginRateLimit,
  safeErrorHandler,
  notFoundHandler,
  requestLogger,
} from './security.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

export async function createApp() {
  assertAuthConfig();
  const isProd = process.env.NODE_ENV === 'production';
  const db = await openDb();
  const seedResult = await seedIfEmpty(db, {
    adminEmail: process.env.ADMIN_EMAIL || 'admin@sadad.local',
    adminPassword: process.env.ADMIN_PASSWORD || 'Admin@12345',
    adminName: process.env.ADMIN_NAME || 'مدیر سیستم',
  });

  console.log('[seed]', seedResult.seeded ? 'initial seed applied' : 'db already seeded');
  console.log('[validation]', seedResult.validation.ok ? 'OK' : seedResult.validation.mismatches);
  console.log('[db]', db.dialect);

  const app = express();
  app.set('trust proxy', 1);
  app.use(securityHeaders(isProd));
  app.use(requestLogger);
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(cookieParser());

  const resolveUser = makeAuthResolver(db);
  app.use('/api/admin', authRequired, resolveUser);
  app.use('/api/auth/me', authRequired, resolveUser);
  app.use('/api/auth/logout', authRequired, resolveUser);

  async function touch(table, id) {
    await db.prepare(`UPDATE ${table} SET updated_at = datetime('now') WHERE id = ?`).run(id);
  }

  /** Merge draft_json over row for Admin/Preview. Public must never call this. */
  function withDraftOverlay(row) {
    if (!row) return row;
    if (!row.draft_json) {
      const { draft_json, ...rest } = row;
      return { ...rest, has_draft: false };
    }
    try {
      const draft = JSON.parse(row.draft_json);
      const { draft_json, ...base } = row;
      return {
        ...base,
        ...draft,
        id: row.id,
        is_published: row.is_published,
        is_active: draft.is_active !== undefined ? draft.is_active : row.is_active,
        has_draft: true,
      };
    } catch {
      const { draft_json, ...rest } = row;
      return { ...rest, has_draft: false };
    }
  }

  function stripDraftMeta(data) {
    const out = { ...data };
    delete out.id;
    delete out.draft_json;
    delete out.has_draft;
    delete out.created_at;
    delete out.updated_at;
    return out;
  }

  async function listQuery(table, { q, active, published, order = 'sort_order ASC, id ASC' } = {}) {
    let sql = `SELECT * FROM ${table} WHERE 1=1`;
    const params = [];
    if (active === '1' || active === '0') {
      sql += ' AND is_active = ?';
      params.push(Number(active));
    }
    if (published === '1' || published === '0') {
      sql += ' AND is_published = ?';
      params.push(Number(published));
    }
    if (q) {
      sql += ` AND (name LIKE ? OR title LIKE ? OR year_label LIKE ? OR label LIKE ? OR no LIKE ?)`;
      const like = `%${q}%`;
      params.push(like, like, like, like, like);
    }
    sql += ` ORDER BY ${order}`;
    try {
      return await db.prepare(sql).all(...params);
    } catch {
      // tables without all columns — fallback without bad filters
      return await db.prepare(`SELECT * FROM ${table} ORDER BY id ASC`).all();
    }
  }

  // ---------- Auth ----------
  app.post('/api/auth/login', loginRateLimit(), async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'ایمیل و رمز عبور الزامی است' });
    const emailNorm = String(email).toLowerCase().trim();
    const user = await db.prepare('SELECT * FROM users WHERE email = ?').get(emailNorm);

    if (!user || !user.is_active || !comparePassword(password, user.password_hash)) {
      await writeAudit(db, {
        userId: user?.id ?? null,
        action: 'LOGIN_FAILED',
        entity: 'users',
        entityId: user?.id ?? null,
        entityName: emailNorm,
        success: false,
        detail: !user ? 'unknown_user' : !user.is_active ? 'inactive' : 'bad_password',
      });
      return res.status(401).json({ error: 'ایمیل یا رمز عبور نادرست است' });
    }

    await db.prepare(`UPDATE users SET last_login_at = datetime('now'), updated_at = datetime('now') WHERE id = ?`).run(user.id);
    const token = signToken(user);
    res.cookie(COOKIE_NAME, token, cookieOptions(isProd));
    await writeAudit(db, {
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      entity: 'users',
      entityId: user.id,
      entityName: user.name,
      success: true,
    });
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  });

  app.post('/api/auth/logout', authRequired, async (req, res) => {
    await writeAudit(db, { userId: req.user.sub, action: 'LOGOUT', entity: 'users', entityId: req.user.sub });
    res.clearCookie(COOKIE_NAME, { path: '/' });
    res.json({ ok: true });
  });

  app.get('/api/auth/me', authRequired, async (req, res) => {
    const user = await db.prepare('SELECT id, email, name, role, is_active, last_login_at FROM users WHERE id = ?').get(req.user.sub);
    if (!user || !user.is_active) return res.status(401).json({ error: 'کاربر غیرفعال است' });
    res.json({ user });
  });

  // ---------- Public presentation bundle ----------
  app.get('/api/public/presentation', async (_req, res) => {
    res.json(await buildPresentation(db, { draft: false }));
  });

  app.get('/api/public/health', async (_req, res) => {
    try {
      await db.health();
      res.json({ ok: true, database: 'ok', dialect: db.dialect });
    } catch {
      res.status(503).json({ ok: false, database: 'error' });
    }
  });

  app.get('/api/admin/preview/presentation', async (_req, res) => {
    res.json(await buildPresentation(db, { draft: true }));
  });

  // ---------- Admin dashboard ----------
  app.get('/api/admin/dashboard', async (_req, res) => {
    const counts = {
      categories: await db.prepare('SELECT COUNT(*) AS c FROM portfolio_categories').get().c,
      products: await db.prepare('SELECT COUNT(*) AS c FROM products').get().c,
      productsActive: await db.prepare('SELECT COUNT(*) AS c FROM products WHERE is_active = 1').get().c,
      pdi: await db.prepare('SELECT COUNT(*) AS c FROM pdi_statuses').get().c,
      committees: await db.prepare('SELECT COUNT(*) AS c FROM committee_periods').get().c,
      backlog: await db.prepare('SELECT COUNT(*) AS c FROM backlog_systems').get().c,
      initiatives: await db.prepare('SELECT COUNT(*) AS c FROM strategic_impacts').get().c,
      attention: await db.prepare('SELECT COUNT(*) AS c FROM attention_items').get().c,
      homeMenu: await db.prepare('SELECT COUNT(*) AS c FROM home_menu_items').get().c,
      committeeInsights: await db.prepare('SELECT COUNT(*) AS c FROM committee_insights').get().c,
      backlogInsights: await db.prepare('SELECT COUNT(*) AS c FROM backlog_insights').get().c,
      outlook: await db.prepare('SELECT COUNT(*) AS c FROM outlook_pillars').get().c,
    };
    const recent = await db.prepare(
        `SELECT a.id, a.action, a.entity, a.entity_id, a.entity_name, a.user_name, a.user_role, a.created_at,
                u.email AS user_email
         FROM audit_logs a
         LEFT JOIN users u ON u.id = a.user_id
         ORDER BY a.id DESC LIMIT 20`
      ).all();
    res.json({ counts, recent, validation: await validateDb(db) });
  });

  function crudRouter(table, { searchable = [], mapIn, mapOut, entity } = {}) {
    const router = express.Router();
    const ent = entity || table;
    const out = (row) => {
      const merged = withDraftOverlay(row);
      return mapOut ? mapOut(merged) : merged;
    };

    router.get('/', async (req, res) => {
      let rows = await db.prepare(`SELECT * FROM ${table} ORDER BY sort_order ASC, id ASC`).all();
      if (req.query.q && searchable.length) {
        const q = String(req.query.q).toLowerCase();
        rows = rows.filter((r) => searchable.some((k) => String(r[k] ?? '').toLowerCase().includes(q)));
      }
      if (req.query.active === '1' || req.query.active === '0') {
        rows = rows.filter((r) => Number(r.is_active) === Number(req.query.active));
      }
    if (req.query.published === '1' || req.query.published === '0') {
      rows = rows.filter((r) => Number(r.is_published) === Number(req.query.published));
    }
    if (req.query.product_id != null && req.query.product_id !== '') {
      rows = rows.filter((r) => Number(r.product_id) === Number(req.query.product_id));
    }
    res.json({ items: rows.map(out) });
  });

    router.get('/:id', async (req, res) => {
      const row = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
      if (!row) return res.status(404).json({ error: 'یافت نشد' });
      res.json({ item: out(row) });
    });

    router.post('/', requireRole('admin', 'editor'), async (req, res) => {
      const data = stripDraftMeta(mapIn ? mapIn(req.body || {}) : req.body || {});
      if (req.body?.as_draft === true) data.is_published = 0;
      data.draft_json = null;
      const cols = Object.keys(data);
      if (!cols.length) return res.status(400).json({ error: 'داده نامعتبر' });
      const placeholders = cols.map(() => '?').join(',');
      const info = await db.prepare(`INSERT INTO ${table} (${cols.join(',')}) VALUES (${placeholders})`).run(...cols.map((c) => data[c]));
      const item = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(info.lastInsertRowid);
      await writeAudit(db, {
        userId: req.user.sub,
        action: 'CREATE',
        entity: ent,
        entityId: info.lastInsertRowid,
        entityName: rowLabel(item),
      });
      res.status(201).json({ item: out(item) });
    });

    router.put('/:id', requireRole('admin', 'editor'), async (req, res) => {
      const existing = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
      if (!existing) return res.status(404).json({ error: 'یافت نشد' });
      const data = stripDraftMeta(mapIn ? mapIn(req.body || {}, existing) : req.body || {});

      // Save Draft on already-published row: keep Public snapshot; store overlay only.
      if (req.body?.as_draft === true && Number(existing.is_published) === 1) {
        const draftPayload = { ...data };
        delete draftPayload.is_published;
        await db.prepare(`UPDATE ${table} SET draft_json = ?, updated_at = datetime('now') WHERE id = ?`).run(
          JSON.stringify(draftPayload),
          req.params.id
        );
        const item = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
        await writeAudit(db, {
          userId: req.user.sub,
          action: 'UPDATE',
          entity: ent,
          entityId: req.params.id,
          entityName: rowLabel(withDraftOverlay(item)),
          detail: 'save_draft',
        });
        return res.json({ item: out(item) });
      }

      if (req.body?.as_draft === true) data.is_published = 0;
      data.draft_json = null;
      const cols = Object.keys(data);
      if (!cols.length) return res.status(400).json({ error: 'داده نامعتبر' });
      const sets = cols.map((c) => `${c} = ?`).join(', ');
      await db.prepare(`UPDATE ${table} SET ${sets}, updated_at = datetime('now') WHERE id = ?`).run(
        ...cols.map((c) => data[c]),
        req.params.id
      );
      const item = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
      let action = 'UPDATE';
      if (existing.is_published !== undefined && data.is_published !== undefined) {
        if (Number(existing.is_published) === 0 && Number(data.is_published) === 1) action = 'PUBLISH';
        if (Number(existing.is_published) === 1 && Number(data.is_published) === 0) action = 'UNPUBLISH';
      }
      await writeAudit(db, {
        userId: req.user.sub,
        action,
        entity: ent,
        entityId: req.params.id,
        entityName: rowLabel(item),
      });
      res.json({ item: out(item) });
    });

    router.post('/:id/publish', requireRole('admin', 'editor'), async (req, res) => {
      const existing = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
      if (!existing) return res.status(404).json({ error: 'یافت نشد' });
      let draft = null;
      if (existing.draft_json) {
        try {
          draft = JSON.parse(existing.draft_json);
        } catch {
          draft = null;
        }
      }
      if (draft && typeof draft === 'object') {
        const payload = stripDraftMeta(draft);
        delete payload.is_published;
        const cols = Object.keys(payload);
        if (cols.length) {
          const sets = cols.map((c) => `${c} = ?`).join(', ');
          await db.prepare(
            `UPDATE ${table} SET ${sets}, is_published = 1, draft_json = NULL, updated_at = datetime('now') WHERE id = ?`
          ).run(...cols.map((c) => payload[c]), req.params.id);
        } else {
          await db.prepare(
            `UPDATE ${table} SET is_published = 1, draft_json = NULL, updated_at = datetime('now') WHERE id = ?`
          ).run(req.params.id);
        }
      } else {
        await db.prepare(
          `UPDATE ${table} SET is_published = 1, draft_json = NULL, updated_at = datetime('now') WHERE id = ?`
        ).run(req.params.id);
      }
      const item = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
      await writeAudit(db, {
        userId: req.user.sub,
        action: 'PUBLISH',
        entity: ent,
        entityId: req.params.id,
        entityName: rowLabel(item),
      });
      res.json({ item: out(item) });
    });

    router.post('/:id/unpublish', requireRole('admin', 'editor'), async (req, res) => {
      const existing = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
      if (!existing) return res.status(404).json({ error: 'یافت نشد' });
      await db.prepare(`UPDATE ${table} SET is_published = 0, updated_at = datetime('now') WHERE id = ?`).run(req.params.id);
      const item = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
      await writeAudit(db, {
        userId: req.user.sub,
        action: 'UNPUBLISH',
        entity: ent,
        entityId: req.params.id,
        entityName: rowLabel(item),
      });
      res.json({ item: out(item) });
    });

    router.delete('/:id', requireRole('admin'), async (req, res) => {
      const existing = await db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
      if (!existing) return res.status(404).json({ error: 'یافت نشد' });
      const label = rowLabel(existing);
      await db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
      await writeAudit(db, {
        userId: req.user.sub,
        action: 'DELETE',
        entity: ent,
        entityId: req.params.id,
        entityName: label,
      });
      res.json({ ok: true });
    });

    return router;
  }

  app.use(
    '/api/admin/categories',
    crudRouter('portfolio_categories', {
      searchable: ['title', 'slug'],
      entity: 'portfolio_categories',
      mapIn: (body) => ({
        slug: body.slug,
        title: body.title,
        icon_key: body.icon_key || body.icon || 'Layers',
        sort_order: Number(body.sort_order ?? 0),
        is_active: body.is_active === false || body.is_active === 0 ? 0 : 1,
        is_published: body.is_published === false || body.is_published === 0 ? 0 : 1,
      }),
    })
  );

  app.use(
    '/api/admin/products',
    crudRouter('products', {
      searchable: ['name', 'status', 'nature', 'kpi'],
      entity: 'products',
      mapIn: (body) => ({
        category_id: Number(body.category_id),
        name: body.name,
        status: body.status,
        nature: body.nature,
        kpi: body.kpi,
        description: body.description || '',
        sort_order: Number(body.sort_order ?? 0),
        is_active: body.is_active === false || body.is_active === 0 ? 0 : 1,
        is_published: body.is_published === false || body.is_published === 0 ? 0 : 1,
      }),
    })
  );

  // Filter products by category
  app.get('/api/admin/products-by-category/:categoryId', async (req, res) => {
    const items = (await db.prepare(`SELECT * FROM products WHERE category_id = ? ORDER BY sort_order, id`).all(req.params.categoryId)).map(withDraftOverlay);
    res.json({ items });
  });

  app.post('/api/admin/product-content-cards/:id/move', requireRole('admin', 'editor'), async (req, res) => {
    const id = Number(req.params.id);
    const dir = req.body?.direction;
    const card = await db.prepare(`SELECT * FROM product_content_cards WHERE id = ?`).get(id);
    if (!card) return res.status(404).json({ error: 'یافت نشد' });
    const siblings = await db
      .prepare(`SELECT * FROM product_content_cards WHERE product_id = ? ORDER BY sort_order ASC, id ASC`)
      .all(card.product_id);
    const idx = siblings.findIndex((r) => r.id === id);
    const swapWith = dir === 'up' ? idx - 1 : idx + 1;
    if (idx < 0 || swapWith < 0 || swapWith >= siblings.length) return res.json({ ok: true });
    const a = siblings[idx];
    const b = siblings[swapWith];
    await db.prepare(`UPDATE product_content_cards SET sort_order = ? WHERE id = ?`).run(b.sort_order, a.id);
    await db.prepare(`UPDATE product_content_cards SET sort_order = ? WHERE id = ?`).run(a.sort_order, b.id);
    await writeAudit(db, {
      userId: req.user.sub,
      action: 'UPDATE',
      entity: 'product_content_cards',
      entityId: id,
      entityName: a.title,
      detail: `reorder_${dir}`,
    });
    res.json({ ok: true });
  });

  app.use(
    '/api/admin/product-content-cards',
    crudRouter('product_content_cards', {
      searchable: ['title', 'description'],
      entity: 'product_content_cards',
      mapIn: (body) => ({
        product_id: Number(body.product_id),
        title: body.title,
        description: body.description || '',
        image_url: body.image_url || body.image || '',
        icon_key: body.icon_key || body.icon || 'Layers',
        color: body.color || '',
        sort_order: Number(body.sort_order ?? 0),
        is_active: body.is_active === false || body.is_active === 0 ? 0 : 1,
        is_published: body.is_published === false || body.is_published === 0 ? 0 : 1,
      }),
    })
  );

  app.use(
    '/api/admin/pdi',
    crudRouter('pdi_statuses', {
      searchable: ['name'],
      entity: 'pdi_statuses',
      mapIn: (body) => ({
        name: body.name,
        value: Number(body.value ?? 0),
        color: body.color || '#9CA3AF',
        sort_order: Number(body.sort_order ?? 0),
        is_active: body.is_active === false || body.is_active === 0 ? 0 : 1,
        is_published: body.is_published === false || body.is_published === 0 ? 0 : 1,
      }),
    })
  );

  app.use(
    '/api/admin/committees',
    crudRouter('committee_periods', {
      searchable: ['year_label'],
      entity: 'committee_periods',
      mapIn: (body) => ({
        year_label: body.year_label || body.year,
        hours: Number(body.hours ?? 0),
        approvals: Number(body.approvals ?? 0),
        completed: Number(body.completed ?? 0),
        in_progress: Number(body.in_progress ?? body.inProgress ?? 0),
        not_completed: Number(body.not_completed ?? body.notCompleted ?? 0),
        sort_order: Number(body.sort_order ?? 0),
        is_active: body.is_active === false || body.is_active === 0 ? 0 : 1,
        is_published: body.is_published === false || body.is_published === 0 ? 0 : 1,
      }),
    })
  );

  app.use(
    '/api/admin/backlog',
    crudRouter('backlog_systems', {
      searchable: ['name'],
      entity: 'backlog_systems',
      mapIn: (body) => {
        const completed = Number(body.completed ?? 0);
        const in_progress = Number(body.in_progress ?? body.inProgress ?? 0);
        const unstarted = Number(body.unstarted ?? 0);
        const canceled = Number(body.canceled ?? 0);
        const total = Number(body.total ?? completed + in_progress + unstarted + canceled);
        const rate =
          body.rate ||
          (total ? `${((completed / total) * 100).toFixed(1)}%` : '0%');
        return {
          name: body.name,
          completed,
          in_progress,
          unstarted,
          canceled,
          total,
          rate,
          sort_order: Number(body.sort_order ?? 0),
          is_active: body.is_active === false || body.is_active === 0 ? 0 : 1,
          is_published: body.is_published === false || body.is_published === 0 ? 0 : 1,
        };
      },
    })
  );

  app.use(
    '/api/admin/strategic-impacts',
    crudRouter('strategic_impacts', {
      searchable: ['title', 'text'],
      entity: 'strategic_impacts',
      mapIn: (body) => ({
        title: body.title,
        text: body.text || '',
        icon_key: body.icon_key || body.icon || 'TrendingUp',
        sort_order: Number(body.sort_order ?? 0),
        is_active: body.is_active === false || body.is_active === 0 ? 0 : 1,
        is_published: body.is_published === false || body.is_published === 0 ? 0 : 1,
      }),
    })
  );

  app.use(
    '/api/admin/committee-insights',
    crudRouter('committee_insights', {
      searchable: ['title', 'text'],
      entity: 'committee_insights',
      mapIn: (body) => ({
        title: body.title,
        text: body.text || '',
        icon_key: body.icon_key || body.icon || 'Target',
        sort_order: Number(body.sort_order ?? 0),
        is_active: body.is_active === false || body.is_active === 0 ? 0 : 1,
        is_published: body.is_published === false || body.is_published === 0 ? 0 : 1,
      }),
    })
  );

  app.use(
    '/api/admin/backlog-insights',
    crudRouter('backlog_insights', {
      searchable: ['title', 'text', 'insight_key'],
      entity: 'backlog_insights',
      mapIn: (body) => ({
        insight_key: body.insight_key || 'manual',
        title: body.title,
        text: body.text || '',
        icon_key: body.icon_key || body.icon || 'CheckCircle',
        tone: body.tone || 'emerald',
        is_auto: body.is_auto === false || body.is_auto === 0 ? 0 : 1,
        sort_order: Number(body.sort_order ?? 0),
        is_active: body.is_active === false || body.is_active === 0 ? 0 : 1,
        is_published: body.is_published === false || body.is_published === 0 ? 0 : 1,
      }),
    })
  );

  app.use(
    '/api/admin/home-menu',
    crudRouter('home_menu_items', {
      searchable: ['title', 'view_id', 'description'],
      entity: 'home_menu_items',
      mapIn: (body) => ({
        view_id: body.view_id || body.id,
        title: body.title,
        description: body.description || body.desc || '',
        preview: body.preview || '',
        preview_source: body.preview_source || 'manual',
        icon_key: body.icon_key || body.icon || 'Layers',
        sort_order: Number(body.sort_order ?? 0),
        is_active: body.is_active === false || body.is_active === 0 ? 0 : 1,
        is_published: body.is_published === false || body.is_published === 0 ? 0 : 1,
      }),
    })
  );

  app.use(
    '/api/admin/decision-proposals',
    crudRouter('decision_proposals', {
      searchable: ['title', 'text'],
      entity: 'decision_proposals',
      mapIn: (body) => ({
        title: body.title || 'پیشنهاد تصمیم',
        text: body.text || '',
        sort_order: Number(body.sort_order ?? 0),
        is_active: body.is_active === false || body.is_active === 0 ? 0 : 1,
        is_published: body.is_published === false || body.is_published === 0 ? 0 : 1,
      }),
    })
  );

  app.use(
    '/api/admin/executive-focus',
    crudRouter('executive_focus', {
      searchable: ['title', 'text'],
      entity: 'executive_focus',
      mapIn: (body) => ({
        title: body.title,
        text: body.text,
        action: body.action || '',
        sort_order: Number(body.sort_order ?? 0),
        is_active: body.is_active === false || body.is_active === 0 ? 0 : 1,
        is_published: body.is_published === false || body.is_published === 0 ? 0 : 1,
      }),
    })
  );

  app.use(
    '/api/admin/attention',
    crudRouter('attention_items', {
      searchable: ['title', 'level'],
      entity: 'attention_items',
      mapIn: (body) => ({
        title: body.title,
        text: body.text,
        level: body.level || '',
        sort_order: Number(body.sort_order ?? 0),
        is_active: body.is_active === false || body.is_active === 0 ? 0 : 1,
        is_published: body.is_published === false || body.is_published === 0 ? 0 : 1,
      }),
    })
  );

  // Outlook pillars with nested items
  app.get('/api/admin/outlook', async (_req, res) => {
    const pillars = await db.prepare(`SELECT * FROM outlook_pillars ORDER BY sort_order, id`).all();
    const items = await db.prepare(`SELECT * FROM outlook_items ORDER BY sort_order, id`).all();
    res.json({
      items: pillars.map((p) => ({
        ...p,
        items: items.filter((i) => i.pillar_id === p.id),
      })),
    });
  });

  app.post('/api/admin/outlook', requireRole('admin', 'editor'), async (req, res) => {
    const body = req.body || {};
    const info = await db.prepare(
        `INSERT INTO outlook_pillars (num, title, icon_key, color, sort_order, is_active, is_published)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      ).run(
        body.num,
        body.title,
        body.icon_key || 'Target',
        body.color || 'from-[#0057A8] to-[#002B5C]',
        Number(body.sort_order ?? 0),
        body.is_active === false || body.is_active === 0 ? 0 : 1,
        body.is_published === false || body.is_published === 0 ? 0 : 1
      );
    const pillarId = info.lastInsertRowid;
    const texts = Array.isArray(body.items) ? body.items : [];
    const ins = db.prepare(`INSERT INTO outlook_items (pillar_id, text, sort_order) VALUES (?, ?, ?)`);
    for (let i = 0; i < texts.length; i++) {
      const t = texts[i];
      const text = typeof t === 'string' ? t : t.text;
      if (text) await ins.run(pillarId, text, i + 1);
    }
    await writeAudit(db, { userId: req.user.sub, action: 'CREATE', entity: 'outlook_pillars', entityId: pillarId });
    res.status(201).json({ id: pillarId });
  });

  app.put('/api/admin/outlook/:id', requireRole('admin', 'editor'), async (req, res) => {
    const id = req.params.id;
    const existing = await db.prepare(`SELECT * FROM outlook_pillars WHERE id = ?`).get(id);
    if (!existing) return res.status(404).json({ error: 'یافت نشد' });
    const body = req.body || {};
    await db.prepare(
      `UPDATE outlook_pillars SET num=?, title=?, icon_key=?, color=?, sort_order=?, is_active=?, is_published=?, updated_at=datetime('now') WHERE id=?`
    ).run(
      body.num ?? existing.num,
      body.title ?? existing.title,
      body.icon_key ?? existing.icon_key,
      body.color ?? existing.color,
      Number(body.sort_order ?? existing.sort_order),
      body.is_active === false || body.is_active === 0 ? 0 : 1,
      body.is_published === false || body.is_published === 0 ? 0 : 1,
      id
    );
    if (Array.isArray(body.items)) {
      await db.prepare(`DELETE FROM outlook_items WHERE pillar_id = ?`).run(id);
      const ins = db.prepare(`INSERT INTO outlook_items (pillar_id, text, sort_order) VALUES (?, ?, ?)`);
      for (let i = 0; i < body.items.length; i++) {
        const t = body.items[i];
        const text = typeof t === 'string' ? t : t.text;
        if (text) await ins.run(id, text, i + 1);
      }
    }
    await writeAudit(db, { userId: req.user.sub, action: 'UPDATE', entity: 'outlook_pillars', entityId: id });
    res.json({ ok: true });
  });

  app.delete('/api/admin/outlook/:id', requireRole('admin'), async (req, res) => {
    await db.prepare(`DELETE FROM outlook_pillars WHERE id = ?`).run(req.params.id);
    await writeAudit(db, { userId: req.user.sub, action: 'DELETE', entity: 'outlook_pillars', entityId: req.params.id });
    res.json({ ok: true });
  });

  app.get('/api/admin/settings', async (_req, res) => {
    const rows = await db.prepare('SELECT key, value FROM app_settings').all();
    res.json({ settings: Object.fromEntries(rows.map((r) => [r.key, r.value])) });
  });

  app.put('/api/admin/settings', requireRole('admin'), async (req, res) => {
    const settings = req.body?.settings || req.body || {};
    const upsert = db.prepare(
      `INSERT INTO app_settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
    );
    for (const [key, value] of Object.entries(settings)) {
      await upsert.run(key, String(value));
    }
    await writeAudit(db, { userId: req.user.sub, action: 'UPDATE', entity: 'app_settings', detail: JSON.stringify(settings) });
    res.json({ ok: true });
  });

  // Change password (self)
  app.post('/api/admin/change-password', async (req, res) => {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'رمز فعلی و رمز جدید الزامی است' });
    }
    const policy = validatePasswordPolicy(newPassword);
    if (!policy.ok) return res.status(400).json({ error: policy.error });
    const user = await db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.sub);
    if (!comparePassword(currentPassword, user.password_hash)) {
      return res.status(400).json({ error: 'رمز فعلی نادرست است' });
    }
    await db.prepare(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`).run(
      hashPassword(newPassword),
      user.id
    );
    await writeAudit(db, { userId: user.id, action: 'PASSWORD_RESET', entity: 'users', entityId: user.id, entityName: user.name });
    res.json({ ok: true });
  });

  // ---------- Users (admin only) ----------
  app.get('/api/admin/users', requireRole('admin'), async (_req, res) => {
    const items = await db.prepare(
        `SELECT id, email, name, role, is_active, created_at, updated_at, last_login_at FROM users ORDER BY id`
      ).all();
    res.json({ items });
  });

  app.post('/api/admin/users', requireRole('admin'), async (req, res) => {
    const { email, name, password, role } = req.body || {};
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'نام، ایمیل و رمز الزامی است' });
    }
    const policy = validatePasswordPolicy(password);
    if (!policy.ok) return res.status(400).json({ error: policy.error });
    if (!['admin', 'editor'].includes(role || 'editor')) {
      return res.status(400).json({ error: 'نقش نامعتبر است' });
    }
    try {
      const info = await db.prepare(
          `INSERT INTO users (email, name, password_hash, role, is_active) VALUES (?, ?, ?, ?, 1)`
        ).run(String(email).toLowerCase().trim(), name.trim(), hashPassword(password), role || 'editor');
      await writeAudit(db, {
        userId: req.user.sub,
        action: 'USER_CREATED',
        entity: 'users',
        entityId: info.lastInsertRowid,
        entityName: name.trim(),
      });
      const item = await db.prepare(`SELECT id, email, name, role, is_active, created_at, updated_at, last_login_at FROM users WHERE id = ?`).get(info.lastInsertRowid);
      res.status(201).json({ item });
    } catch (e) {
      if (String(e.message || '').includes('UNIQUE')) {
        return res.status(400).json({ error: 'این ایمیل قبلاً ثبت شده است' });
      }
      throw e;
    }
  });

  app.put('/api/admin/users/:id', requireRole('admin'), async (req, res) => {
    const id = Number(req.params.id);
    const existing = await db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'کاربر یافت نشد' });
    const { name, email, role, is_active } = req.body || {};
    if (role && !['admin', 'editor'].includes(role)) {
      return res.status(400).json({ error: 'نقش نامعتبر است' });
    }
    const nextActive = is_active === false || is_active === 0 ? 0 : is_active === true || is_active === 1 ? 1 : existing.is_active;
    await db.prepare(
      `UPDATE users SET name = ?, email = ?, role = ?, is_active = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(
      name ?? existing.name,
      email ? String(email).toLowerCase().trim() : existing.email,
      role ?? existing.role,
      nextActive,
      id
    );
    const action =
      Number(existing.is_active) === 1 && nextActive === 0
        ? 'USER_DEACTIVATED'
        : 'USER_UPDATED';
    await writeAudit(db, {
      userId: req.user.sub,
      action,
      entity: 'users',
      entityId: id,
      entityName: name ?? existing.name,
    });
    const item = await db.prepare(`SELECT id, email, name, role, is_active, created_at, updated_at, last_login_at FROM users WHERE id = ?`).get(id);
    res.json({ item });
  });

  app.post('/api/admin/users/:id/reset-password', requireRole('admin'), async (req, res) => {
    const id = Number(req.params.id);
    const existing = await db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'کاربر یافت نشد' });
    const { password } = req.body || {};
    if (!password) {
      return res.status(400).json({ error: 'رمز جدید الزامی است' });
    }
    const policyReset = validatePasswordPolicy(password);
    if (!policyReset.ok) return res.status(400).json({ error: policyReset.error });
    await db.prepare(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`).run(
      hashPassword(password),
      id
    );
    await writeAudit(db, {
      userId: req.user.sub,
      action: 'PASSWORD_RESET',
      entity: 'users',
      entityId: id,
      entityName: existing.name,
    });
    res.json({ ok: true });
  });

  // Soft-deactivate only (no hard delete)
  app.post('/api/admin/users/:id/deactivate', requireRole('admin'), async (req, res) => {
    const id = Number(req.params.id);
    const existing = await db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'کاربر یافت نشد' });
    if (id === req.user.sub) return res.status(400).json({ error: 'نمی‌توانید خودتان را غیرفعال کنید' });
    await db.prepare(`UPDATE users SET is_active = 0, updated_at = datetime('now') WHERE id = ?`).run(id);
    await writeAudit(db, {
      userId: req.user.sub,
      action: 'USER_DEACTIVATED',
      entity: 'users',
      entityId: id,
      entityName: existing.name,
    });
    res.json({ ok: true });
  });

  // ---------- Audit log (read-only) ----------
  app.get('/api/admin/audit', requireRole('admin', 'editor'), async (req, res) => {
    const { q, user_id, action, entity, page = '1', limit = '25' } = req.query;
    const pageN = Math.max(1, Number(page) || 1);
    const limitN = Math.min(100, Math.max(1, Number(limit) || 25));
    const offset = (pageN - 1) * limitN;
    let where = 'WHERE 1=1';
    const params = [];
    if (user_id) {
      where += ' AND a.user_id = ?';
      params.push(Number(user_id));
    }
    if (action) {
      where += ' AND a.action = ?';
      params.push(String(action));
    }
    if (entity) {
      where += ' AND a.entity = ?';
      params.push(String(entity));
    }
    if (q) {
      where += ' AND (a.user_name LIKE ? OR a.entity_name LIKE ? OR a.action LIKE ? OR a.entity LIKE ?)';
      const like = `%${q}%`;
      params.push(like, like, like, like);
    }
    const total = db.prepare(`SELECT COUNT(*) AS c FROM audit_logs a ${where}`).get(...params).c;
    const items = await db.prepare(
        `SELECT a.id, a.user_id, a.user_name, a.user_role, a.action, a.entity, a.entity_id, a.entity_name,
                a.success, a.created_at, u.email AS user_email
         FROM audit_logs a
         LEFT JOIN users u ON u.id = a.user_id
         ${where}
         ORDER BY a.id DESC
         LIMIT ? OFFSET ?`
      ).all(...params, limitN, offset);
    res.json({ items, total, page: pageN, limit: limitN });
  });

  // ---------- Process editor ----------
  app.get('/api/admin/process', async (_req, res) => {
    const tracks = await db.prepare(`SELECT * FROM process_tracks ORDER BY sort_order, id`).all();
    const steps = await db.prepare(`SELECT * FROM process_steps ORDER BY sort_order, id`).all();
    res.json({
      items: tracks.map((t) => ({
        ...t,
        steps: steps.filter((s) => s.track_id === t.id),
      })),
    });
  });

  app.post('/api/admin/process/tracks', requireRole('admin', 'editor'), async (req, res) => {
    const { num, title, sort_order, is_active, is_published, steps } = req.body || {};
    if (!title) return res.status(400).json({ error: 'عنوان الزامی است' });
    const info = await db.prepare(
        `INSERT INTO process_tracks (num, title, sort_order, is_active, is_published) VALUES (?, ?, ?, ?, ?)`
      ).run(
        num || '',
        title,
        Number(sort_order ?? 0),
        is_active === false || is_active === 0 ? 0 : 1,
        is_published === false || is_published === 0 ? 0 : 1
      );
    const trackId = info.lastInsertRowid;
    if (Array.isArray(steps)) {
      const ins = db.prepare(
        `INSERT INTO process_steps (track_id, title, description, icon_key, color, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, 1)`
      );
      for (let i = 0; i < steps.length; i++) {
        const s = steps[i];
        if (s?.title) await ins.run(trackId, s.title, s.description || '', s.icon_key || 'Settings', s.color || 'navy', i + 1);
      }
    }
    await writeAudit(db, { userId: req.user.sub, action: 'CREATE', entity: 'process_tracks', entityId: trackId, entityName: title });
    res.status(201).json({ id: trackId });
  });

  app.put('/api/admin/process/tracks/:id', requireRole('admin', 'editor'), async (req, res) => {
    const id = req.params.id;
    const existing = await db.prepare(`SELECT * FROM process_tracks WHERE id = ?`).get(id);
    if (!existing) return res.status(404).json({ error: 'یافت نشد' });
    const body = req.body || {};
    await db.prepare(
      `UPDATE process_tracks SET num=?, title=?, sort_order=?, is_active=?, is_published=?, updated_at=datetime('now') WHERE id=?`
    ).run(
      body.num ?? existing.num,
      body.title ?? existing.title,
      Number(body.sort_order ?? existing.sort_order),
      body.is_active === false || body.is_active === 0 ? 0 : 1,
      body.is_published === false || body.is_published === 0 ? 0 : 1,
      id
    );
    if (Array.isArray(body.steps)) {
      await db.prepare(`DELETE FROM process_steps WHERE track_id = ?`).run(id);
      const ins = db.prepare(
        `INSERT INTO process_steps (track_id, title, description, icon_key, color, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)`
      );
      for (let i = 0; i < body.steps.length; i++) {
        const s = body.steps[i];
        if (s?.title)
          await ins.run(
            id,
            s.title,
            s.description || '',
            s.icon_key || 'Settings',
            s.color || 'navy',
            Number(s.sort_order ?? i + 1),
            s.is_active === false || s.is_active === 0 ? 0 : 1
          );
      }
    }
    await writeAudit(db, {
      userId: req.user.sub,
      action: 'UPDATE',
      entity: 'process_tracks',
      entityId: id,
      entityName: body.title ?? existing.title,
    });
    res.json({ ok: true });
  });

  app.post('/api/admin/process/tracks/:id/move', requireRole('admin', 'editor'), async (req, res) => {
    const id = Number(req.params.id);
    const dir = req.body?.direction; // 'up' | 'down'
    const tracks = await db.prepare(`SELECT * FROM process_tracks ORDER BY sort_order, id`).all();
    const idx = tracks.findIndex((t) => t.id === id);
    if (idx < 0) return res.status(404).json({ error: 'یافت نشد' });
    const swapWith = dir === 'up' ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= tracks.length) return res.json({ ok: true });
    const a = tracks[idx];
    const b = tracks[swapWith];
    await db.prepare(`UPDATE process_tracks SET sort_order = ? WHERE id = ?`).run(b.sort_order, a.id);
    await db.prepare(`UPDATE process_tracks SET sort_order = ? WHERE id = ?`).run(a.sort_order, b.id);
    await writeAudit(db, { userId: req.user.sub, action: 'UPDATE', entity: 'process_tracks', entityId: id, entityName: a.title, detail: `reorder_${dir}` });
    res.json({ ok: true });
  });

  app.delete('/api/admin/process/tracks/:id', requireRole('admin'), async (req, res) => {
    const existing = await db.prepare(`SELECT * FROM process_tracks WHERE id = ?`).get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'یافت نشد' });
    await db.prepare(`DELETE FROM process_tracks WHERE id = ?`).run(req.params.id);
    await writeAudit(db, {
      userId: req.user.sub,
      action: 'DELETE',
      entity: 'process_tracks',
      entityId: req.params.id,
      entityName: existing.title,
    });
    res.json({ ok: true });
  });


  const dist = path.join(ROOT, 'dist');
  if (isProd && process.env.VERCEL !== '1' && fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get('/{*splat}', async (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(dist, 'index.html'));
    });
  }

  app.use('/api', notFoundHandler);
  app.use(safeErrorHandler(isProd));
  app.locals.db = db;
  return app;
}
