import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronRight,
  Home,
  Menu as MenuIcon,
  ArrowRight,
  Layers,
  Inbox,
  Users,
  ListTodo,
  Rocket,
  GitBranch,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Briefcase,
  Monitor,
  Smartphone,
  CreditCard,
  Settings,
  Database,
  Server,
  ChevronLeft,
  Target,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Gauge,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

// --- DATA DEFINITIONS ---

const COLORS = {
  navy: "#002B5C",
  darkBlue: "#003B73",
  primaryBlue: "#0057A8",
  secondaryBlue: "#007C91",
  yellow: "#F5B400",
  lightYellow: "#FFE3A0",
  bg: "#F5F7FA",
  textMain: "#1A202C",
  textMuted: "#718096",
  white: "#FFFFFF",
  status: {
    live: "#10B981", // Green
    analysis: "#F59E0B", // Orange/Yellow
    develop: "#3B82F6", // Blue
    preOp: "#8B5CF6", // Purple
  },
};

const MAIN_MENU_ITEMS = [
  {
    id: "executive",
    title: "خلاصه مدیریتی",
    desc: "تصویر فشرده‌ای از وضعیت، عملکرد و تمرکزهای کلیدی",
    icon: Gauge,
    preview: "نمای یک‌صفحه‌ای مدیرعامل",
  },
  {
    id: "portfolio",
    title: "پرتفوی محصولات",
    desc: "سبد محصولات و تفکیک محصولات کلیدی، نوآورانه و توانمندساز",
    icon: Layers,
    preview: "۳۵ محصول",
  },
  {
    id: "pdi",
    title: "تقاضا و PDI",
    desc: "حجم تقاضا، وضعیت رسیدگی و نقاط تمرکز",
    icon: Inbox,
    preview: "۲٬۷۲۲ درخواست",
  },
  {
    id: "committees",
    title: "حاکمیت و تصمیمات محصول",
    desc: "تصمیمات، میزان اجرا و اثربخشی مصوبات",
    icon: Users,
    preview: "۷۲ مصوبه",
  },
  {
    id: "backlog",
    title: "تحویل و ظرفیت اجرا",
    desc: "بک‌لاگ، نرخ تحقق و نقاط نیازمند توجه",
    icon: ListTodo,
    preview: "۱٬۴۱۷ آیتم",
  },
  {
    id: "process",
    title: "حاکمیت چرخه محصول",
    desc: "از فرصت و ایده تا تحقق ارزش کسب‌وکار",
    icon: GitBranch,
    preview: "Value Delivery",
  },
  {
    id: "attention",
    title: "موارد نیازمند تصمیم",
    desc: "موضوعاتی که برای تسریع مسیر نیازمند توجه مدیریت هستند",
    icon: AlertTriangle,
    preview: "۳ محور مدیریتی",
  },
  // {
  //   id: "decisions",
  //   title: "۳ تصمیم مورد انتظار",
  //   desc: "تصمیم‌های کلیدی برای افزایش تمرکز، سرعت اجرا و تحقق ارزش",
  //   icon: CheckCircle,
  //   preview: "۳ تصمیم مدیریتی",
  // },
  {
    id: "outlook",
    title: "چشم‌انداز و جهت‌گیری",
    desc: "تمرکز مدیریت محصول در افق پیش‌رو",
    icon: Target,
    preview: "۳ محور استراتژیک",
  },
];

const PORTFOLIO_DATA = {
  payment: {
    title: "محصولات پرداخت",
    count: 6,
    icon: CreditCard,
    products: [
      {
        name: "POS",
        status: "Live",
        kpi: "نرخ موفقیت پردازش تراکنش‌ها",
        nature: "محصول کلیدی",
      },
      {
        name: "IPG",
        status: "Live",
        kpi: "نرخ موفقیت پردازش تراکنش‌ها",
        nature: "محصول کلیدی",
      },
      {
        name: "Switch",
        status: "Live",
        kpi: "نرخ موفقیت پردازش تراکنش‌ها",
        nature: "محصول کلیدی",
      },
      {
        name: "Currency",
        status: "Live",
        kpi: "نرخ موفقیت پردازش تراکنش‌ها",
        nature: "محصول نوآورانه",
      },
      {
        name: "Close Loop Switch",
        status: "Live",
        kpi: "نرخ موفقیت پردازش تراکنش‌ها",
        nature: "محصول عملیاتی",
      },
      {
        name: "Poplay",
        status: "Pre Operation",
        kpi: "نرخ موفقیت پردازش تراکنش‌ها",
        nature: "محصول نوآورانه",
      },
    ],
  },
  digital: {
    title: "محصولات دیجیتال و اعتباری",
    count: 13,
    icon: Smartphone,
    products: [
      {
        name: "IVA",
        status: "Live",
        kpi: "کاربر فعال ماهانه",
        nature: "محصول استراتژیک",
      },
      {
        name: "Iva Pay",
        status: "In Analysis",
        kpi: "نرخ درآمد به ازای هر کاربر",
        nature: "محصول نوآورانه",
      },
      {
        name: "Pulse",
        status: "In Develop",
        kpi: "کاربر فعال ماهانه",
        nature: "محصول استراتژیک",
      },
      {
        name: "My Station",
        status: "Live",
        kpi: "کاربر فعال ماهانه",
        nature: "محصول استراتژیک",
      },
      {
        name: "Wallet",
        status: "Live",
        kpi: "کاربر فعال ماهانه",
        nature: "محصول استراتژیک",
      },
      {
        name: "Digital Rial",
        status: "Live",
        kpi: "نرخ موفقیت پردازش تراکنش‌ها",
        nature: "محصول نوآورانه",
      },
      {
        name: "Melli Wallet",
        status: "Live",
        kpi: "نرخ موفقیت پردازش تراکنش‌ها",
        nature: "محصول نوآورانه",
      },
      {
        name: "BNPL",
        status: "Live",
        kpi: "نرخ موفقیت پردازش تراکنش‌ها",
        nature: "محصول نوآورانه",
      },
      {
        name: "Credit Payment",
        status: "Live",
        kpi: "نرخ موفقیت پردازش تراکنش‌ها",
        nature: "محصول نوآورانه",
      },
      {
        name: "Kahroba",
        status: "Live",
        kpi: "نرخ موفقیت پردازش تراکنش‌ها",
        nature: "محصول نوآورانه",
      },
      {
        name: "Mirshetab",
        status: "Live",
        kpi: "نرخ موفقیت پردازش تراکنش‌ها",
        nature: "محصول نوآورانه",
      },
      {
        name: "Overdraft",
        status: "In Analysis",
        kpi: "نرخ درآمد به ازای هر کاربر",
        nature: "محصول نوآورانه",
      },
      {
        name: "In App Payment",
        status: "In Develop",
        kpi: "نرخ موفقیت پردازش تراکنش‌ها",
        nature: "محصول نوآورانه",
      },
    ],
  },
  acceptance: {
    title: "محصولات پذیرندگی",
    count: 6,
    icon: Monitor,
    products: [
      {
        name: "Shahin DMS",
        status: "Live",
        kpi: "نرخ تأمین نیازهای گزارش‌دهی",
        nature: "محصول استراتژیک",
      },
      {
        name: "MMP",
        status: "Live",
        kpi: "نرخ تبدیل متقاضی به پذیرنده",
        nature: "محصول توانمندساز",
      },
      {
        name: "Mportal",
        status: "Live",
        kpi: "نرخ موفقیت درخواست‌های شاپرکی",
        nature: "محصول توانمندساز",
      },
      {
        name: "PSM",
        status: "Live",
        kpi: "نرخ خطاهای کاربری",
        nature: "محصول توانمندساز",
      },
      {
        name: "TMS",
        status: "Live",
        kpi: "نرخ موفقیت استقرار نسخه هدف",
        nature: "محصول عملیاتی",
      },
      {
        name: "My Sadad",
        status: "In Analysis",
        kpi: "نرخ رضایت کاربران",
        nature: "محصول توانمندساز",
      },
    ],
  },
  valueAdded: {
    title: "سرویس‌ها و محصولات ارزش افزوده",
    count: 10,
    icon: Briefcase,
    products: [
      {
        name: "Customer Gateway",
        status: "Live",
        kpi: "نرخ پاسخگویی موفق به درخواست‌ها",
        nature: "محصول عملیاتی",
      },
      {
        name: "Sadad Naji",
        status: "Live",
        kpi: "نرخ پاسخگویی موفق به درخواست‌ها",
        nature: "محصول عملیاتی",
      },
      {
        name: "User Account",
        status: "Live",
        kpi: "نرخ پاسخگویی موفق به درخواست‌ها",
        nature: "محصول عملیاتی",
      },
      {
        name: "Notification",
        status: "Live",
        kpi: "نرخ پاسخگویی موفق به درخواست‌ها",
        nature: "محصول عملیاتی",
      },
      {
        name: "Post Inquiry",
        status: "Live",
        kpi: "نرخ پاسخگویی موفق به درخواست‌ها",
        nature: "محصول عملیاتی",
      },
      {
        name: "Shaparak Inquiry",
        status: "Live",
        kpi: "نرخ پاسخگویی موفق به درخواست‌ها",
        nature: "محصول عملیاتی",
      },
      {
        name: "Fuel Services",
        status: "Live",
        kpi: "نرخ پاسخگویی موفق به درخواست‌ها",
        nature: "محصول عملیاتی",
      },
      {
        name: "Charge & Bill",
        status: "Live",
        kpi: "نرخ موفقیت پردازش تراکنش‌ها",
        nature: "محصول عملیاتی",
      },
      {
        name: "Charge Switch",
        status: "In Develop",
        kpi: "نرخ موفقیت پردازش تراکنش‌ها",
        nature: "محصول استراتژیک",
      },
      {
        name: "Refund",
        status: "Live",
        kpi: "نرخ موفقیت پردازش تراکنش‌ها",
        nature: "محصول عملیاتی",
      },
    ],
  },
};

