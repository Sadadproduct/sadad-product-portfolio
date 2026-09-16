import {
  PORTFOLIO_SEED,
  PDI_SEED,
  COMMITTEES_SEED,
  BACKLOG_SEED,
  EXECUTIVE_FOCUS_SEED,
  ATTENTION_SEED,
  OUTLOOK_PILLARS_SEED,
  PROCESS_SEED,
  APP_SETTINGS_SEED,
  MAIN_MENU_ITEMS,
  STRATEGIC_IMPACT_CARDS,
  ATTENTION_SUGGESTION,
} from './hardcoded.js';
import { resolveIcon } from './iconRegistry.js';

function mapMenuItems(items) {
  return (items || []).map((m) => ({
    ...m,
    id: m.id || m.view_id,
    desc: m.desc || m.description || '',
    icon: resolveIcon(m.icon || m.icon_key),
  }));
}

function mapProcessTracks(tracks) {
  return (tracks || []).map((t) => ({
    id: t.id,
    num: t.num,
    title: t.title,
    steps: (t.steps || []).map((s) => ({
      title: s.title,
      description: s.description || s.desc || '',
      icon: resolveIcon(s.icon || s.icon_key),
      color: s.color || 'navy',
    })),
  }));
}

function faDigits(n) {
  return String(n).replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d]);
}

function computeFallbackKpis() {
  const pdiTotal = PDI_SEED.reduce((s, r) => s + r.value, 0);
  const done = PDI_SEED.filter((r) => /\bdone\b|\bclosed\b/i.test(r.name) || /انجام شده|بسته شده/.test(r.name)).reduce((s, r) => s + r.value, 0);
  const productCount = Object.values(PORTFOLIO_SEED).reduce((s, c) => s + c.products.length, 0);
  const backlogTotal = BACKLOG_SEED.reduce((s, r) => s + r.total, 0);
  const backlogCompleted = BACKLOG_SEED.reduce((s, r) => s + r.completed, 0);
  const current = COMMITTEES_SEED[COMMITTEES_SEED.length - 1];
  return [
    { value: faDigits(productCount), label: 'محصول در پرتفوی', note: 'چهار حوزه اصلی', source: 'portfolio' },
    { value: faDigits(pdiTotal.toLocaleString('en-US')).replace(/,/g, '٬'), label: 'درخواست ثبت‌شده', note: 'در PDI', source: 'pdi' },
    { value: `${faDigits(Math.round((done / pdiTotal) * 1000) / 10)}٪`, label: 'تعیین‌تکلیف PDI', note: 'Done + Closed', source: 'pdi' },
    {
      value: `${faDigits(Math.round((backlogCompleted / backlogTotal) * 1000) / 10)}٪`,
      label: 'تحقق بک‌لاگ',
      note: 'در مجموع اقلام ثبت‌شده',
      source: 'backlog',
    },
    {
      value: faDigits(current.approvals),
      label: 'مصوبه در دوره جاری',
      note: `${faDigits(current.completed)} اجراشده`,
      source: 'committees',
    },
  ];
}

