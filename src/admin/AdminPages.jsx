import React, { useEffect, useState } from 'react';
import ResourcePage, { ActiveBadge } from './pages/ResourcePage.jsx';
import { api } from '../data/api.js';
import { iconOptions } from '../data/iconRegistry.js';
import {
  Badge,
  Button,
  Input,
  Modal,
  PageHeader,
  Select,
  Spinner,
  Textarea,
  confirmDelete,
  useToast,
} from './components/ui.jsx';
import { useAuth } from './AuthContext.jsx';

const STATUSES = ['Live', 'In Analysis', 'In Develop', 'Pre Operation'];
const ICONS = iconOptions().map((k) => ({ value: k, label: k }));

export function CategoriesPage() {
  return (
    <ResourcePage
      title="دسته‌های پرتفوی"
      subtitle="حوزه‌های اصلی محصولات"
      endpoint="/api/admin/categories"
      newLabel="دسته جدید"
      searchPlaceholder="جستجوی عنوان یا slug"
      columns={[
        { key: 'title', label: 'عنوان' },
        { key: 'slug', label: 'Slug' },
        { key: 'icon_key', label: 'آیکون' },
        { key: 'sort_order', label: 'ترتیب' },
        { key: 'is_active', label: 'وضعیت', render: (r) => <ActiveBadge value={r.is_active} /> },
      ]}
      fields={[
        { name: 'title', label: 'عنوان' },
        { name: 'slug', label: 'Slug (انگلیسی)' },
        { name: 'icon_key', label: 'آیکون', type: 'select', options: ICONS },
        { name: 'sort_order', label: 'ترتیب', type: 'number' },
        { name: 'is_active', label: 'فعال', type: 'checkbox' },
        { name: 'is_published', label: 'منتشر شده', type: 'checkbox' },
      ]}
      toForm={(row) =>
        row
          ? {
              title: row.title,
              slug: row.slug,
              icon_key: row.icon_key,
              sort_order: row.sort_order,
              is_active: !!row.is_active,
              is_published: !!row.is_published,
            }
          : { title: '', slug: '', icon_key: 'Layers', sort_order: 0, is_active: true, is_published: true }
      }
      fromForm={(f) => ({
        title: f.title,
        slug: f.slug,
        icon_key: f.icon_key,
        sort_order: Number(f.sort_order || 0),
        is_active: f.is_active ? 1 : 0,
        is_published: f.is_published ? 1 : 0,
      })}
      validate={(f) => (!f.title || !f.slug ? 'عنوان و slug الزامی است' : null)}
    />
  );
}

export function ProductsPage() {
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    api.get('/api/admin/categories').then((r) => setCategories(r.items || []));
  }, []);
  const catOptions = categories.map((c) => ({ value: String(c.id), label: c.title }));
  const catMap = Object.fromEntries(categories.map((c) => [c.id, c.title]));

  return (
    <ResourcePage
      title="محصولات"
      subtitle="مدیریت جزئیات محصولات پرتفوی"
      endpoint="/api/admin/products"
      newLabel="محصول جدید"
      columns={[
        { key: 'name', label: 'نام' },
        { key: 'category_id', label: 'دسته', render: (r) => catMap[r.category_id] || r.category_id },
        { key: 'status', label: 'وضعیت' },
        { key: 'nature', label: 'ماهیت' },
        { key: 'kpi', label: 'KPI' },
        { key: 'is_active', label: 'فعال', render: (r) => <ActiveBadge value={r.is_active} /> },
      ]}
      fields={[
        { name: 'name', label: 'نام محصول' },
        { name: 'category_id', label: 'دسته', type: 'select', options: catOptions },
        { name: 'status', label: 'وضعیت', type: 'select', options: STATUSES.map((s) => ({ value: s, label: s })) },
        { name: 'nature', label: 'ماهیت' },
        { name: 'kpi', label: 'KPI' },
        { name: 'description', label: 'توضیحات', type: 'textarea' },
        { name: 'sort_order', label: 'ترتیب', type: 'number' },
        { name: 'is_active', label: 'فعال', type: 'checkbox' },
        { name: 'is_published', label: 'منتشر شده', type: 'checkbox' },
      ]}
      toForm={(row) =>
        row
          ? {
              name: row.name,
              category_id: String(row.category_id),
              status: row.status,
              nature: row.nature,
              kpi: row.kpi,
              description: row.description || '',
              sort_order: row.sort_order,
              is_active: !!row.is_active,
              is_published: !!row.is_published,
            }
          : {
              name: '',
              category_id: catOptions[0]?.value || '',
              status: 'Live',
              nature: '',
              kpi: '',
              description: '',
              sort_order: 0,
              is_active: true,
              is_published: true,
            }
      }
      fromForm={(f) => ({
        name: f.name,
        category_id: Number(f.category_id),
        status: f.status,
        nature: f.nature,
        kpi: f.kpi,
        description: f.description,
        sort_order: Number(f.sort_order || 0),
        is_active: f.is_active ? 1 : 0,
        is_published: f.is_published ? 1 : 0,
      })}
      validate={(f) => (!f.name || !f.category_id ? 'نام و دسته الزامی است' : null)}
    />
  );
}

