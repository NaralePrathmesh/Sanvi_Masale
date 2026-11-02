import { Link } from 'react-router-dom';
import { GitCompareArrows, X, Plus, ShoppingBag, Flame } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import EmptyState from '@/components/common/EmptyState';
import Rating from '@/components/common/Rating';
import ProductImage from '@/components/product/ProductImage';
import { useCompare } from '@/context/CompareContext';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useProductActions } from '@/hooks/useProductActions';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { productTypes } from '@/data/categories';
import { formatINR } from '@/utils/format';
import { MAX_COMPARE } from '@/config/site';

export default function ComparePage() {
  const { ids, remove, clear } = useCompare();
  const { getProduct } = useStore();
  const { t, l } = useLocalized();
  const { addToCart } = useProductActions();
  useDocumentTitle(t('compare.title'));
  const items = ids.map(getProduct).filter(Boolean);

  const rows = [
    [t('compare.price'), (p) => <span><strong>{formatINR(p.packs[0].price)}</strong> <span className="text-xs text-charcoal-400">/ {p.packs[0].size}</span><br /><span className="text-xs text-charcoal-400">{p.packs.map((x) => `${x.size}: ${formatINR(x.price)}`).join(' · ')}</span></span>],
    [t('compare.packSize'), (p) => p.packs.map((x) => x.size).join(', ')],
    [t('compare.type'), (p) => l(productTypes.find((x) => x.id === p.type)?.name)],
    [t('compare.rating'), (p) => <Rating value={p.rating} count={p.reviews} size={12} />],
    [t('compare.heat'), (p) => <span className="flex items-center gap-0.5">{Array.from({ length: 5 }, (_, i) => <Flame key={i} size={13} className={i < p.heat ? 'fill-chilli text-chilli' : 'text-charcoal/20'} />)}<span className="ml-1 text-xs">{t(`heat.${p.heat}`)}</span></span>],
    [t('compare.ingredients'), (p) => (p.ingredients.length ? p.ingredients.map((i) => t(`ingredients.${i}`)).join(', ') : (p.includes || []).map((id) => l(getProduct(id)?.name)).join(', '))],
    [t('compare.dishes'), (p) => p.dishes.map((d) => t(`dishes.${d}`)).join(', ')],
  ];

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: t('compare.title') }]} />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="h-page">{t('compare.title')}</h1>
        {items.length > 0 && <button type="button" className="btn-ghost btn-sm" onClick={clear}>{t('actions.clearAll')}</button>}
      </div>
      {!items.length ? (
        <EmptyState icon={GitCompareArrows} title={t('compare.empty')} text={t('compare.emptyHint')}><Link to="/shop" className="btn-primary">{t('actions.shopNow')}</Link></EmptyState>
      ) : (
        <div className="table-wrap">
          <table className="w-full min-w-[720px] table-fixed text-sm">
            <thead>
              <tr>
                <th className="w-40 bg-cream-200/60 p-4 text-left align-bottom text-xs font-semibold uppercase tracking-wide text-charcoal-500">{t('compare.bar', { count: items.length })}</th>
                {items.map((p) => (
                  <th key={p.id} className="p-4 text-left align-top font-normal">
                    <div className="relative">
                      <button type="button" onClick={() => remove(p.id)} className="absolute right-1 top-1 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-card hover:text-chilli" aria-label={t('actions.remove')}><X size={15} /></button>
                      <Link to={`/product/${p.slug}`} className="block w-40 overflow-hidden rounded-xl"><ProductImage product={p} compact /></Link>
                      <Link to={`/product/${p.slug}`} className="mt-2 block font-display text-base font-bold hover:text-chilli">{l(p.name)}</Link>
                      <button type="button" className="btn-primary btn-sm mt-3" onClick={() => addToCart(p, p.packs[0].size)}><ShoppingBag size={14} />{t('actions.addToCart')}</button>
                    </div>
                  </th>
                ))}
                {items.length < MAX_COMPARE && (
                  <th className="p-4 align-middle">
                    <Link to="/shop" className="flex aspect-[4/5] w-40 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-charcoal/15 text-sm font-semibold text-charcoal-500 hover:border-chilli hover:text-chilli"><Plus size={22} />{t('compare.add')}</Link>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, render]) => (
                <tr key={label} className="border-t border-charcoal/5">
                  <th scope="row" className="bg-cream-200/40 p-4 text-left align-top text-xs font-semibold uppercase tracking-wide text-charcoal-500">{label}</th>
                  {items.map((p) => <td key={p.id} className="p-4 align-top leading-relaxed">{render(p)}</td>)}
                  {items.length < MAX_COMPARE && <td />}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
