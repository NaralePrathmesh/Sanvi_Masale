import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import EmptyState from '@/components/common/EmptyState';
import Price from '@/components/common/Price';
import Rating from '@/components/common/Rating';
import ProductImage from '@/components/product/ProductImage';
import { useWishlist } from '@/context/WishlistContext';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function WishlistItems() {
  const { ids, remove } = useWishlist();
  const { getProduct } = useStore();
  const { add } = useCart();
  const { toast } = useUI();
  const { t, l } = useLocalized();
  const items = ids.map(getProduct).filter((p) => p && p.active !== false);
  if (!items.length) return <EmptyState icon={Heart} title={t('wishlist.empty')} text={t('wishlist.emptyHint')}><Link to="/shop" className="btn-primary">{t('actions.shopNow')}</Link></EmptyState>;
  const moveToCart = (p) => { add(p.id, p.packs[0].size, 1); remove(p.id); toast(t('wishlist.movedToCart'), 'success', { to: '/cart', label: t('actions.viewCart') }); };
  return (
    <>
      <div className="mb-4 flex justify-end">
        <button type="button" className="btn-outline btn-sm" onClick={() => { items.forEach((p) => add(p.id, p.packs[0].size, 1)); items.forEach((p) => remove(p.id)); toast(t('wishlist.movedToCart'), 'success', { to: '/cart', label: t('actions.viewCart') }); }}>
          <ShoppingBag size={14} />{t('actions.addAllToCart')}
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {items.map((p) => (
          <article key={p.id} className="flex flex-col overflow-hidden rounded-xl border border-line bg-white">
            <Link to={`/product/${p.slug}`}><ProductImage product={p} /></Link>
            <div className="flex flex-1 flex-col p-4">
              <Rating value={p.rating} size={11} />
              <Link to={`/product/${p.slug}`} className="mt-1 font-display font-bold leading-snug hover:text-chilli">{l(p.name)}</Link>
              <div className="mt-2"><Price price={p.packs[0].price} mrp={p.packs[0].mrp} size="sm" /></div>
              <div className="mt-auto flex gap-2 pt-4">
                <button type="button" className="btn-primary btn-sm flex-1" onClick={() => moveToCart(p)}><ShoppingBag size={14} />{t('actions.moveToCart')}</button>
                <button type="button" className="icon-btn h-9 w-9 border border-charcoal/15" onClick={() => { remove(p.id); toast(t('product.removedFromWishlist'), 'info'); }} aria-label={t('actions.remove')}><Trash2 size={15} /></button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

export default function WishlistPage() {
  const { t } = useLocalized();
  const { count } = useWishlist();
  useDocumentTitle(t('wishlist.title'));
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: t('wishlist.title') }]} />
      <h1 className="h-page mb-8">{t('wishlist.title')} {count > 0 && <span className="font-sans text-lg font-normal text-charcoal-400">({count})</span>}</h1>
      <WishlistItems />
    </div>
  );
}