export function PdiPage() {
  return (
    <ResourcePage
      title="PDI"
      subtitle="توزیع وضعیت درخواست‌ها"
      endpoint="/api/admin/pdi"
      newLabel="وضعیت جدید"
      columns={[
        {
          key: 'color',
          label: 'رنگ',
          render: (r) => <span className="inline-block w-4 h-4 rounded-full" style={{ background: r.color }} />,
        },
        { key: 'name', label: 'نام' },
        { key: 'value', label: 'تعداد' },
        { key: 'sort_order', label: 'ترتیب' },
        { key: 'is_active', label: 'فعال', render: (r) => <ActiveBadge value={r.is_active} /> },
      ]}
      fields={[
        { name: 'name', label: 'نام' },
        { name: 'value', label: 'تعداد', type: 'number' },
        { name: 'color', label: 'رنگ (#hex)' },
        { name: 'sort_order', label: 'ترتیب', type: 'number' },
        { name: 'is_active', label: 'فعال', type: 'checkbox' },
        { name: 'is_published', label: 'منتشر شده', type: 'checkbox' },
      ]}
      toForm={(row) =>
        row
          ? { ...row, is_active: !!row.is_active, is_published: !!row.is_published }
          : { name: '', value: 0, color: '#9CA3AF', sort_order: 0, is_active: true, is_published: true }
      }
      fromForm={(f) => ({
        name: f.name,
        value: Number(f.value || 0),
        color: f.color,
        sort_order: Number(f.sort_order || 0),
        is_active: f.is_active ? 1 : 0,
        is_published: f.is_published ? 1 : 0,
      })}
      validate={(f) => (!f.name ? 'نام الزامی است' : null)}
    />
  );
}

