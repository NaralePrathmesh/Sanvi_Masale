import { Link } from 'react-router-dom';
import { IndianRupee, ShoppingCart, Package, Users, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { StatCard, Panel } from '@/components/admin/ui';
import { StatusBadge } from '@/components/order/OrderTimeline';
import { useOrders } from '@/context/OrderContext';
import { useStore } from '@/context/StoreContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { demoMonthlySales } from '@/services/mock/seed';
import { formatINR, formatDate, formatINRCompact } from '@/utils/format';

const tip = { contentStyle: { borderRadius: 12, border: '1px solid rgba(40,35,31,.1)', fontSize: 12 }, cursor: { stroke: '#28231F', strokeOpacity: 0.2 } };

export default function AdminOverviewPage() {
  const { orders, customers } = useOrders();
  const { products, getProduct } = useStore();
  useDocumentTitle('Admin · Overview');
  const valid = orders.filter((o) => o.status !== 'cancelled');
  const liveSales = valid.reduce((s, o) => s + o.totals.total, 0);
  const historic = demoMonthlySales.slice(0, -1).reduce((s, m) => s + m.sales, 0);
  const pending = orders.filter((o) => ['placed', 'confirmed', 'processing'].includes(o.status));
  const sales = demoMonthlySales.map((m, i, a) => (i === a.length - 1 ? { ...m, sales: m.sales + liveSales } : m));

  const qty = {};
  valid.forEach((o) => o.items.forEach((it) => { qty[it.productId] = (qty[it.productId] || 0) + it.qty; }));
  const top = Object.entries(qty).map(([id, q]) => ({ name: getProduct(id)?.name.en || id, units: q })).sort((a, b) => b.units - a.units).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={IndianRupee} label="Total sales" value={formatINRCompact(historic + liveSales)} hint="Last 6 months (demo)" />
        <StatCard icon={ShoppingCart} label="Orders" value={orders.length} hint={<Link to="/admin/orders" className="inline-flex items-center gap-1 text-chilli hover:underline"><Clock size={12} />{pending.length} pending</Link>} />
        <StatCard icon={Package} label="Products" value={products.length} hint={`${products.filter((p) => p.active !== false).length} active`} />
        <StatCard icon={Users} label="Customers" value={customers.length} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Panel title="Monthly sales (₹)">
          <div className="h-72" role="img" aria-label="Area chart of monthly sales">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sales} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="#28231F" strokeOpacity={0.06} vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#7A7068' }} />
                <YAxis tickLine={false} axisLine={false} width={56} tick={{ fontSize: 12, fill: '#7A7068' }} tickFormatter={(v) => `₹${Math.round(v / 1000)}k`} />
                <Tooltip {...tip} formatter={(v) => [formatINR(v), 'Sales']} />
                <Area type="monotone" dataKey="sales" stroke="#762B32" strokeWidth={2} fill="#762B32" fillOpacity={0.1} activeDot={{ r: 5, stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <details className="mt-3 text-sm"><summary className="cursor-pointer text-charcoal-500">View as table</summary>
            <table className="mt-2 w-full text-left text-sm"><thead><tr className="text-charcoal-400"><th className="py-1">Month</th><th>Sales</th><th>Orders</th></tr></thead><tbody>{sales.map((m) => <tr key={m.month} className="border-t border-charcoal/5"><td className="py-1">{m.month}</td><td>{formatINR(m.sales)}</td><td>{m.orders}</td></tr>)}</tbody></table>
          </details>
        </Panel>
        <Panel title="Top-selling products">
          {top.length ? (
            <div className="h-72" role="img" aria-label="Bar chart of top-selling products">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }} barCategoryGap={8}>
                  <XAxis type="number" hide allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={130} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#3E3731' }} />
                  <Tooltip {...tip} cursor={{ fill: '#28231F', fillOpacity: 0.04 }} formatter={(v) => [v, 'Units']} />
                  <Bar dataKey="units" fill="#762B32" radius={[0, 4, 4, 0]} barSize={18} label={{ position: 'right', fontSize: 12, fill: '#3E3731' }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-sm text-charcoal-500">No orders yet.</p>}
        </Panel>
      </div>
      <Panel title="Recent orders · demo data" action={<Link to="/admin/orders" className="link text-sm">View all →</Link>}>
        <div className="table-wrap border-0"><table className="table">
          <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Status</th><th className="text-right">Total</th></tr></thead>
          <tbody>{orders.slice(0, 5).map((o) => (
            <tr key={o.id}><td className="font-mono font-semibold">{o.id}</td><td>{o.customer.name}<span className="block text-xs text-charcoal-400">{o.address.city}</span></td><td>{formatDate(o.placedAt)}</td><td><StatusBadge status={o.status} /></td><td className="text-right font-semibold">{formatINR(o.totals.total)}</td></tr>
          ))}</tbody>
        </table></div>
      </Panel>
    </div>
  );
}
