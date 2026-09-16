import React, { useState } from 'react';
import { usePresentation } from './data/PresentationProvider.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, Home, Menu as MenuIcon, ArrowRight, Layers, 
  Inbox, Users, ListTodo, Rocket, GitBranch, 
  Activity, CheckCircle, XCircle, Clock, Search, 
  Briefcase, Monitor, Smartphone, CreditCard, 
  Settings, Database, Server, ChevronLeft, Target, Sparkles, TrendingUp, AlertTriangle, Gauge, BarChart3, Flag
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';

// --- DATA DEFINITIONS ---

const COLORS = {
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
    live: '#10B981', // Green
    analysis: '#F59E0B', // Orange/Yellow
    develop: '#3B82F6', // Blue
    preOp: '#8B5CF6' // Purple
  }
};

// Typography styles mapping
const typography = {
  h1: "text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight",
  h2: "text-3xl md:text-4xl font-bold",
  h3: "text-2xl md:text-3xl font-semibold",
  h4: "text-xl font-semibold",
  body: "text-base md:text-lg font-normal leading-relaxed",
  small: "text-sm font-normal",
  numberLg: "text-5xl md:text-7xl font-bold",
};

const persianNumber = (num) => {
  const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return num.toString().replace(/\d/g, x => farsiDigits[x]);
};

const formatNumber = (num) => {
  return persianNumber(num.toLocaleString('en-US'));
};

