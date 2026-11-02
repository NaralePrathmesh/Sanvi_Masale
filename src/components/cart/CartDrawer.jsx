import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { X, ArrowRight, Lock, Plus, Sparkles } from 'lucide-react';
import CartLine from './CartLine';
import FreeShippingBar from './FreeShippingBar';
import ProductImage from '@/components/product/ProductImage';
import SmartImage from '@/components/common/SmartImage';
import { BrandMark } from '@/components/common/Logo';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useProductActions } from '@/hooks/useProductActions';
import { getComplements } from '@/pages/ProductDetails/FrequentlyBought';
import { formatINR } from '@/utils/format';

/** Slide-in cart: progress to free delivery, compact items, one suggestion, sticky totals. */
export default function CartDrawer() {
  const { cartOpen, setCartOpen } = useUI();
  const { lines, count, totals } = useCart();
  const { activeProducts } = useStore();
  const { t, l } = useLocalized();
  const { addToCart } = useProductActions();
  const { pathname } = useLocation();
  useEffect(() => { setCartOpen(false); }, [pathname, setCartOpen]);
  useEffect(() => {
    if (!cartOpen) return undefined;
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && setCartOpen(false);
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [cartOpen, setCartOpen]);
  if (!cartOpen) return null;
  const close = () => setCartOpen(false);
  const inCart = new Set(lines.map((x) => x.productId));
  const suggestion = lines.length ? getComplements(lines[lines.length - 1].product, activeProducts, 6).find((p) => !inCart.has(p.id)) : null;
  const payable = totals.subtotal - totals.comboDiscount - totals.couponDiscount;

  return createPortal(
    <div className="fixed inset-0 z-[65]">
      <div className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px] animate-pageIn" onClick={close} />
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-cream shadow-lift animate-slideIn" role="dialog" aria-modal="true" aria-label={t('cart.title')}>
        <header className="flex items-center justify-between border-b border-line bg-white px-5 py-4">
          <div className="flex items-center gap-3">
            <BrandMark className="h-9 w-9" />
            <div><h2 className="text-lg leading-none">{t('cart.title')}</h2><p className="mt-1 text-xs text-charcoal-500">{t('cart.items', { count })}</p></div>
          </div>
          <button type="button" className="icon-btn border border-line bg-white" onClick={close} aria-label={t('actions.close')}><X size={18} /></button>
        </header>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="relative h-28 w-28">
              <div className="absolute inset-0 rounded-full bg-chilli-50" />
              {['hero/accent-turmeric', 'hero/accent-chilli', 'hero/accent-cardamom'].map((ph, i) => (
                <div key={ph} className={`absolute h-11 w-11 animate-float overflow-hidden rounded-full ring-4 ring-white ${['left-0 top-1', 'right-0 top-5', 'bottom-0 left-1/2 -translate-x-1/2'][i]}`} style={{ animationDelay: `${-i * 1.5}s` }}><SmartImage photo={ph} art="pure" alt="" className="h-full w-full" /></div>
              ))}
            </div>
            <p className="mt-6 font-display text-xl">{t('cart.emptyTitle')}</p>
            <p className="mt-1 max-w-xs text-sm text-charcoal-500">{t('cart.emptyText')}</p>
            <Link to="/shop" className="btn-primary mt-6 px-7">{t('actions.shopNow')}<ArrowRight size={15} /></Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="px-5 pt-4"><FreeShippingBar totals={totals} compact /></div>
              <div className="mx-5 mt-4 divide-y divide-line rounded-2xl border border-line bg-white px-4">{lines.map((x) => <CartLine key={x.key} line={x} compact />)}</div>
              {suggestion && (
                <div className="mx-5 my-4 rounded-2xl border border-dashed border-turmeric/50 bg-turmeric-50/60 p-3">
                  <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-turmeric-700"><Sparkles size={12} />{t('cart.pairsWell')}</p>
                  <div className="flex items-center gap-3">
                    <Link to={`/product/${suggestion.slug}`} className="w-11 shrink-0 overflow-hidden rounded-lg"><ProductImage product={suggestion} compact sizes="44px" /></Link>
                    <div className="min-w-0 flex-1"><Link to={`/product/${suggestion.slug}`} className="block truncate text-sm font-semibold hover:text-chilli">{l(suggestion.name)}</Link><p className="text-xs text-charcoal-500">{suggestion.packs[0].size} · {formatINR(suggestion.packs[0].price)}</p></div>
                    <button type="button" onClick={() => addToCart(suggestion, suggestion.packs[0].size)} className="flex h-8 w-8 items-center justify-center rounded-full bg-chilli text-white transition hover:scale-110" aria-label={`${t('actions.addToCart')}: ${l(suggestion.name)}`}><Plus size={15} /></button>
                  </div>
                </div>
              )}
            </div>
            <footer className="border-t border-line bg-white p-5">
              {totals.savings > 0 && <p className="mb-3 rounded-lg bg-leaf-50 px-3 py-2 text-center text-xs font-semibold text-leaf-700">{t('cart.savings', { amount: formatINR(totals.savings) })}</p>}
              <div className="flex items-baseline justify-between"><span className="text-sm text-charcoal-500">{t('cart.subtotal')}</span><span className="text-xl font-bold tabular-nums">{formatINR(payable)}</span></div>
              <p className="mt-0.5 text-[11px] text-charcoal-400">{t('product.inclTaxes')} · {totals.freeShipping ? t('cart.freeShippingUnlocked') : `${t('cart.delivery')}: ${formatINR(totals.delivery)}`}</p>
              <Link to="/checkout" className="btn-primary mt-4 w-full py-3 text-[15px]"><Lock size={16} />{t('actions.checkout')}</Link>
              <Link to="/cart" className="mt-2 block text-center text-sm font-semibold text-charcoal-600 hover:text-chilli">{t('actions.viewCart')}</Link>
            </footer>
          </>
        )}
      </aside>
    </div>,
    document.body,
  );
}
