import { Link, useLocation } from 'react-router-dom';
import { X, GitCompareArrows } from 'lucide-react';
import { useCompare } from '@/context/CompareContext';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import ProductImage from './ProductImage';

/** Floating bar showing products queued for comparison. */
export default function CompareBar() {
  const { ids, remove, clear } = useCompare();
  const { getProduct } = useStore();
  const { t, l } = useLocalized();
  const { pathname } = useLocation();
  const items = ids.map(getProduct).filter(Boolean);
  if (!items.length || pathname.startsWith('/compare') || pathname.startsWith('/checkout')) return null;
  return (
    <div className={`fixed inset-x-0 bottom-0 z-40 ${pathname.startsWith('/product/') ? 'hidden lg:block' : ''} border-t border-line bg-white/95 shadow-lift backdrop-blur animate-fadeUp`}>
      <div className="container-x flex items-center gap-3 py-2.5">
        <GitCompareArrows size={18} className="hidden shrink-0 text-leaf sm:block" />
        <div className="flex flex-1 items-center gap-2 overflow-x-auto scrollbar-none">
          {items.map((p) => (
            <div key={p.id} className="flex shrink-0 items-center gap-2 rounded-full border border-line bg-cream py-1 pl-1 pr-2">
              <div className="h-8 w-7 overflow-hidden rounded-full"><ProductImage product={p} compact /></div>
              <span className="max-w-[110px] truncate text-xs font-semibold">{l(p.name)}</span>
              <button type="button" onClick={() => remove(p.id)} aria-label={t('actions.remove')} className="text-charcoal-400 hover:text-chilli"><X size={14} /></button>
            </div>
          ))}
        </div>
        <span className="hidden text-xs text-charcoal-500 md:inline">{t('compare.bar', { count: items.length })}</span>
        <button type="button" onClick={clear} className="btn-ghost btn-sm hidden sm:inline-flex">{t('actions.clearAll')}</button>
        <Link to="/compare" className="btn-green btn-sm shrink-0">{t('compare.compareNow')}</Link>
      </div>
    </div>
  );
}
