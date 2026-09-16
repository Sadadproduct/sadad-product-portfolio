import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { Button, Input, useToast } from '../components/ui.jsx';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const { show, node } = useToast();
  const [email, setEmail] = useState('admin@sadad.local');
  const [password, setPassword] = useState('Admin@12345');
  const [busy, setBusy] = useState(false);

  if (!loading && user) return <Navigate to="/admin" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const emailValue = String(fd.get('email') || email).trim();
    const passwordValue = String(fd.get('password') || password);
    setBusy(true);
    try {
      await login(emailValue, passwordValue);
      show('ورود موفق');
      navigate('/admin', { replace: true });
    } catch (err) {
      show(err.message || 'خطا در ورود', 'error');
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6" dir="rtl" style={{ fontFamily: 'Vazirmatn, Tahoma, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800&display=swap');`}</style>
      {node}
      <form onSubmit={onSubmit} className="w-full max-w-md bg-white rounded-2xl p-8 shadow-2xl space-y-5">
        <div>
          <div className="text-xs font-bold text-amber-600 mb-2">SADAD • BACK OFFICE</div>
          <h1 className="text-2xl font-bold text-slate-900">ورود مدیران</h1>
          <p className="text-sm text-slate-500 mt-1">برای مدیریت داده‌های Portfolio وارد شوید</p>
        </div>
        <Input label="ایمیل" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <Input label="رمز عبور" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'در حال ورود…' : 'ورود'}
        </Button>
        <p className="text-xs text-slate-400 text-center">پیش‌فرض توسعه: admin@sadad.local / Admin@12345</p>
      </form>
    </div>
  );
}
