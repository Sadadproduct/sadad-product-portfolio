/**
 * Canonical seed data extracted from the Public presentation.
 * Icons are string keys resolved via iconRegistry on the client.
 * DO NOT delete — used as seed source and public fallback.
 */

export const COLORS = {
  navy: '#002B5C',
  darkBlue: '#003B73',
  primaryBlue: '#0057A8',
  secondaryBlue: '#007C91',
  yellow: '#F5B400',
  lightYellow: '#FFE3A0',
  bg: '#F5F7FA',
  textMain: '#1A202C',
  textMuted: '#718096',
  white: '#FFFFFF',
  status: {
    live: '#10B981',
    analysis: '#F59E0B',
    develop: '#3B82F6',
    preOp: '#8B5CF6',
  },
};

export const MAIN_MENU_ITEMS = [
  { id: 'executive', title: 'خلاصه مدیریتی', desc: 'تصویر فشرده‌ای از وضعیت، عملکرد و تمرکزهای کلیدی', icon: 'Gauge', preview: 'نمای یک‌صفحه‌ای مدیرعامل' },
  { id: 'portfolio', title: 'پرتفوی محصولات', desc: 'سبد محصولات و تفکیک محصولات کلیدی، نوآورانه و توانمندساز', icon: 'Layers', preview: '۳۵ محصول' },
  { id: 'pdi', title: 'تقاضا و PDI', desc: 'حجم تقاضا، وضعیت رسیدگی و نقاط تمرکز', icon: 'Inbox', preview: '۲٬۲۹۹ درخواست' },
  { id: 'committees', title: 'حاکمیت و تصمیمات محصول', desc: 'تصمیمات، میزان اجرا و اثربخشی مصوبات', icon: 'Users', preview: '۷۲ مصوبه' },
  { id: 'backlog', title: 'تحویل و ظرفیت اجرا', desc: 'بک‌لاگ، نرخ تحقق و نقاط نیازمند توجه', icon: 'ListTodo', preview: '۱٬۴۱۷ آیتم' },
  { id: 'process', title: 'حاکمیت چرخه محصول', desc: 'از فرصت و ایده تا تحقق ارزش کسب‌وکار', icon: 'GitBranch', preview: 'Value Delivery' },
  { id: 'attention', title: 'موارد نیازمند تصمیم', desc: 'موضوعاتی که برای تسریع مسیر نیازمند توجه مدیریت هستند', icon: 'AlertTriangle', preview: '۳ محور مدیریتی' },
  { id: 'outlook', title: 'چشم‌انداز و جهت‌گیری', desc: 'تمرکز مدیریت محصول در افق پیش‌رو', icon: 'Target', preview: '۳ محور استراتژیک' },
];

/** Kept for page routing / Business Impact CTA — not shown on Home. */
export const HIDDEN_MENU_ITEMS = [
  { id: 'initiatives', title: 'دستورکار راهبردی ۱۴۰۵–۱۴۰۶', desc: 'مهم‌ترین اقدامات و Business Lineهای آینده', icon: 'Rocket', preview: '۶ اقدام کلیدی' },
  { id: 'decisions', title: '۳ تصمیم مورد انتظار', desc: 'تصمیم‌های کلیدی برای افزایش تمرکز، سرعت اجرا و تحقق ارزش', icon: 'CheckCircle', preview: '۳ تصمیم مدیریتی' },
];