export function CommitteesPage() {
  return (
    <div className="space-y-8">
      <ResourcePage
        title="کمیته‌های محصول"
        subtitle="دوره‌ها و آمار مصوبات"
        endpoint="/api/admin/committees"
        newLabel="دوره جدید"
        columns={[
          { key: 'year_label', label: 'دوره' },
          { key: 'hours', label: 'نفرساعت' },
          { key: 'approvals', label: 'مصوبات' },
          { key: 'completed', label: 'انجام‌شده' },
          { key: 'in_progress', label: 'در جریان' },
          { key: 'not_completed', label: 'انجام‌نشده' },
          { key: 'is_active', label: 'فعال', render: (r) => <ActiveBadge value={r.is_active} /> },
        ]}
        fields={[
          { name: 'year_label', label: 'برچسب دوره' },
          { name: 'hours', label: 'نفرساعت', type: 'number' },
          { name: 'approvals', label: 'مصوبات', type: 'number' },
          { name: 'completed', label: 'انجام‌شده', type: 'number' },
          { name: 'in_progress', label: 'در جریان', type: 'number' },
          { name: 'not_completed', label: 'انجام‌نشده', type: 'number' },
          { name: 'sort_order', label: 'ترتیب', type: 'number' },
          { name: 'is_active', label: 'فعال', type: 'checkbox' },
          { name: 'is_published', label: 'منتشر شده', type: 'checkbox' },
        ]}
        toForm={(row) =>
          row
            ? { ...row, is_active: !!row.is_active, is_published: !!row.is_published }
            : {
                year_label: '',
                hours: 0,
                approvals: 0,
                completed: 0,
                in_progress: 0,
                not_completed: 0,
                sort_order: 0,
                is_active: true,
                is_published: true,
              }
        }
        fromForm={(f) => ({
          year_label: f.year_label,
          hours: Number(f.hours || 0),
          approvals: Number(f.approvals || 0),
          completed: Number(f.completed || 0),
          in_progress: Number(f.in_progress || 0),
          not_completed: Number(f.not_completed || 0),
          sort_order: Number(f.sort_order || 0),
          is_active: f.is_active ? 1 : 0,
          is_published: f.is_published ? 1 : 0,
        })}
        validate={(f) => (!f.year_label ? 'برچسب دوره الزامی است' : null)}
      />
      <MiniCrud
        title="کارت‌های بینش کمیته (تمرکز حاکمیت / نفرساعت)"
        endpoint="/api/admin/committee-insights"
        columns={[
          { key: 'title', label: 'عنوان' },
          { key: 'icon_key', label: 'آیکون' },
          { key: 'sort_order', label: 'ترتیب' },
          { key: 'is_active', label: 'فعال', render: (r) => <ActiveBadge value={r.is_active} /> },
        ]}
        fields={[
          { name: 'title', label: 'عنوان' },
          { name: 'text', label: 'متن', type: 'textarea' },
          { name: 'icon_key', label: 'آیکون', type: 'select', options: ICONS },
          { name: 'sort_order', label: 'ترتیب', type: 'number' },
          { name: 'is_active', label: 'فعال', type: 'checkbox' },
          { name: 'is_published', label: 'منتشر شده', type: 'checkbox' },
        ]}
        toForm={(row) =>
          row
            ? { ...row, is_active: !!row.is_active, is_published: !!row.is_published }
            : { title: '', text: '', icon_key: 'Target', sort_order: 0, is_active: true, is_published: true }
        }
        fromForm={(f) => ({
          title: f.title,
          text: f.text,
          icon_key: f.icon_key,
          sort_order: Number(f.sort_order || 0),
          is_active: f.is_active ? 1 : 0,
          is_published: f.is_published ? 1 : 0,
        })}
        validate={(f) => (!f.title ? 'عنوان الزامی است' : null)}
      />
    </div>
  );
}

