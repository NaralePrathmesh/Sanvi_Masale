import { useMemo, useState } from 'react';
import { Search, Eye } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { Panel } from '@/components/admin/ui';
import { StatusBadge } from '@/components/order/OrderTimeline';
import OrderItems from '@/components/order/OrderItems';
import OrderSummary from '@/components/cart/OrderSummary';
import { useOrders } from '@/context/OrderContext';
import { useUI } from '@/context/UIContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { ORDER_STATUSES } from '@/config/site';
import { formatINR, formatDateTime } from '@/utils/format';

const LABEL = { placed: 'Placed', confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled' };
const PAY = { upi: 'UPI', card: 'Card', netbanking: 'Net banking', cod: 'Cash on Delivery' };

export default function AdminOrdersPage() {
  const { orders, updateStatus } = useOrders();
  const { toast } = useUI();
  const [q, setQ] = useState(''); const [status, setStatus] = useState(''); const [pay, setPay] = useState('');
  const [viewId, setViewId] = useState(null);
  useDocumentTitle('Admin · Orders');
  const list = useMemo(() => orders.filter((o) => (!status || o.status === status) && (!pay || o.payment === pay)
    && (!q || `${o.id} ${o.customer.name} ${o.customer.email} ${o.customer.phone} ${o.address.city}`.toLowerCase().includes(q.toLowerCase()))), [orders, q, status, pay]);
  const view = orders.find((o) => o.id === viewId);
  const counts = Object.fromEntries([...ORDER_STATUSES, 'cancelled'].map((s) => [s, orders.filter((o) => o.status === s).length]));
  const change = (o, s) => { updateStatus(o.id, s); toast(`${o.id} → ${LABEL[s]}`); };

  return (
    <div className="space-y-6">
      <div className="scrollbar-none flex gap-2 overflow-x-auto">
        <button type="button" onClick={() => setStatus('')} className={`chip shrink-0 ${!status ? 'chip-active' : ''}`}>All ({orders.length})</button>
        {[...ORDER_STATUSES, 'cancelled'].map((s) => <button key={s} type="button" onClick={() => setStatus(s)} className={`chip shrink-0 ${status === s ? 'chip-active' : ''}`}>{LABEL[s]} ({counts[s]})</button>)}
      </div>
      <Panel title={`Orders (${list.length})`}>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <label className="relative flex-1"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" /><input className="input pl-10" placeholder="Search order ID, customer, phone, city" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search orders" /></label>
          <select className="input sm:w-52" value={pay} onChange={(e) => setPay(e.target.value)} aria-label="Filter by payment"><option value="">All payment methods</option>{Object.entries(PAY).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        </div>
        {!list.length ? <p className="py-8 text-center text-sm text-charcoal-500">No orders match these filters.</p> : (
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Order</th><th>Customer</th><th>Placed</th><th>Payment</th><th>Total</th><th>Status</th><th className="text-right">View</th></tr></thead>
            <tbody>{list.map((o) => (
              <tr key={o.id}>
                <td className="font-mono font-semibold">{o.id}</td>
                <td>{o.customer.name}<span className="block text-xs text-charcoal-400">{o.address.city} · {o.customer.phone}</span></td>
                <td className="whitespace-nowrap text-xs">{formatDateTime(o.placedAt)}</td>
                <td>{PAY[o.payment]}</td>
                <td className="font-semibold">{formatINR(o.totals.total)}</td>
                <td><select value={o.status} onChange={(e) => change(o, e.target.value)} className="h-9 rounded-full border border-charcoal/15 bg-white px-2 text-xs font-semibold" aria-label={`Status of ${o.id}`}>{[...ORDER_STATUSES, 'cancelled'].map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}</select></td>
                <td className="text-right"><button type="button" className="icon-btn h-9 w-9" onClick={() => setViewId(o.id)} aria-label={`View ${o.id}`}><Eye size={16} /></button></td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      </Panel>
      <Modal open={!!view} onClose={() => setViewId(null)} title={view ? `Order ${view.id}` : ''} size="lg">
        {view && (
          <div className="grid gap-6 p-5 md:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="mb-4 flex flex-wrap items-center gap-3"><StatusBadge status={view.status} /><span className="text-xs text-charcoal-500">Placed {formatDateTime(view.placedAt)}</span>{view.demo && <span className="demo-pill">Demo</span>}</div>
              <OrderItems items={view.items} />
              <h3 className="mt-5 text-sm font-bold">Status history</h3>
              <ul className="mt-2 space-y-1 text-xs text-charcoal-600">{(view.history || []).map((h, i) => <li key={i}>• {LABEL[h.status]} — {formatDateTime(h.at)}</li>)}</ul>
            </div>
            <div className="space-y-4 text-sm">
              <div><p className="text-xs font-semibold uppercase text-charcoal-400">Customer</p><p>{view.customer.name}<br />{view.customer.email}<br />{view.customer.phone}</p></div>
              <div><p className="text-xs font-semibold uppercase text-charcoal-400">Ship to</p><p>{view.address.house}, {view.address.street}, {view.address.area}, {view.address.city}, {view.address.state} – {view.address.pin}</p></div>
              <div><p className="text-xs font-semibold uppercase text-charcoal-400">Payment · Delivery</p><p>{PAY[view.payment]}{view.paymentInfo ? ` (${view.paymentInfo})` : ''} · {view.delivery.method}</p></div>
              <label className="block"><span className="text-xs font-semibold uppercase text-charcoal-400">Update status</span><select className="input mt-1" value={view.status} onChange={(e) => change(view, e.target.value)}>{[...ORDER_STATUSES, 'cancelled'].map((s) => <option key={s} value={s}>{LABEL[s]}</option>)}</select></label>
              <div className="rounded-xl bg-cream p-4"><OrderSummary totals={view.totals} /></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
