import bcrypt from 'bcryptjs';
import {
  PORTFOLIO_SEED,
  PDI_SEED,
  COMMITTEES_SEED,
  BACKLOG_SEED,
  INITIATIVES_SEED,
  EXECUTIVE_KPIS_SEED,
  EXECUTIVE_FOCUS_SEED,
  ATTENTION_SEED,
  DECISIONS_SEED,
  OUTLOOK_PILLARS_SEED,
  APP_SETTINGS_SEED,
  PROCESS_SEED,
  VALIDATION,
} from '../src/data/hardcoded.js';

export async function seedProcessIfEmpty(db) {
  const count = await db.prepare('SELECT COUNT(*) AS c FROM process_tracks').get();
  if (Number(count?.c || 0) > 0) return false;
  const insertTrack = db.prepare(
    `INSERT INTO process_tracks (num, title, sort_order) VALUES (?, ?, ?)`
  );
  const insertStep = db.prepare(
    `INSERT INTO process_steps (track_id, title, description, icon_key, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)`
  );
  for (const track of PROCESS_SEED) {
    const info = await insertTrack.run(track.num, track.title, track.sort_order);
    for (let i = 0; i < track.steps.length; i++) {
      const step = track.steps[i];
      await insertStep.run(info.lastInsertRowid, step.title, step.description, step.icon, step.color, i + 1);
    }
  }
  return true;
}

