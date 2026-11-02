import { useMemo, useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { Panel } from '@/components/admin/ui';
import { StatusBadge } from '@/components/order/OrderTimeline';
import { useOrders } from '@/context/OrderContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatINR, formatDate } from '@/utils/format';

export default function AdminCustomersPage() {
  const { customers, orders } = useOrders();
  const [q, setQ] = useState(''); const [view, setView] = useState(null);
  useDocumentTitle('Admin · Customers');
  const rows = useMemo(() => customers.map((c) => {
    const own = orders.filter((o) => o.customerId === c.id || o.customer.email === c.email);
    return { ...c, orders: own, spent: own.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totals.total, 0) };
  }).filter((c) => !q || `${c.name} ${c.email} ${c.phone} ${c.city}`.toLowerCase().includes(q.toLowerCase())), [customers, orders, q]);

  return (
    <Panel title={`Customers (${rows.length})`}>
      <label className="relative mb-4 block"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" /><input className="input pl-10" placeholder="Search name, email, phone, city" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search customers" /></label>
      <div className="table-wrap"><table className="table">
        <thead><tr><th>Customer</th><th>Phone</th><th>City</th><th>Joined</th><th>Orders</th><th>Spent</th><th /></tr></thead>
        <tbody>{rows.map((c) => (
          <tr key={c.id} className="cursor-pointer hover:bg-cream/60" onClick={() => setView(c)}>
            <td><div className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-chilli-50 font-bold text-chilli">{c.name[0]}</span><span><span className="block font-semibold">{c.name}</span><span className="text-xs text-charcoal-400">{c.email}</span></span></div></td>
            <td>{c.phone}</td><td>{c.city}</td><td>{formatDate(c.joinedAt)}</td><td>{c.orders.length}</td><td className="font-semibold">{formatINR(c.spent)}</td>
            <td className="text-right"><button type="button" className="icon-btn h-9 w-9" aria-label={`View ${c.name}`}><ChevronRight size={16} /></button></td>
          </tr>
        ))}</tbody>
      </table></div>
      <Modal open={!!view} onClose={() => setView(null)} title={view?.name || ''}>
        {view && (
          <div className="p-5">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {[['Email', view.email], ['Phone', view.phone], ['City', view.city], ['Customer since', formatDate(view.joinedAt)], ['Orders', view.orders.length], ['Total spent', formatINR(view.spent)]].map(([k, v]) => <div key={k} className="rounded-xl bg-cream p-3"><dt className="text-xs text-charcoal-400">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
            </dl>
            <h3 className="mt-5 font-bold">Order history</h3>
            {!view.orders.length ? <p className="mt-2 text-sm text-charcoal-500">No orders yet.</p> : (
              <ul className="mt-2 divide-y divide-charcoal/10">{view.orders.map((o) => <li key={o.id} className="flex flex-wrap items-center gap-3 py-2.5 text-sm"><span className="font-mono font-semibold">{o.id}</span><span className="text-charcoal-500">{formatDate(o.placedAt)}</span><StatusBadge status={o.status} /><span className="ml-auto font-semibold">{formatINR(o.totals.total)}</span></li>)}</ul>
            )}
          </div>
        )}
      </Modal>
    </Panel>
  );
}