export const PORTFOLIO_SEED = {
  payment: {
    title: 'محصولات پرداخت',
    icon: 'CreditCard',
    sort_order: 1,
    products: [
      { name: 'POS', status: 'Live', kpi: 'نرخ موفقیت پردازش تراکنش‌ها', nature: 'محصول کلیدی' },
      { name: 'IPG', status: 'Live', kpi: 'نرخ موفقیت پردازش تراکنش‌ها', nature: 'محصول کلیدی' },
      { name: 'Switch', status: 'Live', kpi: 'نرخ موفقیت پردازش تراکنش‌ها', nature: 'محصول کلیدی' },
      { name: 'Currency', status: 'Live', kpi: 'نرخ موفقیت پردازش تراکنش‌ها', nature: 'محصول نوآورانه' },
      { name: 'Close Loop Switch', status: 'Live', kpi: 'نرخ موفقیت پردازش تراکنش‌ها', nature: 'محصول عملیاتی' },
      { name: 'Poplay', status: 'Pre Operation', kpi: 'نرخ موفقیت پردازش تراکنش‌ها', nature: 'محصول نوآورانه' },
    ],
  },
  digital: {
    title: 'محصولات دیجیتال و اعتباری',
    icon: 'Smartphone',
    sort_order: 2,
    products: [
      { name: 'IVA', status: 'Live', kpi: 'کاربر فعال ماهانه', nature: 'محصول استراتژیک' },
      { name: 'Iva Pay', status: 'In Analysis', kpi: 'نرخ درآمد به ازای هر کاربر', nature: 'محصول نوآورانه' },
      { name: 'Pulse', status: 'In Develop', kpi: 'کاربر فعال ماهانه', nature: 'محصول استراتژیک' },
      { name: 'My Station', status: 'Live', kpi: 'کاربر فعال ماهانه', nature: 'محصول استراتژیک' },
      { name: 'Wallet', status: 'Live', kpi: 'کاربر فعال ماهانه', nature: 'محصول استراتژیک' },
      { name: 'Digital Rial', status: 'Live', kpi: 'نرخ موفقیت پردازش تراکنش‌ها', nature: 'محصول نوآورانه' },
      { name: 'Melli Wallet', status: 'Live', kpi: 'نرخ موفقیت پردازش تراکنش‌ها', nature: 'محصول نوآورانه' },
      { name: 'BNPL', status: 'Live', kpi: 'نرخ موفقیت پردازش تراکنش‌ها', nature: 'محصول نوآورانه' },
      { name: 'Credit Payment', status: 'Live', kpi: 'نرخ موفقیت پردازش تراکنش‌ها', nature: 'محصول نوآورانه' },
      { name: 'Kahroba', status: 'Live', kpi: 'نرخ موفقیت پردازش تراکنش‌ها', nature: 'محصول نوآورانه' },
      { name: 'Mirshetab', status: 'Live', kpi: 'نرخ موفقیت پردازش تراکنش‌ها', nature: 'محصول نوآورانه' },
      { name: 'Overdraft', status: 'In Analysis', kpi: 'نرخ درآمد به ازای هر کاربر', nature: 'محصول نوآورانه' },
      { name: 'In App Payment', status: 'In Develop', kpi: 'نرخ موفقیت پردازش تراکنش‌ها', nature: 'محصول نوآورانه' },
    ],
  },
  acceptance: {
    title: 'محصولات پذیرندگی',
    icon: 'Monitor',
    sort_order: 3,
    products: [
      { name: 'Shahin DMS', status: 'Live', kpi: 'نرخ تأمین نیازهای گزارش‌دهی', nature: 'محصول استراتژیک' },
      { name: 'MMP', status: 'Live', kpi: 'نرخ تبدیل متقاضی به پذیرنده', nature: 'محصول توانمندساز' },
      { name: 'Mportal', status: 'Live', kpi: 'نرخ موفقیت درخواست‌های شاپرکی', nature: 'محصول توانمندساز' },
      { name: 'PSM', status: 'Live', kpi: 'نرخ خطاهای کاربری', nature: 'محصول توانمندساز' },
      { name: 'TMS', status: 'Live', kpi: 'نرخ موفقیت استقرار نسخه هدف', nature: 'محصول عملیاتی' },
      { name: 'My Sadad', status: 'In Analysis', kpi: 'نرخ رضایت کاربران', nature: 'محصول توانمندساز' },
    ],
  },
  valueAdded: {
    title: 'سرویس‌ها و محصولات ارزش افزوده',
    icon: 'Briefcase',
    sort_order: 4,
    products: [
      { name: 'Customer Gateway', status: 'Live', kpi: 'نرخ پاسخگویی موفق به درخواست‌ها', nature: 'محصول عملیاتی' },
      { name: 'Sadad Naji', status: 'Live', kpi: 'نرخ پاسخگویی موفق به درخواست‌ها', nature: 'محصول عملیاتی' },
      { name: 'User Account', status: 'Live', kpi: 'نرخ پاسخگویی موفق به درخواست‌ها', nature: 'محصول عملیاتی' },
      { name: 'Notification', status: 'Live', kpi: 'نرخ پاسخگویی موفق به درخواست‌ها', nature: 'محصول عملیاتی' },
      { name: 'Post Inquiry', status: 'Live', kpi: 'نرخ پاسخگویی موفق به درخواست‌ها', nature: 'محصول عملیاتی' },
      { name: 'Shaparak Inquiry', status: 'Live', kpi: 'نرخ پاسخگویی موفق به درخواست‌ها', nature: 'محصول عملیاتی' },
      { name: 'Fuel Services', status: 'Live', kpi: 'نرخ پاسخگویی موفق به درخواست‌ها', nature: 'محصول عملیاتی' },
      { name: 'Charge & Bill', status: 'Live', kpi: 'نرخ موفقیت پردازش تراکنش‌ها', nature: 'محصول عملیاتی' },
      { name: 'Charge Switch', status: 'In Develop', kpi: 'نرخ موفقیت پردازش تراکنش‌ها', nature: 'محصول استراتژیک' },
      { name: 'Refund', status: 'Live', kpi: 'نرخ موفقیت پردازش تراکنش‌ها', nature: 'محصول عملیاتی' },
    ],
  },
};

