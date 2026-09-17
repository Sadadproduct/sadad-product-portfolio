import { writeAudit, rowLabel } from './db.js';

function parseDraft(row) {
  if (!row?.draft_json) return null;
  try {
    return JSON.parse(row.draft_json);
  } catch {
    return null;
  }
}

/** For preview: overlay draft_json onto published columns. Public never uses this. */
function applyDraftRow(row) {
  if (!row) return row;
  const draft = parseDraft(row);
  if (!draft) {
    const { draft_json, ...rest } = row;
    return rest;
  }
  const { draft_json, ...base } = row;
  return { ...base, ...draft, id: row.id, is_published: row.is_published };
}

function mapRows(rows, draft) {
  return draft
    ? rows.map(applyDraftRow)
    : rows.map((r) => {
        const { draft_json, ...rest } = r;
        return rest;
      });
}

function faDigits(n) {
  const s = String(n);
  return s.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

function faNumber(n) {
  const num = Number(n) || 0;
  const withSep = num.toLocaleString('en-US');
  return faDigits(withSep).replace(/,/g, '٬');
}

function isDoneClosed(name = '') {
  const n = String(name);
  return /\bdone\b|\bclosed\b/i.test(n) || /انجام شده|بسته شده/.test(n);
}

function buildAutoBacklogText(key, backlog) {
  if (!backlog.length) return '';
  const withRate = backlog.map((b) => ({
    ...b,
    rateNum: Number(b.rate) || (b.total ? Math.round((Number(b.completed) / Number(b.total)) * 1000) / 10 : 0),
  }));
  if (key === 'highest_completion') {
    const best = [...withRate].sort((a, b) => b.rateNum - a.rateNum)[0];
    return `سامانه ${best.name} با ${faDigits(best.rateNum)}٪ نرخ تکمیل، بهترین عملکرد را در اتمام وظایف داشته است.`;
  }
  if (key === 'most_active') {
    const most = [...withRate].sort((a, b) => Number(b.inProgress) - Number(a.inProgress))[0];
    return `سامانه ${most.name} با ${faNumber(most.inProgress)} تسک در حال انجام، بیشترین حجم عملیاتی فعلی را دارد.`;
  }
  if (key === 'needs_attention') {
    const worst = [...withRate].sort((a, b) => a.rateNum - b.rateNum)[0];
    return `نرخ تکمیل ${worst.name} تنها ${faDigits(worst.rateNum)}٪ است و بخش عمده وظایف (${faNumber(worst.inProgress)} مورد) در وضعیت در حال انجام انباشته شده‌اند.`;
  }
  return '';
}

function computeExecutiveKpis({ productCount, categoryCount, pdi, committees, backlog }) {
  const pdiTotal = pdi.reduce((s, r) => s + (Number(r.value) || 0), 0);
  const doneClosed = pdi.filter((r) => isDoneClosed(r.name)).reduce((s, r) => s + (Number(r.value) || 0), 0);
  const pdiRate = pdiTotal ? Math.round((doneClosed / pdiTotal) * 1000) / 10 : 0;

  const backlogTotal = backlog.reduce((s, r) => s + (Number(r.total) || Number(r.completed) + Number(r.inProgress) + Number(r.unstarted) + Number(r.canceled) || 0), 0);
  const backlogCompleted = backlog.reduce((s, r) => s + (Number(r.completed) || 0), 0);
  const backlogRate = backlogTotal ? Math.round((backlogCompleted / backlogTotal) * 1000) / 10 : 0;

  const current = committees.length ? committees[committees.length - 1] : null;

  return [
    {
      value: faNumber(productCount),
      label: 'محصول در پرتفوی',
      note: categoryCount ? `${faDigits(categoryCount)} حوزه اصلی` : 'پرتفوی محصولات',
      source: 'portfolio',
    },
    {
      value: faNumber(pdiTotal),
      label: 'درخواست ثبت‌شده',
      note: 'در PDI',
      source: 'pdi',
    },
    {
      value: `${faDigits(pdiRate)}٪`,
      label: 'تعیین‌تکلیف PDI',
      note: 'Done + Closed',
      source: 'pdi',
    },
    {
      value: `${faDigits(backlogRate)}٪`,
      label: 'تحقق بک‌لاگ',
      note: 'در مجموع اقلام ثبت‌شده',
      source: 'backlog',
    },
    {
      value: faNumber(current?.approvals || 0),
      label: 'مصوبه در دوره جاری',
      note: current ? `${faNumber(current.completed)} اجراشده` : 'کمیته‌ها',
      source: 'committees',
    },
  ];
}

/** Build public or draft presentation payload from DB. */
export async function buildPresentation(db, { draft = false } = {}) {
  const pubFilter = draft
    ? 'is_active = 1'
    : 'is_active = 1 AND is_published = 1';

  const categories = mapRows(
    await db.prepare(`SELECT * FROM portfolio_categories WHERE ${pubFilter} ORDER BY sort_order, id`).all(),
    draft
  );
  const products = mapRows(
    await db.prepare(`SELECT * FROM products WHERE ${pubFilter} ORDER BY sort_order, id`).all(),
    draft
  );

  const contentCardRows = mapRows(
    await db
      .prepare(`SELECT * FROM product_content_cards WHERE ${pubFilter} ORDER BY sort_order ASC, id ASC`)
      .all(),
    draft
  );
  const cardsByProduct = {};
  for (const c of contentCardRows) {
    const pid = c.product_id;
    if (!cardsByProduct[pid]) cardsByProduct[pid] = [];
    cardsByProduct[pid].push({
      id: c.id,
      title: c.title,
      description: c.description || '',
      imageUrl: c.image_url || '',
      icon: c.icon_key || 'Layers',
      color: c.color || '',
    });
  }

  const portfolio = {};
  for (const cat of categories) {
    const catProducts = products.filter((p) => p.category_id === cat.id);
    portfolio[cat.slug] = {
      title: cat.title,
      count: catProducts.length,
      icon: cat.icon_key,
      products: catProducts.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        kpi: p.kpi,
        nature: p.nature,
        description: p.description || '',
        contentCards: cardsByProduct[p.id] || [],
      })),
    };
  }

  const pillarRows = mapRows(
    await db.prepare(`SELECT * FROM outlook_pillars WHERE ${pubFilter} ORDER BY sort_order, id`).all(),
    draft
  );
  const pillars = [];
  for (const pillar of pillarRows) {
    const itemRows = await db
      .prepare(
        `SELECT text FROM outlook_items WHERE pillar_id = ? AND is_active = 1 ORDER BY sort_order, id`
      )
      .all(pillar.id);
    pillars.push({
      id: pillar.id,
      num: pillar.num,
      title: pillar.title,
      icon: pillar.icon_key,
      color: pillar.color,
      items: itemRows.map((r) => r.text),
    });
  }

  const trackRows = mapRows(
    await db.prepare(`SELECT * FROM process_tracks WHERE ${pubFilter} ORDER BY sort_order, id`).all(),
    draft
  );
  const processTracks = [];
  for (const track of trackRows) {
    const steps = await db
      .prepare(
        `SELECT title, description, icon_key AS icon, color FROM process_steps
         WHERE track_id = ? AND is_active = 1 ORDER BY sort_order, id`
      )
      .all(track.id);
    processTracks.push({
      id: track.id,
      num: track.num,
      title: track.title,
      steps,
    });
  }

  const settingsRows = await db.prepare('SELECT key, value FROM app_settings').all();
  const settings = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]));

  const pdiRows = mapRows(
    await db.prepare(`SELECT * FROM pdi_statuses WHERE ${pubFilter} ORDER BY sort_order, id`).all(),
    draft
  );
  const pdi = pdiRows.map((r) => ({ name: r.name, value: Number(r.value) || 0, color: r.color }));

  const committees = mapRows(
    await db.prepare(`SELECT * FROM committee_periods WHERE ${pubFilter} ORDER BY sort_order, id`).all(),
    draft
  ).map((r) => ({
    year: r.year_label,
    hours: r.hours,
    approvals: r.approvals,
    completed: r.completed,
    inProgress: r.in_progress,
    notCompleted: r.not_completed,
  }));

  const backlog = mapRows(
    await db.prepare(`SELECT * FROM backlog_systems WHERE ${pubFilter} ORDER BY sort_order, id`).all(),
    draft
  ).map((r) => ({
    name: r.name,
    completed: r.completed,
    inProgress: r.in_progress,
    unstarted: r.unstarted,
    canceled: r.canceled,
    total: r.total,
    rate: r.rate,
  }));

  const backlogTotal = backlog.reduce(
    (s, r) => s + (Number(r.total) || Number(r.completed) + Number(r.inProgress) + Number(r.unstarted) + Number(r.canceled) || 0),
    0
  );
  const backlogCompleted = backlog.reduce((s, r) => s + (Number(r.completed) || 0), 0);
  const backlogRate = backlogTotal ? Math.round((backlogCompleted / backlogTotal) * 1000) / 10 : 0;

  const strategicImpacts = mapRows(
    await db.prepare(`SELECT * FROM strategic_impacts WHERE ${pubFilter} ORDER BY sort_order, id`).all(),
    draft
  ).map((r) => ({
    id: r.id,
    title: r.title,
    text: r.text,
    icon: r.icon_key,
  }));

  const committeeInsights = mapRows(
    await db.prepare(`SELECT * FROM committee_insights WHERE ${pubFilter} ORDER BY sort_order, id`).all(),
    draft
  ).map((r) => ({
    id: r.id,
    title: r.title,
    text: r.text,
    icon: r.icon_key,
  }));

  const backlogInsightRows = mapRows(
    await db.prepare(`SELECT * FROM backlog_insights WHERE ${pubFilter} ORDER BY sort_order, id`).all(),
    draft
  );
  const backlogInsights = backlogInsightRows.map((r) => {
    const autoText = Number(r.is_auto) === 1 ? buildAutoBacklogText(r.insight_key, backlog) : '';
    return {
      id: r.id,
      insightKey: r.insight_key,
      title: r.title,
      text: Number(r.is_auto) === 1 && autoText ? autoText : r.text,
      icon: r.icon_key,
      tone: r.tone || 'emerald',
      isAuto: Number(r.is_auto) === 1,
    };
  });

  const homeMenu = mapRows(
    await db.prepare(`SELECT * FROM home_menu_items WHERE ${pubFilter} ORDER BY sort_order, id`).all(),
    draft
  ).map((r) => {
    let preview = r.preview || '';
    if (r.preview_source === 'products') preview = `${faNumber(products.length)} محصول`;
    if (r.preview_source === 'pdi') preview = `${faNumber(pdi.reduce((s, i) => s + i.value, 0))} درخواست`;
    if (r.preview_source === 'committees') {
      const cur = committees[committees.length - 1];
      preview = cur ? `${faNumber(cur.approvals)} مصوبه` : preview;
    }
    if (r.preview_source === 'backlog') preview = `${faNumber(backlogTotal)} آیتم`;
    return {
      id: r.view_id,
      dbId: r.id,
      title: r.title,
      desc: r.description,
      preview,
      icon: r.icon_key,
      previewSource: r.preview_source,
    };
  });

  const proposalRows = mapRows(
    await db.prepare(`SELECT * FROM decision_proposals WHERE ${pubFilter} ORDER BY sort_order, id`).all(),
    draft
  );
  const proposal = proposalRows[0]
    ? { title: proposalRows[0].title, text: proposalRows[0].text }
    : {
        title: 'پیشنهاد تصمیم',
        text: settings.attention_suggestion || '',
      };

  const executiveKpis = computeExecutiveKpis({
    productCount: products.length,
    categoryCount: categories.length,
    pdi,
    committees,
    backlog,
  });

  return {
    source: draft ? 'preview' : 'api',
    portfolio,
    pdi,
    committees,
    backlog,
    backlogSummary: {
      total: backlogTotal,
      completed: backlogCompleted,
      rate: backlogRate,
    },
    backlogInsights,
    strategicImpacts,
    committeeInsights,
    initiatives: [],
    executiveKpis,
    executiveFocus: mapRows(
      await db.prepare(`SELECT * FROM executive_focus WHERE ${pubFilter} ORDER BY sort_order, id`).all(),
      draft
    ).map((r) => ({ title: r.title, text: r.text, action: r.action || '' })),
    attention: mapRows(
      await db.prepare(`SELECT * FROM attention_items WHERE ${pubFilter} ORDER BY sort_order, id`).all(),
      draft
    ).map((r) => ({ title: r.title, text: r.text, level: r.level })),
    attentionSuggestion: proposal.text,
    attentionSuggestionTitle: proposal.title,
    decisions: [],
    outlookPillars: pillars,
    processTracks,
    settings,
    menuItems: homeMenu,
  };
}

export function enhancedCrudRouter() {
  return {};
}

export { writeAudit, rowLabel };
