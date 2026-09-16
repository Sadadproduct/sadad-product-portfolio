import React, { useEffect, useState } from 'react';
import { api } from '../../data/api.js';
import { Badge, EmptyState, Input, PageHeader, Select, Spinner, useToast } from '../components/ui.jsx';

const PAGE_SIZE = 25;

export default function AuditPage() {
  const { show, node } = useToast();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [action, setAction] = useState('');
  const [entity, setEntity] = useState('');
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get('/api/admin/users').then((r) => setUsers(r.items || [])).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
    if (q) params.set('q', q);
    if (action) params.set('action', action);
    if (entity) params.set('entity', entity);
    if (userId) params.set('user_id', userId);
    api
      .get(`/api/admin/audit?${params}`)
      .then((r) => {
        if (cancelled) return;
        setItems(r.items || []);
        setTotal(r.total || 0);
      })
      .catch((e) => {
        if (!cancelled) show(e.message, 'error');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [q, action, entity, userId, page, show]);

  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      {node}
      <PageHeader title="Audit Log" subtitle="فقط خواندنی — هویت از Authentication سرور" />
      <div className="flex flex-wrap gap-2 mb-4">
        <Input placeholder="جستجو…" value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} className="min-w-[180px]" />
        <Select value={userId} onChange={(e) => { setPage(1); setUserId(e.target.value); }} className="w-44">
          <option value="">همه کاربران</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>
        <Select value={action} onChange={(e) => { setPage(1); setAction(e.target.value); }} className="w-44">
          <option value="">همه عملیات</option>
          {['LOGIN_SUCCESS','LOGIN_FAILED','CREATE','UPDATE','DELETE','PUBLISH','UNPUBLISH','PASSWORD_RESET','USER_CREATED','USER_UPDATED','USER_DEACTIVATED'].map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </Select>
        <Select value={entity} onChange={(e) => { setPage(1); setEntity(e.target.value); }} className="w-44">
          <option value="">همه بخش‌ها</option>
          {['users','products','portfolio_categories','pdi_statuses','committee_periods','backlog_systems','strategic_impacts','committee_insights','backlog_insights','home_menu_items','decision_proposals','process_tracks','outlook_pillars','app_settings'].map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </Select>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState title="لاگی یافت نشد" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="text-right px-4 py-3">زمان</th>
                  <th className="text-right px-4 py-3">کاربر</th>
                  <th className="text-right px-4 py-3">نقش</th>
                  <th className="text-right px-4 py-3">عملیات</th>
                  <th className="text-right px-4 py-3">بخش</th>
                  <th className="text-right px-4 py-3">مورد</th>
                </tr>
              </thead>
              <tbody>
                {items.map((row) => (
                  <tr key={row.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{row.created_at}</td>
                    <td className="px-4 py-3 font-semibold">{row.user_name || row.user_email || '—'}</td>
                    <td className="px-4 py-3"><Badge>{row.user_role || '—'}</Badge></td>
                    <td className="px-4 py-3">
                      <Badge tone={row.success === 0 ? 'red' : 'slate'}>{row.action}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{row.entity}</td>
                    <td className="px-4 py-3">{row.entity_name || (row.entity_id ? `#${row.entity_id}` : '—')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mt-4 text-sm text-slate-500">
        <span>
          {total} مورد · صفحه {page} از {pages} · {PAGE_SIZE} در هر صفحه
        </span>
        <div className="flex gap-2">
          <button disabled={page <= 1 || loading} className="px-3 py-1 rounded border disabled:opacity-40" onClick={() => setPage((p) => p - 1)}>قبلی</button>
          <span className="px-2 py-1">{page} / {pages}</span>
          <button disabled={page >= pages || loading} className="px-3 py-1 rounded border disabled:opacity-40" onClick={() => setPage((p) => p + 1)}>بعدی</button>
        </div>
      </div>
    </div>
  );
}
