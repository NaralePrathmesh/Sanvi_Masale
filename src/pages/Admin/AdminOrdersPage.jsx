import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, KanbanSquare, List, Printer, ChevronRight, XCircle, Phone, Mail, MapPin, CreditCard, Truck, GripVertical, ShoppingCart, MessageCircle } from 'lucide-react';
import ProductImage from '@/components/product/ProductImage';
import { Panel, PageHeader, Segmented, OrderBadge, ORDER_LABEL, ORDER_DOT, PAY_LABEL, Empty } from '@/components/admin/ui';
import { Drawer, useStagger, spring } from '@/components/admin/motion';
import { useOrders } from '@/context/OrderContext';
import { useStore } from '@/context/StoreContext';
import { useUI } from '@/context/UIContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePersistentState } from '@/hooks/usePersistentState';
import { ORDER_STATUSES } from '@/config/site';
import { brand } from '@/config/brand';
import { formatINR, formatDateTime, formatDate } from '@/utils/format';

const ALL = [...ORDER_STATUSES, 'cancelled'];
const ago = (iso) => {
  const m = Math.round((Date.now() - new Date(iso)) / 60000);
  if (m < 60) return `${Math.max(1, m)}m ago`; if (m < 1440) return `${Math.round(m / 60)}h ago`; return `${Math.round(m / 1440)}d ago`;
};