export const PDI_SEED = [
  { name: 'انجام شده (Done)', value: 1068, color: '#10B981' },
  { name: 'بسته شده (Closed)', value: 461, color: '#34D399' },
  { name: 'در حال انجام (In Progress)', value: 409, color: '#3B82F6' },
  { name: 'لغو شده (Canceled)', value: 107, color: '#EF4444' },
  { name: 'مرحله (Stage)', value: 101, color: '#F59E0B' },
  { name: 'در انتظار مشتری', value: 61, color: '#8B5CF6' },
  { name: 'محصول (Product)', value: 22, color: '#6366F1' },
  { name: 'باز (Open)', value: 20, color: '#EC4899' },
  { name: 'رد شده (Rejected)', value: 16, color: '#9CA3AF' },
  { name: 'سایر موارد', value: 5, color: '#D1D5DB' },
  { name: 'نامشخص / بدون دسته‌بندی', value: 29, color: '#E5E7EB' },
];

export const COMMITTEES_SEED = [
  { year: '۱۴۰۳', hours: 1892, approvals: 415, completed: 314, inProgress: 50, notCompleted: 41 },
  { year: '۱۴۰۴', hours: 720, approvals: 247, completed: 195, inProgress: 36, notCompleted: 16 },
  { year: '۶ ماهه اول ۱۴۰۵', hours: 280, approvals: 72, completed: 27, inProgress: 29, notCompleted: 16 },
];

export const BACKLOG_SEED = [
  { name: 'Database', completed: 195, inProgress: 40, unstarted: 44, canceled: 45, total: 324, rate: '60.2%' },
  { name: 'POS', completed: 153, inProgress: 57, unstarted: 62, canceled: 11, total: 283, rate: '54.1%' },
  { name: 'Portal', completed: 106, inProgress: 49, unstarted: 21, canceled: 19, total: 195, rate: '54.4%' },
  { name: 'MMP', completed: 100, inProgress: 40, unstarted: 14, canceled: 32, total: 186, rate: '53.8%' },
  { name: 'PSM SAMBAD', completed: 86, inProgress: 74, unstarted: 2, canceled: 9, total: 171, rate: '50.3%' },
  { name: 'Services', completed: 67, inProgress: 28, unstarted: 1, canceled: 8, total: 104, rate: '64.4%' },
  { name: 'PSM', completed: 43, inProgress: 15, unstarted: 17, canceled: 5, total: 80, rate: '53.8%' },
  { name: 'Shahin DMS', completed: 6, inProgress: 40, unstarted: 7, canceled: 0, total: 53, rate: '11.3%' },
  { name: 'Shaparak WS', completed: 10, inProgress: 4, unstarted: 0, canceled: 7, total: 21, rate: '47.6%' },
];

export const INITIATIVES_SEED = [
  { id: 1, title: 'یکپارچه‌سازی سامانه‌های بک‌آفیس', desc: 'در قالب پلتفرم جامع «سداد من»', category: 'Platform & Infrastructure', icon: 'Database' },
  { id: 2, title: 'عملیاتی‌سازی پروژه «پل پی»', desc: 'توسعه زیرساخت پرداخت‌های نوین', category: 'New Business Lines', icon: 'CreditCard' },
  { id: 3, title: 'انتشار نسخه جدید «پالس»', desc: 'ارتقاء تجربه کاربری و افزودن قابلیت‌های پیشرفته', category: 'Digital Transformation', icon: 'Smartphone' },
  { id: 4, title: 'ایجاد بیزنس‌لاین «تسهیلات روزانه»', desc: 'توسعه محصولات اعتباری خرد و سریع', category: 'New Business Lines', icon: 'TrendingUp' },
  { id: 5, title: 'راه‌اندازی لاین جدید KYC', desc: 'احراز هویت دیجیتال یکپارچه و هوشمند', category: 'Platform & Infrastructure', icon: 'Users' },
  { id: 6, title: 'عملیاتی‌سازی «سوییچ شارژ»', desc: 'با قابلیت تبدیل شدن به ارائه‌دهنده سرویس', category: 'Platform & Infrastructure', icon: 'Server' },
];

