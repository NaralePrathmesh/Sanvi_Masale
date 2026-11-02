import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import { productTypes, regions } from '@/data/categories';

function Group({ title, children }) {
  return <fieldset className="border-b border-line py-5 first:pt-0"><legend className="mb-3 text-xs font-semibold uppercase tracking-[.12em] text-charcoal-500">{title}</legend>{children}</fieldset>;
}
function Check({ checked, onChange, label, count }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 rounded border-charcoal/30 accent-chilli" />
      <span className="flex-1">{label}</span>{count != null && <span className="text-xs text-charcoal-400">{count}</span>}
    </label>
  );
}

export default function ShopFilters({ f, update, clearAll, hideCategory = false }) {
  const { categories, activeProducts } = useStore();
  const { t, l } = useLocalized();
  const [min, setMin] = useState(f.min); const [max, setMax] = useState(f.max);
  useEffect(() => { setMin(f.min); setMax(f.max); }, [f.min, f.max]);
  const toggle = (key, id) => update({ [key]: f[key].includes(id) ? f[key].filter((x) => x !== id) : [...f[key], id] });
  const countBy = (key, id) => activeProducts.filter((p) => p[key] === id).length;
  const presets = [[0, 100], [100, 200], [200, 400], [400, '']];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between"><p className="text-sm font-semibold">{t('shop.filters')}</p><button type="button" onClick={clearAll} className="text-xs font-semibold text-chilli hover:underline">{t('actions.clearAll')}</button></div>
      {!hideCategory && <Group title={t('filters.category')}>
        {categories.map((c) => <Check key={c.id} checked={f.category.includes(c.id)} onChange={() => toggle('category', c.id)} label={l(c.name)} count={countBy('category', c.id)} />)}
      </Group>}
      <Group title={t('filters.price')}>
        <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); update({ min, max }); }}>
          <div className="flex items-center gap-2">
            <input type="number" min="0" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} placeholder={`₹ ${t('filters.min')}`} className="input min-w-0 px-3" aria-label={t('filters.min')} />
            <span className="text-charcoal-400">–</span>
            <input type="number" min="0" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} placeholder={`₹ ${t('filters.max')}`} className="input min-w-0 px-3" aria-label={t('filters.max')} />
          </div>
          <button type="submit" className="btn-outline btn-sm w-full">{t('actions.apply')}</button>
        </form>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {presets.map(([a, b]) => {
            const active = String(f.min) === String(a) && String(f.max) === String(b);
            return <button key={a} type="button" onClick={() => update(active ? { min: '', max: '' } : { min: String(a), max: String(b) })} className={`chip px-2.5 py-1 text-xs ${active ? 'chip-active' : ''}`}>{b ? `₹${a}–₹${b}` : `₹${a}+`}</button>;
          })}
        </div>
      </Group>
      <Group title={t('filters.type')}>
        {productTypes.map((c) => <Check key={c.id} checked={f.type.includes(c.id)} onChange={() => toggle('type', c.id)} label={l(c.name)} count={countBy('type', c.id)} />)}
      </Group>
      <Group title={t('filters.region')}>
        {[...regions, { id: 'pan-india', name: { en: t('product.panIndia'), hi: t('product.panIndia'), mr: t('product.panIndia') } }].map((r) => <Check key={r.id} checked={f.region.includes(r.id)} onChange={() => toggle('region', r.id)} label={l(r.name)} count={countBy('region', r.id)} />)}
      </Group>
      <Group title={t('filters.rating')}>
        {[4.8, 4.5, 4].map((n) => (
          <label key={n} className="flex cursor-pointer items-center gap-2.5 py-1.5 text-sm">
            <input type="radio" name="rating" checked={String(f.rating) === String(n)} onChange={() => update({ rating: String(n) })} className="h-4 w-4 accent-chilli" />
            <Star size={14} className="fill-turmeric text-turmeric" />{t('filters.ratingUp', { n })}
          </label>
        ))}
        {f.rating && <button type="button" className="mt-1 text-xs text-chilli underline" onClick={() => update({ rating: '' })}>{t('actions.clearAll')}</button>}
      </Group>
      <div className="pt-4">
        <Check checked={f.offers} onChange={() => update({ offers: !f.offers })} label={t('filters.onlyOffers')} />
        <Check checked={f.stock} onChange={() => update({ stock: !f.stock })} label={t('filters.inStockOnly')} />
      </div>
    </div>
  );
}
