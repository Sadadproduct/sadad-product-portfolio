import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../data/api.js';
import { Badge, PageHeader, Spinner, useToast } from '../components/ui.jsx';
// paths ok

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const { show, node } = useToast();

  useEffect(() => {
    api
      .get('/api/admin/dashboard')
      .then(setData)
      .catch((e) => {
        setError(e.message);
        show(e.message, 'error');
      });
  }, []);

  if (!data && !error) return <Spinner />;

  const cards = [
    { label: 'دسته‌ها', value: data?.counts.categories, to: '/admin/categories' },
    { label: 'محصولات', value: data?.counts.products, to: '/admin/products' },
    { label: 'فعال', value: data?.counts.productsActive, to: '/admin/products' },
    { label: 'PDI', value: data?.counts.pdi, to: '/admin/pdi' },
    { label: 'کمیته‌ها', value: data?.counts.committees, to: '/admin/committees' },
    { label: 'بک‌لاگ', value: data?.counts.backlog, to: '/admin/backlog' },
    { label: 'دستور کار راهبردی', value: data?.counts.initiatives, to: '/admin/strategic' },
    { label: 'کارت‌های Home', value: data?.counts.homeMenu, to: '/admin/home-menu' },
    { label: 'محتوای مدیریتی', value: data?.counts.attention || 0, to: '/admin/editorial' },
  ];

  return (
    <div>
      {node}
      <PageHeader title="داشبورد" subtitle="وضعیت کلی داده‌ها و آخرین تغییرات" />
      {data?.validation && (
        <div
          className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
            data.validation.ok
              ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
              : 'bg-amber-50 border-amber-100 text-amber-900'
          }`}
        >
          {data.validation.ok
            ? 'اعتبارسنجی مهاجرت داده: همه مقادیر کلیدی با seed اولیه مطابقت دارند.'
            : `اختلاف با seed اولیه: ${JSON.stringify(data.validation.mismatches)}`}
        </div>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition">
            <div className="text-3xl font-bold text-slate-900 mb-1">{c.value ?? '—'}</div>
            <div className="text-sm text-slate-500">{c.label}</div>
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 font-bold">آخرین فعالیت‌ها</div>
        <div className="divide-y divide-slate-100">
          {(data?.recent || []).length === 0 && <div className="p-6 text-sm text-slate-500">هنوز لاگی ثبت نشده است.</div>}
          {(data?.recent || []).map((row) => (
            <div key={row.id} className="px-5 py-3 flex items-center justify-between gap-4 text-sm">
              <div>
                <div className="font-semibold text-slate-800">
                  {row.action} · {row.entity}
                  {row.entity_id ? ` #${row.entity_id}` : ''}
                </div>
                <div className="text-slate-400 text-xs mt-0.5">{row.user_email || 'system'}</div>
              </div>
              <Badge>{row.created_at}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
