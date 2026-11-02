import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Check, Eye, ShoppingBag, Star, Flame, Sparkles } from 'lucide-react';
import ProductImage from './ProductImage';
import { useStore } from '@/context/StoreContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useTilt } from '@/hooks/useMotion';
import { useProductActions } from '@/hooks/useProductActions';
import { discountPct, formatINR } from '@/utils/format';

const compact = (n) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));

/**
 * Premium product card: inset photo with glass badge + discount tag, hover quick-view,
 * category · rating line, serif name, pill weight selector, price block and a single
 * gradient Add to Cart button that confirms with a check.
 */
function ProductCard({ product }) {
  const { t, l } = useLocalized();
  const { categories } = useStore();
  const { setQuickViewId } = useUI();
  const { addToCart, toggleWishlist, inWishlist } = useProductActions();
  const tilt = useTilt(4);
  const [size, setSize] = useState(product.packs[0].size);
  const [justAdded, setJustAdded] = useState(false);
  const pack = product.packs.find((p) => p.size === size) || product.packs[0];
  const off = discountPct(pack.price, pack.mrp);
  const wished = inWishlist(product.id);
  const out = pack.stock <= 0;
  const url = `/product/${product.slug}`;
  const category = categories.find((c) => c.id === product.category);

  const onAdd = () => {
    addToCart(product, size);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <article ref={tilt}
      className="tilt group relative flex h-full flex-col rounded-[22px] border border-line/80 bg-white p-2 shadow-card transition-[box-shadow,border-color] duration-300 hover:border-turmeric/40 hover:shadow-[0_22px_45px_-20px_rgb(var(--chilli)/.28),0_8px_20px_-12px_rgb(var(--turmeric)/.35)]">
      <span className="tilt-glare" aria-hidden="true" />

      {/* Photo */}
      <div className="relative overflow-hidden rounded-2xl bg-[#FEFDF8]">
        <Link to={url} aria-label={l(product.name)} className="block">
          <ProductImage product={product} size={size} zoom />
        </Link>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {(product.bestseller || product.isNew) && (
          <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full border border-white/60 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-charcoal shadow-sm backdrop-blur-md">
            {product.bestseller ? <Flame size={11} className="text-chilli" /> : <Sparkles size={11} className="text-leaf" />}
            {product.bestseller ? t('product.bestseller') : t('product.new')}
          </span>
        )}
        {off > 0 && <span className="absolute bottom-2.5 left-2.5 rounded-full bg-chilli px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">−{off}%</span>}

        <div className="absolute right-2.5 top-2.5 flex flex-col gap-2">
          <button type="button" onClick={() => toggleWishlist(product)} aria-pressed={wished} aria-label={wished ? t('product.wishlistRemove') : t('product.wishlistAdd')}
            className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/60 shadow-sm backdrop-blur-md transition hover:scale-110 ${wished ? 'bg-chilli text-white' : 'bg-white/80 text-charcoal'}`}>
            <Heart size={15} className={wished ? 'fill-current' : ''} />
          </button>
          <button type="button" onClick={() => setQuickViewId(product.id)} aria-label={t('actions.quickView')}
            className="hidden h-9 w-9 translate-x-12 items-center justify-center rounded-full border border-white/60 bg-white/80 text-charcoal opacity-0 shadow-sm backdrop-blur-md transition duration-300 hover:scale-110 focus-visible:translate-x-0 focus-visible:opacity-100 group-hover:translate-x-0 group-hover:opacity-100 lg:flex">
            <Eye size={15} />
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col px-2 pb-2 pt-3.5 sm:px-2.5">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <span className="truncate font-semibold uppercase tracking-wider text-charcoal-400">{l(category?.name)}</span>
          <span className="flex shrink-0 items-center gap-0.5 font-semibold text-charcoal-600"><Star size={11} className="fill-turmeric text-turmeric" />{product.rating.toFixed(1)}<span className="font-normal text-charcoal-400">({compact(product.reviews)})</span></span>
        </div>
        <h3 className="mt-1.5 font-display text-[17px] font-medium leading-snug text-charcoal sm:text-lg">
          <Link to={url} className="transition-colors hover:text-chilli">{l(product.name)}</Link>
        </h3>

        {product.packs.length > 1 ? (
          <div className="mt-3 flex flex-wrap gap-1" role="radiogroup" aria-label={t('product.packSize')}>
            {product.packs.map((p) => (
              <button key={p.size} type="button" role="radio" aria-checked={p.size === size} onClick={() => setSize(p.size)}
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${p.size === size ? 'bg-charcoal text-white' : 'bg-cream-200 text-charcoal-600 hover:bg-turmeric-100'}`}>
                {p.size}
              </button>
            ))}
          </div>
        ) : <p className="mt-3 w-fit rounded-full bg-cream-200 px-2.5 py-1 text-[11px] font-semibold text-charcoal-600">{pack.size}</p>}

        <div className="mt-auto pt-4">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-lg font-bold tracking-tight text-charcoal">{formatINR(pack.price)}</span>
            {off > 0 && <span className="text-xs text-charcoal-400 line-through">{formatINR(pack.mrp)}</span>}
            {off > 0 && <span className="text-[11px] font-semibold text-leaf-700">{t('product.save', { amount: formatINR(pack.mrp - pack.price) })}</span>}
          </p>
          <button type="button" onClick={onAdd} disabled={out}
            className={`btn mt-3 w-full whitespace-nowrap rounded-xl px-2 text-[13px] sm:text-sm ${justAdded ? 'bg-leaf text-white' : 'bg-gradient-to-r from-chilli to-chilli-deep text-white shadow-[0_8px_18px_-10px_rgb(var(--chilli)/.8)] hover:from-chilli-700 hover:to-chilli'}`}>
            {justAdded ? <Check size={16} className="animate-bump" /> : <ShoppingBag size={15} className="hidden min-[400px]:block" />}
            {out ? t('product.outOfStock') : justAdded ? t('actions.added') : t('actions.addToCart')}
          </button>
        </div>
      </div>
    </article>
  );
}
export default memo(ProductCard);