export function BacklogPage() {
  return (
    <div className="space-y-8">
      <ResourcePage
        title="بک‌لاگ"
        subtitle="وضعیت اقلام به تفکیک سامانه"
        endpoint="/api/admin/backlog"
        newLabel="سامانه جدید"
        columns={[
          { key: 'name', label: 'سامانه' },
          { key: 'completed', label: 'انجام‌شده' },
          { key: 'in_progress', label: 'در جریان' },
          { key: 'unstarted', label: 'شروع‌نشده' },
          { key: 'canceled', label: 'لغو' },
          { key: 'total', label: 'کل' },
          { key: 'rate', label: 'نرخ' },
          { key: 'is_active', label: 'فعال', render: (r) => <ActiveBadge value={r.is_active} /> },
        ]}
        fields={[
          { name: 'name', label: 'نام سامانه' },
          { name: 'completed', label: 'انجام‌شده', type: 'number' },
          { name: 'in_progress', label: 'در جریان', type: 'number' },
          { name: 'unstarted', label: 'شروع‌نشده', type: 'number' },
          { name: 'canceled', label: 'لغو', type: 'number' },
          { name: 'sort_order', label: 'ترتیب', type: 'number' },
          { name: 'is_active', label: 'فعال', type: 'checkbox' },
          { name: 'is_published', label: 'منتشر شده', type: 'checkbox' },
        ]}
        toForm={(row) =>
          row
            ? { ...row, is_active: !!row.is_active, is_published: !!row.is_published }
            : {
                name: '',
                completed: 0,
                in_progress: 0,
                unstarted: 0,
                canceled: 0,
                sort_order: 0,
                is_active: true,
                is_published: true,
              }
        }
        fromForm={(f) => ({
          name: f.name,
          completed: Number(f.completed || 0),
          in_progress: Number(f.in_progress || 0),
          unstarted: Number(f.unstarted || 0),
          canceled: Number(f.canceled || 0),
          sort_order: Number(f.sort_order || 0),
          is_active: f.is_active ? 1 : 0,
          is_published: f.is_published ? 1 : 0,
        })}
        validate={(f) => (!f.name ? 'نام الزامی است' : null)}
      />
      <MiniCrud
        title="کارت‌های بینش بک‌لاگ"
        endpoint="/api/admin/backlog-insights"
        columns={[
          { key: 'title', label: 'عنوان' },
          { key: 'insight_key', label: 'نوع' },
          { key: 'is_auto', label: 'خودکار', render: (r) => (Number(r.is_auto) === 1 ? 'بله' : 'خیر') },
          { key: 'is_active', label: 'فعال', render: (r) => <ActiveBadge value={r.is_active} /> },
        ]}
        fields={[
          { name: 'title', label: 'عنوان' },
          {
            name: 'insight_key',
            label: 'کلید محاسبه',
            type: 'select',
            options: [
              { value: 'highest_completion', label: 'highest_completion' },
              { value: 'most_active', label: 'most_active' },
              { value: 'needs_attention', label: 'needs_attention' },
              { value: 'manual', label: 'manual' },
            ],
          },
          { name: 'text', label: 'متن دستی (اگر خودکار خاموش باشد)', type: 'textarea' },
          { name: 'icon_key', label: 'آیکون', type: 'select', options: ICONS },
          {
            name: 'tone',
            label: 'تم رنگ',
            type: 'select',
            options: [
              { value: 'emerald', label: 'emerald' },
              { value: 'amber', label: 'amber' },
              { value: 'red', label: 'red' },
            ],
          },
          { name: 'is_auto', label: 'متن خودکار از داده بک‌لاگ', type: 'checkbox' },
          { name: 'sort_order', label: 'ترتیب', type: 'number' },
          { name: 'is_active', label: 'فعال', type: 'checkbox' },
          { name: 'is_published', label: 'منتشر شده', type: 'checkbox' },
        ]}
        toForm={(row) =>
          row
            ? { ...row, is_active: !!row.is_active, is_published: !!row.is_published, is_auto: !!row.is_auto }
            : {
                title: '',
                insight_key: 'manual',
                text: '',
                icon_key: 'CheckCircle',
                tone: 'emerald',
                is_auto: true,
                sort_order: 0,
                is_active: true,
                is_published: true,
              }
        }
        fromForm={(f) => ({
          title: f.title,
          insight_key: f.insight_key,
          text: f.text,
          icon_key: f.icon_key,
          tone: f.tone,
          is_auto: f.is_auto ? 1 : 0,
          sort_order: Number(f.sort_order || 0),
          is_active: f.is_active ? 1 : 0,
          is_published: f.is_published ? 1 : 0,
        })}
        validate={(f) => (!f.title ? 'عنوان الزامی است' : null)}
      />
    </div>
  );
}

export function StrategicAgendaPage() {
  return (
    <ResourcePage
      title="دستور کار راهبردی"
      subtitle="۴ کارت اثر کسب‌وکاری صفحه Strategic Agenda"
      endpoint="/api/admin/strategic-impacts"
      newLabel="کارت جدید"
      columns={[
        { key: 'title', label: 'عنوان' },
        { key: 'icon_key', label: 'آیکون' },
        { key: 'sort_order', label: 'ترتیب' },
        { key: 'is_active', label: 'فعال', render: (r) => <ActiveBadge value={r.is_active} /> },
      ]}
      fields={[
        { name: 'title', label: 'عنوان' },
        { name: 'text', label: 'توضیح / محتوای کارت', type: 'textarea' },
        { name: 'icon_key', label: 'آیکون', type: 'select', options: ICONS },
        { name: 'sort_order', label: 'ترتیب', type: 'number' },
        { name: 'is_active', label: 'فعال', type: 'checkbox' },
        { name: 'is_published', label: 'منتشر شده', type: 'checkbox' },
      ]}
      toForm={(row) =>
        row
          ? {
              title: row.title,
              text: row.text,
              icon_key: row.icon_key,
              sort_order: row.sort_order,
              is_active: !!row.is_active,
              is_published: !!row.is_published,
            }
          : {
              title: '',
              text: '',
              icon_key: 'TrendingUp',
              sort_order: 0,
              is_active: true,
              is_published: true,
            }
      }
      fromForm={(f) => ({
        title: f.title,
        text: f.text,
        icon_key: f.icon_key,
        sort_order: Number(f.sort_order || 0),
        is_active: f.is_active ? 1 : 0,
        is_published: f.is_published ? 1 : 0,
      })}
      validate={(f) => (!f.title ? 'عنوان الزامی است' : null)}
    />
  );
}