export function buildFallbackPresentation() {
  const portfolio = {};
  for (const [slug, cat] of Object.entries(PORTFOLIO_SEED)) {
    portfolio[slug] = {
      title: cat.title,
      count: cat.products.length,
      icon: resolveIcon(cat.icon),
      products: cat.products.map((p) => ({ ...p })),
    };
  }

  const backlog = BACKLOG_SEED.map((r) => ({ ...r }));
  const backlogTotal = backlog.reduce((s, r) => s + r.total, 0);
  const backlogCompleted = backlog.reduce((s, r) => s + r.completed, 0);

  return {
    source: 'fallback',
    portfolio,
    pdi: PDI_SEED.map((r) => ({ ...r })),
    committees: COMMITTEES_SEED.map((r) => ({ ...r })),
    backlog,
    backlogSummary: {
      total: backlogTotal,
      completed: backlogCompleted,
      rate: Math.round((backlogCompleted / backlogTotal) * 1000) / 10,
    },
    backlogInsights: [
      {
        title: 'بالاترین نرخ تکمیل',
        text: 'سامانه Services با ۶۴.۴٪ نرخ تکمیل، بهترین عملکرد را در اتمام وظایف داشته است.',
        icon: 'CheckCircle',
        tone: 'emerald',
      },
      {
        title: 'بیشترین حجم کار فعال',
        text: 'سامانه PSM SAMBAD با ۷۴ تسک در حال انجام، بیشترین حجم عملیاتی فعلی را دارد.',
        icon: 'AlertTriangle',
        tone: 'amber',
      },
      {
        title: 'نیازمند توجه (Shahin DMS)',
        text: 'نرخ تکمیل تنها ۱۱.۳٪ است و بخش عمده وظایف (۴۰ مورد) در وضعیت در حال انجام انباشته شده‌اند.',
        icon: 'Activity',
        tone: 'red',
      },
    ],
    strategicImpacts: STRATEGIC_IMPACT_CARDS.map((c, i) => ({
      id: i + 1,
      title: c.title,
      text: c.text,
      icon: ['TrendingUp', 'Rocket', 'Settings', 'Target'][i] || 'TrendingUp',
    })),
    committeeInsights: [
      {
        title: 'تمرکز حاکمیت محصول',
        text: 'اثربخشی کمیته‌ها را باید از «تعداد مصوبه» به «تحقق خروجی» منتقل کرد؛ با پایش دوره‌ای مصوبات باز، تعیین مالک اجرا و بستن حلقه تصمیم تا نتیجه کسب‌وکار.',
        icon: 'Target',
      },
      {
        title: 'نفرساعت',
        text: 'مجموع نفرساعت بر اساس میانگین ۲۰ نفر حضور در هر جلسه محاسبه شده است.',
        icon: 'Clock',
      },
    ],
    initiatives: [],
    executiveKpis: computeFallbackKpis(),
    executiveFocus: EXECUTIVE_FOCUS_SEED.map((r) => ({ title: r.title, text: r.text, action: r.action })),
    attention: ATTENTION_SEED.map((r) => ({ title: r.title, text: r.text, level: r.level })),
    attentionSuggestion: ATTENTION_SUGGESTION,
    attentionSuggestionTitle: 'پیشنهاد تصمیم',
    decisions: [],
    outlookPillars: OUTLOOK_PILLARS_SEED.map((p) => ({
      num: p.num,
      title: p.title,
      icon: resolveIcon(p.icon),
      color: p.color,
      items: [...p.items],
    })),
    processTracks: mapProcessTracks(PROCESS_SEED),
    settings: { ...APP_SETTINGS_SEED },
    menuItems: mapMenuItems(MAIN_MENU_ITEMS),
    allMenuItems: mapMenuItems(MAIN_MENU_ITEMS),
  };
}

export function mapApiPresentation(api) {
  const portfolio = {};
  for (const [slug, cat] of Object.entries(api.portfolio || {})) {
    portfolio[slug] = {
      title: cat.title,
      count: cat.count ?? (cat.products?.length || 0),
      icon: resolveIcon(cat.icon),
      products: (cat.products || []).map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status,
        kpi: p.kpi,
        nature: p.nature,
        description: p.description || '',
      })),
    };
  }

  return {
    source: 'api',
    portfolio,
    pdi: api.pdi || [],
    committees: api.committees || [],
    backlog: api.backlog || [],
    backlogSummary: api.backlogSummary || { total: 0, completed: 0, rate: 0 },
    backlogInsights: (api.backlogInsights || []).map((r) => ({
      ...r,
      icon: resolveIcon(r.icon),
    })),
    strategicImpacts: (api.strategicImpacts || []).map((r) => ({
      id: r.id,
      title: r.title,
      text: r.text,
      icon: resolveIcon(r.icon),
    })),
    committeeInsights: (api.committeeInsights || []).map((r) => ({
      id: r.id,
      title: r.title,
      text: r.text,
      icon: resolveIcon(r.icon),
    })),
    initiatives: [],
    executiveKpis: api.executiveKpis || [],
    executiveFocus: api.executiveFocus || [],
    attention: api.attention || [],
    attentionSuggestion: api.attentionSuggestion || api.settings?.attention_suggestion || ATTENTION_SUGGESTION,
    attentionSuggestionTitle: api.attentionSuggestionTitle || 'پیشنهاد تصمیم',
    decisions: [],
    outlookPillars: (api.outlookPillars || []).map((p) => ({
      num: p.num,
      title: p.title,
      icon: resolveIcon(p.icon),
      color: p.color,
      items: p.items || [],
    })),
    processTracks: mapProcessTracks(api.processTracks),
    settings: api.settings || {},
    menuItems: mapMenuItems(api.menuItems?.length ? api.menuItems : MAIN_MENU_ITEMS),
    allMenuItems: mapMenuItems(api.menuItems?.length ? api.menuItems : MAIN_MENU_ITEMS),
  };
}
