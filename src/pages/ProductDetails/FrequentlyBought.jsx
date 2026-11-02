import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingBag } from 'lucide-react';
import ProductImage from '@/components/product/ProductImage';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from '@/hooks/useLocalized';
import { formatINR } from '@/utils/format';

/** Complementary products: shares dishes but different category, best-sellers first. */
export function getComplements(product, products, n = 2) {
  return products
    .filter((p) => p.id !== product.id && p.type !== 'combo' && p.active !== false)
    .map((p) => ({ p, score: p.dishes.filter((d) => product.dishes.includes(d)).length * 3 + (p.category !== product.category ? 2 : 0) + p.popularity / 50 }))
    .sort((a, b) => b.score - a.score).slice(0, n).map((x) => x.p);
}

export default function FrequentlyBought({ product }) {
  const { activeProducts } = useStore();
  const { addMany } = useCart();
  const { toast } = useUI();
  const { t, l } = useLocalized();
  const items = useMemo(() => [product, ...getComplements(product, activeProducts)], [product, activeProducts]);
  const [sel, setSel] = useState(() => items.map((p) => p.id));
  const chosen = items.filter((p) => sel.includes(p.id));
  const total = chosen.reduce((s, p) => s + p.packs[0].price, 0);
  if (items.length < 2) return null;
  return (
    <section className="mt-10 rounded-2xl bg-white p-5 shadow-card sm:p-8">
      <h2 className="text-2xl">{t('pdp.fbt')}</h2>
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2 overflow-x-auto sm:gap-4">
          {items.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2 sm:gap-4">
              {i > 0 && <Plus size={18} className="shrink-0 text-charcoal-400" />}
              <label className={`relative w-24 shrink-0 cursor-pointer sm:w-32 ${sel.includes(p.id) ? '' : 'opacity-40'}`}>
                <input type="checkbox" className="absolute left-2 top-2 z-10 h-4 w-4 accent-chilli" checked={sel.includes(p.id)} onChange={() => setSel((s) => (s.includes(p.id) ? s.filter((x) => x !== p.id) : [...s, p.id]))} aria-label={l(p.name)} />
                <div className="overflow-hidden rounded-xl"><ProductImage product={p} compact /></div>
                <Link to={`/product/${p.slug}`} className="mt-1 block truncate text-xs font-semibold hover:text-chilli">{l(p.name)}</Link>
                <span className="text-xs text-charcoal-500">{p.packs[0].size} · {formatINR(p.packs[0].price)}</span>
              </label>
            </div>
          ))}
        </div>
        <div className="rounded-2xl bg-cream p-5 lg:w-72">
          <p className="text-sm text-charcoal-500">{t('pdp.fbtTotal', { count: chosen.length })}</p>
          <p className="mt-1 text-2xl">{formatINR(total)}</p>
          <button type="button" disabled={!chosen.length} className="btn-primary mt-4 w-full" onClick={() => { addMany(chosen.map((p) => ({ productId: p.id, size: p.packs[0].size }))); toast(t('recipes.addedAll'), 'success', { to: '/cart', label: t('actions.viewCart') }); }}>
            <ShoppingBag size={16} />{t('pdp.fbtAdd', { count: chosen.length })}
          </button>
        </div>
      </div>
    </section>
  );
}