export function HomeMenuPage() {
  return (
    <ResourcePage
      title="کارت‌های Home"
      subtitle="کارت‌های داشبورد مدیریتی — previewهای عددی می‌توانند از داده واقعی محاسبه شوند"
      endpoint="/api/admin/home-menu"
      newLabel="کارت جدید"
      columns={[
        { key: 'view_id', label: 'مسیر' },
        { key: 'title', label: 'عنوان' },
        { key: 'preview_source', label: 'منبع Preview' },
        { key: 'sort_order', label: 'ترتیب' },
        { key: 'is_active', label: 'فعال', render: (r) => <ActiveBadge value={r.is_active} /> },
      ]}
      fields={[
        { name: 'view_id', label: 'شناسه مسیر (مثلا portfolio)' },
        { name: 'title', label: 'عنوان' },
        { name: 'description', label: 'توضیح', type: 'textarea' },
        { name: 'preview', label: 'Preview دستی' },
        {
          name: 'preview_source',
          label: 'منبع Preview',
          type: 'select',
          options: [
            { value: 'manual', label: 'manual' },
            { value: 'products', label: 'products' },
            { value: 'pdi', label: 'pdi' },
            { value: 'committees', label: 'committees' },
            { value: 'backlog', label: 'backlog' },
          ],
        },
        { name: 'icon_key', label: 'آیکون', type: 'select', options: ICONS },
        { name: 'sort_order', label: 'ترتیب', type: 'number' },
        { name: 'is_active', label: 'فعال', type: 'checkbox' },
        { name: 'is_published', label: 'منتشر شده', type: 'checkbox' },
      ]}
      toForm={(row) =>
        row
          ? {
              view_id: row.view_id,
              title: row.title,
              description: row.description,
              preview: row.preview,
              preview_source: row.preview_source || 'manual',
              icon_key: row.icon_key,
              sort_order: row.sort_order,
              is_active: !!row.is_active,
              is_published: !!row.is_published,
            }
          : {
              view_id: '',
              title: '',
              description: '',
              preview: '',
              preview_source: 'manual',
              icon_key: 'Layers',
              sort_order: 0,
              is_active: true,
              is_published: true,
            }
      }
      fromForm={(f) => ({
        view_id: f.view_id,
        title: f.title,
        description: f.description,
        preview: f.preview,
        preview_source: f.preview_source,
        icon_key: f.icon_key,
        sort_order: Number(f.sort_order || 0),
        is_active: f.is_active ? 1 : 0,
        is_published: f.is_published ? 1 : 0,
      })}
      validate={(f) => (!f.view_id || !f.title ? 'مسیر و عنوان الزامی است' : null)}
    />
  );
}

function MiniCrud({ title, endpoint, columns, fields, toForm, fromForm, validate }) {
  return (
    <div className="mb-10">
      <ResourcePage
        title={title}
        endpoint={endpoint}
        columns={columns}
        fields={fields}
        toForm={toForm}
        fromForm={fromForm}
        validate={validate}
        newLabel="افزودن"
      />
    </div>
  );
}