export default function AdminOrdersPage() {
  const { orders, updateStatus } = useOrders();
  const { toast } = useUI();
  const [params, setParams] = useSearchParams();
  const [view, setView] = usePersistentState('adminOrderView', 'board');
  const [q, setQ] = useState(''); const [status, setStatus] = useState(params.get('status') || ''); const [pay, setPay] = useState('');
  const [viewId, setViewId] = useState(params.get('view'));
  const [dragOver, setDragOver] = useState(null);
  useDocumentTitle('Admin · Orders');
  const ref = useStagger([view]);
  useEffect(() => { if (params.get('view') || params.get('status')) setParams({}, { replace: true }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const list = useMemo(() => orders.filter((o) => (!status || o.status === status) && (!pay || o.payment === pay)
    && (!q || `${o.id} ${o.customer.name} ${o.customer.email} ${o.customer.phone} ${o.address.city}`.toLowerCase().includes(q.toLowerCase()))), [orders, q, status, pay]);
  const counts = Object.fromEntries(ALL.map((s) => [s, orders.filter((o) => o.status === s).length]));
  const order = orders.find((o) => o.id === viewId);
  const change = (o, s) => { if (o.status === s) return; updateStatus(o.id, s); toast(`${o.id} → ${ORDER_LABEL[s]}`); };

  return (
    <div ref={ref} className="space-y-6">
      <PageHeader title="Orders" subtitle={`${orders.length} orders · ${counts.placed + counts.confirmed} need attention`}
        actions={<Segmented id="oview" value={view} onChange={setView} options={[['board', <span key="b" className="inline-flex items-center gap-1.5"><KanbanSquare size={14} />Board</span>], ['list', <span key="l" className="inline-flex items-center gap-1.5"><List size={14} />List</span>]]} />} />

      <div data-anim className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" /><input className="adm-input pl-10" placeholder="Search order ID, customer, phone, city" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search orders" /></label>
        <select className="adm-input sm:w-52" value={pay} onChange={(e) => setPay(e.target.value)} aria-label="Filter by payment"><option value="">All payment methods</option>{Object.entries(PAY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        {view === 'list' && <select className="adm-input sm:w-48" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status"><option value="">All statuses</option>{ALL.map((s) => <option key={s} value={s}>{ORDER_LABEL[s]} ({counts[s]})</option>)}</select>}
      </div>

      {view === 'board' ? (
        <div data-anim className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <p className="mb-3 text-xs text-charcoal-500">Drag a card to another column to change its status (or open it and use the buttons).</p>
          <div className="flex gap-4">
            {ALL.map((s) => {
              const col = list.filter((o) => o.status === s);
              return (
                <section key={s} aria-label={ORDER_LABEL[s]}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(s); }} onDragLeave={() => setDragOver((d) => (d === s ? null : d))}
                  onDrop={(e) => { e.preventDefault(); setDragOver(null); const o = orders.find((x) => x.id === e.dataTransfer.getData('text/plain')); if (o) change(o, s); }}
                  className={`flex w-72 shrink-0 flex-col rounded-[22px] border p-2.5 transition-colors ${dragOver === s ? 'border-chilli/40 bg-chilli/[.05]' : 'border-black/[.05] bg-black/[.025]'}`}>
                  <header className="flex items-center gap-2 px-2 pb-2.5 pt-1.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: ORDER_DOT[s] }} />
                    <h2 className="text-sm font-bold">{ORDER_LABEL[s]}</h2>
                    <span className="ml-auto rounded-full bg-white px-2 text-xs font-semibold text-charcoal-500 shadow-sm">{col.length}</span>
                  </header>
                  <div className="flex min-h-[120px] flex-1 flex-col gap-2.5">
                    <AnimatePresence initial={false}>
                      {col.map((o) => (
                        <motion.div key={o.id} layout layoutId={`ord-${o.id}`} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={spring}>
                          <div draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', o.id); e.dataTransfer.effectAllowed = 'move'; }}
                            onClick={() => setViewId(o.id)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setViewId(o.id)}
                            className="group cursor-grab rounded-2xl border border-black/[.06] bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,.05)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-16px_rgba(0,0,0,.35)] active:cursor-grabbing">
                            <div className="flex items-center gap-2"><span className="font-mono text-[13px] font-bold">{o.id}</span><span className="ml-auto text-[11px] text-charcoal-400">{ago(o.placedAt)}</span><GripVertical size={14} className="text-charcoal-400 opacity-0 transition group-hover:opacity-100" /></div>
                            <p className="mt-1.5 truncate text-sm font-semibold">{o.customer.name}</p>
                            <p className="truncate text-xs text-charcoal-500">{o.address.city} · {PAY_LABEL[o.payment]}</p>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="flex -space-x-2">{o.items.slice(0, 3).map((it, i) => <OrderThumb key={i} id={it.productId} />)}{o.items.length > 3 && <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/[.06] text-[10px] font-bold ring-2 ring-white">+{o.items.length - 3}</span>}</span>
                              <span className="font-bold tabular-nums">{formatINR(o.totals.total)}</span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {!col.length && <p className="flex flex-1 items-center justify-center rounded-2xl border-2 border-dashed border-black/[.08] px-3 py-8 text-center text-xs text-charcoal-400">Drop orders here</p>}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <Panel pad={false}>
          {!list.length ? <Empty icon={ShoppingCart} title="No orders match these filters" /> : (
            <div className="overflow-x-auto"><table className="adm-table">
              <thead><tr><th>Order</th><th>Customer</th><th>Placed</th><th>Payment</th><th>Total</th><th>Status</th><th /></tr></thead>
              <tbody>{list.map((o) => (
                <tr key={o.id} className="cursor-pointer" onClick={() => setViewId(o.id)}>
                  <td className="font-mono text-[13px] font-bold">{o.id}</td>
                  <td>{o.customer.name}<span className="block text-xs text-charcoal-400">{o.address.city} · {o.customer.phone}</span></td>
                  <td className="whitespace-nowrap text-xs text-charcoal-500">{formatDateTime(o.placedAt)}</td>
                  <td>{PAY_LABEL[o.payment]}</td>
                  <td className="font-semibold tabular-nums">{formatINR(o.totals.total)}</td>
                  <td onClick={(e) => e.stopPropagation()}><select value={o.status} onChange={(e) => change(o, e.target.value)} className="h-8 rounded-full border border-black/10 bg-white px-2 text-xs font-semibold" aria-label={`Status of ${o.id}`}>{ALL.map((s) => <option key={s} value={s}>{ORDER_LABEL[s]}</option>)}</select></td>
                  <td className="text-right"><ChevronRight size={16} className="text-charcoal-400" /></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </Panel>
      )}

      <OrderDrawer order={order} onClose={() => setViewId(null)} onChange={change} />
    </div>
  );
}

function OrderThumb({ id }) {
  const { getProduct } = useStore();
  const p = getProduct(id);
  return <span className="h-7 w-7 overflow-hidden rounded-full bg-[#FEFDF8] ring-2 ring-white">{p && <ProductImage product={p} compact sizes="28px" />}</span>;
}

function OrderDrawer({ order: o, onClose, onChange }) {
  const { getProduct } = useStore();
  const step = o ? ORDER_STATUSES.indexOf(o.status) : -1;
  const next = o && o.status !== 'cancelled' && step < ORDER_STATUSES.length - 1 ? ORDER_STATUSES[step + 1] : null;
  const wa = o ? `https://wa.me/91${o.customer.phone.replace(/\D/g, '').slice(-10)}?text=${encodeURIComponent(`Hello ${o.customer.name}, your Saanvi Masale order ${o.id} is now: ${ORDER_LABEL[o.status]}.`)}` : '#';
  return (
    <Drawer open={!!o} onClose={onClose} title={o ? `Order ${o.id}` : ''} subtitle={o ? `Placed ${formatDateTime(o.placedAt)}` : ''} width="max-w-2xl"
      footer={o && <>
        {o.status !== 'cancelled' && o.status !== 'delivered' && <button type="button" className="adm-btn-ghost mr-auto text-chilli" onClick={() => onChange(o, 'cancelled')}><XCircle size={16} />Cancel order</button>}
        <button type="button" className="adm-btn-ghost" onClick={() => printInvoice(o, getProduct)}><Printer size={16} />Invoice</button>
        {next && <button type="button" className="adm-btn-accent" onClick={() => onChange(o, next)}><Truck size={16} />Mark as {ORDER_LABEL[next]}</button>}
      </>}>
      {o && (
        <div className="space-y-6 p-6">
          {/* status stepper */}
          <div>
            <div className="flex items-center justify-between"><OrderBadge status={o.status} />{o.demo && <span className="text-[11px] font-semibold uppercase tracking-wide text-turmeric-700">Demo order</span>}</div>
            <ol className="mt-5 grid grid-cols-6 gap-1.5">
              {ORDER_STATUSES.map((s, i) => {
                const done = o.status !== 'cancelled' && i <= step;
                return (
                  <li key={s}>
                    <button type="button" onClick={() => onChange(o, s)} className="group w-full text-left" aria-label={`Set status ${ORDER_LABEL[s]}`}>
                      <span className="block h-1.5 overflow-hidden rounded-full bg-black/[.07]"><motion.span className="block h-full rounded-full bg-gradient-to-r from-chilli to-turmeric" initial={false} animate={{ width: done ? '100%' : '0%' }} transition={{ duration: 0.5, delay: done ? i * 0.06 : 0 }} /></span>
                      <span className={`mt-1.5 block truncate text-[10px] font-semibold ${done ? 'text-charcoal' : 'text-charcoal-400 group-hover:text-charcoal'}`}>{ORDER_LABEL[s]}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <section>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-charcoal-400">Items ({o.items.length})</h3>
            <ul className="divide-y divide-black/[.05] rounded-2xl border border-black/[.06]">
              {o.items.map((it, i) => {
                const p = getProduct(it.productId);
                return (
                  <li key={i} className="flex items-center gap-3 p-3">
                    <div className="w-12 shrink-0 overflow-hidden rounded-xl bg-[#FEFDF8]">{p && <ProductImage product={p} compact />}</div>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{p?.name.en || it.productId}</p><p className="text-xs text-charcoal-500">{it.size} · {formatINR(it.price)} × {it.qty}</p></div>
                    <span className="font-semibold tabular-nums">{formatINR(it.price * it.qty)}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="rounded-2xl bg-[#FAFAF8] p-4 text-sm">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-charcoal-400">Customer</h3>
              <p className="font-semibold">{o.customer.name}</p>
              <p className="mt-1 flex items-center gap-2 text-charcoal-600"><Mail size={13} />{o.customer.email}</p>
              <p className="mt-1 flex items-center gap-2 text-charcoal-600"><Phone size={13} />{o.customer.phone}</p>
              <div className="mt-3 flex gap-2">
                <a href={`tel:${o.customer.phone}`} className="adm-btn-ghost h-8 px-3 text-xs"><Phone size={13} />Call</a>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="adm-btn h-8 bg-[#25D366] px-3 text-xs text-white hover:brightness-95"><MessageCircle size={13} />WhatsApp update</a>
              </div>
            </section>
            <section className="rounded-2xl bg-[#FAFAF8] p-4 text-sm">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-[.12em] text-charcoal-400">Delivery</h3>
              <p className="flex gap-2 text-charcoal-600"><MapPin size={13} className="mt-1 shrink-0" />{o.address.house}, {o.address.street}, {o.address.area}, {o.address.city}, {o.address.state} – {o.address.pin}</p>
              <p className="mt-2 flex items-center gap-2 text-charcoal-600"><CreditCard size={13} />{PAY_LABEL[o.payment]}{o.paymentInfo ? ` (${o.paymentInfo})` : ''}</p>
              <p className="mt-1 flex items-center gap-2 text-charcoal-600"><Truck size={13} />{o.delivery.method === 'express' ? 'Express' : 'Standard'}{o.delivery.eta ? ` · ETA ${formatDate(o.delivery.eta)}` : ''}</p>
            </section>
          </div>

          <section className="rounded-2xl border border-black/[.06] p-4 text-sm">
            {[['Subtotal', o.totals.subtotal], o.totals.couponDiscount ? [`Coupon ${o.totals.couponCode || ''}`, -o.totals.couponDiscount] : null, o.totals.comboDiscount ? ['Combo discount', -o.totals.comboDiscount] : null, ['Delivery', o.totals.delivery], o.totals.codCharge ? ['COD charge', o.totals.codCharge] : null].filter(Boolean).map(([k, v]) => (
              <div key={k} className="flex justify-between py-1"><span className="text-charcoal-500">{k}</span><span className={`tabular-nums ${v < 0 ? 'text-leaf-700' : ''}`}>{v < 0 ? `−${formatINR(-v)}` : v === 0 && k === 'Delivery' ? 'Free' : formatINR(v)}</span></div>
            ))}
            <div className="mt-2 flex justify-between border-t border-black/[.06] pt-3 text-base font-bold"><span>Total</span><span className="tabular-nums">{formatINR(o.totals.total)}</span></div>
          </section>

          <section>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-[.12em] text-charcoal-400">Timeline</h3>
            <ol className="relative space-y-3 border-l border-black/10 pl-5">
              {[...(o.history || [])].reverse().map((h, i) => (
                <li key={i} className="relative text-sm"><span className="absolute -left-[26px] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white" style={{ background: ORDER_DOT[h.status] }} /><span className="font-semibold">{ORDER_LABEL[h.status]}</span><span className="block text-xs text-charcoal-400">{formatDateTime(h.at)}</span></li>
              ))}
            </ol>
          </section>
        </div>
      )}
    </Drawer>
  );
}

/** Opens a clean, printable tax-invoice style page in a new window (DEMO — not a legal GST invoice). */
function printInvoice(o, getProduct) {
  const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const rows = o.items.map((it, i) => `<tr><td>${i + 1}</td><td>${esc(getProduct(it.productId)?.name.en || it.productId)}<br><small>${esc(it.size)}</small></td><td>${it.qty}</td><td>₹${it.price}</td><td>₹${it.price * it.qty}</td></tr>`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${esc(o.id)}</title><style>
    body{font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#1d1b19;margin:40px;font-size:13px}
    h1{font-size:22px;margin:0}.muted{color:#777}.row{display:flex;justify-content:space-between;gap:24px}
    table{width:100%;border-collapse:collapse;margin-top:24px}th,td{text-align:left;padding:10px;border-bottom:1px solid #eee}th{background:#faf8f5;font-size:11px;text-transform:uppercase;letter-spacing:.06em}
    .tot{margin-left:auto;width:280px;margin-top:16px}.tot div{display:flex;justify-content:space-between;padding:4px 0}.grand{font-weight:700;font-size:16px;border-top:2px solid #1d1b19;margin-top:6px;padding-top:8px!important}
    .demo{margin-top:32px;padding:10px;border:1px dashed #d9a400;background:#fff8e6;font-size:12px}
  </style></head><body>
    <div class="row"><div><h1>${esc(brand.name)} <span class="muted" style="font-size:14px">${esc(brand.nameLatin)}</span></h1><p class="muted">${esc(brand.contact.address)}<br>${esc(brand.contact.email)}</p></div>
    <div style="text-align:right"><h1>INVOICE</h1><p class="muted">No. ${esc(o.id)}<br>Date ${new Date(o.placedAt).toLocaleDateString('en-IN')}</p></div></div>
    <div class="row" style="margin-top:24px"><div><strong>Bill to</strong><br>${esc(o.customer.name)}<br>${esc(o.address.house)}, ${esc(o.address.street)}, ${esc(o.address.area)}<br>${esc(o.address.city)}, ${esc(o.address.state)} – ${esc(o.address.pin)}<br>${esc(o.customer.phone)}</div>
    <div style="text-align:right"><strong>Payment</strong><br>${esc(PAY_LABEL[o.payment])}<br>Status: ${esc(ORDER_LABEL[o.status])}</div></div>
    <table><thead><tr><th>#</th><th>Item</th><th>Qty</th><th>Rate</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="tot"><div><span>Subtotal</span><span>₹${o.totals.subtotal}</span></div>${o.totals.couponDiscount ? `<div><span>Coupon</span><span>−₹${o.totals.couponDiscount}</span></div>` : ''}${o.totals.comboDiscount ? `<div><span>Combo</span><span>−₹${o.totals.comboDiscount}</span></div>` : ''}<div><span>Delivery</span><span>${o.totals.delivery ? `₹${o.totals.delivery}` : 'Free'}</span></div>${o.totals.codCharge ? `<div><span>COD</span><span>₹${o.totals.codCharge}</span></div>` : ''}<div class="grand"><span>Total</span><span>₹${o.totals.total}</span></div></div>
    <p class="demo">Demo invoice generated by the frontend prototype — not a valid GST tax invoice. Real invoices (GSTIN, HSN codes, tax split) come with the Phase 2 backend.</p>
    <script>window.onload=()=>setTimeout(()=>window.print(),300)<\/script></body></html>`;
  const w = window.open('', '_blank', 'width=900,height=1000');
  if (!w) return;
  w.document.open(); w.document.write(html); w.document.close();
}