const PDI_DATA = [
  { name: "انجام شده (Done)", value: 1068, color: "#10B981" },
  { name: "بسته شده (Closed)", value: 461, color: "#34D399" },
  { name: "در حال انجام (In Progress)", value: 409, color: "#3B82F6" },
  { name: "لغو شده (Canceled)", value: 107, color: "#EF4444" },
  { name: "مرحله (Stage)", value: 101, color: "#F59E0B" },
  { name: "در انتظار مشتری", value: 61, color: "#8B5CF6" },
  { name: "محصول (Product)", value: 22, color: "#6366F1" },
  { name: "باز (Open)", value: 20, color: "#EC4899" },
  { name: "رد شده (Rejected)", value: 16, color: "#9CA3AF" },
  { name: "سایر موارد", value: 5, color: "#D1D5DB" },
  { name: "نامشخص / بدون دسته‌بندی", value: 29, color: "#E5E7EB" }, // The difference to reach 2299
];

const COMMITTEES_DATA = [
  {
    year: "۱۴۰۳",
    hours: 1892,
    approvals: 415,
    completed: 314,
    inProgress: 50,
    notCompleted: 41,
  },
  {
    year: "۱۴۰۴",
    hours: 720,
    approvals: 247,
    completed: 195,
    inProgress: 36,
    notCompleted: 16,
  },
  {
    year: "۶ ماهه اول ۱۴۰۵",
    hours: 280,
    approvals: 72,
    completed: 27,
    inProgress: 29,
    notCompleted: 16,
  },
];

const BACKLOG_DATA = [
  {
    name: "Database",
    completed: 195,
    inProgress: 40,
    unstarted: 44,
    canceled: 45,
    total: 324,
    rate: "60.2%",
  },
  {
    name: "POS",
    completed: 153,
    inProgress: 57,
    unstarted: 62,
    canceled: 11,
    total: 283,
    rate: "54.1%",
  },
  {
    name: "Portal",
    completed: 106,
    inProgress: 49,
    unstarted: 21,
    canceled: 19,
    total: 195,
    rate: "54.4%",
  },
  {
    name: "MMP",
    completed: 100,
    inProgress: 40,
    unstarted: 14,
    canceled: 32,
    total: 186,
    rate: "53.8%",
  },
  {
    name: "PSM SAMBAD",
    completed: 86,
    inProgress: 74,
    unstarted: 2,
    canceled: 9,
    total: 171,
    rate: "50.3%",
  },
  {
    name: "Services",
    completed: 67,
    inProgress: 28,
    unstarted: 1,
    canceled: 8,
    total: 104,
    rate: "64.4%",
  },
  {
    name: "PSM",
    completed: 43,
    inProgress: 15,
    unstarted: 17,
    canceled: 5,
    total: 80,
    rate: "53.8%",
  },
  {
    name: "Shahin DMS",
    completed: 6,
    inProgress: 40,
    unstarted: 7,
    canceled: 0,
    total: 53,
    rate: "11.3%",
  },
  {
    name: "Shaparak WS",
    completed: 10,
    inProgress: 4,
    unstarted: 0,
    canceled: 7,
    total: 21,
    rate: "47.6%",
  },
];

const INITIATIVES_DATA = [
  {
    id: 1,
    title: "درآمد",
    desc: "ایجاد جریان های درآمدی جدید از اعتبار، bnpl و خدمات ارزش افزوده",
    category: "Income",
    icon: Database,
  },
  {
    id: 2,
    title: "رشد",
    desc: "افزایش ارزش سبد خدمات سداد برای پذیرندگان و توسعه بازارهای جدید",
    category: "Grow Up",
    icon: CreditCard,
  },
  {
    id: 3,
    title: "بهره وری",
    desc: "کاهش توسعه های موازی و ایجاد زیرساخت های قابل استفاده مجدد",
    category: "Productivity",
    icon: Smartphone,
  },
  {
    id: 4,
    title: "آینده کسب و کار",
    desc: "ایجاد بستر حرکت از پرداخت به پلتفرم های مالی و دیجیتال",
    category: "New Business Lines",
    icon: TrendingUp,
  },
  // {
  //   id: 5,
  //   title: "راه‌اندازی لاین جدید KYC",
  //   desc: "احراز هویت دیجیتال یکپارچه و هوشمند",
  //   category: "Platform & Infrastructure",
  //   icon: Users,
  // },
  // {
  //   id: 6,
  //   title: "عملیاتی‌سازی «سوییچ شارژ»",
  //   desc: "با قابلیت تبدیل شدن به ارائه‌دهنده سرویس",
  //   category: "Platform & Infrastructure",
  //   icon: Server,
  // },
];

