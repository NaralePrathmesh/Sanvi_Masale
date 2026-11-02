import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, TrendingUp, X, MapPin, LayoutGrid } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useClickOutside } from '@/hooks/useClickOutside';
import { popularSearches } from '@/data/products';
import { regions, regionSlug } from '@/data/categories';
import { searchProducts } from '@/utils/search';
import { formatINR } from '@/utils/format';
import ProductImage from '@/components/product/ProductImage';

/** Smart search with product, category and region suggestions + popular / recent searches. */
export default function SearchBox({ autoFocus = false, onDone }) {
  const { activeProducts, categories } = useStore();
  const { t, l } = useLocalized();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = usePersistentState('recentSearches', []);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);

  const query = q.trim().toLowerCase();
  const results = useMemo(() => (query ? searchProducts(activeProducts, query).slice(0, 5) : []), [activeProducts, query]);
  const catMatches = useMemo(() => (query ? categories.filter((c) => Object.values(c.name).some((n) => n.toLowerCase().includes(query))).slice(0, 3) : []), [categories, query]);
  const regionMatches = useMemo(() => (query ? regions.filter((r) => Object.values(r.name).some((n) => n.toLowerCase().includes(query)) || r.id.includes(query)).slice(0, 2) : []), [query]);

  const go = (path, term) => {
    if (term) setRecent((r) => [term, ...r.filter((x) => x.toLowerCase() !== term.toLowerCase())].slice(0, 6));
    setOpen(false); setQ(''); onDone?.(); navigate(path);
  };
  const submit = (e) => { e.preventDefault(); if (query) go(`/shop?q=${encodeURIComponent(q.trim())}`, q.trim()); };

  return (
    <div ref={ref} className="relative w-full">
      <form onSubmit={submit} role="search">
        <label className="relative block">
          <span className="sr-only">{t('header.search')}</span>
          <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} autoFocus={autoFocus}
            placeholder={t('header.searchPlaceholder')} className="input bg-cream pl-11 pr-10" aria-autocomplete="list" aria-expanded={open} />
          {q && <button type="button" onClick={() => setQ('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400 hover:text-chilli" aria-label={t('actions.clearAll')}><X size={16} /></button>}
        </label>
      </form>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 max-h-[70vh] overflow-y-auto rounded-xl border border-line bg-white p-3 shadow-lift animate-fadeUp">
          {!query && (
            <div className="space-y-4 p-1">
              {recent.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-charcoal-400">{t('search.recent')}</p>
                    <button type="button" className="text-xs text-chilli hover:underline" onClick={() => setRecent([])}>{t('search.clearRecent')}</button></div>
                  <div className="flex flex-wrap gap-2">{recent.map((r) => <button type="button" key={r} className="chip text-xs" onClick={() => go(`/shop?q=${encodeURIComponent(r)}`, r)}><Clock size={13} />{r}</button>)}</div>
                </div>
              )}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-charcoal-400">{t('search.popular')}</p>
                <div className="flex flex-wrap gap-2">{popularSearches.map((r) => <button type="button" key={r} className="chip text-xs" onClick={() => go(`/shop?q=${encodeURIComponent(r)}`, r)}><TrendingUp size={13} />{r}</button>)}</div>
              </div>
            </div>
          )}
          {query && (
            <div className="space-y-3">
              {results.length > 0 && (
                <div>
                  <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-charcoal-400">{t('search.products')}</p>
                  {results.map((p) => (
                    <button type="button" key={p.id} onClick={() => go(`/product/${p.slug}`, q.trim())} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-cream">
                      <div className="w-10 shrink-0 overflow-hidden rounded-lg"><ProductImage product={p} compact /></div>
                      <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{l(p.name)}</p><p className="truncate text-xs text-charcoal-400">{l(categories.find((c) => c.id === p.category)?.name)}</p></div>
                      <span className="text-sm font-semibold">{formatINR(p.packs[0].price)}</span>
                    </button>
                  ))}
                </div>
              )}
              {(catMatches.length > 0 || regionMatches.length > 0) && (
                <div className="flex flex-wrap gap-2 px-2">
                  {catMatches.map((c) => <button type="button" key={c.id} className="chip text-xs" onClick={() => go(`/category/${c.id}`)}><LayoutGrid size={13} />{l(c.name)}</button>)}
                  {regionMatches.map((r) => <button type="button" key={r.id} className="chip text-xs" onClick={() => go(`/regional/${regionSlug(r.id)}`)}><MapPin size={13} />{l(r.name)}</button>)}
                </div>
              )}
              {!results.length && !catMatches.length && !regionMatches.length && <p className="px-2 py-4 text-center text-sm text-charcoal-500">{t('search.noMatch', { q: q.trim() })}</p>}
              <button type="button" onClick={submit} className="w-full rounded-xl bg-cream px-3 py-2.5 text-left text-sm font-semibold text-chilli hover:bg-cream-200">{t('search.seeAll', { q: q.trim() })} →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