export const EXECUTIVE_KPIS_SEED = [
  { value: '۳۵', label: 'محصول در پرتفوی', note: 'چهار حوزه اصلی', sort_order: 1 },
  { value: '۲٬۲۹۹', label: 'درخواست ثبت‌شده', note: 'در PDI', sort_order: 2 },
  { value: '۶۶.۶٪', label: 'تعیین‌تکلیف PDI', note: 'Done + Closed', sort_order: 3 },
  { value: '۵۴.۱٪', label: 'تحقق بک‌لاگ', note: 'در مجموع اقلام ثبت‌شده', sort_order: 4 },
  { value: '۷۲', label: 'مصوبه در ۶ماهه اول ۱۴۰۵', note: '۲۷ اجراشده', sort_order: 5 },
];

export const EXECUTIVE_FOCUS_SEED = [
  { title: 'رشد', text: 'توسعه Business Lineهای جدید و محصولات اعتباری/پرداختی', action: '', sort_order: 1 },
  { title: 'یکپارچگی', text: 'کاهش پراکندگی سامانه‌ها و حرکت به سمت تجربه یکپارچه سداد', action: '', sort_order: 2 },
  { title: 'تحقق ارزش', text: 'اتصال تصمیم محصول به KPI، اولویت و نتیجه کسب‌وکار', action: '', sort_order: 3 },
];

export const ATTENTION_SEED = [
  { title: 'ظرفیت در برابر تقاضا', text: '۲٬۲۹۹ درخواست در PDI و ۱٬۴۱۷ آیتم در بک‌لاگ نشان می‌دهد اولویت‌بندی و ظرفیت‌گذاری باید بخشی از تصمیم‌گیری مدیریتی باشد.', level: 'نیازمند توجه', sort_order: 1 },
  { title: 'تمرکز روی گلوگاه‌های تحویل', text: 'نبود ظرفیت اختصاص‌یافته و قابل‌اندازه‌گیری برای تحویل هر محصول، محدودیت ظرفیت موجود، امکان ظرفیت‌سنجی و برنامه‌ریزی دقیق به تفکیک محصول را محدود کرده و در نتیجه قابلیت پیش‌بینی زمان و تعهد تحویل کاهش یافته است.', level: 'اولویت بالا', sort_order: 2 },
  { title: 'اثربخشی تصمیمات', text: 'ایجاد سازوکار تصمیم‌گیری سریع، شفاف و داده‌محور با مالکیت مشخص، اولویت‌بندی مبتنی بر ارزش کسب‌وکار و سنجش اثربخشی تصمیمات بر اساس خروجی واقعی.', level: 'نیازمند پیگیری', sort_order: 3 },
];

export const STRATEGIC_IMPACT_CARDS = [
  { title: 'درآمد', text: 'ایجاد جریان‌های درآمدی جدید از اعتبار، BNPL و خدمات ارزش‌افزوده' },
  { title: 'رشد', text: 'افزایش ارزش سبد خدمات سداد برای پذیرندگان و توسعه بازارهای جدید' },
  { title: 'بهره‌وری', text: 'کاهش توسعه‌های موازی و ایجاد زیرساخت‌های قابل استفاده مجدد' },
  { title: 'آینده کسب‌وکار', text: 'ایجاد بستر حرکت از Payment Provider به Financial & Business Platform' },
];

export const ATTENTION_SUGGESTION =
  'تمرکز ظرفیت توسعه بر اولویت‌های دارای ارزش کسب‌وکار، تعریف SLA برای تقاضا و ایجاد مسیر مشخص برای رفع وابستگی‌های بین‌واحدی.';

