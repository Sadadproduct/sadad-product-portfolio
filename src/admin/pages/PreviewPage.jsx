import React from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Button } from '../components/ui.jsx';

export default function PreviewPage() {
  return (
    <div>
      <PageHeader
        title="پیش‌نمایش Draft"
        subtitle="نسخه شامل پیش‌نویس‌ها — Public تغییر نمی‌کند تا Publish شود"
        actions={
          <a href="/preview" target="_blank" rel="noreferrer">
            <Button>باز کردن پیش‌نمایش کامل</Button>
          </a>
        }
      />
      <div className="bg-white rounded-2xl border border-slate-200 p-6 text-sm text-slate-600 leading-7 space-y-3">
        <p>
          لینک <code className="bg-slate-100 px-1 rounded">/preview</code> همان UI عمومی را با داده‌های Draft
          (موارد <b>فعال</b> حتی اگر هنوز Publish نشده‌اند) نشان می‌دهد.
        </p>
        <p>مسیر <code className="bg-slate-100 px-1 rounded">/</code> فقط داده‌های Publish شده را می‌بیند.</p>
        <p>
          برای ورود به پیش‌نمایش باید Login باشید (cookie احراز هویت). اگر Session منقضی شده، ابتدا از{' '}
          <Link className="text-slate-900 font-semibold underline" to="/admin/login">
            صفحه ورود
          </Link>{' '}
          وارد شوید.
        </p>
      </div>
    </div>
  );
}
