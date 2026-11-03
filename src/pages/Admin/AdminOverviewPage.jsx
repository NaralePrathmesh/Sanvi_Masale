import { useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api/client';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IndianRupee, ShoppingCart, Users, Receipt, Plus, Ticket, PackageX, ArrowUpRight, Star, MessageSquareHeart, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatCard, Panel, Segmented, OrderBadge, ORDER_LABEL, ORDER_DOT, Empty } from '@/components/admin/ui';
import { useStagger, themeColor } from '@/components/admin/motion';
import ProductImage from '@/components/product/ProductImage';
import { useOrders } from '@/context/OrderContext';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { demoMonthlySales } from '@/services/mock/seed';
import { formatINR, formatINRCompact, formatDate } from '@/utils/format';

const tip = { contentStyle: { borderRadius: 14, border: '1px solid rgba(0,0,0,.06)', boxShadow: '0 12px 30px -12px rgba(0,0,0,.25)', fontSize: 12 } };
const aov = (m) => (m?.orders ? m.sales / m.orders : 0);
const inr = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function AdminOverviewPage() {
  const { orders, customers, apiMode } = useOrders();
  const [dash, setDash] = useState(null); // API mode: server-side aggregates over ALL orders
  useEffect(() => { if (apiMode) api('/admin/dashboard').then(setDash).catch(() => {}); }, [apiMode, orders.length]);
  const { products, getProduct, reviews, settings } = useStore();
  const { admin } = useAuth();
  const [range, setRange] = useState('6');
  useDocumentTitle('Admin · Dashboard');
  const ref = useStagger();
  const accent = themeColor('chilli');

  const valid = orders.filter((o) => o.status !== 'cancelled');
  const liveSales = valid.reduce((s, o) => s + o.totals.total, 0);
  const sales = useMemo(() => {
    if (!apiMode) return demoMonthlySales.map((m, i, a) => (i === a.length - 1 ? { ...m, sales: m.sales + liveSales, orders: m.orders + valid.length } : m));
    // Last 6 calendar months, zero-filled, from the server's monthly totals.
    const out = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      const month = d.toLocaleString('en-US', { month: 'short' });
      const m = dash?.monthly?.find((x) => x.month === month);
      out.push({ month, sales: m?.sales || 0, orders: m?.orders || 0 });
    }
    return out;
  }, [apiMode, dash, liveSales, valid.length]);
  const shown = sales.slice(-Number(range));
  const cur = sales[sales.length - 1]; const prev = sales[sales.length - 2];
  const totalSales = sales.reduce((s, m) => s + m.sales, 0);
  const totalOrders = sales.reduce((s, m) => s + m.orders, 0);
  const pct = (a, b) => (b ? ((a - b) / b) * 100 : 0);

  const statusData = useMemo(() => Object.keys(ORDER_LABEL).map((s) => ({ s, name: ORDER_LABEL[s], value: dash?.byStatus ? dash.byStatus[s] || 0 : orders.filter((o) => o.status === s).length })).filter((d) => d.value), [orders, dash]);
  const top = useMemo(() => {
    const qty = {};
    if (dash?.top) dash.top.forEach((r) => { qty[r.productId] = r.units; });
    else valid.forEach((o) => o.items.forEach((it) => { qty[it.productId] = (qty[it.productId] || 0) + it.qty; }));
    const rows = Object.entries(qty).map(([id, q]) => ({ p: getProduct(id), q })).filter((r) => r.p).sort((a, b) => b.q - a.q).slice(0, 5);
    const max = Math.max(1, ...rows.map((r) => r.q));
    return rows.map((r) => ({ ...r, w: (r.q / max) * 100 }));
  }, [valid, getProduct, dash]);
  const low = products.flatMap((p) => p.packs.filter((x) => Number(x.stock) <= settings.lowStockThreshold).map((x) => ({ p, x }))).sort((a, b) => a.x.stock - b.x.stock).slice(0, 5);
  const latestReviews = reviews.filter((r) => !r.hidden).slice(0, 3);
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div ref={ref} className="space-y-6">
      {/* Hero greeting */}
      <section data-anim className="relative overflow-hidden rounded-[28px] bg-[#121010] p-6 text-white sm:p-8">
        <div aria-hidden="true" className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-chilli/40 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-turmeric/25 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[.16em] text-white/50"><Sparkles size={13} />{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            <h1 className="mt-2 font-sans text-2xl font-bold tracking-tight sm:text-3xl">{greet}, {admin?.name?.split(' ')[0] || 'Admin'} 👋</h1>
            <p className="mt-1 max-w-md text-sm text-white/60">This month: <strong className="text-white">{formatINR(cur.sales)}</strong> in sales from <strong className="text-white">{cur.orders}</strong> orders.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/products?new=1" className="adm-btn bg-white text-charcoal hover:bg-turmeric"><Plus size={16} />Add product</Link>
            <Link to="/admin/coupons?new=1" className="adm-btn border border-white/15 bg-white/5 text-white hover:bg-white/10"><Ticket size={16} />New coupon</Link>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={IndianRupee} label="Revenue (6 mo)" value={totalSales} format={(n) => formatINRCompact(n)} delta={pct(cur.sales, prev.sales)} hint="vs last month" trend={sales.map((m) => m.sales)} />
        <StatCard icon={ShoppingCart} label="Orders (6 mo)" value={totalOrders} delta={pct(cur.orders, prev.orders)} hint="vs last month" trend={sales.map((m) => m.orders)} tone="turmeric" />
        <StatCard icon={Receipt} label="Avg order value" value={totalSales / Math.max(1, totalOrders)} format={inr} delta={pct(aov(cur), aov(prev))} hint="vs last month" trend={sales.map(aov)} tone="leaf" />
        <StatCard icon={Users} label="Customers" value={dash?.customers ?? customers.length} hint={<Link to="/admin/customers" className="font-semibold text-chilli hover:underline">View all</Link>} tone="charcoal" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <Panel title="Revenue" subtitle="Monthly sales (demo history + live orders this month)" action={<Segmented id="range" value={range} onChange={setRange} options={[['3', '3M'], ['6', '6M']]} />}>
          <div className="h-72" role="img" aria-label="Area chart of monthly sales">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={shown} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={accent} stopOpacity={0.28} /><stop offset="100%" stopColor={accent} stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="#000" strokeOpacity={0.05} vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#8A847E' }} />
                <YAxis tickLine={false} axisLine={false} width={56} tick={{ fontSize: 12, fill: '#8A847E' }} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
                <Tooltip {...tip} formatter={(v) => [formatINR(v), 'Sales']} cursor={{ stroke: accent, strokeOpacity: 0.3 }} />
                <Area type="monotone" dataKey="sales" stroke={accent} strokeWidth={2.5} fill="url(#rev)" animationDuration={1200} activeDot={{ r: 6, stroke: '#fff', strokeWidth: 3, fill: accent }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>
        <Panel title="Orders by status" subtitle={`${orders.length} orders in the system`}>
          {statusData.length ? (
            <div className="flex flex-col items-center gap-4 sm:flex-row xl:flex-col 2xl:flex-row">
              <div className="relative h-48 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart><Pie data={statusData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={86} paddingAngle={3} stroke="none" animationDuration={1100}>{statusData.map((d) => <Cell key={d.s} fill={ORDER_DOT[d.s]} />)}</Pie><Tooltip {...tip} /></PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><span className="text-2xl font-bold">{orders.length}</span><span className="text-[11px] text-charcoal-400">orders</span></div>
              </div>
              <ul className="w-full space-y-1.5 text-sm">{statusData.map((d) => <li key={d.s}><Link to={`/admin/orders?status=${d.s}`} className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-black/[.03]"><span className="h-2.5 w-2.5 rounded-full" style={{ background: ORDER_DOT[d.s] }} />{d.name}<span className="ml-auto font-semibold tabular-nums">{d.value}</span></Link></li>)}</ul>
            </div>
          ) : <Empty icon={ShoppingCart} title="No orders yet" />}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Panel title="Top sellers" subtitle="Units sold in demo orders" action={<Link to="/admin/products" className="text-xs font-semibold text-chilli hover:underline">Products →</Link>}>
          {top.length ? (
            <ul className="space-y-4">{top.map(({ p, q, w }, i) => (
              <li key={p.id} className="flex items-center gap-3">
                <div className="w-10 shrink-0 overflow-hidden rounded-xl"><ProductImage product={p} compact /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2 text-sm"><span className="truncate font-semibold">{p.name.en}</span><span className="shrink-0 tabular-nums text-charcoal-500">{q}</span></div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[.05]"><motion.div className="h-full rounded-full bg-gradient-to-r from-turmeric to-chilli" initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ duration: 1, delay: 0.3 + i * 0.08, ease: [0.2, 0.75, 0.25, 1] }} /></div>
                </div>
              </li>
            ))}</ul>
          ) : <Empty icon={ShoppingCart} title="No sales yet" />}
        </Panel>
        <Panel title="Stock alerts" subtitle={`Packs at or below ${settings.lowStockThreshold} units`} action={<Link to="/admin/inventory?filter=low" className="text-xs font-semibold text-chilli hover:underline">Inventory →</Link>}>
          {low.length ? (
            <ul className="divide-y divide-black/[.05]">{low.map(({ p, x }) => (
              <li key={`${p.id}-${x.size}`} className="flex items-center gap-3 py-2.5 text-sm">
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${Number(x.stock) === 0 ? 'bg-chilli-50 text-chilli' : 'bg-turmeric-100 text-turmeric-700'}`}><PackageX size={15} /></span>
                <span className="min-w-0 flex-1"><span className="block truncate font-semibold">{p.name.en}</span><span className="text-xs text-charcoal-500">{x.size}</span></span>
                <span className={`font-bold tabular-nums ${Number(x.stock) === 0 ? 'text-chilli' : 'text-turmeric-700'}`}>{x.stock}</span>
              </li>
            ))}</ul>
          ) : <Empty icon={PackageX} title="All stocked up" text="No pack is below the alert level." />}
        </Panel>
        <Panel title="Latest reviews" action={<Link to="/admin/reviews" className="text-xs font-semibold text-chilli hover:underline">Moderate →</Link>} className="lg:col-span-2 xl:col-span-1">
          {latestReviews.length ? (
            <ul className="space-y-3">{latestReviews.map((r) => (
              <li key={r.id} className="rounded-2xl bg-[#E7FCE3] p-3.5">
                <div className="flex items-center justify-between gap-2 text-sm"><span className="truncate font-semibold text-[#0A7C4E]">{r.name}</span><span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-turmeric-700"><Star size={12} className="fill-turmeric text-turmeric" />{r.rating}</span></div>
                <p className="mt-1 line-clamp-2 text-[13px] text-[#111B21]">{r.text}</p>
              </li>
            ))}</ul>
          ) : <Empty icon={MessageSquareHeart} title="No reviews yet" />}
        </Panel>
      </div>

      <Panel title="Recent orders" pad={false} action={<Link to="/admin/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-chilli hover:underline">All orders<ArrowUpRight size={13} /></Link>}>
        <div className="overflow-x-auto"><table className="adm-table">
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th className="text-right">Total</th></tr></thead>
          <tbody>{orders.slice(0, 6).map((o) => (
            <tr key={o.id}><td><Link to={`/admin/orders?view=${o.id}`} className="font-mono text-[13px] font-semibold hover:text-chilli">{o.id}</Link></td><td>{o.customer.name}<span className="block text-xs text-charcoal-400">{o.address.city}</span></td><td className="whitespace-nowrap text-charcoal-500">{formatDate(o.placedAt)}</td><td><OrderBadge status={o.status} /></td><td className="text-right font-semibold tabular-nums">{formatINR(o.totals.total)}</td></tr>
          ))}</tbody>
        </table></div>
      </Panel>
    </div>
  );
}