export const DECISIONS_SEED = [
  {
    no: '01',
    title: 'اولویت‌بندی ظرفیت توسعه',
    question: 'آیا ظرفیت توسعه بر اساس ارزش کسب‌وکار و اولویت‌های راهبردی تخصیص یابد؟',
    evidence: '۲٬۲۹۹ درخواست PDI در کنار ۱٬۴۱۷ آیتم بک‌لاگ، ضرورت یک سازوکار شفاف برای انتخاب و توقف/تعویق تقاضاها را نشان می‌دهد.',
    outcome: 'تمرکز منابع روی تعداد محدودی از اولویت‌های باارزش و کاهش پراکندگی ظرفیت.',
    sort_order: 1,
  },
  {
    no: '02',
    title: 'رفع گلوگاه‌های تحویل',
    question: 'آیا برای گلوگاه‌های مزمن، مالک و مسیر رفع وابستگی در سطح مدیریت تعیین شود؟',
    evidence: 'نرخ تحقق Shahin DMS در داده فعلی ۱۱.۳٪ است و نیاز به بررسی علت تأخیر و وابستگی‌های آن دارد.',
    outcome: 'افزایش قابلیت پیش‌بینی تحویل و جلوگیری از انباشت آیتم‌های کم‌تحقق.',
    sort_order: 2,
  },
  {
    no: '03',
    title: 'اتصال مصوبه به نتیجه',
    question: 'آیا اجرای مصوبات محصول تا تحقق خروجی، به‌صورت دوره‌ای در سطح مدیریت پایش شود؟',
    evidence: 'در ۶ ماهه ۱۴۰۵، از ۷۲ مصوبه/تأییدیه، ۲۷ مورد تکمیل شده، ۲۹ مورد در حال انجام و ۱۶ مورد تکمیل نشده است.',
    outcome: 'عبور از «تصمیم‌گیری» به «تحقق تصمیم» و افزایش اثربخشی حاکمیت محصول.',
    sort_order: 3,
  },
];

export const OUTLOOK_PILLARS_SEED = [
  {
    num: '۱',
    title: 'تحول دیجیتال؛ از سرویس‌های منفرد به تجربه یکپارچه',
    icon: 'Layers',
    color: 'from-[#0057A8] to-[#002B5C]',
    sort_order: 1,
    items: [
      'بازطراحی محصولات بر مبنای Digital First و تجربه یکپارچه مشتری و پذیرنده',
      'ایجاد اکوسیستم یکپارچه از درگاه، پایانه، اپلیکیشن، خدمات پذیرندگی و سرویس‌های مالی',
      'استفاده از داده و هوش مصنوعی برای شخصی‌سازی خدمات، پیش‌بینی رفتار و تصمیم‌گیری هوشمند',
      'حرکت از توسعه پروژه‌محور به Product-Led Development و مدیریت چرخه عمر محصولات',
    ],
  },
  {
    num: '۲',
    title: 'اعتبارات؛ تبدیل ظرفیت پرداخت به موتور رشد',
    icon: 'CreditCard',
    color: 'from-[#F5B400] to-[#D49400]',
    sort_order: 2,
    items: [
      'توسعه زیرساخت Credit as a Service برای ارائه خدمات اعتباری به مشتریان و پذیرندگان',
      'توسعه BNPL، اعتبار در نقطه فروش و تسهیلات مبتنی بر جریان تراکنش',
      'استفاده از داده‌های تراکنشی برای اعتبارسنجی، تعیین سقف اعتبار و مدیریت ریسک',
      'ایجاد قابلیت ارائه و مدیریت محصولات اعتباری از طریق یک هسته اعتباری یکپارچه',
    ],
  },
  {
    num: '۳',
    title: 'توسعه Business Lineهای جدید',
    icon: 'TrendingUp',
    color: 'from-[#00A88D] to-[#00786B]',
    sort_order: 3,
    items: [
      'خدمات اعتباری و تأمین مالی',
      'خدمات ارزش‌افزوده پذیرندگان',
      'Embedded Finance، Payment & Financial APIs',
      'خدمات داده و تحلیل کسب‌وکار، راهکارهای اختصاصی کسب‌وکارهای بزرگ و زنجیره‌ای، مدل‌های B2B2C و پلتفرمی',
    ],
  },
  {
    num: '۴',
    title: 'تبدیل پذیرنده از «نقطه تراکنش» به «مشتری کسب‌وکار»',
    icon: 'Users',
    color: 'from-[#8B5CF6] to-[#6D28D9]',
    sort_order: 4,
    items: [
      'عبور از نگاه صرفاً پذیرندگی و تبدیل سداد به شریک رشد کسب‌وکارها',
      'ارائه مجموعه‌ای یکپارچه از خدمات: پرداخت، اعتبار، تسویه، مدیریت مالی',
      'تحلیل فروش و خدمات ارزش‌افزوده در یک اکوسیستم یکپارچه',
    ],
  },
  {
    num: '۵',
    title: 'ساخت سبد محصول متوازن و درآمدزا',
    icon: 'BarChart3',
    color: 'from-[#EF4444] to-[#B91C1C]',
    sort_order: 5,
    items: [
      'تصمیم‌گیری محصول بر سه محور: Customer Value × Business Value × Technology Feasibility',
      'حل مسئله واقعی مشتری با مزیت رقابتی قابل دفاع',
      'قابلیت مقیاس‌پذیری و ایجاد درآمد پایدار برای سداد',
    ],
  },
];

