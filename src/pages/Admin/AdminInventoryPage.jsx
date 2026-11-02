import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Boxes, PackageX, AlertTriangle, IndianRupee, Search, Minus, Plus, PackagePlus } from 'lucide-react';
import ProductImage from '@/components/product/ProductImage';
import { StatCard, Panel, PageHeader, Segmented, Badge, Empty } from '@/components/admin/ui';
import { useStagger } from '@/components/admin/motion';
import { useStore } from '@/context/StoreContext';
import { useUI } from '@/context/UIContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatINR, formatINRCompact } from '@/utils/format';

/** Stock for every pack size: inline edit, quick restock, low/out-of-stock filters. */
export default function AdminInventoryPage() {
  const { products, setProducts, settings, setSettings } = useStore();
  const { toast } = useUI();
  const [params] = useSearchParams();
  const [filter, setFilter] = useState(params.get('filter') || 'all');
  const [q, setQ] = useState('');
  useDocumentTitle('Admin · Inventory');
  const ref = useStagger();
  const th = Number(settings.lowStockThreshold) || 0;

  const rows = useMemo(() => products.flatMap((p) => p.packs.map((x, i) => ({ p, x, i, stock: Number(x.stock) || 0 }))), [products]);
  const stat = {
    units: rows.reduce((s, r) => s + r.stock, 0),
    value: rows.reduce((s, r) => s + r.stock * Number(r.x.price), 0),
    low: rows.filter((r) => r.stock > 0 && r.stock <= th).length,
    out: rows.filter((r) => r.stock === 0).length,
  };
  const list = rows.filter((r) => (filter === 'all' || (filter === 'low' && r.stock <= th) || (filter === 'out' && r.stock === 0) || (filter === 'ok' && r.stock > th))
    && (!q || `${r.p.name.en} ${r.p.sku} ${r.x.size}`.toLowerCase().includes(q.toLowerCase())))
    .sort((a, b) => (filter === 'all' ? 0 : a.stock - b.stock));

  const setStock = (pid, i, v) => setProducts((all) => all.map((p) => (p.id === pid ? { ...p, packs: p.packs.map((x, j) => (j === i ? { ...x, stock: Math.max(0, Math.round(Number(v) || 0)) } : x)) } : p)));
  const restockAll = () => {
    const n = rows.filter((r) => r.stock <= th).length;
    setProducts((all) => all.map((p) => ({ ...p, packs: p.packs.map((x) => (Number(x.stock) <= th ? { ...x, stock: Number(x.stock) + 100 } : x)) })));
    toast(`Restocked ${n} low packs (+100 each)`);
  };
  const max = Math.max(th * 4, ...rows.map((r) => r.stock), 1);

  return (
    <div ref={ref} className="space-y-6">
      <PageHeader title="Inventory" subtitle="Stock for every pack size. Changes apply to the store instantly."
        actions={<button type="button" className="adm-btn-accent" onClick={restockAll} disabled={!stat.low && !stat.out}><PackagePlus size={16} />Restock all low (+100)</button>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Boxes} label="Units in stock" value={stat.units} tone="charcoal" hint={`${rows.length} pack sizes`} />
        <StatCard icon={IndianRupee} label="Stock value (retail)" value={stat.value} format={formatINRCompact} tone="leaf" />
        <StatCard icon={AlertTriangle} label="Low stock" value={stat.low} tone="turmeric" hint={`≤ ${th} units`} />
        <StatCard icon={PackageX} label="Out of stock" value={stat.out} hint="Customers can’t buy these sizes" />
      </div>

      <Panel pad={false}>
        <div className="flex flex-col gap-3 border-b border-black/[.06] p-4 sm:p-5 lg:flex-row lg:items-center">
          <Segmented id="inv" value={filter} onChange={setFilter} options={[['all', 'All', rows.length], ['low', 'Needs restock', stat.low + stat.out], ['out', 'Out', stat.out], ['ok', 'Healthy']]} />
          <label className="relative flex-1"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" /><input className="adm-input pl-10" placeholder="Search product, SKU or size" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search inventory" /></label>
          <label className="flex items-center gap-2 text-sm text-charcoal-500">Alert at ≤<input type="number" min="0" className="adm-input w-20" value={settings.lowStockThreshold} onChange={(e) => setSettings({ ...settings, lowStockThreshold: Math.max(0, Number(e.target.value) || 0) })} aria-label="Low stock threshold" />units</label>
        </div>
        {!list.length ? <Empty icon={Boxes} title="Nothing here" text="No pack sizes match this filter." /> : (
          <div className="overflow-x-auto"><table className="adm-table">
            <thead><tr><th>Product</th><th>Size</th><th>Price</th><th className="min-w-[180px]">Level</th><th>Stock</th><th className="text-right">Quick restock</th></tr></thead>
            <tbody>{list.map(({ p, x, i, stock }) => {
              const tone = stock === 0 ? 'red' : stock <= th ? 'amber' : 'green';
              return (
                <tr key={`${p.id}-${i}`}>
                  <td><div className="flex items-center gap-3"><div className="w-10 shrink-0 overflow-hidden rounded-xl"><ProductImage product={p} compact /></div><div className="min-w-0"><p className="truncate font-semibold">{p.name.en}</p><p className="text-xs text-charcoal-400">{p.sku}</p></div></div></td>
                  <td><Badge>{x.size}</Badge></td>
                  <td className="tabular-nums">{formatINR(x.price)}</td>
                  <td>
                    <div className="h-2 overflow-hidden rounded-full bg-black/[.05]"><motion.div className={`h-full rounded-full ${tone === 'red' ? 'bg-chilli' : tone === 'amber' ? 'bg-turmeric' : 'bg-leaf'}`} initial={false} animate={{ width: `${Math.max(2, Math.min(100, (stock / max) * 100))}%` }} transition={{ type: 'spring', stiffness: 200, damping: 30 }} /></div>
                    <p className="mt-1 text-[11px] text-charcoal-400">{stock === 0 ? 'Out of stock' : stock <= th ? 'Low — restock soon' : 'Healthy'}</p>
                  </td>
                  <td>
                    <div className="inline-flex items-center rounded-xl border border-black/10 bg-white">
                      <button type="button" className="flex h-9 w-8 items-center justify-center text-charcoal-500 hover:text-chilli" onClick={() => setStock(p.id, i, stock - 1)} aria-label={`Decrease ${p.name.en} ${x.size}`}><Minus size={14} /></button>
                      <input type="number" min="0" value={stock} onChange={(e) => setStock(p.id, i, e.target.value)} className="h-9 w-16 border-x border-black/10 bg-transparent text-center text-sm font-semibold tabular-nums outline-none" aria-label={`Stock of ${p.name.en} ${x.size}`} />
                      <button type="button" className="flex h-9 w-8 items-center justify-center text-charcoal-500 hover:text-leaf-700" onClick={() => setStock(p.id, i, stock + 1)} aria-label={`Increase ${p.name.en} ${x.size}`}><Plus size={14} /></button>
                    </div>
                  </td>
                  <td className="text-right"><div className="inline-flex gap-1">{[10, 50, 100].map((n) => <button key={n} type="button" onClick={() => { setStock(p.id, i, stock + n); toast(`${p.name.en} ${x.size}: +${n}`); }} className="h-8 rounded-lg border border-black/10 px-2 text-xs font-semibold text-charcoal-600 transition hover:border-leaf hover:bg-leaf-50 hover:text-leaf-700">+{n}</button>)}</div></td>
                </tr>
              );
            })}</tbody>
          </table></div>
        )}
      </Panel>
    </div>
  );
}