export function EditorialPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        title="محتوای مدیریتی"
        subtitle="KPIهای خلاصه مدیریتی به‌صورت خودکار از Portfolio / PDI / Backlog / Committees محاسبه می‌شوند"
      />
      <div className="bg-amber-50 border border-amber-100 text-amber-900 text-sm rounded-xl px-4 py-3 mb-2">
        مقادیر Summary دیگر از این صفحه ویرایش نمی‌شوند؛ با تغییر داده صفحات مبدأ و Publish، به‌صورت خودکار به‌روز می‌شوند.
      </div>
      <MiniCrud
        title="تمرکزهای اجرایی (رشد / یکپارچگی / تحقق ارزش)"
        endpoint="/api/admin/executive-focus"
        columns={[
          { key: 'title', label: 'عنوان' },
          { key: 'text', label: 'متن' },
          { key: 'is_active', label: 'فعال', render: (r) => <ActiveBadge value={r.is_active} /> },
        ]}
        fields={[
          { name: 'title', label: 'عنوان' },
          { name: 'text', label: 'متن', type: 'textarea' },
          { name: 'action', label: 'اکشن ناوبری (خالی = بدون لینک)' },
          { name: 'sort_order', label: 'ترتیب', type: 'number' },
          { name: 'is_active', label: 'فعال', type: 'checkbox' },
          { name: 'is_published', label: 'منتشر شده', type: 'checkbox' },
        ]}
        toForm={(row) =>
          row
            ? { ...row, is_active: !!row.is_active, is_published: !!row.is_published }
            : { title: '', text: '', action: '', sort_order: 0, is_active: true, is_published: true }
        }
        fromForm={(f) => ({
          title: f.title,
          text: f.text,
          action: f.action,
          sort_order: Number(f.sort_order || 0),
          is_active: f.is_active ? 1 : 0,
          is_published: f.is_published ? 1 : 0,
        })}
        validate={(f) => (!f.title ? 'عنوان الزامی است' : null)}
      />
      <MiniCrud
        title="موارد نیازمند توجه"
        endpoint="/api/admin/attention"
        columns={[
          { key: 'title', label: 'عنوان' },
          { key: 'level', label: 'سطح' },
          { key: 'is_active', label: 'فعال', render: (r) => <ActiveBadge value={r.is_active} /> },
        ]}
        fields={[
          { name: 'title', label: 'عنوان' },
          { name: 'text', label: 'متن', type: 'textarea' },
          { name: 'level', label: 'سطح' },
          { name: 'sort_order', label: 'ترتیب', type: 'number' },
          { name: 'is_active', label: 'فعال', type: 'checkbox' },
          { name: 'is_published', label: 'منتشر شده', type: 'checkbox' },
        ]}
        toForm={(row) =>
          row
            ? { ...row, is_active: !!row.is_active, is_published: !!row.is_published }
            : { title: '', text: '', level: '', sort_order: 0, is_active: true, is_published: true }
        }
        fromForm={(f) => ({
          title: f.title,
          text: f.text,
          level: f.level,
          sort_order: Number(f.sort_order || 0),
          is_active: f.is_active ? 1 : 0,
          is_published: f.is_published ? 1 : 0,
        })}
        validate={(f) => (!f.title ? 'عنوان الزامی است' : null)}
      />
      <MiniCrud
        title="پیشنهاد تصمیم"
        endpoint="/api/admin/decision-proposals"
        columns={[
          { key: 'title', label: 'عنوان' },
          { key: 'text', label: 'متن' },
          { key: 'is_active', label: 'فعال', render: (r) => <ActiveBadge value={r.is_active} /> },
        ]}
        fields={[
          { name: 'title', label: 'عنوان' },
          { name: 'text', label: 'متن', type: 'textarea' },
          { name: 'sort_order', label: 'ترتیب', type: 'number' },
          { name: 'is_active', label: 'فعال', type: 'checkbox' },
          { name: 'is_published', label: 'منتشر شده', type: 'checkbox' },
        ]}
        toForm={(row) =>
          row
            ? { ...row, is_active: !!row.is_active, is_published: !!row.is_published }
            : { title: 'پیشنهاد تصمیم', text: '', sort_order: 1, is_active: true, is_published: true }
        }
        fromForm={(f) => ({
          title: f.title,
          text: f.text,
          sort_order: Number(f.sort_order || 0),
          is_active: f.is_active ? 1 : 0,
          is_published: f.is_published ? 1 : 0,
        })}
        validate={(f) => (!f.title || !f.text ? 'عنوان و متن الزامی است' : null)}
      />
      <OutlookAdmin />
    </div>
  );
}

