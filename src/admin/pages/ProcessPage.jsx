import React, { useEffect, useState } from 'react';
import { api } from '../../data/api.js';
import { iconOptions } from '../../data/iconRegistry.js';
import {
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
import { useAuth } from '../AuthContext.jsx';

const COLORS = ['blue', 'navy', 'indigo', 'emerald', 'amber', 'red'];
const ICONS = iconOptions();

export default function ProcessPage() {
  const { user } = useAuth();
  const { show, node } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ num: '', title: '', stepsText: '', is_published: true });

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/admin/process');
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

  const openEdit = (track) => {
    setEditing(track);
    setForm({
      num: track?.num || '',
      title: track?.title || '',
      sort_order: track?.sort_order || 0,
      is_active: track ? !!track.is_active : true,
      is_published: track ? !!track.is_published : true,
      stepsText: (track?.steps || [])
        .map((s) => `${s.title}|${s.description || ''}|${s.icon_key || 'Settings'}|${s.color || 'navy'}`)
        .join('\n'),
    });
    setOpen(true);
  };

  const save = async () => {
    const steps = String(form.stepsText || '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [title, description, icon_key, color] = line.split('|').map((x) => (x || '').trim());
        return { title, description: description || '', icon_key: icon_key || 'Settings', color: color || 'navy' };
      });
    const payload = {
      num: form.num,
      title: form.title,
      sort_order: Number(form.sort_order || 0),
      is_active: form.is_active ? 1 : 0,
      is_published: form.is_published ? 1 : 0,
      steps,
    };
    try {
      if (editing) await api.put(`/api/admin/process/tracks/${editing.id}`, payload);
      else await api.post('/api/admin/process/tracks', payload);
      show('ذخیره شد');
      setOpen(false);
      load();
    } catch (e) {
      show(e.message, 'error');
    }
  };

  return (
    <div>
      {node}
      <PageHeader
        title="ویرایشگر Process"
        subtitle="بدون تغییر ظاهر Public — فقط داده"
        actions={
          <Button onClick={() => openEdit(null)}>مسیر جدید</Button>
        }
      />
      <p className="text-xs text-slate-500 mb-4">
        فرمت هر Step در ویرایشگر: <code>عنوان|توضیح|آیکون|رنگ</code> — هر خط یک Step. آیکون‌ها: {ICONS.slice(0, 8).join(', ')}…
      </p>
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          items.map((track, idx) => (
            <div key={track.id} className="border border-slate-100 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="font-bold text-slate-900">
                  {track.num} · {track.title}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {(track.steps || []).length} گام · {Number(track.is_published) === 1 ? 'منتشر' : 'پیش‌نویس'} ·{' '}
                  {Number(track.is_active) === 1 ? 'فعال' : 'غیرفعال'}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="ghost" disabled={idx === 0} onClick={async () => { await api.post(`/api/admin/process/tracks/${track.id}/move`, { direction: 'up' }); load(); }}>↑</Button>
                <Button variant="ghost" disabled={idx === items.length - 1} onClick={async () => { await api.post(`/api/admin/process/tracks/${track.id}/move`, { direction: 'down' }); load(); }}>↓</Button>
                <Button variant="secondary" onClick={() => openEdit(track)}>ویرایش</Button>
                {user?.role === 'admin' && (
                  <Button
                    variant="danger"
                    onClick={async () => {
                      if (!confirmDelete(track.title)) return;
                      await api.delete(`/api/admin/process/tracks/${track.id}`);
                      show('حذف شد');
                      load();
                    }}
                  >
                    حذف
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        open={open}
        title={editing ? 'ویرایش مسیر' : 'مسیر جدید'}
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpen(false)}>انصراف</Button>
            <Button onClick={save}>ذخیره</Button>
          </>
        }
      >
        <Input label="شماره" value={form.num} onChange={(e) => setForm((s) => ({ ...s, num: e.target.value }))} />
        <Input label="عنوان" value={form.title} onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))} />
        <Input label="ترتیب" type="number" value={form.sort_order} onChange={(e) => setForm((s) => ({ ...s, sort_order: e.target.value }))} />
        <Textarea label="گام‌ها (هر خط: عنوان|توضیح|آیکون|رنگ)" value={form.stepsText} onChange={(e) => setForm((s) => ({ ...s, stepsText: e.target.value }))} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!form.is_published} onChange={(e) => setForm((s) => ({ ...s, is_published: e.target.checked }))} />
          منتشر شده
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={!!form.is_active} onChange={(e) => setForm((s) => ({ ...s, is_active: e.target.checked }))} />
          فعال
        </label>
        <Select label="رنگ‌های مجاز" value="" onChange={() => {}}>
          {COLORS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </Modal>
    </div>
  );
}
