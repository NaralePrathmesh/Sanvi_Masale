import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, PackageSearch, Search } from 'lucide-react';
import SmartImage from '@/components/common/SmartImage';
import ProductCard from '@/components/product/ProductCard';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { categoryImage, hasPhoto, collectionBanner } from '@/assets/images';
import ProductGrid from '@/components/product/ProductGrid';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import EmptyState from '@/components/common/EmptyState';
import ShopFilters from './ShopFilters';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { searchProducts } from '@/utils/search';
import { productTypes, regions } from '@/data/categories';

const PAGE = 12;
const minPrice = (p) => Math.min(...p.packs.map((x) => x.price));
const list = (v) => (v ? v.split(',').filter(Boolean) : []);

/** Product listing. With `lockedCategory` it becomes a category page (same filters/sort, category fixed). */
export default function ShopPage({ lockedCategory = null }) {
  const { activeProducts, categories, getProduct } = useStore();
  const { ids: recentIds } = useRecentlyViewed();
  const { t, l } = useLocalized();
  const [params, setParams] = useSearchParams();
  const [visible, setVisible] = useState(PAGE);
  const [drawer, setDrawer] = useState(false);

  const f = {
    q: params.get('q') || '', category: lockedCategory ? [lockedCategory.id] : list(params.get('category')), type: list(params.get('type')), region: list(params.get('region')),
    min: params.get('min') || '', max: params.get('max') || '', rating: params.get('rating') || '', offers: params.get('offers') === '1',
    stock: params.get('stock') === '1', sort: params.get('sort') || 'popularity',
  };
  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      const val = Array.isArray(v) ? v.join(',') : typeof v === 'boolean' ? (v ? '1' : '') : v;
      if (val === '' || val == null) next.delete(k); else next.set(k, val);
    });
    setParams(next, { replace: true });
  };
  const clearAll = () => setParams(f.q ? { q: f.q } : {}, { replace: true });
  const [qInput, setQInput] = useState(f.q);
  useEffect(() => { setQInput(f.q); }, [f.q]);

  const filtered = useMemo(() => {
    let res = f.q ? searchProducts(activeProducts, f.q) : activeProducts;
    if (f.category.length) res = res.filter((p) => f.category.includes(p.category));
    if (f.type.length) res = res.filter((p) => f.type.includes(p.type));
    if (f.region.length) res = res.filter((p) => f.region.includes(p.region));
    if (f.min) res = res.filter((p) => minPrice(p) >= Number(f.min));
    if (f.max) res = res.filter((p) => minPrice(p) <= Number(f.max));
    if (f.rating) res = res.filter((p) => p.rating >= Number(f.rating));
    if (f.offers) res = res.filter((p) => p.packs.some((x) => x.mrp > x.price));
    if (f.stock) res = res.filter((p) => p.packs.some((x) => x.stock > 0));
    const sorted = [...res];
    const sorters = {
      popularity: (a, b) => b.popularity - a.popularity, newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
      priceLow: (a, b) => minPrice(a) - minPrice(b), priceHigh: (a, b) => minPrice(b) - minPrice(a), rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    };
    if (!(f.q && f.sort === 'popularity' && !params.get('sort'))) sorted.sort(sorters[f.sort] || sorters.popularity);
    return sorted;
  }, [activeProducts, params, lockedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { setVisible(PAGE); }, [params]);
  useEffect(() => { document.body.style.overflow = drawer ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [drawer]);

  const singleCat = lockedCategory || (f.category.length === 1 ? categories.find((c) => c.id === f.category[0]) : null);
  const banner = lockedCategory ? collectionBanner(lockedCategory.id) : null;
  const recent = recentIds.map(getProduct).filter((p) => p && p.active !== false).slice(0, 4);
  const title = lockedCategory ? l(lockedCategory.name) : f.q ? t('shop.searchFor', { q: f.q }) : singleCat ? l(singleCat.name) : t('shop.title');
  useDocumentTitle(title, 'Shop authentic Indian masalas and pure spices online.');

  const chips = [
    ...(lockedCategory ? [] : f.category).map((id) => ({ label: l(categories.find((c) => c.id === id)?.name) || id, clear: () => update({ category: f.category.filter((x) => x !== id) }) })),
    ...f.type.map((id) => ({ label: l(productTypes.find((c) => c.id === id)?.name), clear: () => update({ type: f.type.filter((x) => x !== id) }) })),
    ...f.region.map((id) => ({ label: id === 'pan-india' ? t('product.panIndia') : l(regions.find((c) => c.id === id)?.name), clear: () => update({ region: f.region.filter((x) => x !== id) }) })),
    ...(f.min || f.max ? [{ label: `₹${f.min || 0} – ₹${f.max || '∞'}`, clear: () => update({ min: '', max: '' }) }] : []),
    ...(f.rating ? [{ label: t('filters.ratingUp', { n: f.rating }), clear: () => update({ rating: '' }) }] : []),
    ...(f.offers ? [{ label: t('filters.onlyOffers'), clear: () => update({ offers: false }) }] : []),
    ...(f.stock ? [{ label: t('filters.inStockOnly'), clear: () => update({ stock: false }) }] : []),
  ];

  return (
    <div className="container-x py-8 sm:py-10">
      <Breadcrumbs items={lockedCategory ? [{ label: t('nav.categories'), to: '/categories' }, { label: l(lockedCategory.name) }] : [{ label: t('nav.shop'), to: '/shop' }, ...(singleCat ? [{ label: l(singleCat.name) }] : [])]} />
      <div className="mb-8 flex items-end justify-between gap-6">
        <div className="max-w-2xl">
          <h1 className="h-page">{title}</h1>
          <p className="mt-2 text-charcoal-500">{singleCat ? l(singleCat.desc) : t('shop.subtitle', { count: activeProducts.length })}</p>
        </div>
        {lockedCategory && !banner && hasPhoto(categoryImage(lockedCategory.id).photo) && <SmartImage image={categoryImage(lockedCategory.id)} alt="" className="hidden h-24 w-40 shrink-0 rounded-xl md:block" />}
      </div>
      {banner && (
        <div className="mb-10 overflow-hidden rounded-2xl shadow-soft ring-1 ring-black/5 animate-heroIn">
          <img src={banner.src} srcSet={banner.srcSet} sizes="(min-width:1280px) 1216px, 100vw" alt={`${l(lockedCategory.name)} — सान्वी मसाले`} className="block aspect-[1920/650] w-full object-cover" />
        </div>
      )}

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block"><div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-2"><ShopFilters f={f} update={update} clearAll={clearAll} hideCategory={!!lockedCategory} /></div></aside>

        <div className="min-w-0">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            {!lockedCategory && (
              <form className="relative w-full sm:w-64" onSubmit={(e) => { e.preventDefault(); update({ q: qInput.trim() }); }} role="search">
                <label className="sr-only" htmlFor="shop-search">{t('shop.searchIn')}</label>
                <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
                <input id="shop-search" value={qInput} onChange={(e) => setQInput(e.target.value)} onBlur={() => qInput.trim() !== f.q && update({ q: qInput.trim() })} placeholder={t('shop.searchIn')} className="input pl-10" />
              </form>
            )}
            <button type="button" className="btn-outline lg:hidden" onClick={() => setDrawer(true)}><SlidersHorizontal size={16} />{t('shop.filters')}{chips.length > 0 && <span className="rounded-full bg-chilli px-1.5 text-[11px] text-white">{chips.length}</span>}</button>
            <p className="text-sm text-charcoal-500" aria-live="polite">{t('shop.results', { count: filtered.length })}</p>
            <label className="ml-auto flex items-center gap-2 text-sm">
              <span className="hidden text-charcoal-500 sm:inline">{t('sort.label')}</span>
              <select value={f.sort} onChange={(e) => update({ sort: e.target.value })} className="input h-11 w-auto py-0 pr-8" aria-label={t('sort.label')}>
                {['popularity', 'newest', 'priceLow', 'priceHigh', 'rating'].map((s) => <option key={s} value={s}>{t(`sort.${s}`)}</option>)}
              </select>
            </label>
          </div>
          {chips.length > 0 && (
            <div className="mb-5 flex flex-wrap gap-2">
              {chips.map((c, i) => <button key={i} type="button" onClick={c.clear} className="chip border-chilli/30 bg-chilli-50 text-xs text-chilli">{c.label}<X size={13} /></button>)}
              <button type="button" onClick={clearAll} className="text-xs font-semibold text-charcoal-500 underline hover:text-chilli">{t('actions.clearAll')}</button>
            </div>
          )}

          {filtered.length === 0 ? (
            <EmptyState icon={PackageSearch} title={t('shop.noResults')} text={t('shop.noResultsHint')}>
              <button type="button" className="btn-primary" onClick={() => { setQInput(''); setParams({}, { replace: true }); }}>{t('actions.clearAll')}</button>
            </EmptyState>
          ) : (
            <>
              <ProductGrid products={filtered.slice(0, visible)} cols="md:grid-cols-3 xl:grid-cols-4" />
              <div className="mt-10 flex flex-col items-center gap-3">
                <p className="text-sm text-charcoal-500">{t('shop.showing', { shown: Math.min(visible, filtered.length), total: filtered.length })}</p>
                <div className="h-0.5 w-48 overflow-hidden rounded-full bg-line"><div className="h-full bg-chilli" style={{ width: `${(Math.min(visible, filtered.length) / filtered.length) * 100}%` }} /></div>
                {visible < filtered.length && <button type="button" className="btn-outline mt-2 px-8" onClick={() => setVisible((v) => v + PAGE)}>{t('actions.loadMore')}</button>}
              </div>
            </>
          )}
        </div>
      </div>

      {recent.length > 0 && (
        <section className="mt-20 border-t border-line pt-12">
          <h2 className="h-section mb-8">{t('pdp.recentlyViewed')}</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{recent.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}

      {drawer && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-charcoal/50" onClick={() => setDrawer(false)} />
          <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-3xl bg-white animate-fadeUp" role="dialog" aria-modal="true" aria-label={t('shop.filters')}>
            <div className="flex items-center justify-between border-b border-line px-5 py-4"><h2 className="font-display text-lg">{t('shop.filters')}</h2><button type="button" className="icon-btn" onClick={() => setDrawer(false)} aria-label={t('actions.close')}><X size={20} /></button></div>
            <div className="flex-1 overflow-y-auto px-5 py-4"><ShopFilters f={f} update={update} clearAll={clearAll} hideCategory={!!lockedCategory} /></div>
            <div className="border-t border-line p-4"><button type="button" className="btn-primary w-full" onClick={() => setDrawer(false)}>{t('shop.results', { count: filtered.length })}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}