const StatusBadge = ({ status }) => {
  let config = { label: 'نامشخص', color: 'bg-gray-200 text-gray-800' };
  switch(status) {
    case 'Live': config = { label: 'عملیاتی', color: 'bg-emerald-100 text-emerald-800 border border-emerald-200' }; break;
    case 'In Analysis': config = { label: 'در تحلیل', color: 'bg-amber-100 text-amber-800 border border-amber-200' }; break;
    case 'In Develop': config = { label: 'در توسعه', color: 'bg-blue-100 text-blue-800 border border-blue-200' }; break;
    case 'Pre Operation': config = { label: 'پیش از بهره‌برداری', color: 'bg-purple-100 text-purple-800 border border-purple-200' }; break;
  }
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${config.color} flex items-center gap-1.5`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.color.split(' ')[0].replace('100', '500')}`}></span>
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
          <h1 className="text-[#002B5C] font-bold text-lg leading-none mb-1">مدیریت محصول</h1>
          <p className="text-gray-500 text-xs">ارائه عملکرد و چشم‌انداز</p>
        </div>
      </div>

      {/* Center: Breadcrumbs (Hidden on very small screens) */}
      <nav className="hidden md:flex items-center gap-2 text-sm text-gray-500 flex-1 justify-center px-4">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            <button 
              onClick={() => crumb.path && onNavigate(crumb.path)}
              className={`hover:text-[#0057A8] transition-colors ${index === breadcrumbs.length - 1 ? 'font-semibold text-[#002B5C]' : ''} ${!crumb.path ? 'cursor-default' : ''}`}
            >
              {crumb.label}
            </button>
            {index < breadcrumbs.length - 1 && <ChevronLeft className="w-4 h-4 opacity-50" />}
          </React.Fragment>
        ))}
      </nav>

      {/* Left side: Controls */}
      <div className="flex items-center gap-2">
        {breadcrumbs.length > 1 && (
          <button 
            onClick={() => onNavigate(breadcrumbs[breadcrumbs.length - 2].path || 'menu')}
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
  const { data } = usePresentation();
  const kpis = data.executiveKpis;
  const focus = data.executiveFocus;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="text-[#F5B400] font-bold text-sm mb-2">EXECUTIVE VIEW</div>
        <h2 className={`text-[#002B5C] ${typography.h2} mb-2`}>خلاصه مدیریتی</h2>
        <p className="text-gray-500">تصویری فشرده از وضعیت فعلی، عملکرد اجرایی و جهت‌گیری مدیریت محصول</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {kpis.map((k, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className={`${typography.numberLg} text-[#002B5C] text-4xl mb-2`}>{k.value}</div>
            <div className="font-bold text-gray-800 text-sm">{k.label}</div>
            <div className="text-xs text-gray-400 mt-1">{k.note}</div>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-3 gap-5 mb-8">
        {focus.map((item, i) => (
          <div key={i} className="text-right bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4"><span className="text-[#0057A8] font-extrabold text-lg">{item.title}</span></div>
            <p className="text-gray-600 leading-7 text-sm">{item.text}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#002B5C] rounded-2xl p-6 md:p-8 text-white flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div>
          <div className="text-[#F5B400] font-bold text-sm mb-2">BUSINESS IMPACT</div>
          <p className="text-blue-100 text-sm leading-7 max-w-3xl">اثر کسب‌وکاری مسیر محصول، از درآمد و رشد تا بهره‌وری و آینده پلتفرم.</p>
        </div>
        <button onClick={() => onNavigate('initiatives')} className="shrink-0 bg-[#F5B400] text-[#002B5C] font-bold px-5 py-3 rounded-xl">مشاهده دستور کار راهبردی</button>
      </div>
    </motion.div>
  );
};

const ManagementAttentionSection = () => {
  const { data } = usePresentation();
  const items = data.attention;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8"><div className="text-[#F5B400] font-bold text-sm mb-2">MANAGEMENT ATTENTION</div><h2 className={`text-[#002B5C] ${typography.h2} mb-2`}>موارد نیازمند تصمیم و توجه مدیریت</h2><p className="text-gray-500">موضوعاتی که از گزارش عملکرد به تصمیم مدیریتی تبدیل می‌شوند</p></div>
      <div className="grid md:grid-cols-3 gap-5">{items.map((item, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm relative overflow-hidden"><div className="absolute top-0 right-0 w-1 h-full bg-[#F5B400]"/><div className="flex items-center gap-2 mb-5"><AlertTriangle className="w-5 h-5 text-[#F5B400]"/><span className="text-xs font-bold text-gray-500">{item.level}</span></div><h3 className="font-bold text-[#002B5C] text-lg mb-3">{item.title}</h3><p className="text-gray-600 text-sm leading-7">{item.text}</p></div>
      ))}</div>
      {(data.attentionSuggestion || data.attentionSuggestionTitle) && (
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-2xl p-5 text-sm text-gray-600">
          <b className="text-[#002B5C]">{data.attentionSuggestionTitle || 'پیشنهاد تصمیم'}:</b>{' '}
          {data.attentionSuggestion}
        </div>
      )}
    </motion.div>
  );
};

const DecisionSection = () => {
  const { data } = usePresentation();
  const decisions = data.decisions;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="text-[#F5B400] font-bold text-sm mb-2">BOARD DECISIONS</div>
        <h2 className={`text-[#002B5C] ${typography.h2} mb-3`}>۳ تصمیم مورد انتظار از مدیریت</h2>
        <p className="text-gray-500 max-w-3xl leading-7">این صفحه عمداً از گزارش وضعیت عبور می‌کند و سه نقطه‌ای را مشخص می‌کند که تصمیم مدیریتی می‌تواند مستقیماً بر سرعت اجرا و تحقق ارزش اثر بگذارد.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {decisions.map((d, i) => (
          <motion.div key={d.no} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-shadow">
            <div className="bg-[#002B5C] text-white p-6 flex items-start justify-between">
              <div><div className="text-[#F5B400] text-xs font-bold mb-2">DECISION {d.no}</div><h3 className="text-xl font-bold leading-8">{d.title}</h3></div>
              <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-[#F5B400] font-black">{d.no}</div>
            </div>
            <div className="p-6">
              <div className="mb-5"><div className="text-xs font-bold text-gray-400 mb-2">تصمیم مورد انتظار</div><p className="font-bold text-[#002B5C] leading-7">{d.question}</p></div>
              <div className="mb-5 bg-gray-50 rounded-2xl p-4"><div className="text-xs font-bold text-gray-400 mb-2">شاهد موجود در گزارش</div><p className="text-sm text-gray-600 leading-7">{d.evidence}</p></div>
              <div className="border-t border-gray-100 pt-4"><div className="text-xs font-bold text-[#0057A8] mb-2">خروجی مورد انتظار</div><p className="text-sm font-semibold text-gray-700 leading-7">{d.outcome}</p></div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 rounded-3xl bg-gradient-to-l from-[#002B5C] to-[#0057A8] p-7 md:p-8 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div><div className="text-[#F5B400] font-bold text-xs mb-2">EXECUTIVE TAKEAWAY</div><h3 className="text-xl md:text-2xl font-bold mb-2">تمرکز مدیریتی باید از «تعداد فعالیت‌ها» به «نتیجه قابل تحقق» منتقل شود.</h3><p className="text-blue-100 text-sm leading-7">سه تصمیم بالا، نقطه اتصال میان تقاضا، ظرفیت، حاکمیت و تحقق ارزش در چرخه محصول هستند.</p></div>
        <div className="shrink-0 px-5 py-3 rounded-xl bg-[#F5B400] text-[#002B5C] font-black text-sm">Decision → Execution → Value</div>
      </div>
    </motion.div>
  );
};

const OutlookSection = () => {
  const { data } = usePresentation();
  const pillars = data.outlookPillars;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-10 text-center">
        <div className="text-[#F5B400] font-bold text-sm mb-2">STRATEGIC VISION 1405–1406</div>
        <h2 className={`text-[#002B5C] ${typography.h2} mb-3`}>جهت‌گیری مدیریت محصول</h2>
      </div>

      <div className="bg-gradient-to-br from-[#002B5C] via-[#0057A8] to-[#002B5C] rounded-3xl p-8 md:p-12 mb-10 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-40 translate-x-40"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F5B400]/10 rounded-full translate-y-32 -translate-x-32"></div>
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold text-[#F5B400] mb-6 border border-white/20">
            <Target className="w-4 h-4" />
            چشم‌انداز راهبردی
          </div>
          <h3 className="text-2xl md:text-4xl font-black mb-5 leading-tight">
            حرکت از «پرداخت» به «پلتفرم خدمات مالی و کسب‌وکار»
          </h3>
          <p className="text-lg md:text-xl leading-9 text-blue-50/90 max-w-4xl">
            تبدیل سداد از یک ارائه‌دهنده زیرساخت‌های پرداخت به <span className="text-[#F5B400] font-bold">یک پلتفرم یکپارچه، داده‌محور و نوآور در خدمات مالی و کسب‌وکار</span>؛ پلتفرمی که با تکیه بر زیرساخت پرداخت، اعتبار، داده و فناوری، بتواند نیازهای مشتریان و کسب‌وکارها را از مرحله پذیرش و پرداخت تا تأمین مالی و خدمات ارزش‌افزوده پوشش دهد.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {pillars.map((pillar, i) => {
          const Icon = pillar.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white rounded-2xl border border-gray-100 p-7 shadow-sm hover:shadow-xl transition-shadow relative overflow-hidden group"
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${pillar.color} opacity-5 rounded-bl-full transition-opacity group-hover:opacity-10`}></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${pillar.color} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-4xl font-black text-gray-100">{pillar.num}</span>
                </div>
                <h3 className="text-xl font-bold text-[#002B5C] mb-4 leading-8">{pillar.title}</h3>
                <ul className="space-y-3">
                  {pillar.items.map((item, idx) => (
                    <li key={idx} className="flex gap-3 text-sm leading-7 text-gray-600">
                      <div className={`mt-2 w-1.5 h-1.5 rounded-full bg-gradient-to-br ${pillar.color} flex-shrink-0`}></div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          );
        })}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 5 * 0.08 }}
          className="md:col-span-2 lg:col-span-1 bg-gradient-to-br from-[#002B5C] to-[#0057A8] rounded-2xl p-7 shadow-lg relative overflow-hidden flex flex-col justify-center"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#F5B400]/15 rounded-full -translate-y-20 translate-x-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 -translate-x-16"></div>
          <div className="relative z-10">
            <Flag className="w-10 h-10 text-[#F5B400] mb-5" />
            <h3 className="text-2xl font-black text-white mb-4 leading-8">مقصد نهایی</h3>
            <p className="text-blue-50 leading-8 text-sm">
              سداد؛ از یک شرکت پرداخت به یک <span className="text-[#F5B400] font-bold">پلتفرم هوشمند خدمات مالی و کسب‌وکار</span>، با محوریت پرداخت، اعتبار، داده و فناوری.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const PortfolioSection = ({ onNavigate }) => {
  const { data } = usePresentation();
  const PORTFOLIO_DATA = data.portfolio;
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 md:p-10 max-w-7xl mx-auto"
    >
      <div className="mb-10 text-center">
        <h2 className={`text-[#002B5C] ${typography.h2} mb-4`}>پرتفوی محصولات سداد</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">نمایی یکپارچه از اکوسیستم محصولات در چهار دسته‌بندی اصلی</p>
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
                  <span className="block text-3xl font-bold text-[#002B5C]">{persianNumber(category.count)}</span>
                  <span className="text-sm text-gray-500">محصول</span>
                </div>
              </div>
              
              <h3 className={`text-[#002B5C] ${typography.h3} mb-2`}>{category.title}</h3>
              <div className="flex items-center gap-2 text-sm font-medium text-[#0057A8] mt-4">
                مشاهده محصولات <ChevronLeft className="w-4 h-4" />
              </div>
            </motion.button>
          )
        })}
      </div>
    </motion.div>
  );
};

const CategoryDetailView = ({ categoryKey, onBack, onSelectProduct }) => {
  const { data } = usePresentation();
  const category = data.portfolio[categoryKey];

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
            <h2 className={`text-[#002B5C] ${typography.h2}`}>{category.title}</h2>
          </div>
          <p className="text-gray-500">فهرست محصولات این دسته‌بندی</p>
        </div>
        <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <span className="text-gray-500 text-sm ml-2">تعداد کل:</span>
          <span className="font-bold text-[#002B5C] text-lg">{persianNumber(category.count)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {category.products.map((product, idx) => (
          <motion.div
            key={product.id || idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelectProduct(product)}
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 cursor-pointer transition-all flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-bold text-[#002B5C] text-lg english-font tracking-wide" dir="ltr">{product.name}</h4>
              <StatusBadge status={product.status} />
            </div>
            <div className="mt-auto pt-4 flex justify-between items-end border-t border-gray-50">
               <NatureBadge nature={product.nature} />
               <ChevronLeft className="w-5 h-5 text-gray-300" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

const ProductDetailView = ({ categoryKey, productId, onBack }) => {
  const { data } = usePresentation();
  const category = data.portfolio[categoryKey];
  const product = category?.products?.find(
    (p) => String(p.id) === String(productId) || p.name === productId
  );

  if (!category || !product) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 text-center text-gray-500">
        محصول یافت نشد.
        <div className="mt-4">
          <button onClick={onBack} className="text-[#0057A8] font-semibold">بازگشت</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="p-6 md:p-10 max-w-3xl mx-auto"
    >
      <div className="mb-8">
        <span className="text-xs font-semibold text-gray-500 mb-2 block">{category.title}</span>
        <h2 className={`text-[#002B5C] ${typography.h2} english-font tracking-wide mb-3`} dir="ltr">{product.name}</h2>
        <p className="text-gray-500 text-sm">جزئیات محصول</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-5">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <span className="text-sm text-gray-500 block mb-1">وضعیت فعلی</span>
          <StatusBadge status={product.status} />
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <span className="text-sm text-gray-500 block mb-1">شاخص کلیدی عملکرد (KPI)</span>
          <p className="font-semibold text-gray-800">{product.kpi}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <span className="text-sm text-gray-500 block mb-1">ماهیت محصول</span>
          <NatureBadge nature={product.nature} />
        </div>

        {product.description ? (
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <span className="text-sm text-gray-500 block mb-2">توضیحات</span>
            <p className="text-gray-700 leading-8 text-sm whitespace-pre-wrap">{product.description}</p>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
};

const PDISection = () => {
  const { data } = usePresentation();
  const PDI_DATA = data.pdi || [];
  const pdiTotal = PDI_DATA.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const doneClosed = PDI_DATA.filter((i) => /done|closed|انجام|بسته/i.test(i.name || ''))
    .reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const inProgress = PDI_DATA.filter((i) => /progress|در حال انجام|فعال/i.test(i.name || ''))
    .reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const donePct = pdiTotal ? Math.round((doneClosed / pdiTotal) * 1000) / 10 : 0;
  const progressPct = pdiTotal ? Math.round((inProgress / pdiTotal) * 1000) / 10 : 0;
  const chartKey = PDI_DATA.map((i) => `${i.name}:${i.value}`).join('|');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-7xl mx-auto h-full"
    >
      <div className="mb-8">
        <h2 className={`text-[#002B5C] ${typography.h2} mb-2`}>درخواست‌ها و PDI</h2>
        <p className="text-gray-500">تصویری از حجم و وضعیت درخواست‌های ورودی</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-[#002B5C] to-[#0057A8] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                <Inbox className="w-48 h-48 -mr-10 -mt-10" />
             </div>
             <h3 className="text-blue-100 font-medium mb-2 text-lg">کل درخواست‌های ثبت شده</h3>
             <div className={`${typography.numberLg} text-[#F5B400] mb-4`}>{formatNumber(pdiTotal)}</div>
             <div className="space-y-2 mt-6">
               <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                 <span className="text-sm">نرخ تکمیل / بسته‌شده</span>
                 <span className="font-bold">~{persianNumber(donePct)}٪</span>
               </div>
               <div className="flex justify-between items-center bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/10">
                 <span className="text-sm">در حال انجام / فعال</span>
                 <span className="font-bold">~{persianNumber(progressPct)}٪</span>
               </div>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-[#002B5C] mb-6">توزیع وضعیت درخواست‌ها</h3>
          <div className="flex-1 min-h-[400px] flex flex-col md:flex-row items-center">
            
            <div className="w-full md:w-1/2 h-64 md:h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart key={chartKey}>
                  <Pie
                    data={PDI_DATA}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                    isAnimationActive={true}
                  >
                    {PDI_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => [formatNumber(value), 'تعداد']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'Vazirmatn, Tahoma, sans-serif' }}
                    itemStyle={{ textAlign: 'right', fontFamily: 'Vazirmatn, Tahoma, sans-serif' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                <span className="text-gray-400 text-sm">تعداد کل</span>
                <span className="text-2xl font-bold text-[#002B5C]">{formatNumber(pdiTotal)}</span>
              </div>
            </div>

            <div className="w-full md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 mt-6 md:mt-0 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {PDI_DATA.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm text-gray-700 truncate max-w-[120px]" title={item.name}>{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{formatNumber(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CommitteesSection = () => {
  const { data } = usePresentation();
  const COMMITTEES_DATA = data.committees;
  if (!COMMITTEES_DATA.length) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 text-center text-gray-500">
        داده‌ای برای کمیته‌ها ثبت نشده است.
      </motion.div>
    );
  }
  const maxHours = Math.max(...COMMITTEES_DATA.map((d) => d.hours));
  const current = COMMITTEES_DATA[COMMITTEES_DATA.length - 1];
  const currentRate = Math.round((current.completed / current.approvals) * 100);

  const statusLegend = [
    { key: 'completed', label: 'انجام‌شده', color: 'bg-emerald-500' },
    { key: 'inProgress', label: 'در دست اقدام', color: 'bg-[#0057A8]' },
    { key: 'notCompleted', label: 'انجام‌نشده', color: 'bg-rose-400' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-7xl mx-auto"
    >
      <div className="mb-8">
        <div className="text-[#F5B400] font-bold text-sm mb-2">GOVERNANCE</div>
        <h2 className={`text-[#002B5C] ${typography.h2} mb-2`}>عملکرد کمیته‌های محصول</h2>
        <p className="text-gray-500">روند تصمیم‌گیری، حجم مصوبات و میزان اجرای آن‌ها در سه دوره</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'مصوبات دوره جاری', value: formatNumber(current.approvals), note: current.year },
          { label: 'نرخ تکمیل', value: `${persianNumber(currentRate)}٪`, note: `${formatNumber(current.completed)} اجراشده` },
          { label: 'در جریان', value: formatNumber(current.inProgress), note: 'نیازمند پیگیری' },
          { label: 'نفرساعت دوره جاری', value: formatNumber(current.hours), note: 'بر اساس جلسات برگزارشده' },
        ].map((kpi, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="text-3xl font-bold text-[#002B5C] mb-2">{kpi.value}</div>
            <div className="font-bold text-gray-800 text-sm">{kpi.label}</div>
            <div className="text-xs text-gray-400 mt-1">{kpi.note}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-5 text-xs text-gray-500">
        {statusLegend.map((item) => (
          <div key={item.key} className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
        {COMMITTEES_DATA.map((yearData, idx) => {
          const rate = Math.round((yearData.completed / yearData.approvals) * 100);
          const isLatest = idx === COMMITTEES_DATA.length - 1;
          const completedPct = (yearData.completed / yearData.approvals) * 100;
          const inProgressPct = (yearData.inProgress / yearData.approvals) * 100;
          const notCompletedPct = (yearData.notCompleted / yearData.approvals) * 100;
          const hoursPct = Math.max((yearData.hours / maxHours) * 100, 8);

          return (
            <div
              key={idx}
              className={`relative bg-white rounded-2xl border p-6 shadow-sm overflow-hidden ${
                isLatest ? 'border-[#F5B400]/60 ring-1 ring-[#F5B400]/20' : 'border-gray-100'
              }`}
            >
              {isLatest && (
                <div className="absolute top-4 left-4 bg-[#F5B400] text-[#002B5C] text-[11px] font-bold px-2.5 py-1 rounded-md">
                  دوره جاری
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-[#002B5C] mb-1">{yearData.year}</h3>
                <p className="text-xs text-gray-400">وضعیت اجرای مصوبات کمیته</p>
              </div>

              <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                  <div className="text-xs text-gray-400 mb-1">نرخ تکمیل</div>
                  <div className={`text-4xl font-bold ${rate >= 70 ? 'text-emerald-600' : rate >= 50 ? 'text-[#0057A8]' : 'text-amber-600'}`}>
                    {persianNumber(rate)}٪
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-xs text-gray-400 mb-1">کل مصوبات</div>
                  <div className="text-2xl font-bold text-[#002B5C]">{formatNumber(yearData.approvals)}</div>
                </div>
              </div>

              <div className="mb-5">
                <div className="flex h-3 rounded-full overflow-hidden bg-gray-100">
                  <div className="bg-emerald-500 transition-all" style={{ width: `${completedPct}%` }} />
                  <div className="bg-[#0057A8] transition-all" style={{ width: `${inProgressPct}%` }} />
                  <div className="bg-rose-400 transition-all" style={{ width: `${notCompletedPct}%` }} />
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { label: 'انجام‌شده', value: yearData.completed, color: 'text-emerald-600' },
                  { label: 'در دست اقدام', value: yearData.inProgress, color: 'text-[#0057A8]' },
                  { label: 'انجام‌نشده', value: yearData.notCompleted, color: 'text-rose-500' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{row.label}</span>
                    <span className={`font-bold ${row.color}`}>{formatNumber(row.value)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    نفرساعت
                  </span>
                  <span className="font-bold text-[#002B5C]">{formatNumber(yearData.hours)}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-l from-[#F5B400] to-[#FFE3A0]"
                    style={{ width: `${hoursPct}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
        {(data.committeeInsights || []).map((card, idx) => {
          const Icon = card.icon || Target;
          return (
            <motion.div
              key={card.id || idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-white rounded-2xl border border-gray-100 p-6 md:p-7 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-[#F5B400] to-[#0057A8]" />
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#002B5C] text-[#F5B400] flex items-center justify-center shrink-0 shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#002B5C] mb-3 leading-8">{card.title}</h3>
                  <p className="text-sm text-gray-600 leading-7">{card.text}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

const BacklogSection = () => {
  const { data } = usePresentation();
  const BACKLOG_DATA = data.backlog;
  const summary = data.backlogSummary || { total: 0, rate: 0 };
  const insights = data.backlogInsights || [];
  const toneStyles = {
    emerald: { wrap: 'bg-emerald-50 border-emerald-100', title: 'text-emerald-900', text: 'text-emerald-700', icon: 'text-emerald-600' },
    amber: { wrap: 'bg-amber-50 border-amber-100', title: 'text-amber-900', text: 'text-amber-700', icon: 'text-amber-600' },
    red: { wrap: 'bg-red-50 border-red-100', title: 'text-red-900', text: 'text-red-700', icon: 'text-red-600' },
  };
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-7xl mx-auto"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8">
        <div>
          <h2 className={`text-[#002B5C] ${typography.h2} mb-2`}>وضعیت بک‌لاگ محصولات</h2>
          <p className="text-gray-500">تصویری از حجم کار و پیشرفت اجرای محصولات در سامانه‌های مختلف</p>
        </div>
        
        <div className="flex gap-4 mt-4 md:mt-0">
          <div className="bg-white px-5 py-3 rounded-xl border border-gray-200 shadow-sm text-center">
            <span className="text-gray-500 text-xs block mb-1">کل تسک‌ها</span>
            <span className="font-bold text-[#002B5C] text-2xl">{formatNumber(summary.total)}</span>
          </div>
          <div className="bg-[#002B5C] px-5 py-3 rounded-xl shadow-sm text-center">
            <span className="text-blue-200 text-xs block mb-1">نرخ تکمیل کل</span>
            <span className="font-bold text-[#F5B400] text-2xl">{persianNumber(summary.rate)}٪</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 overflow-hidden">
        <h3 className="text-lg font-bold text-[#002B5C] mb-6">وضعیت تسک‌ها به تفکیک محصول / سامانه</h3>
        
        <div className="h-[500px] w-full" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={BACKLOG_DATA}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: '#4B5563', fontSize: 12, fontWeight: 600 }}
                width={110}
              />
              <RechartsTooltip 
                cursor={{fill: '#F3F4F6'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontFamily: 'Vazirmatn, Tahoma, sans-serif' }}
                itemStyle={{ textAlign: 'left' }}
                labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              
              <Bar dataKey="completed" name="Completed" stackId="a" fill="#10B981" radius={[0, 0, 0, 4]} barSize={24} />
              <Bar dataKey="inProgress" name="In Progress" stackId="a" fill="#3B82F6" />
              <Bar dataKey="unstarted" name="Unstarted" stackId="a" fill="#F59E0B" />
              <Bar dataKey="canceled" name="Canceled" stackId="a" fill="#EF4444" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {insights.map((card, idx) => {
          const tone = toneStyles[card.tone] || toneStyles.emerald;
          const Icon = card.icon || CheckCircle;
          return (
            <div key={card.id || idx} className={`${tone.wrap} p-4 rounded-xl border flex items-start gap-3`}>
              <Icon className={`w-5 h-5 ${tone.icon} mt-0.5 shrink-0`} />
              <div>
                <h4 className={`font-bold ${tone.title} text-sm`}>{card.title}</h4>
                <p className={`${tone.text} text-sm mt-1 leading-7`}>{card.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

const AlertCircleIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const InitiativesSection = () => {
  const { data } = usePresentation();
  const impactCards = data.strategicImpacts || [];
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-7xl mx-auto"
    >
      <div className="mb-12 text-center">
        <div className="text-[#F5B400] font-bold text-sm mb-2">STRATEGIC AGENDA</div>
        <h2 className={`text-[#002B5C] ${typography.h2} mb-4`}>مهم‌ترین اقدامات در دست انجام</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">اثر کسب‌وکاری مسیر محصول، از درآمد و رشد تا بهره‌وری و آینده پلتفرم</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {impactCards.map((card, idx) => {
          const Icon = card.icon || TrendingUp;
          return (
            <motion.div
              key={card.id || card.title}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="group bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-lg hover:border-[#0057A8]/25 transition-all relative overflow-hidden min-h-[220px] flex flex-col"
            >
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-l from-[#F5B400] via-[#0057A8] to-[#002B5C] opacity-80" />
              <div className="absolute -left-3 -bottom-3 text-7xl font-black text-gray-50 group-hover:text-blue-50/80 transition-colors pointer-events-none" dir="ltr">
                0{idx + 1}
              </div>
              <div className="w-12 h-12 rounded-xl bg-[#002B5C] text-[#F5B400] flex items-center justify-center mb-5 shadow-sm group-hover:bg-[#0057A8] transition-colors relative z-10">
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-[#F5B400] font-bold text-[11px] tracking-wide mb-2 relative z-10">BUSINESS IMPACT</div>
              <h3 className="text-xl font-extrabold text-[#002B5C] mb-3 relative z-10 leading-8">{card.title}</h3>
              <p className="text-sm text-gray-600 leading-7 relative z-10 mt-auto">{card.text}</p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

const ProcessSection = () => {
  const { data } = usePresentation();
  const tracks = data.processTracks?.length ? data.processTracks : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 md:p-10 max-w-7xl mx-auto h-full flex flex-col"
    >
      <div className="mb-8">
        <h2 className={`text-[#002B5C] ${typography.h2} mb-2`}>حاکمیت چرخه محصول و تحقق ارزش</h2>
        <p className="text-gray-500">مسیر یکپارچه تبدیل نیاز و ایده به محصول قابل ارائه (خلاصه مدیریتی)</p>
      </div>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto custom-scrollbar p-6 relative">
        <div className="min-w-[900px] h-full flex flex-col justify-around py-4">
          {tracks.map((track, tIdx) => (
          <div key={track.id || tIdx} className={`relative ${tIdx < tracks.length - 1 ? 'mb-12' : ''}`}>
             <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F5B400] text-white flex items-center justify-center font-bold text-sm shadow-md z-10">{track.num}</div>
             <div className="ml-8 bg-gray-50 rounded-xl border border-gray-200 p-4 relative">
                <h3 className="absolute -top-3 right-6 bg-white px-3 text-sm font-bold text-[#002B5C] border border-gray-200 rounded-full">{track.title}</h3>
                <div className="flex items-center justify-between mt-4">
                  {(track.steps || []).map((step, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <ProcessStep icon={step.icon} title={step.title} desc={step.description} color={step.color} />
                      {sIdx < (track.steps.length - 1) && <ProcessArrow />}
                    </React.Fragment>
                  ))}
                </div>
             </div>
          </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

const ProcessStep = ({ icon: Icon, title, desc, color }) => {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-700 border-blue-200',
    navy: 'bg-indigo-100 text-[#002B5C] border-indigo-200',
    indigo: 'bg-violet-100 text-violet-700 border-violet-200',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-100 text-amber-700 border-amber-200',
    red: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="flex flex-col items-center text-center w-40 z-10 relative group">
      <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 mb-3 bg-white shadow-sm transition-transform group-hover:scale-110 ${colorMap[color]}`}>
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
  const { data } = usePresentation();
  const MAIN_MENU_ITEMS = data.menuItems;
  const ALL_MENU_ITEMS = data.allMenuItems || data.menuItems;
  const PORTFOLIO_DATA = data.portfolio;
  const [currentView, setCurrentView] = useState('cover'); // 'cover', 'menu', or specific section paths
  const [breadcrumbs, setBreadcrumbs] = useState([{ label: 'خانه', path: 'menu' }]);

  // Handle Navigation
  const navigateTo = (path) => {
    setCurrentView(path);
    
    // Build breadcrumbs based on path
    const newBreadcrumbs = [{ label: 'خانه', path: 'menu' }];
    
    if (path === 'menu') {
      // Just home
    } else if (path.startsWith('portfolio/')) {
      newBreadcrumbs.push({ label: 'پرتفوی محصولات', path: 'portfolio' });
      const parts = path.split('/');
      const categoryKey = parts[1];
      if (PORTFOLIO_DATA[categoryKey]) {
        const catPath = `portfolio/${categoryKey}`;
        if (parts[2]) {
          newBreadcrumbs.push({ label: PORTFOLIO_DATA[categoryKey].title, path: catPath });
          const product = PORTFOLIO_DATA[categoryKey].products?.find(
            (p) => String(p.id) === String(parts[2]) || p.name === parts[2]
          );
          newBreadcrumbs.push({ label: product?.name || 'جزئیات محصول', path: null });
        } else {
          newBreadcrumbs.push({ label: PORTFOLIO_DATA[categoryKey].title, path: null });
        }
      }
    } else {
      const menuItem = ALL_MENU_ITEMS.find(item => item.id === path);
      if (menuItem) {
        newBreadcrumbs.push({ label: menuItem.title, path: null });
      } else if (path === 'initiatives') {
        newBreadcrumbs.push({ label: 'دستورکار راهبردی', path: null });
      }
    }
    setBreadcrumbs(newBreadcrumbs);
  };

  const handleHome = () => navigateTo('menu');

  // Render appropriate view based on state
  const renderView = () => {
    if (currentView.startsWith('portfolio/') && currentView.split('/').length >= 3) {
      const [, categoryKey, productId] = currentView.split('/');
      return (
        <ProductDetailView
          key={currentView}
          categoryKey={categoryKey}
          productId={decodeURIComponent(productId)}
          onBack={() => navigateTo(`portfolio/${categoryKey}`)}
        />
      );
    }

    switch (currentView) {
      case 'menu':
        return (
          <motion.div 
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="board-menu p-6 md:p-10 max-w-7xl mx-auto min-h-screen flex flex-col justify-center"
          >
            <div className="mb-12 text-center board-menu-heading">
              <div className="board-kicker">PRODUCT MANAGEMENT • EXECUTIVE VIEW</div>
              <h2 className={`text-[#002B5C] ${typography.h1} mb-4`}>{data.settings?.menu_heading || 'داشبورد مدیریتی معاونت نوآوری و توسعه محصول'}</h2>
              <p className="text-gray-600 text-lg">{data.settings?.menu_subtitle || 'لطفاً برای مشاهده جزئیات، بخش مورد نظر را انتخاب کنید'}</p>
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
                    <span className="board-number text-gray-300 font-bold text-2xl" dir="ltr">0{idx + 1}</span>
                  </div>
                  
                  <h3 className={`text-[#002B5C] ${typography.h3} mb-2 line-clamp-1`}>{item.title}</h3>
                  <p className="text-gray-500 text-sm mb-6 flex-1">{item.desc}</p>
                  
                  <div className="mt-auto flex items-center justify-between border-t border-gray-50 pt-4">
                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{item.preview}</span>
                    <ChevronLeft className="w-5 h-5 text-[#0057A8]" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        );
      case 'executive':
        return <ExecutiveSummarySection key="executive" onNavigate={navigateTo} />;
      case 'attention':
        return <ManagementAttentionSection key="attention" />;
      case 'outlook':
        return <OutlookSection key="outlook" />;
      case 'portfolio':
        return <PortfolioSection key="portfolio" onNavigate={navigateTo} />;
      case 'portfolio/payment':
      case 'portfolio/digital':
      case 'portfolio/acceptance':
      case 'portfolio/valueAdded':
        return (
          <CategoryDetailView
            key={currentView}
            categoryKey={currentView.split('/')[1]}
            onBack={() => navigateTo('portfolio')}
            onSelectProduct={(product) =>
              navigateTo(`portfolio/${currentView.split('/')[1]}/${product.id ?? encodeURIComponent(product.name)}`)
            }
          />
        );
      case 'pdi':
        return <PDISection key="pdi" />;
      case 'committees':
        return <CommitteesSection key="committees" />;
      case 'backlog':
        return <BacklogSection key="backlog" />;
      case 'initiatives':
        return <InitiativesSection key="initiatives" />;
      case 'process':
        return <ProcessSection key="process" />;
      default:
        return null;
    }
  };

  return (
    <div className="executive-app min-h-screen bg-[#F5F7FA] text-right" dir="rtl" style={{ fontFamily: 'Vazirmatn, Tahoma, sans-serif' }}>
      {/* Import Font */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800;900&display=swap');
        .executive-app, .executive-app button, .executive-app input, .executive-app select, .executive-app textarea {
          font-family: Vazirmatn, Tahoma, sans-serif !important;
        }
        .executive-app .english-font { font-family: Vazirmatn, Tahoma, sans-serif !important; letter-spacing: 0.02em; }
        .executive-app .recharts-wrapper, .executive-app .recharts-surface, .executive-app .recharts-text,
        .executive-app .recharts-cartesian-axis-tick-value, .executive-app .recharts-legend-item-text {
          font-family: Vazirmatn, Tahoma, sans-serif !important;
        }
        .clip-trapezoid { clip-path: polygon(5% 0, 95% 0, 100% 100%, 0% 100%); }
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
      `}} />

      <AnimatePresence mode="wait">
        {currentView === 'cover' ? (
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
               <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                 <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                   <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#FFFFFF" strokeWidth="0.5"/>
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
                
                <div className="board-cover-kicker">{data.settings?.cover_kicker || 'SADAD • PRODUCT MANAGEMENT'}</div>
                <h1 className={`${typography.h1} text-white mb-6 leading-tight drop-shadow-lg`}>
                  {data.settings?.cover_title || 'نمای کلی عملکرد و چشم‌انداز مدیریت محصول'}
                </h1>
                
                <p className="text-xl md:text-2xl text-blue-200 mb-12 font-light max-w-3xl mx-auto">
                  {data.settings?.cover_subtitle || 'نمایی یکپارچه از پرتفوی محصولات، عملکرد و مسیر پیش‌رو'}
                </p>
                
                <button 
                  onClick={() => navigateTo('menu')}
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
              <div className="board-cover-meta"><span>معاونت توسعه و نوآوری محصول</span><span>۱۴۰۵ — ۱۴۰۶</span></div>
            </motion.div>
          </motion.div>
        ) : (
          /* Application Layout */
          <div className="min-h-screen flex flex-col relative" key="app">
            <Header breadcrumbs={breadcrumbs} onNavigate={navigateTo} onHome={handleHome} />
            
            <main className="flex-1 relative pb-20">
              <AnimatePresence mode="wait">
                {renderView()}
              </AnimatePresence>
            </main>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}