// Typography styles mapping
const typography = {
  h1: "text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight",
  h2: "text-3xl md:text-4xl font-bold",
  h3: "text-2xl md:text-3xl font-semibold",
  h4: "text-xl font-semibold",
  body: "text-base md:text-lg font-normal leading-relaxed",
  small: "text-sm font-normal",
  numberLg: "text-5xl md:text-7xl font-bold font-sans", // Use sans for numbers to ensure tabular lining if possible
};

const persianNumber = (num) => {
  const farsiDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return num.toString().replace(/\d/g, (x) => farsiDigits[x]);
};

const formatNumber = (num) => {
  return persianNumber(num.toLocaleString("en-US"));
};

const StatusBadge = ({ status }) => {
  let config = { label: "نامشخص", color: "bg-gray-200 text-gray-800" };
  switch (status) {
    case "Live":
      config = {
        label: "عملیاتی",
        color: "bg-emerald-100 text-emerald-800 border border-emerald-200",
      };
      break;
    case "In Analysis":
      config = {
        label: "در تحلیل",
        color: "bg-amber-100 text-amber-800 border border-amber-200",
      };
      break;
    case "In Develop":
      config = {
        label: "در توسعه",
        color: "bg-blue-100 text-blue-800 border border-blue-200",
      };
      break;
    case "Pre Operation":
      config = {
        label: "پیش از بهره‌برداری",
        color: "bg-purple-100 text-purple-800 border border-purple-200",
      };
      break;
  }
  return (
    <span
      className={`px-2.5 py-1 text-xs font-semibold rounded-full ${config.color} flex items-center gap-1.5`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${config.color
          .split(" ")[0]
          .replace("100", "500")}`}
      ></span>
      {config.label}
    </span>
  );
};

const NatureBadge = ({ nature }) => {
  return (
    <span className="px-2 py-1 text-[10px] sm:text-xs font-medium bg-gray-100 text-gray-600 rounded-md border border-gray-200">
      {nature}
    </span>
  );
};

const Header = ({ breadcrumbs, onNavigate, onHome }) => {
  return (
    <header className="board-header sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
      {/* Right side: Branding */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#002B5C] to-[#0057A8] flex items-center justify-center shadow-inner">
          <Layers className="text-[#F5B400] w-6 h-6" />
        </div>
        <div className="hidden sm:block">
          <h1 className="text-[#002B5C] font-bold text-lg leading-none mb-1">
            مدیریت محصول
          </h1>
          <p className="text-gray-500 text-xs">ارائه عملکرد و چشم‌انداز</p>
        </div>
      </div>

      {/* Center: Breadcrumbs (Hidden on very small screens) */}
      <nav className="hidden md:flex items-center gap-2 text-sm text-gray-500 flex-1 justify-center px-4">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <button
              onClick={() => crumb.path && onNavigate(crumb.path)}
              className={`hover:text-[#0057A8] transition-colors ${
                index === breadcrumbs.length - 1
                  ? "font-semibold text-[#002B5C]"
                  : ""
              } ${!crumb.path ? "cursor-default" : ""}`}
            >
              {crumb.label}
            </button>
            {index < breadcrumbs.length - 1 && (
              <ChevronLeft className="w-4 h-4 opacity-50" />
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Left side: Controls */}
      <div className="flex items-center gap-2">
        {breadcrumbs.length > 1 && (
          <button
            onClick={() =>
              onNavigate(breadcrumbs[breadcrumbs.length - 2].path || "menu")
            }
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="hidden sm:inline">بازگشت</span>
          </button>
        )}
        <button
          onClick={onHome}
          className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          title="خانه"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

const ExecutiveSummarySection = ({ onNavigate }) => {
  const kpis = [
    { value: "۳۵", label: "محصول در پرتفوی", note: "چهار حوزه اصلی" },
    { value: "۲٬۷۲۲", label: "درخواست ثبت‌شده", note: "در PDI" },
    { value: "۶۶.۶٪", label: "تعیین‌تکلیف PDI", note: "Done + Closed" },
    { value: "۵۴.۱٪", label: "تحقق بک‌لاگ", note: "در مجموع اقلام ثبت‌شده" },
    { value: "۷۲", label: "مصوبه در ۶ماهه اول ۱۴۰۵", note: "۲۷ اجراشده" },
  ];
  const focus = [
    {
      title: "رشد",
      text: "توسعه Business Lineهای جدید و محصولات اعتباری/پرداختی",
    },
    {
      title: "یکپارچگی",
      text: "کاهش پراکندگی سامانه‌ها و حرکت به سمت تجربه یکپارچه سداد",
    },
    {
      title: "تحقق ارزش",
      text: "اتصال تصمیم محصول به KPI، اولویت و نتیجه کسب‌وکار",
    },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-7xl mx-auto"
    >
      <div className="mb-8">
        <div className="text-[#F5B400] font-bold text-sm mb-2">
          EXECUTIVE VIEW
        </div>
        <h2 className={`text-[#002B5C] ${typography.h2} mb-2`}>
          خلاصه مدیریتی
        </h2>
        <p className="text-gray-500">
          تصویری فشرده از وضعیت فعلی، عملکرد اجرایی و جهت‌گیری مدیریت محصول
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {kpis.map((k, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
          >
            <div
              className={`${typography.numberLg} text-[#002B5C] text-4xl mb-2`}
            >
              {k.value}
            </div>
            <div className="font-bold text-gray-800 text-sm">{k.label}</div>
            <div className="text-xs text-gray-400 mt-1">{k.note}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-5 mb-8">
        {focus.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
          >
            <div className="mb-4">
              <span className="text-[#0057A8] font-extrabold text-lg">
                {item.title}
              </span>
            </div>
            <p className="text-gray-600 leading-7 text-sm">{item.text}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#002B5C] rounded-2xl p-6 md:p-8 text-white flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div>
          <div className="text-[#F5B400] font-bold text-sm mb-2">
            BUSINESS IMPACT
          </div>
          <h3 className="text-2xl font-bold mb-2">
            ارزش خلق شده برای کسب و کار
          </h3>
          {/* <p className="text-blue-100 text-sm leading-7 max-w-3xl">در نسخه نهایی، درآمد، رشد کاربران/پذیرندگان، صرفه‌جویی یا سایر KPIهای مالی و کسب‌وکاری در این بخش قرار می‌گیرد. عددی بدون منبع در این نسخه اضافه نشده است.</p>*/}
        </div>
        <button
          onClick={() => onNavigate("initiatives")}
          className="shrink-0 bg-[#F5B400] text-[#002B5C] font-bold px-5 py-3 rounded-xl"
        >
          مشاهده دستورکار راهبردی
        </button>
      </div>
    </motion.div>
  );
};

const ManagementAttentionSection = () => {
  const items = [
    {
      title: "ظرفیت در برابر تقاضا",
      text: "۲٬۷۲۲ درخواست در PDI و ۱٬۴۱۷ آیتم در بک‌لاگ نشان می‌دهد اولویت‌بندی و ظرفیت‌گذاری باید بخشی از تصمیم‌گیری مدیریتی باشد.",
      level: "نیازمند توجه",
    },
    {
      title: "تمرکز روی گلوگاه‌های تحویل",
      text: "نبود ظرفیت اختصاص یافته و قابل اندازه گیری برای تحویل هر محصول، محدودیت ظرفیت موجود، امکان ظرفیت سنجی و برنامه ریزی دقیق به تفکیک محصول را محدود کرده و در نتیجه قابلیت پیش بینی زمان و تعهد تحویل کاهش یافته است.",
      level: "اولویت بالا",
    },
    {
      title: "اثربخشی تصمیمات",
      text: "ایجاد سازوکار تصمیم گیری سریع، شفاف و داده محور با مالکیت مشخص، اولویت بندی مبتنی بر ارزش کسب و کار و سنجش اثربخشی تصمیمات بر اساس خروجی واقعی",
      level: "نیازمند پیگیری",
    },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-7xl mx-auto"
    >
      <div className="mb-8">
        <div className="text-[#F5B400] font-bold text-sm mb-2">
          MANAGEMENT ATTENTION
        </div>
        <h2 className={`text-[#002B5C] ${typography.h2} mb-2`}>
          موارد نیازمند تصمیم و توجه مدیریت
        </h2>
        <p className="text-gray-500">
          موضوعاتی که از گزارش عملکرد به تصمیم مدیریتی تبدیل می‌شوند
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-1 h-full bg-[#F5B400]" />
            <div className="flex items-center gap-2 mb-5">
              <AlertTriangle className="w-5 h-5 text-[#F5B400]" />
              <span className="text-xs font-bold text-gray-500">
                {item.level}
              </span>
            </div>
            <h3 className="font-bold text-[#002B5C] text-lg mb-3">
              {item.title}
            </h3>
            <p className="text-gray-600 text-sm leading-7">{item.text}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-5 text-sm text-gray-600">
        <b className="text-[#002B5C]">پیشنهاد تصمیم:</b> تمرکز ظرفیت توسعه بر
        اولویت‌های دارای ارزش کسب‌وکار، تعریف SLA برای تقاضا و ایجاد مسیر مشخص
        برای رفع وابستگی‌های بین‌واحدی.
      </div>
    </motion.div>
  );
};

const DecisionSection = () => {
  const decisions = [
    {
      no: "01",
      title: "اولویت‌بندی ظرفیت توسعه",
      question:
        "آیا ظرفیت توسعه بر اساس ارزش کسب‌وکار و اولویت‌های راهبردی تخصیص یابد؟",
      evidence:
        "۲٬۷۲۲ درخواست PDI در کنار ۱٬۴۱۷ آیتم بک‌لاگ، ضرورت یک سازوکار شفاف برای انتخاب و توقف/تعویق تقاضاها را نشان می‌دهد.",
      outcome:
        "تمرکز منابع روی تعداد محدودی از اولویت‌های باارزش و کاهش پراکندگی ظرفیت.",
    },
    {
      no: "02",
      title: "رفع گلوگاه‌های تحویل",
      question:
        "آیا برای گلوگاه‌های مزمن، مالک و مسیر رفع وابستگی در سطح مدیریت تعیین شود؟",
      evidence:
        "نرخ تحقق Shahin DMS در داده فعلی ۱۱.۳٪ است و نیاز به بررسی علت تأخیر و وابستگی‌های آن دارد.",
      outcome:
        "افزایش قابلیت پیش‌بینی تحویل و جلوگیری از انباشت آیتم‌های کم‌تحقق.",
    },
    {
      no: "03",
      title: "اتصال مصوبه به نتیجه",
      question:
        "آیا اجرای مصوبات محصول تا تحقق خروجی، به‌صورت دوره‌ای در سطح مدیریت پایش شود؟",
      evidence:
        "در ۶ ماهه ۱۴۰۵، از ۷۲ مصوبه/تأییدیه، ۲۷ مورد تکمیل شده، ۲۹ مورد در حال انجام و ۱۶ مورد تکمیل نشده است.",
      outcome:
        "عبور از «تصمیم‌گیری» به «تحقق تصمیم» و افزایش اثربخشی حاکمیت محصول.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-7xl mx-auto"
    >
      <div className="mb-10">
        <div className="text-[#F5B400] font-bold text-sm mb-2">
          BOARD DECISIONS
        </div>
        <h2 className={`text-[#002B5C] ${typography.h2} mb-3`}>
          ۳ تصمیم مورد انتظار از مدیریت
        </h2>
        <p className="text-gray-500 max-w-3xl leading-7">
          این صفحه عمداً از گزارش وضعیت عبور می‌کند و سه نقطه‌ای را مشخص می‌کند
          که تصمیم مدیریتی می‌تواند مستقیماً بر سرعت اجرا و تحقق ارزش اثر
          بگذارد.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {decisions.map((d, i) => (
          <motion.div
            key={d.no}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
          >
            <div className="bg-[#002B5C] text-white p-6 flex items-start justify-between">
              <div>
                <div className="text-[#F5B400] text-xs font-bold mb-2">
                  DECISION {d.no}
                </div>
                <h3 className="text-xl font-bold leading-8">{d.title}</h3>
              </div>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-[#F5B400] font-black">
                {d.no}
              </div>
            </div>
            <div className="p-6">
              <div className="mb-5">
                <div className="text-xs font-bold text-gray-400 mb-2">
                  تصمیم مورد انتظار
                </div>
                <p className="font-bold text-[#002B5C] leading-7">
                  {d.question}
                </p>
              </div>
              <div className="mb-5 bg-gray-50 rounded-2xl p-4">
                <div className="text-xs font-bold text-gray-400 mb-2">
                  شاهد موجود در گزارش
                </div>
                <p className="text-sm text-gray-600 leading-7">{d.evidence}</p>
              </div>
              <div className="border-t border-gray-100 pt-4">
                <div className="text-xs font-bold text-[#0057A8] mb-2">
                  خروجی مورد انتظار
                </div>
                <p className="text-sm font-semibold text-gray-700 leading-7">
                  {d.outcome}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl bg-gradient-to-l from-[#002B5C] to-[#0057A8] p-7 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div>
          <div className="text-[#F5B400] font-bold text-xs mb-2">
            EXECUTIVE TAKEAWAY
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-2">
            تمرکز مدیریتی باید از «تعداد فعالیت‌ها» به «نتیجه قابل تحقق» منتقل
            شود.
          </h3>
          <p className="text-blue-100 text-sm leading-7">
            سه تصمیم بالا، نقطه اتصال میان تقاضا، ظرفیت، حاکمیت و تحقق ارزش در
            چرخه محصول هستند.
          </p>
        </div>
        <div className="shrink-0 px-5 py-3 rounded-xl bg-[#F5B400] text-[#002B5C] font-black text-sm">
          Decision → Execution → Value
        </div>
      </div>
    </motion.div>
  );
};

const OutlookSection = () => {
  const items = [
    [
      "",
      "حرکت از پرداخت به پلتفرم خدمات مالی و کسب و کار",
      "تبدیل سداد از یک ارایه دهنده زیرساخت های پرداخت به یک پلتفرم یکپارچه داده محور و نوآور در خدمات مالی و کسب و کار که با تکیه بر زیرساخت پرداخت ، اعتبار، داده و فناوری بتواند نیازهتی مشتریان و کسب و کارها را از مرحله پذیرش و پرداخت تا تامین مالی و خدمات ارزش افزوده پوشش دهد. با تمرکز بر محصولاتی که همزمان مسئله واقعی مشتری را حل کند ، وضعیت رقابتی قابل دفاع ایجاد کند و به ایجاد درآمد پایدار برای سداد منجر شود.",
    ],
    // [
    //   "یکپارچگی",
    //   "ساخت پلتفرم و تجربه یکپارچه برای ذی‌نفعان",
    //   "یکپارچه‌سازی Back-office و سداد من",
    // ],
    // [
    //   "توانمندسازی",
    //   "ایجاد زیرساخت‌های مقیاس‌پذیر و قابل توسعه",
    //   "KYC، Charge Switch و پلتفرم‌های محصول",
    // ],
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-7xl mx-auto"
    >
      <div className="mb-10 text-center">
        <div className="text-[#F5B400] font-bold text-sm mb-2">
          OUTLOOK 1405–1406
        </div>
        <h2 className={`text-[#002B5C] ${typography.h2} mb-3`}>
          جهت‌گیری مدیریت محصول
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto">
          حرکت از مدیریت مجموعه‌ای از محصولات به مدیریت سبدی که مستقیماً به رشد
          و ارزش کسب‌وکار متصل است
        </p>
      </div>
      <div className=" gap-6">
        {items.map((item, i) => (
          <div
            key={i}
            className="bg-white w-full rounded-2xl border border-gray-100 p-7 shadow-sm"
          >
            <div className="text-4xl font-black text-gray-200 mb-4">
              0{i + 1}
            </div>
            <h3 className="text-2xl font-bold text-[#002B5C] mb-3">
              {item[0]}
            </h3>
            <p className="font-semibold text-gray-800 mb-3">{item[1]}</p>
            <p className="text-gray-500 text-sm leading-7">{item[2]}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 flex items-center justify-center gap-3 text-[#002B5C] font-bold">
        <span>Portfolio</span>
        <ArrowRight className="w-5 h-5" />
        <span>Prioritization</span>
        <ArrowRight className="w-5 h-5" />
        <span>Delivery</span>
        <ArrowRight className="w-5 h-5" />
        <span className="text-[#0057A8]">Value Realization</span>
      </div>
    </motion.div>
  );
};

const PortfolioSection = ({ onNavigate }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 md:p-10 max-w-7xl mx-auto"
    >
      <div className="mb-10 text-center">
        <h2 className={`text-[#002B5C] ${typography.h2} mb-4`}>
          پرتفوی محصولات سداد
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          نمایی یکپارچه از اکوسیستم محصولات در چهار دسته‌بندی اصلی
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {Object.entries(PORTFOLIO_DATA).map(([key, category], index) => {
          const Icon = category.icon;
          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02, translateY: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate(`portfolio/${key}`)}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 transition-all text-right flex flex-col items-start relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#0057A8]/5 to-transparent rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>

              <div className="flex justify-between items-start w-full mb-6">
                <div className="p-3 bg-blue-50 text-[#0057A8] rounded-xl">
                  <Icon className="w-8 h-8" />
                </div>
                <div className="text-right">
                  <span className="block text-3xl font-bold text-[#002B5C]">
                    {persianNumber(category.count)}
                  </span>
                  <span className="text-sm text-gray-500">محصول</span>
                </div>
              </div>

              <h3 className={`text-[#002B5C] ${typography.h3} mb-2`}>
                {category.title}
              </h3>
              <div className="flex items-center gap-2 text-sm font-medium text-[#0057A8] mt-4">
                مشاهده محصولات <ChevronLeft className="w-4 h-4" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

const CategoryDetailView = ({ categoryKey, onBack }) => {
  const category = PORTFOLIO_DATA[categoryKey];
  const [selectedProduct, setSelectedProduct] = useState(null);

  if (!category) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 md:p-10 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <category.icon className="w-8 h-8 text-[#0057A8]" />
            <h2 className={`text-[#002B5C] ${typography.h2}`}>
              {category.title}
            </h2>
          </div>
          <p className="text-gray-500">فهرست محصولات این دسته‌بندی</p>
        </div>
        <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <span className="text-gray-500 text-sm ml-2">تعداد کل:</span>
          <span className="font-bold text-[#002B5C] text-lg">
            {persianNumber(category.count)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {category.products.map((product, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedProduct(product)}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer transition-all flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <h4
                className="font-bold text-[#002B5C] text-lg english-font tracking-wide"
                dir="ltr"
              >
                {product.name}
              </h4>
              <StatusBadge status={product.status} />
            </div>
            <div className="mt-auto pt-4 flex justify-between items-end border-t border-gray-50">
              <NatureBadge nature={product.nature} />
              <ChevronLeft className="w-5 h-5 text-gray-300" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 left-4 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-full p-1"
              >
                <XCircle className="w-6 h-6" />
              </button>

              <div className="mb-6">
                <span className="text-xs font-semibold text-gray-500 mb-2 block">
                  {category.title}
                </span>
                <h3
                  className="text-3xl font-extrabold text-[#002B5C] english-font tracking-wide"
                  dir="ltr"
                >
                  {selectedProduct.name}
                </h3>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-sm text-gray-500 block mb-1">
                    وضعیت فعلی
                  </span>
                  <StatusBadge status={selectedProduct.status} />
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-sm text-gray-500 block mb-1">
                    شاخص کلیدی عملکرد (KPI)
                  </span>
                  <p className="font-semibold text-gray-800">
                    {selectedProduct.kpi}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <span className="text-sm text-gray-500 block mb-1">
                    ماهیت محصول
                  </span>
                  <NatureBadge nature={selectedProduct.nature} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const PDISection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-7xl mx-auto h-full"
    >
      <div className="mb-8">
        <h2 className={`text-[#002B5C] ${typography.h2} mb-2`}>
          درخواست‌ها و PDI
        </h2>
        <p className="text-gray-500">تصویری از حجم و وضعیت درخواست‌های ورودی</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Main KPI Card */}
          <div className="bg-gradient-to-br from-[#002B5C] to-[#0057A8] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
              <Inbox className="w-48 h-48 -mr-10 -mt-10" />
            </div>
            <h3 className="text-blue-100 font-medium mb-2 text-lg">
              کل درخواست‌های ثبت شده
            </h3>
            <div className={`${typography.numberLg} text-[#F5B400] mb-4`}>
              {formatNumber(2722)}
            </div>
            <div className="space-y-2 mt-6">
              <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                <span className="text-sm">نرخ تکمیل / بسته‌شده</span>
                <span className="font-bold">~۶۶.۶٪</span>
              </div>
              <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                <span className="text-sm">در حال انجام / فعال</span>
                <span className="font-bold">~۱۷.۸٪</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-amber-800 text-sm">
            <Search className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-500" />
            <p>
              <strong>توجه:</strong> مجموع آیتم‌های دسته‌بندی شده ۲٬۲۷۰ مورد
              است. ۲۹ مورد به عنوان «سایر / نامشخص» برای تطبیق با کل (۲٬۷۲۲) در
              نظر گرفته شده است.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-[#002B5C] mb-6">
            توزیع وضعیت درخواست‌ها
          </h3>
          <div className="flex-1 min-h-[400px] flex flex-col md:flex-row items-center">
            {/* Chart Area */}
            <div className="w-full md:w-1/2 h-64 md:h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PDI_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {PDI_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => [formatNumber(value), "تعداد"]}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    itemStyle={{ textAlign: "right" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-gray-400 text-sm">تعداد کل</span>
                <span className="text-2xl font-bold text-[#002B5C]">
                  {formatNumber(2722)}
                </span>
              </div>
            </div>

            {/* Legend Area */}
            <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 mt-6 md:mt-0 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {PDI_DATA.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span
                      className="text-sm text-gray-700 truncate max-w-[120px]"
                      title={item.name}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatNumber(item.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const COMMITTEE_METRICS = [
  { key: "hours", label: "مجموع نفرساعت", color: "#E8AD24" },
  { key: "approvals", label: "تعداد کل مصوبات", color: "#002B5C" },
  { key: "completed", label: "انجام‌شده", color: "#0B5CAB" },
  { key: "inProgress", label: "در دست اقدام", color: "#007C91" },
  { key: "notCompleted", label: "انجام‌نشده", color: "#94A3B8" },
];

const CommitteeMetricRow = ({ label, value, maxVal, color }) => {
  const percentage = maxVal > 0 ? Math.max((value / maxVal) * 100, 8) : 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className="text-sm font-medium text-gray-600 leading-6">
          {label}
        </span>
        <span className="text-base font-bold text-[#002B5C] shrink-0">
          {formatNumber(value)}
        </span>
      </div>
      <div className="h-3 w-full rounded-full bg-white border border-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

const CommitteesSection = () => {
  const maxHours = Math.max(...COMMITTEES_DATA.map((item) => item.hours));
  const maxApprovals = Math.max(
    ...COMMITTEES_DATA.map((item) => item.approvals)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-7xl mx-auto"
    >
      <div className="mb-10 text-center">
        <h2 className={`text-[#002B5C] ${typography.h2} mb-4`}>
          عملکرد کمیته‌های محصول
        </h2>
        <p className="text-gray-600">
          روند تصمیم‌گیری و اجرای مصوبات طی سال‌های گذشته
        </p>
      </div>

      <div className="bg-white w-full rounded-3xl p-4 md:p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {COMMITTEES_DATA.map((yearData, idx) => {
            const isLatest = idx === COMMITTEES_DATA.length - 1;
            const completionRate = Math.round(
              (yearData.completed / yearData.approvals) * 100
            );

            return (
              <div
                key={yearData.year}
                className={`flex flex-col rounded-2xl p-5 md:p-6 ${
                  isLatest
                    ? "bg-blue-50/70 ring-1 ring-blue-100"
                    : "bg-slate-50/80"
                }`}
              >
                <div className="mb-6 text-center">
                  <div className="h-7 mb-3 flex items-center justify-center">
                    {isLatest ? (
                      <div className="inline-flex bg-[#F5B400] text-[#002B5C] text-xs font-bold px-3 py-1 rounded-full">
                        دوره جاری
                      </div>
                    ) : (
                      <span className="invisible text-xs px-3 py-1">
                        دوره جاری
                      </span>
                    )}
                  </div>
                  <h3
                    className={`text-xl md:text-2xl font-bold leading-snug min-h-[3.25rem] flex items-center justify-center ${
                      isLatest ? "text-[#0057A8]" : "text-[#002B5C]"
                    }`}
                  >
                    {yearData.year}
                  </h3>
                </div>

                <div className="w-full flex flex-col gap-5">
                  {COMMITTEE_METRICS.map((metric) => (
                    <CommitteeMetricRow
                      key={metric.key}
                      label={metric.label}
                      value={yearData[metric.key]}
                      maxVal={
                        metric.key === "hours" ? maxHours : maxApprovals
                      }
                      color={metric.color}
                    />
                  ))}
                </div>

                <div className="mt-auto pt-6 text-center bg-white p-3 rounded-xl w-full border border-gray-100">
                  <span className="block text-xs text-gray-400 mb-1">
                    نرخ تکمیل مصوبات
                  </span>
                  <span className="font-bold text-lg text-[#002B5C]">
                    {persianNumber(completionRate)}٪
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-500 text-center flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            مجموع نفرساعت بر اساس میانگین ۲۰ نفر حضور در هر جلسه محاسبه شده
            است.
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const BacklogSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-4xl mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
        <div>
          <h2 className={`text-[#002B5C] ${typography.h2} mb-2`}>
            وضعیت بک‌لاگ محصولات
          </h2>
          <p className="text-gray-500">
            تصویری از حجم کار و پیشرفت اجرای محصولات در سامانه‌های مختلف
          </p>
        </div>

        <div className="flex gap-4 mt-4 md:mt-0">
          <div className="bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm text-center">
            <span className="text-gray-500 text-xs block mb-1">کل تسک‌ها</span>
            <span className="font-bold text-[#002B5C] text-2xl">
              {formatNumber(1417)}
            </span>
          </div>
          <div className="bg-[#002B5C] px-5 py-3 rounded-xl shadow-sm text-center">
            <span className="text-blue-200 text-xs block mb-1">
              نرخ تکمیل کل
            </span>
            <span className="font-bold text-[#F5B400] text-2xl">
              {persianNumber(54.1)}٪
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <h3 className="text-lg font-bold text-[#002B5C] mb-6">
          وضعیت تسک‌ها به تفکیک محصول / سامانه
        </h3>

        <div className="h-[500px] w-full" dir="ltr">
          {" "}
          {/* Recharts usually works better in LTR, we handle labels manually */}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={BACKLOG_DATA}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#E5E7EB"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#4B5563", fontSize: 12, fontWeight: 600 }}
                width={110}
              />
              <RechartsTooltip
                cursor={{ fill: "#F3F4F6" }}
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ textAlign: "left" }}
                labelStyle={{
                  fontWeight: "bold",
                  color: "#111827",
                  marginBottom: "8px",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />

              <Bar
                dataKey="completed"
                name="Completed"
                stackId="a"
                fill="#10B981"
                radius={[0, 0, 0, 4]}
                barSize={24}
              />
              <Bar
                dataKey="inProgress"
                name="In Progress"
                stackId="a"
                fill="#3B82F6"
              />
              <Bar
                dataKey="unstarted"
                name="Unstarted"
                stackId="a"
                fill="#F59E0B"
              />
              <Bar
                dataKey="canceled"
                name="Canceled"
                stackId="a"
                fill="#EF4444"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Management Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-emerald-900 text-sm">
              بالاترین نرخ تکمیل
            </h4>
            <p className="text-emerald-700 text-sm mt-1">
              سامانه Services با <strong>{persianNumber(64.4)}٪</strong> نرخ
              تکمیل، بهترین عملکرد را در اتمام وظایف داشته است.
            </p>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-start gap-3">
          <AlertCircleIcon className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-900 text-sm">
              بیشترین حجم کار فعال
            </h4>
            <p className="text-amber-700 text-sm mt-1">
              سامانه PSM SAMBAD با <strong>{persianNumber(74)}</strong> تسک در
              حال انجام، بیشترین حجم عملیاتی فعلی را دارد.
            </p>
          </div>
        </div>

        <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 h-full bg-red-400"></div>
          <Activity className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-bold text-red-900 text-sm">
              نیازمند توجه (Shahin DMS)
            </h4>
            <p className="text-red-700 text-sm mt-1">
              نرخ تکمیل تنها <strong>{persianNumber(11.3)}٪</strong> است و بخش
              عمده وظایف ({persianNumber(40)} مورد) در وضعیت در حال انجام
              انباشته شده‌اند.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AlertCircleIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const InitiativesSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-7xl mx-auto"
    >
      <div className="mb-12 text-center">
        <h2 className={`text-[#002B5C] ${typography.h2} mb-4`}>
          مهم‌ترین اقدامات در دست انجام
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          پروژه‌های کلیدی و اقدامات راهبردی مدیریت محصول در مسیر آینده
        </p>
      </div>

      <div className="gap-6 relative">
        {/* Background connector line - visual only */}
        <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-0.5 bg-gradient-to-r from-transparent via-blue-200 to-transparent -translate-y-1/2 z-0"></div>

        {INITIATIVES_DATA.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white mb-4 rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl hover:border-blue-300 transition-all z-10 relative overflow-hidden group h-full w-full flex flex-col"
          >
            {/* Number watermark */}
            <div
              className="absolute -top-4 -left-4 text-8xl font-black text-gray-50 opacity-50 group-hover:text-blue-50 transition-colors pointer-events-none english-font"
              dir="ltr"
            >
              {item.id}
            </div>

            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-[#002B5C] text-white flex items-center justify-center shrink-0 shadow-inner group-hover:bg-[#0057A8] transition-colors">
                <item.icon className="w-6 h-6 text-[#F5B400]" />
              </div>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                {item.category}
              </span>
            </div>

            <h3 className="text-xl font-bold text-[#002B5C] mb-3 relative z-10 leading-tight">
              {item.title}
            </h3>

            <p className="text-gray-600 text-sm leading-relaxed relative z-10 mt-auto pt-4 border-t border-gray-50">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const ProcessSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-7xl mx-auto h-full flex flex-col"
    >
      <div className="mb-8">
        <h2 className={`text-[#002B5C] ${typography.h2} mb-2`}>
          حاکمیت چرخه محصول و تحقق ارزش
        </h2>
        <p className="text-gray-500">
          مسیر یکپارچه تبدیل نیاز و ایده به محصول قابل ارائه (خلاصه مدیریتی)
        </p>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto custom-scrollbar p-6 relative">
        {/* Simplified Executive Flowchart */}
        <div className="min-w-[900px] h-full flex flex-col justify-around py-4">
          {/* Track 1: New Product */}
          <div className="relative mb-12">
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F5B400] text-white flex items-center justify-center font-bold text-sm shadow-md z-10">
              ۱
            </div>
            <div className="ml-8 bg-gray-50 rounded-xl border border-gray-200 p-4 relative">
              <h3 className="absolute -top-3 right-6 bg-white px-3 text-sm font-bold text-[#002B5C] border border-gray-200 rounded-full">
                توسعه محصول جدید
              </h3>

              <div className="flex items-center justify-between mt-4">
                <ProcessStep
                  icon={Search}
                  title="کشف و تحلیل"
                  desc="نیازسنجی و راهکار"
                  color="blue"
                />
                <ProcessArrow />
                <ProcessStep
                  icon={Settings}
                  title="شفاف‌سازی و PRD"
                  desc="مستندات و تیم فنی"
                  color="navy"
                />
                <ProcessArrow />
                <ProcessStep
                  icon={GitBranch}
                  title="توسعه و تست"
                  desc="پیاده‌سازی و ارزیابی"
                  color="indigo"
                />
                <ProcessArrow />
                <ProcessStep
                  icon={Rocket}
                  title="عملیاتی‌سازی"
                  desc="ارائه به مشتری و رشد"
                  color="emerald"
                />
              </div>
            </div>
          </div>

          {/* Track 2: Improvement */}
          <div className="relative mb-12">
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F5B400] text-white flex items-center justify-center font-bold text-sm shadow-md z-10">
              ۲
            </div>
            <div className="ml-8 bg-gray-50 rounded-xl border border-gray-200 p-4 relative">
              <h3 className="absolute -top-3 right-6 bg-white px-3 text-sm font-bold text-[#002B5C] border border-gray-200 rounded-full">
                بهبود و توسعه ویژگی‌ها
              </h3>

              <div className="flex items-center justify-between mt-4">
                <ProcessStep
                  icon={Activity}
                  title="بازخورد و آنالیز"
                  desc="طرح بهبود محصول"
                  color="amber"
                />
                <ProcessArrow />
                <ProcessStep
                  icon={Users}
                  title="جلسه فنی و Jira"
                  desc="ثبت درخواست توسعه"
                  color="navy"
                />
                <ProcessArrow />
                <ProcessStep
                  icon={CheckCircle}
                  title="تست محیط عملیاتی"
                  desc="بررسی کامل ویژگی"
                  color="indigo"
                />
                <ProcessArrow />
                <ProcessStep
                  icon={Smartphone}
                  title="انتشار و اطلاع‌رسانی"
                  desc="ارائه به ذینفعان"
                  color="emerald"
                />
              </div>
            </div>
          </div>

          {/* Track 3: Bug Fix */}
          <div className="relative">
            <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F5B400] text-white flex items-center justify-center font-bold text-sm shadow-md z-10">
              ۳
            </div>
            <div className="ml-8 bg-gray-50 rounded-xl border border-gray-200 p-4 relative">
              <h3 className="absolute -top-3 right-6 bg-white px-3 text-sm font-bold text-[#002B5C] border border-gray-200 rounded-full">
                رفع باگ (Bug Fix)
              </h3>

              <div className="flex items-center justify-between mt-4">
                <ProcessStep
                  icon={XCircle}
                  title="تشخیص و گزارش"
                  desc="شفاف‌سازی باگ"
                  color="red"
                />
                <ProcessArrow />
                <ProcessStep
                  icon={ListTodo}
                  title="ثبت و ارجاع"
                  desc="درخواست رفع مشکل"
                  color="navy"
                />
                <ProcessArrow />
                <ProcessStep
                  icon={Settings}
                  title="رفع فنی / عملیاتی"
                  desc="توسعه یا تنظیمات"
                  color="indigo"
                />
                <ProcessArrow />
                <ProcessStep
                  icon={CheckCircle}
                  title="نصب و اطلاع‌رسانی"
                  desc="تاییدیه نهایی"
                  color="emerald"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ProcessStep = ({ icon: Icon, title, desc, color }) => {
  const colorMap = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    navy: "bg-indigo-100 text-[#002B5C] border-indigo-200",
    indigo: "bg-violet-100 text-violet-700 border-violet-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    red: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <div className="flex flex-col items-center text-center w-40 z-10 relative group">
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center border-2 mb-3 bg-white shadow-sm transition-transform group-hover:scale-110 ${colorMap[color]}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="font-bold text-sm text-[#002B5C] mb-1">{title}</h4>
      <p className="text-xs text-gray-500">{desc}</p>
    </div>
  );
};

const ProcessArrow = () => (
  <div className="flex-1 flex items-center px-2 z-0">
    <div className="w-full h-0.5 bg-gray-300 relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 border-t-2 border-l-2 border-gray-400 transform -rotate-45"></div>
    </div>
  </div>
);

export default function ExecutiveApp() {
  const [currentView, setCurrentView] = useState("cover"); // 'cover', 'menu', or specific section paths
  const [breadcrumbs, setBreadcrumbs] = useState([
    { label: "خانه", path: "menu" },
  ]);

  // Handle Navigation
  const navigateTo = (path) => {
    setCurrentView(path);

    // Build breadcrumbs based on path
    const newBreadcrumbs = [{ label: "خانه", path: "menu" }];

    if (path === "menu") {
      // Just home
    } else if (path.startsWith("portfolio/")) {
      newBreadcrumbs.push({ label: "پرتفوی محصولات", path: "portfolio" });
      const categoryKey = path.split("/")[1];
      if (PORTFOLIO_DATA[categoryKey]) {
        newBreadcrumbs.push({
          label: PORTFOLIO_DATA[categoryKey].title,
          path: null,
        });
      }
    } else {
      const menuItem = MAIN_MENU_ITEMS.find((item) => item.id === path);
      if (menuItem) {
        newBreadcrumbs.push({ label: menuItem.title, path: null });
      }
    }

    setBreadcrumbs(newBreadcrumbs);
  };

  const handleHome = () => navigateTo("menu");

  // Render appropriate view based on state
  const renderView = () => {
    switch (currentView) {
      case "menu":
        return (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="board-menu p-6 md:p-10 max-w-7xl mx-auto min-h-screen flex flex-col justify-center"
          >
            <div className="mb-12 text-center board-menu-heading">
              <div className="board-kicker">
                PRODUCT MANAGEMENT • EXECUTIVE VIEW
              </div>
              <h2 className={`text-[#002B5C] ${typography.h1} mb-4`}>
                داشبورد محصولات سداد
              </h2>
              <p className="text-gray-600 text-lg">
                لطفاً برای مشاهده جزئیات، بخش مورد نظر را انتخاب کنید
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {MAIN_MENU_ITEMS.map((item, idx) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.03, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateTo(item.id)}
                  className="board-menu-card bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 transition-all text-right flex flex-col relative overflow-hidden group"
                >
                  <div className="absolute -left-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity">
                    <item.icon className="w-40 h-40" />
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="board-menu-icon w-12 h-12 rounded-xl bg-gradient-to-br from-[#002B5C] to-[#0057A8] text-white flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all">
                      <item.icon className="w-6 h-6 text-[#F5B400]" />
                    </div>
                    <span
                      className="board-number text-gray-300 font-bold text-2xl english-font"
                      dir="ltr"
                    >
                      0{idx + 1}
                    </span>
                  </div>

                  <h3
                    className={`text-[#002B5C] ${typography.h3} mb-2 line-clamp-1`}
                  >
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm mb-6 flex-1">
                    {item.desc}
                  </p>

                  <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                      {item.preview}
                    </span>
                    <ChevronLeft className="w-5 h-5 text-[#0057A8]" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      case "executive":
        return (
          <ExecutiveSummarySection key="executive" onNavigate={navigateTo} />
        );
      case "attention":
        return <ManagementAttentionSection key="attention" />;
      case "decisions":
        return <DecisionSection key="decisions" />;
      case "outlook":
        return <OutlookSection key="outlook" />;
      case "portfolio":
        return <PortfolioSection key="portfolio" onNavigate={navigateTo} />;
      case "portfolio/payment":
      case "portfolio/digital":
      case "portfolio/acceptance":
      case "portfolio/valueAdded":
        return (
          <CategoryDetailView
            key={currentView}
            categoryKey={currentView.split("/")[1]}
            onBack={() => navigateTo("portfolio")}
          />
        );
      case "pdi":
        return <PDISection key="pdi" />;
      case "committees":
        return <CommitteesSection key="committees" />;
      case "backlog":
        return <BacklogSection key="backlog" />;
      case "initiatives":
        return <InitiativesSection key="initiatives" />;
      case "process":
        return <ProcessSection key="process" />;
      default:
        return null;
    }
  };

  return (
    <div
      className="executive-app min-h-screen bg-[#F5F7FA] font-sans text-right"
      dir="rtl"
    >

      <AnimatePresence mode="wait">
        {currentView === "cover" ? (
          /* Cover Page */
          <motion.div
            key="cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8 }}
            className="h-screen w-full bg-gradient-to-br from-[#001f43] via-[#002B5C] to-[#004282] flex flex-col items-center justify-center relative overflow-hidden"
          >
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
                className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0057A8] via-transparent to-transparent"
              ></motion.div>

              {/* Abstract tech lines */}
              <svg
                className="absolute inset-0 w-full h-full opacity-20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="0.5"
                  />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            <div className="z-10 text-center max-w-5xl px-6 board-cover-content">
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.8 }}
              >
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl mx-auto mb-8 flex items-center justify-center border border-white/20 shadow-2xl">
                  <Layers className="w-10 h-10 text-[#F5B400]" />
                </div>

                <div className="board-cover-kicker">
                  SADAD • PRODUCT MANAGEMENT
                </div>
                <h1
                  className={`${typography.h1} text-white mb-6 leading-tight drop-shadow-lg`}
                >
                  نمای کلی عملکرد و چشم‌انداز مدیریت محصول
                </h1>

                <p className="text-xl md:text-2xl text-blue-200 mb-12 font-light max-w-3xl mx-auto">
                  نمایی یکپارچه از پرتفوی محصولات، عملکرد و مسیر پیش‌رو
                </p>

                <button
                  onClick={() => navigateTo("menu")}
                  className="group relative px-8 py-4 bg-[#F5B400] hover:bg-[#ffc824] text-[#002B5C] font-bold text-lg rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 mx-auto overflow-hidden"
                >
                  <span className="relative z-10">شروع ارائه</span>
                  <ChevronLeft className="w-5 h-5 relative z-10 group-hover:-translate-x-1 transition-transform" />
                  <div className="absolute inset-0 h-full w-full bg-white/20 scale-x-0 group-hover:scale-x-100 origin-right transition-transform duration-300 ease-out z-0"></div>
                </button>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="absolute bottom-10 left-0 right-0 text-center z-10"
            >
              <div className="board-cover-meta">
                <span>معاونت توسعه و نوآوری محصول</span>
                <span>۱۴۰۵ — ۱۴۰۶</span>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* Application Layout */
          <div className="min-h-screen flex flex-col relative" key="app">
            <Header
              breadcrumbs={breadcrumbs}
              onNavigate={navigateTo}
              onHome={handleHome}
            />

            <main className="flex-1 relative pb-20">
              <AnimatePresence mode="wait">{renderView()}</AnimatePresence>
            </main>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
