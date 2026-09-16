import React, { useCallback, useEffect, useState } from 'react';

export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    if (!message) return undefined;
    const t = setTimeout(onClose, 3200);
    return () => clearTimeout(t);
  }, [message, onClose]);
  if (!message) return null;
  const colors =
    type === 'error'
      ? 'bg-rose-600'
      : type === 'info'
        ? 'bg-slate-700'
        : 'bg-emerald-600';
  return (
    <div className={`fixed bottom-6 left-6 z-[100] text-white px-4 py-3 rounded-xl shadow-lg text-sm ${colors}`}>
      {message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const show = useCallback((message, type = 'success') => setToast({ message, type }), []);
  const clear = useCallback(() => setToast({ message: '', type: 'success' }), []);
  const node = <Toast message={toast.message} type={toast.type} onClose={clear} />;
  return { show, node };
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const styles = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800',
    secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50',
    danger: 'bg-rose-600 text-white hover:bg-rose-500',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
  };
  return (
    <button
      className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition disabled:opacity-50 ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({ label, className = '', type, onWheel, ...props }) {
  return (
    <label className="block text-sm">
      {label && <span className="block text-slate-600 mb-1.5 font-medium">{label}</span>}
      <input
        type={type}
        className={`w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 ${className}`}
        onWheel={(e) => {
          if (type === 'number') e.currentTarget.blur();
          onWheel?.(e);
        }}
        {...props}
      />
    </label>
  );
}

export function Select({ label, children, className = '', ...props }) {
  return (
    <label className="block text-sm">
      {label && <span className="block text-slate-600 mb-1.5 font-medium">{label}</span>}
      <select
        className={`w-full rounded-lg border border-slate-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-300 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function Textarea({ label, className = '', ...props }) {
  return (
    <label className="block text-sm">
      {label && <span className="block text-slate-600 mb-1.5 font-medium">{label}</span>}
      <textarea
        className={`w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 min-h-[90px] ${className}`}
        {...props}
      />
    </label>
  );
}

export function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-xl leading-none">
            ×
          </button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ title = 'موردی یافت نشد', hint }) {
  return (
    <div className="text-center py-16 text-slate-500">
      <div className="font-semibold text-slate-700 mb-1">{title}</div>
      {hint && <div className="text-sm">{hint}</div>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center py-20">
      <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin" />
    </div>
  );
}

export function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    green: 'bg-emerald-50 text-emerald-700',
    red: 'bg-rose-50 text-rose-700',
    amber: 'bg-amber-50 text-amber-800',
  };
  return <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function confirmDelete(label = 'این مورد') {
  return window.confirm(`آیا از حذف ${label} مطمئن هستید؟ این عمل قابل بازگشت نیست.`);
}