export const APP_SETTINGS_SEED = {
  cover_title: 'نمای کلی عملکرد و چشم‌انداز مدیریت محصول',
  cover_subtitle: 'نمایی یکپارچه از پرتفوی محصولات، عملکرد و مسیر پیش‌رو',
  cover_kicker: 'SADAD • PRODUCT MANAGEMENT',
  menu_heading: 'داشبورد مدیریتی معاونت نوآوری و توسعه محصول',
  menu_subtitle: 'لطفاً برای مشاهده جزئیات، بخش مورد نظر را انتخاب کنید',
  attention_suggestion: ATTENTION_SUGGESTION,
  outlook_vision_title: 'حرکت از «پرداخت» به «پلتفرم خدمات مالی و کسب‌وکار»',
  outlook_vision_body:
    'تبدیل سداد از یک ارائه‌دهنده زیرساخت‌های پرداخت به یک پلتفرم یکپارچه، داده‌محور و نوآور در خدمات مالی و کسب‌وکار؛ پلتفرمی که با تکیه بر زیرساخت پرداخت، اعتبار، داده و فناوری، بتواند نیازهای مشتریان و کسب‌وکارها را از مرحله پذیرش و پرداخت تا تأمین مالی و خدمات ارزش‌افزوده پوشش دهد.',
  pdi_total: 2299,
};

/** Process flowchart tracks (Public ProcessSection) */
export const PROCESS_SEED = [
  {
    num: '۱',
    title: 'توسعه محصول جدید',
    sort_order: 1,
    steps: [
      { title: 'کشف و تحلیل', description: 'نیازسنجی و راهکار', icon: 'Search', color: 'blue' },
      { title: 'شفاف‌سازی و PRD', description: 'مستندات و تیم فنی', icon: 'Settings', color: 'navy' },
      { title: 'توسعه و تست', description: 'پیاده‌سازی و ارزیابی', icon: 'GitBranch', color: 'indigo' },
      { title: 'عملیاتی‌سازی', description: 'ارائه به مشتری و رشد', icon: 'Rocket', color: 'emerald' },
    ],
  },
  {
    num: '۲',
    title: 'بهبود و توسعه ویژگی‌ها',
    sort_order: 2,
    steps: [
      { title: 'بازخورد و آنالیز', description: 'طرح بهبود محصول', icon: 'Activity', color: 'amber' },
      { title: 'جلسه فنی و Jira', description: 'ثبت درخواست توسعه', icon: 'Users', color: 'navy' },
      { title: 'تست محیط عملیاتی', description: 'بررسی کامل ویژگی', icon: 'CheckCircle', color: 'indigo' },
      { title: 'انتشار و اطلاع‌رسانی', description: 'ارائه به ذینفعان', icon: 'Smartphone', color: 'emerald' },
    ],
  },
  {
    num: '۳',
    title: 'رفع باگ (Bug Fix)',
    sort_order: 3,
    steps: [
      { title: 'تشخیص و گزارش', description: 'شفاف‌سازی باگ', icon: 'XCircle', color: 'red' },
      { title: 'ثبت و ارجاع', description: 'درخواست رفع مشکل', icon: 'ListTodo', color: 'navy' },
      { title: 'رفع فنی / عملیاتی', description: 'توسعه یا تنظیمات', icon: 'Settings', color: 'indigo' },
      { title: 'نصب و اطلاع‌رسانی', description: 'تاییدیه نهایی', icon: 'CheckCircle', color: 'emerald' },
    ],
  },
];

/** Expected validation fingerprints after migration */
export const VALIDATION = {
  productCount: 35,
  categoryCount: 4,
  pdiSum: 2299,
  pdiRows: 11,
  committeePeriods: 3,
  backlogSystems: 9,
  backlogTotalItems: 1417,
  initiatives: 6,
  attentionItems: 3,
  decisions: 3,
  outlookPillars: 5,
};