export async function seedIfEmpty(db, { adminEmail, adminPassword, adminName }) {
  const userCount = await db.prepare('SELECT COUNT(*) AS c FROM users').get();
  if (Number(userCount?.c || 0) === 0) {
    const hash = bcrypt.hashSync(adminPassword, 10);
    await db
      .prepare(`INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, 'admin')`)
      .run(adminEmail, adminName, hash);

    const editorEmail = process.env.EDITOR_EMAIL || 'editor@sadad.local';
    const editorPassword = process.env.EDITOR_PASSWORD || 'Editor@12345';
    await db
      .prepare(`INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, 'editor')`)
      .run(editorEmail, 'ویرایشگر', bcrypt.hashSync(editorPassword, 10));
  }

  const catCount = await db.prepare('SELECT COUNT(*) AS c FROM portfolio_categories').get();
  if (Number(catCount?.c || 0) > 0) {
    const processSeeded = await seedProcessIfEmpty(db);
    return { seeded: false, processSeeded, validation: await validateDb(db) };
  }

  const insertCat = db.prepare(
    `INSERT INTO portfolio_categories (slug, title, icon_key, sort_order) VALUES (?, ?, ?, ?)`
  );
  const insertProduct = db.prepare(
    `INSERT INTO products (category_id, name, status, nature, kpi, sort_order) VALUES (?, ?, ?, ?, ?, ?)`
  );

  for (const [slug, cat] of Object.entries(PORTFOLIO_SEED)) {
    const info = await insertCat.run(slug, cat.title, cat.icon, cat.sort_order);
    for (let i = 0; i < cat.products.length; i++) {
      const p = cat.products[i];
      await insertProduct.run(info.lastInsertRowid, p.name, p.status, p.nature, p.kpi, i + 1);
    }
  }

  const insertPdi = db.prepare(
    `INSERT INTO pdi_statuses (name, value, color, sort_order) VALUES (?, ?, ?, ?)`
  );
  for (let i = 0; i < PDI_SEED.length; i++) {
    const row = PDI_SEED[i];
    await insertPdi.run(row.name, row.value, row.color, i + 1);
  }

  const insertCommittee = db.prepare(
    `INSERT INTO committee_periods (year_label, hours, approvals, completed, in_progress, not_completed, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  for (let i = 0; i < COMMITTEES_SEED.length; i++) {
    const row = COMMITTEES_SEED[i];
    await insertCommittee.run(
      row.year,
      row.hours,
      row.approvals,
      row.completed,
      row.inProgress,
      row.notCompleted,
      i + 1
    );
  }

  const insertBacklog = db.prepare(
    `INSERT INTO backlog_systems (name, completed, in_progress, unstarted, canceled, total, rate, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );
  for (let i = 0; i < BACKLOG_SEED.length; i++) {
    const row = BACKLOG_SEED[i];
    await insertBacklog.run(
      row.name,
      row.completed,
      row.inProgress,
      row.unstarted,
      row.canceled,
      row.total,
      row.rate,
      i + 1
    );
  }

  const insertInit = db.prepare(
    `INSERT INTO initiatives (title, description, category, icon_key, sort_order) VALUES (?, ?, ?, ?, ?)`
  );
  for (let i = 0; i < INITIATIVES_SEED.length; i++) {
    const row = INITIATIVES_SEED[i];
    await insertInit.run(row.title, row.desc, row.category, row.icon, i + 1);
  }

  const insertKpi = db.prepare(
    `INSERT INTO executive_kpis (value, label, note, sort_order) VALUES (?, ?, ?, ?)`
  );
  for (const row of EXECUTIVE_KPIS_SEED) {
    await insertKpi.run(row.value, row.label, row.note, row.sort_order);
  }

  const insertFocus = db.prepare(
    `INSERT INTO executive_focus (title, text, action, sort_order) VALUES (?, ?, ?, ?)`
  );
  for (const row of EXECUTIVE_FOCUS_SEED) {
    await insertFocus.run(row.title, row.text, row.action, row.sort_order);
  }

  const insertAtt = db.prepare(
    `INSERT INTO attention_items (title, text, level, sort_order) VALUES (?, ?, ?, ?)`
  );
  for (const row of ATTENTION_SEED) {
    await insertAtt.run(row.title, row.text, row.level, row.sort_order);
  }

  const insertDec = db.prepare(
    `INSERT INTO board_decisions (no, title, question, evidence, outcome, sort_order) VALUES (?, ?, ?, ?, ?, ?)`
  );
  for (const row of DECISIONS_SEED) {
    await insertDec.run(row.no, row.title, row.question, row.evidence, row.outcome, row.sort_order);
  }

  const insertPillar = db.prepare(
    `INSERT INTO outlook_pillars (num, title, icon_key, color, sort_order) VALUES (?, ?, ?, ?, ?)`
  );
  const insertItem = db.prepare(
    `INSERT INTO outlook_items (pillar_id, text, sort_order) VALUES (?, ?, ?)`
  );
  for (const pillar of OUTLOOK_PILLARS_SEED) {
    const info = await insertPillar.run(
      pillar.num,
      pillar.title,
      pillar.icon,
      pillar.color,
      pillar.sort_order
    );
    for (let i = 0; i < pillar.items.length; i++) {
      await insertItem.run(info.lastInsertRowid, pillar.items[i], i + 1);
    }
  }

  const setSetting = db.prepare(
    `INSERT INTO app_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`
  );
  for (const [key, value] of Object.entries(APP_SETTINGS_SEED)) {
    await setSetting.run(key, String(value));
  }

  await seedProcessIfEmpty(db);
  return { seeded: true, processSeeded: true, validation: await validateDb(db) };
}

export async function validateDb(db) {
  const productCount = Number((await db.prepare('SELECT COUNT(*) AS c FROM products').get())?.c || 0);
  const categoryCount = Number(
    (await db.prepare('SELECT COUNT(*) AS c FROM portfolio_categories').get())?.c || 0
  );
  const pdiSum = Number(
    (await db.prepare('SELECT COALESCE(SUM(value),0) AS s FROM pdi_statuses').get())?.s || 0
  );
  const pdiRows = Number((await db.prepare('SELECT COUNT(*) AS c FROM pdi_statuses').get())?.c || 0);
  const committeePeriods = Number(
    (await db.prepare('SELECT COUNT(*) AS c FROM committee_periods').get())?.c || 0
  );
  const backlogSystems = Number(
    (await db.prepare('SELECT COUNT(*) AS c FROM backlog_systems').get())?.c || 0
  );
  const backlogTotalItems = Number(
    (await db.prepare('SELECT COALESCE(SUM(total),0) AS s FROM backlog_systems').get())?.s || 0
  );
  const initiatives = Number((await db.prepare('SELECT COUNT(*) AS c FROM initiatives').get())?.c || 0);
  const attentionItems = Number(
    (await db.prepare('SELECT COUNT(*) AS c FROM attention_items').get())?.c || 0
  );
  const decisions = Number((await db.prepare('SELECT COUNT(*) AS c FROM board_decisions').get())?.c || 0);
  const outlookPillars = Number(
    (await db.prepare('SELECT COUNT(*) AS c FROM outlook_pillars').get())?.c || 0
  );

  const actual = {
    productCount,
    categoryCount,
    pdiSum,
    pdiRows,
    committeePeriods,
    backlogSystems,
    backlogTotalItems,
    initiatives,
    attentionItems,
    decisions,
    outlookPillars,
  };

  const mismatches = Object.entries(VALIDATION)
    .filter(([k, expected]) => actual[k] !== expected)
    .map(([k, expected]) => ({ key: k, expected, actual: actual[k] }));

  return { ok: mismatches.length === 0, actual, expected: VALIDATION, mismatches };
}
