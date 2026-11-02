import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Heart, Minus, Plus, Tag } from 'lucide-react';
import ProductImage from '@/components/product/ProductImage';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useStore } from '@/context/StoreContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from '@/hooks/useLocalized';
import { formatINR } from '@/utils/format';

/** Cart item card. `compact` = drawer layout. Removing animates the card out. */
export default function CartLine({ line, compact = false }) {
  const { t, l } = useLocalized();
  const { setQty, remove, changeSize } = useCart();
  const wishlist = useWishlist();
  const { categories } = useStore();
  const { toast, setCartOpen } = useUI();
  const [leaving, setLeaving] = useState(false);
  const { product } = line;
  const save = (line.mrp - line.price) * line.qty;
  const category = categories.find((c) => c.id === product.category);

  const animateOut = (after) => { setLeaving(true); setTimeout(after, 260); };
  const onRemove = () => animateOut(() => { remove(line.key); toast(t('cart.removed'), 'info'); });
  const onSaveLater = () => animateOut(() => { if (!wishlist.has(product.id)) wishlist.toggle(product.id); remove(line.key); toast(t('cart.movedToWishlist'), 'success', { to: '/wishlist', label: t('header.wishlist') }); });

  const Stepper = (
    <div className="inline-flex h-9 items-center rounded-full border border-line bg-white" role="group" aria-label={t('product.quantity')}>
      <button type="button" onClick={() => (line.qty <= 1 ? onRemove() : setQty(line.key, line.qty - 1))} className="flex h-9 w-9 items-center justify-center rounded-l-full text-charcoal-600 transition hover:bg-chilli-50 hover:text-chilli" aria-label="−">
        {line.qty <= 1 ? <Trash2 size={14} /> : <Minus size={14} />}
      </button>
      <span className="min-w-[1.75rem] text-center text-sm font-semibold tabular-nums" aria-live="polite">{line.qty}</span>
      <button type="button" onClick={() => setQty(line.key, line.qty + 1)} disabled={line.qty >= line.maxQty} className="flex h-9 w-9 items-center justify-center rounded-r-full text-charcoal-600 transition hover:bg-chilli-50 hover:text-chilli disabled:opacity-40" aria-label="+"><Plus size={14} /></button>
    </div>
  );

  return (
    <div className={`grid transition-[grid-template-rows,opacity,transform] duration-300 ease-out ${leaving ? 'grid-rows-[0fr] -translate-x-4 opacity-0' : 'grid-rows-[1fr] opacity-100'}`}>
      <div className="overflow-hidden">
        <article className={`flex gap-4 ${compact ? 'py-4' : 'rounded-2xl border border-line bg-white p-4 transition-shadow hover:shadow-soft sm:p-5'}`}>
          <Link to={`/product/${product.slug}`} onClick={() => setCartOpen(false)} className={`${compact ? 'w-[72px]' : 'w-24 sm:w-28'} shrink-0 self-start overflow-hidden rounded-xl bg-cream-200`}>
            <ProductImage product={product} size={line.size} compact sizes="112px" />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                {!compact && category && <p className="text-[11px] font-semibold uppercase tracking-wider text-charcoal-400">{l(category.name)}</p>}
                <Link to={`/product/${product.slug}`} onClick={() => setCartOpen(false)} className={`block font-semibold leading-snug hover:text-chilli ${compact ? 'text-sm' : 'mt-0.5 text-base'}`}>{l(product.name)}</Link>
                {line.comboPct ? <p className="mt-1 inline-flex items-center gap-1 rounded-full bg-leaf-50 px-2 py-0.5 text-[11px] font-semibold text-leaf-700"><Tag size={11} />{t('cart.comboTag', { pct: line.comboPct })}</p> : null}
              </div>
              <div className="shrink-0 text-right">
                <p className={`font-bold tabular-nums ${compact ? 'text-sm' : 'text-base'}`}>{formatINR(line.price * line.qty)}</p>
                {line.mrp > line.price && <p className="text-xs text-charcoal-400 line-through tabular-nums">{formatINR(line.mrp * line.qty)}</p>}
              </div>
            </div>

            {/* weight */}
            {product.packs.length > 1 ? (
              compact ? (
                <select value={line.size} onChange={(e) => changeSize(line.key, e.target.value)} aria-label={t('product.packSize')} className="mt-2 h-8 w-fit rounded-full border border-line bg-white px-3 text-xs font-semibold">
                  {product.packs.map((p) => <option key={p.size} value={p.size}>{p.size} · {formatINR(p.price)}</option>)}
                </select>
              ) : (
                <div className="mt-3 flex flex-wrap gap-1.5" role="radiogroup" aria-label={t('product.packSize')}>
                  {product.packs.map((p) => (
                    <button key={p.size} type="button" role="radio" aria-checked={p.size === line.size} onClick={() => changeSize(line.key, p.size)}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${p.size === line.size ? 'border-chilli bg-chilli text-white' : 'border-line bg-white text-charcoal-600 hover:border-chilli/50'}`}>
                      {p.size}
                    </button>
                  ))}
                </div>
              )
            ) : <p className="mt-2 w-fit rounded-full bg-cream-200 px-3 py-1 text-xs font-semibold">{line.size}</p>}

            <div className={`mt-auto flex flex-wrap items-center justify-between gap-3 ${compact ? 'pt-3' : 'pt-4'}`}>
              {Stepper}
              <div className="flex items-center gap-3 text-xs font-medium text-charcoal-500">
                {save > 0 && !compact && <span className="rounded-full bg-leaf-50 px-2 py-0.5 font-semibold text-leaf-700">{t('cart.lineSave', { amount: formatINR(save) })}</span>}
                {!compact && <button type="button" onClick={onSaveLater} className="inline-flex items-center gap-1 hover:text-chilli"><Heart size={13} />{t('cart.moveToWishlist')}</button>}
                {!(compact && line.qty <= 1) && <button type="button" onClick={onRemove} className="inline-flex items-center gap-1 hover:text-chilli" aria-label={`${t('actions.remove')} ${l(product.name)}`}><Trash2 size={13} />{!compact && t('actions.remove')}</button>}
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
