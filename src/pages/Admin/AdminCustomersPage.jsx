import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ChevronRight, Users, Crown, Sparkles, Repeat, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { StatCard, Panel, PageHeader, Segmented, Badge, OrderBadge, Empty } from '@/components/admin/ui';
import { Drawer, useStagger } from '@/components/admin/motion';
import { useOrders } from '@/context/OrderContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useUI } from '@/context/UIContext';
import { useAuth } from '@/context/AuthContext';
import { can } from '@/config/permissions';
import { formatINR, formatDate } from '@/utils/format';

const VIP = 1000; // ₹ lifetime spend for the VIP tag (demo rule)

export default function AdminCustomersPage() {
  const { customers, orders, setCustomerStatus, apiMode } = useOrders();
  const { toast } = useUI();
  const { admin } = useAuth();
  const canBlock = can(admin?.role || 'SUPER_ADMIN', 'customers:write');
  const [params, setParams] = useSearchParams();
  const [q, setQ] = useState(''); const [seg, setSeg] = useState('all');
  const [viewId, setViewId] = useState(params.get('view'));
  useDocumentTitle('Admin · Customers');
  const ref = useStagger();
  useEffect(() => { if (params.get('view')) setParams({}, { replace: true }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const rows = useMemo(() => customers.map((c) => {
    const own = orders.filter((o) => o.customerId === c.id || (!!c.email && o.customer?.email === c.email));
    // API mode: lifetime totals come from the server (the order list only holds the latest 100).
    const spent = apiMode && typeof c.spent === 'number' ? c.spent : own.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totals.total, 0);
    const isNew = Date.now() - new Date(c.joinedAt) < 30 * 864e5;
    const count = apiMode && typeof c.orders === 'number' ? c.orders : own.length;
    return { ...c, name: c.name || c.email || c.phone || 'Customer', orders: own, orderCount: count, spent, vip: spent >= VIP, repeat: count > 1, isNew };
  }), [customers, orders]);
  const list = rows.filter((c) => (seg === 'all' || (seg === 'vip' && c.vip) || (seg === 'repeat' && c.repeat) || (seg === 'new' && c.isNew))
    && (!q || `${c.name} ${c.email} ${c.phone} ${c.city}`.toLowerCase().includes(q.toLowerCase())));
  const view = rows.find((c) => c.id === viewId);
  const total = rows.reduce((s, c) => s + c.spent, 0);

  return (
    <div ref={ref} className="space-y-6">
      <PageHeader title="Customers" subtitle="Everyone who has created an account or placed an order (demo data)." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} label="Customers" value={rows.length} tone="charcoal" />
        <StatCard icon={Crown} label="VIP customers" value={rows.filter((c) => c.vip).length} hint={`Spent ${formatINR(VIP)}+`} tone="turmeric" />
        <StatCard icon={Repeat} label="Repeat buyers" value={rows.filter((c) => c.repeat).length} tone="leaf" />
        <StatCard icon={Sparkles} label="Avg lifetime value" value={total / Math.max(1, rows.length)} format={(n) => formatINR(Math.round(n))} />
      </div>
      <Panel pad={false}>
        <div className="flex flex-col gap-3 border-b border-black/[.06] p-4 sm:p-5 lg:flex-row lg:items-center">
          <Segmented id="cseg" value={seg} onChange={setSeg} options={[['all', 'All', rows.length], ['vip', 'VIP'], ['repeat', 'Repeat'], ['new', 'New (30 days)']]} />
          <label className="relative flex-1"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" /><input className="adm-input pl-10" placeholder="Search name, email, phone, city" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search customers" /></label>
        </div>
        {!list.length ? <Empty icon={Users} title="No customers match" /> : (
          <div className="overflow-x-auto"><table className="adm-table">
            <thead><tr><th>Customer</th><th>Phone</th><th>City</th><th>Joined</th><th>Orders</th><th>Spent</th><th /></tr></thead>
            <tbody>{list.map((c, i) => (
              <motion.tr key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 12) * 0.025 }} className="cursor-pointer" onClick={() => setViewId(c.id)}>
                <td><div className="flex items-center gap-3"><Avatar name={c.name} /><span className="min-w-0"><span className="flex items-center gap-1.5 font-semibold">{c.name}{c.vip && <Badge tone="amber"><Crown size={10} />VIP</Badge>}{c.isNew && <Badge tone="green">New</Badge>}</span><span className="text-xs text-charcoal-400">{c.email}</span></span></div></td>
                <td>{c.phone}</td><td>{c.city}</td><td className="whitespace-nowrap text-charcoal-500">{formatDate(c.joinedAt)}</td><td>{c.orderCount}</td><td className="font-semibold tabular-nums">{formatINR(c.spent)}</td>
                <td className="text-right"><ChevronRight size={16} className="text-charcoal-400" /></td>
              </motion.tr>
            ))}</tbody>
          </table></div>
        )}
      </Panel>

      <Drawer open={!!view} onClose={() => setViewId(null)} title={view?.name || ''} subtitle={view ? `Customer since ${formatDate(view.joinedAt)}` : ''}>
        {view && (
          <div className="space-y-6 p-6">
            <div className="flex items-center gap-4">
              <Avatar name={view.name} big />
              <div className="flex flex-wrap gap-1.5">{view.vip && <Badge tone="amber"><Crown size={10} />VIP</Badge>}{view.repeat && <Badge tone="blue">Repeat buyer</Badge>}{view.isNew && <Badge tone="green">New</Badge>}</div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {[['Orders', view.orderCount], ['Total spent', formatINR(view.spent)], ['Avg order', formatINR(Math.round(view.spent / Math.max(1, view.orders.filter((o) => o.status !== 'cancelled').length)))]].map(([k, v]) => <div key={k} className="rounded-2xl bg-[#FAFAF8] p-4"><p className="text-xs text-charcoal-400">{k}</p><p className="mt-1 text-lg font-bold">{v}</p></div>)}
            </div>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><Mail size={14} className="text-charcoal-400" />{view.email}</p>
              <p className="flex items-center gap-2"><Phone size={14} className="text-charcoal-400" />{view.phone || '—'}</p>
              <p className="flex items-center gap-2"><MapPin size={14} className="text-charcoal-400" />{view.city || '—'}</p>
              <div className="flex gap-2 pt-2">
                <a href={`mailto:${view.email}`} className="adm-btn-ghost h-9 px-3 text-xs"><Mail size={13} />Email</a>
                {canBlock && view.status && <button type="button" className={`adm-btn h-9 px-3 text-xs ${view.status === 'BLOCKED' ? 'bg-leaf text-white' : 'border border-chilli/30 text-chilli hover:bg-chilli-50'}`} onClick={async () => { const next = view.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED'; try { await setCustomerStatus(view.id, next); toast(next === 'BLOCKED' ? 'Customer blocked and signed out everywhere' : 'Customer unblocked'); } catch (e) { toast(e.message, 'error'); } }}>{view.status === 'BLOCKED' ? 'Unblock' : 'Block customer'}</button>}
                {view.phone && <a href={`https://wa.me/91${view.phone.replace(/\D/g, '').slice(-10)}`} target="_blank" rel="noopener noreferrer" className="adm-btn h-9 bg-[#25D366] px-3 text-xs text-white"><MessageCircle size={13} />WhatsApp</a>}
              </div>
            </div>
            <section>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-charcoal-400">Order history</h3>
              {!view.orders.length ? <p className="text-sm text-charcoal-500">No orders yet.</p> : (
                <ul className="divide-y divide-black/[.05] rounded-2xl border border-black/[.06]">{view.orders.map((o) => <li key={o.id} className="flex flex-wrap items-center gap-3 p-3 text-sm"><span className="font-mono font-semibold">{o.id}</span><span className="text-charcoal-500">{formatDate(o.placedAt)}</span><OrderBadge status={o.status} /><span className="ml-auto font-semibold tabular-nums">{formatINR(o.totals.total)}</span></li>)}</ul>
              )}
            </section>
          </div>
        )}
      </Drawer>
    </div>
  );
}

function Avatar({ name, big }) {
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return <span className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white shadow-sm ${big ? 'h-16 w-16 text-2xl' : 'h-9 w-9 text-sm'}`} style={{ background: `linear-gradient(135deg, hsl(${hue} 65% 52%), hsl(${(hue + 40) % 360} 70% 45%))` }}>{name[0]}</span>;
}
