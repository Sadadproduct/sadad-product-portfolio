import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
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
  useToast,
} from '../components/ui.jsx';

function ActivePill({ value }) {
  return <Badge tone={Number(value) === 1 ? 'green' : 'red'}>{Number(value) === 1 ? 'فعال' : 'غیرفعال'}</Badge>;
}

export default function UsersPage() {
  const { user } = useAuth();
  const { show, node } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'editor' });
  const [newPassword, setNewPassword] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get('/api/admin/users');
      setItems(r.items || []);
    } catch (e) {
      show(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') load();
  }, [user]);

  if (user?.role !== 'admin') return <Navigate to="/admin" replace />;

  const save = async () => {
    try {
      if (editing) {
        await api.put(`/api/admin/users/${editing.id}`, {
          name: form.name,
          email: form.email,
          role: form.role,
          is_active: form.is_active ? 1 : 0,
        });
        show('کاربر به‌روزرسانی شد');
      } else {
        await api.post('/api/admin/users', {
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
        });
        show('کاربر ایجاد شد');
      }
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
        title="کاربران"
        subtitle="مدیریت کاربران شخصی تیم — فقط Admin"
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setForm({ name: '', email: '', password: '', role: 'editor', is_active: true });
              setOpen(true);
            }}
          >
            کاربر جدید
          </Button>
        }
      />
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState />
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-right px-4 py-3">نام</th>
                <th className="text-right px-4 py-3">ایمیل</th>
                <th className="text-right px-4 py-3">نقش</th>
                <th className="text-right px-4 py-3">وضعیت</th>
                <th className="text-right px-4 py-3">آخرین ورود</th>
                <th className="text-right px-4 py-3">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {items.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold">{u.name}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3">
                    <Badge>{u.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <ActivePill value={u.is_active} />
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.last_login_at || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setEditing(u);
                          setForm({
                            name: u.name,
                            email: u.email,
                            role: u.role,
                            is_active: !!u.is_active,
                            password: '',
                          });
                          setOpen(true);
                        }}
                      >
                        ویرایش
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setEditing(u);
                          setNewPassword('');
                          setResetOpen(true);
                        }}
                      >
                        Reset رمز
                      </Button>
                      {Number(u.is_active) === 1 && u.id !== user.id && (
                        <Button
                          variant="danger"
                          onClick={async () => {
                            if (!window.confirm(`غیرفعال‌سازی «${u.name}»؟`)) return;
                            try {
                              await api.post(`/api/admin/users/${u.id}/deactivate`, {});
                              show('کاربر غیرفعال شد');
                              load();
                            } catch (e) {
                              show(e.message, 'error');
                            }
                          }}
                        >
                          غیرفعال
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={open}
        title={editing ? 'ویرایش کاربر' : 'کاربر جدید'}
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
        <Input label="نام" value={form.name} onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))} />
        <Input label="ایمیل" type="email" value={form.email} onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))} />
        {!editing && (
          <Input
            label="رمز عبور"
            type="password"
            value={form.password}
            onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
          />
        )}
        <Select label="نقش" value={form.role} onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}>
          <option value="editor">editor</option>
          <option value="admin">admin</option>
        </Select>
        {editing && (
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!form.is_active}
              onChange={(e) => setForm((s) => ({ ...s, is_active: e.target.checked }))}
            />
            فعال
          </label>
        )}
      </Modal>

      <Modal
        open={resetOpen}
        title={`Reset رمز — ${editing?.name || ''}`}
        onClose={() => setResetOpen(false)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetOpen(false)}>
              انصراف
            </Button>
            <Button
              onClick={async () => {
                try {
                  await api.post(`/api/admin/users/${editing.id}/reset-password`, { password: newPassword });
                  show('رمز بازنشانی شد');
                  setResetOpen(false);
                } catch (e) {
                  show(e.message, 'error');
                }
              }}
            >
              ذخیره رمز جدید
            </Button>
          </>
        }
      >
        <Input label="رمز جدید (حداقل ۸ کاراکتر)" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </Modal>
    </div>
  );
}
