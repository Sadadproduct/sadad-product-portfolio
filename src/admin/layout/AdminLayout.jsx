import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { Button } from '../components/ui.jsx';

const NAV = [
  { to: '/admin', end: true, label: 'داشبورد' },
  { to: '/admin/categories', label: 'دسته‌های پرتفوی' },
  { to: '/admin/products', label: 'محصولات' },
  { to: '/admin/pdi', label: 'PDI' },
  { to: '/admin/committees', label: 'کمیته‌ها' },
  { to: '/admin/backlog', label: 'بک‌لاگ' },
  { to: '/admin/strategic', label: 'دستور کار راهبردی' },
  { to: '/admin/process', label: 'Process' },
  { to: '/admin/editorial', label: 'محتوای مدیریتی' },
  { to: '/admin/home-menu', label: 'کارت‌های Home' },
  { to: '/admin/users', label: 'کاربران', adminOnly: true },
  { to: '/admin/audit', label: 'Audit Log' },
  { to: '/admin/preview', label: 'پیش‌نمایش' },
  { to: '/admin/settings', label: 'تنظیمات' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const links = NAV.filter((item) => !item.adminOnly || user?.role === 'admin');

  return (
    <div className="admin-shell min-h-screen bg-slate-100 text-slate-900" dir="rtl" style={{ fontFamily: 'Vazirmatn, Tahoma, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');
        .admin-shell, .admin-shell button, .admin-shell input, .admin-shell select, .admin-shell textarea, .admin-shell table {
          font-family: Vazirmatn, Tahoma, sans-serif !important;
        }
      `}</style>
      <div className="flex min-h-screen">
        <aside className="w-64 shrink-0 bg-slate-950 text-slate-100 flex flex-col">
          <div className="px-5 py-6 border-b border-white/10">
            <div className="text-xs text-amber-400 font-bold tracking-wider mb-1">SADAD ADMIN</div>
            <div className="font-bold text-lg">Back Office</div>
            <div className="text-xs text-slate-400 mt-1">مدیریت داده‌های ارائه</div>
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {links.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    isActive ? 'bg-white text-slate-900' : 'text-slate-300 hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-white/10 space-y-3">
            <div className="text-xs text-slate-400">
              <div className="text-slate-200 font-semibold">{user?.name}</div>
              <div>{user?.email}</div>
              <div className="mt-1 uppercase tracking-wide text-amber-400/90">{user?.role}</div>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={async () => {
                await logout();
                navigate('/admin/login');
              }}
            >
              خروج
            </Button>
            <a href="/" className="block text-center text-xs text-slate-400 hover:text-white">
              ← بازگشت به Presentation
            </a>
          </div>
        </aside>
        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
