import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { api } from '../../data/api.js';
import { useAuth } from '../AuthContext.jsx';
import {
  Badge,
  Button,
  EmptyState,
  Input,
  Modal,
  PageHeader,
  Select,
  Spinner,
  Textarea,
  confirmDelete,
  useToast,
} from '../components/ui.jsx';
// ok

/**
 * Generic CRUD page for simple admin resources.
 */
export default function ResourcePage({
  title,
  subtitle,
  endpoint,
  columns,
  fields,
  searchPlaceholder = 'جستجو…',
  newLabel = 'افزودن',
  toForm,
  fromForm,
  validate,
  queryParams = null,
  rowActions = null,
  hidePageHeader = false,
}) {
  const { user } = useAuth();
  const canDelete = user?.role === 'admin';
  const { show, node } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (queryParams) {
        Object.entries(queryParams).forEach(([k, v]) => {
          if (v != null && v !== '') params.set(k, String(v));
        });
      }
      if (q) params.set('q', q);
      if (activeFilter !== 'all') params.set('active', activeFilter);
      const qs = params.toString() ? `?${params}` : '';
      const data = await api.get(`${endpoint}${qs}`);
      setItems(data.items || []);
    } catch (e) {
      show(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [endpoint, q, activeFilter, JSON.stringify(queryParams || {})]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    let rows = items;
    if (q) {
      const qq = q.toLowerCase();
      rows = rows.filter((row) => JSON.stringify(row).toLowerCase().includes(qq));
    }
    if (activeFilter === '1') rows = rows.filter((r) => Number(r.is_active) === 1);
    if (activeFilter === '0') rows = rows.filter((r) => Number(r.is_active) === 0);
    return rows;
  }, [items, q, activeFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm(toForm ? toForm(null) : {});
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm(toForm ? toForm(row) : { ...row });
    setOpen(true);
  };

  const save = async (asDraft = false) => {
    if (validate) {
      const err = validate(form);
      if (err) return show(err, 'error');
    }
    setBusy(true);
    try {
      const payload = fromForm ? fromForm(form) : { ...form };
      if (asDraft) {
        payload.is_published = 0;
        payload.as_draft = true;
      }
      if (editing) {
        await api.put(`${endpoint}/${editing.id}`, payload);
        show(asDraft ? 'پیش‌نویس ذخیره شد' : 'با موفقیت به‌روزرسانی شد');
      } else {
        if (asDraft) payload.is_published = 0;
        await api.post(endpoint, payload);
        show(asDraft ? 'پیش‌نویس ایجاد شد' : 'با موفقیت ایجاد شد');
      }
      setOpen(false);
      await load();
    } catch (e) {
      show(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const publish = async (row) => {
    if (!window.confirm(`انتشار «${row.name || row.title || row.year_label || row.id}» در Public؟`)) return;
    try {
      await api.post(`${endpoint}/${row.id}/publish`, {});
      show('منتشر شد');
      await load();
    } catch (e) {
      show(e.message, 'error');
    }
  };

  const unpublish = async (row) => {
    if (!window.confirm(`لغو انتشار «${row.name || row.title || row.year_label || row.id}»؟ Public دیگر آن را نشان نمی‌دهد.`)) return;
    try {
      await api.post(`${endpoint}/${row.id}/unpublish`, {});
      show('به پیش‌نویس برگشت');
      await load();
    } catch (e) {
      show(e.message, 'error');
    }
  };

  const remove = async (row) => {
    if (!canDelete) return show('حذف فقط برای نقش admin مجاز است', 'error');
    if (!confirmDelete(row.name || row.title || row.year_label || `#${row.id}`)) return;
    try {
      await api.delete(`${endpoint}/${row.id}`);
      show('حذف شد');
      await load();
    } catch (e) {
      show(e.message, 'error');
    }
  };

  const toggleActive = async (row) => {
    try {
      const payload = fromForm
        ? fromForm(toForm(row))
        : { ...row };
      payload.is_active = Number(row.is_active) === 1 ? 0 : 1;
      await api.put(`${endpoint}/${row.id}`, payload);
      show(payload.is_active ? 'فعال شد' : 'غیرفعال شد');
      await load();
    } catch (e) {
      show(e.message, 'error');
    }
  };

  return (
    <div>
      {node}
      {!hidePageHeader && (
        <PageHeader
          title={title}
          subtitle={subtitle}
          actions={
            <>
              <Input
                placeholder={searchPlaceholder}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="min-w-[200px]"
              />
              <Select value={activeFilter} onChange={(e) => setActiveFilter(e.target.value)} className="w-36">
                <option value="all">همه</option>
                <option value="1">فعال</option>
                <option value="0">غیرفعال</option>
              </Select>
              <Button onClick={openCreate}>{newLabel}</Button>
            </>
          }
        />
      )}
      {hidePageHeader && (
        <div className="flex flex-wrap gap-2 mb-4 justify-end">
          <Button onClick={openCreate}>{newLabel}</Button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <EmptyState hint="برای شروع یک مورد جدید اضافه کنید." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  {columns.map((c) => (
                    <th key={c.key} className="text-right font-semibold px-4 py-3 whitespace-nowrap">
                      {c.label}
                    </th>
                  ))}
                  <th className="text-right font-semibold px-4 py-3">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100 hover:bg-slate-50/70">
                    {columns.map((c) => (
                      <td key={c.key} className="px-4 py-3 align-middle">
                        {c.render ? c.render(row) : row[c.key]}
                      </td>
                    ))}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        {rowActions ? rowActions(row, { load, show }) : null}
                        <Button variant="secondary" onClick={() => openEdit(row)}>
                          ویرایش
                        </Button>
                        {(Number(row.is_published) !== 1 || row.has_draft) && (
                          <Button variant="ghost" onClick={() => publish(row)}>
                            Publish
                          </Button>
                        )}
                        {Number(row.is_published) === 1 && (
                          <Button variant="ghost" onClick={() => unpublish(row)}>
                            Unpublish
                          </Button>
                        )}
                        {row.has_draft && <Badge tone="amber">Draft</Badge>}
                        <Button
                          variant="ghost"
                          onClick={() => {
                            if (!window.confirm(Number(row.is_active) === 1 ? 'غیرفعال شود؟' : 'فعال شود؟')) return;
                            toggleActive(row);
                          }}
                        >
                          {Number(row.is_active) === 1 ? 'غیرفعال' : 'فعال'}
                        </Button>
                        {canDelete && (
                          <Button variant="danger" onClick={() => remove(row)}>
                            حذف
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={open}
        title={editing ? 'ویرایش' : newLabel}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              انصراف
            </Button>
            <Button variant="secondary" onClick={() => save(true)} disabled={busy}>
              ذخیره پیش‌نویس
            </Button>
            <Button onClick={() => save(false)} disabled={busy}>
              {busy ? 'در حال ذخیره…' : 'ذخیره'}
            </Button>
          </>
        }
      >
        {fields.map((f) => {
          if (f.type === 'select') {
            return (
              <Select
                key={f.name}
                label={f.label}
                value={form[f.name] ?? ''}
                onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
              >
                {(f.options || []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            );
          }
          if (f.type === 'textarea') {
            return (
              <Textarea
                key={f.name}
                label={f.label}
                value={form[f.name] ?? ''}
                onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
              />
            );
          }
          if (f.type === 'checkbox') {
            return (
              <label key={f.name} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={!!form[f.name]}
                  onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.checked }))}
                />
                {f.label}
              </label>
            );
          }
          if (f.type === 'color') {
            const hex = form[f.name] || '#0057A8';
            return (
              <div key={f.name} className="space-y-2">
                <span className="block text-sm text-slate-600 font-medium">{f.label}</span>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={/^#[0-9A-Fa-f]{6}$/.test(hex) ? hex : '#0057A8'}
                    onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                    className="h-10 w-14 rounded border border-slate-200 cursor-pointer bg-white"
                  />
                  <Input
                    value={form[f.name] ?? ''}
                    placeholder="#0057A8"
                    onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
                    className="flex-1"
                  />
                  <span
                    className="inline-block w-8 h-8 rounded-lg border border-slate-200"
                    style={{ background: form[f.name] || '#e5e7eb' }}
                    title="پیش‌نمایش"
                  />
                </div>
              </div>
            );
          }
          return (
            <Input
              key={f.name}
              label={f.label}
              type={f.type || 'text'}
              value={form[f.name] ?? ''}
              onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
            />
          );
        })}
      </Modal>
    </div>
  );
}

export function ActiveBadge({ value }) {
  return <Badge tone={Number(value) === 1 ? 'green' : 'red'}>{Number(value) === 1 ? 'فعال' : 'غیرفعال'}</Badge>;
}