function OutlookAdmin() {
  const { user } = useAuth();
  const { show, node } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ num: '', title: '', icon_key: 'Target', color: '', itemsText: '', is_active: true });

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/admin/outlook');
      setItems(r.items || []);
    } catch (e) {
      show(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    const payload = {
      num: form.num,
      title: form.title,
      icon_key: form.icon_key,
      color: form.color || 'from-[#0057A8] to-[#002B5C]',
      sort_order: Number(form.sort_order || 0),
      is_active: form.is_active ? 1 : 0,
      is_published: 1,
      items: String(form.itemsText || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    try {
      if (editing) await api.put(`/api/admin/outlook/${editing.id}`, payload);
      else await api.post('/api/admin/outlook', payload);
      show('ذخیره شد');
      setOpen(false);
      load();
    } catch (e) {
      show(e.message, 'error');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5">
      {node}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">ستون‌های چشم‌انداز</h2>
        <Button
          onClick={() => {
            setEditing(null);
            setForm({ num: '', title: '', icon_key: 'Target', color: 'from-[#0057A8] to-[#002B5C]', itemsText: '', sort_order: 0, is_active: true });
            setOpen(true);
          }}
        >
          افزودن ستون
        </Button>
      </div>
      {loading ? (
        <Spinner />
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <div key={p.id} className="border border-slate-100 rounded-xl p-4 flex justify-between gap-4">
              <div>
                <div className="font-bold text-slate-900">
                  {p.num}. {p.title}
                </div>
                <div className="text-xs text-slate-500 mt-1">{(p.items || []).length} مورد</div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setEditing(p);
                    setForm({
                      num: p.num,
                      title: p.title,
                      icon_key: p.icon_key,
                      color: p.color,
                      sort_order: p.sort_order,
                      is_active: !!p.is_active,
                      itemsText: (p.items || []).map((i) => i.text).join('\n'),
                    });
                    setOpen(true);
                  }}
                >
                  ویرایش
                </Button>
                {user?.role === 'admin' && (
                  <Button
                    variant="danger"
                    onClick={async () => {
                      if (!confirmDelete(p.title)) return;
                      await api.delete(`/api/admin/outlook/${p.id}`);
                      show('حذف شد');
                      load();
                    }}
                  >
                    حذف
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal
        open={open}
        title={editing ? 'ویرایش ستون' : 'ستون جدید'}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button onClick={save}>ذخیره</Button>
          </>
        }
      >
        <Input label="شماره" value={form.num} onChange={(e) => setForm((s) => ({ ...s, num: e.target.value }))} />
        <Input label="عنوان" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
        <Select label="آیکون" value={form.icon_key} onChange={(e) => setForm((s) => ({ ...s, icon_key: e.target.value }))}>
          {ICONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Input label="کلاس رنگ گرادیان" value={form.color} onChange={(e) => setForm((s) => ({ ...s, color: e.target.value }))} />
        <Textarea
          label="آیتم‌ها (هر خط یک مورد)"
          value={form.itemsText}
          onChange={(e) => setForm((s) => ({ ...s, itemsText: e.target.value }))}
        />
      </Modal>
    </div>
  );
}

export function SettingsPage() {
  const { show, node } = useToast();
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    api
      .get('/api/admin/settings')
      .then((r) => setSettings(r.settings || {}))
      .catch((e) => show(e.message, 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const fields = [
    'cover_title',
    'cover_subtitle',
    'cover_kicker',
    'menu_heading',
    'menu_subtitle',
    'outlook_vision_title',
    'outlook_vision_body',
  ];

  return (
    <div>
      {node}
      <PageHeader title="تنظیمات" subtitle="متادیتای Cover/Menu و امنیت" />
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 mb-6">
        {fields.map((key) =>
          key.includes('body') || key.includes('suggestion') ? (
            <Textarea
              key={key}
              label={key}
              value={settings[key] || ''}
              onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
            />
          ) : (
            <Input
              key={key}
              label={key}
              value={settings[key] || ''}
              onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.value }))}
            />
          )
        )}
        <Button
          onClick={async () => {
            try {
              await api.put('/api/admin/settings', { settings });
              show('تنظیمات ذخیره شد');
            } catch (e) {
              show(e.message, 'error');
            }
          }}
        >
          ذخیره تنظیمات
        </Button>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 max-w-lg">
        <h2 className="font-bold">تغییر رمز عبور</h2>
        <Input label="رمز فعلی" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
        <Input label="رمز جدید" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
        <Button
          onClick={async () => {
            try {
              await api.post('/api/admin/change-password', { currentPassword, newPassword });
              show('رمز عبور تغییر کرد');
              setCurrentPassword('');
              setNewPassword('');
            } catch (e) {
              show(e.message, 'error');
            }
          }}
        >
          تغییر رمز
        </Button>
      </div>
    </div>
  );
}
