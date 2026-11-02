import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart } from 'lucide-react';
import Modal from '@/components/common/Modal';
import ProductImage from './ProductImage';
import Rating from '@/components/common/Rating';
import Price from '@/components/common/Price';
import QuantitySelector from '@/components/common/QuantitySelector';
import PackSelector from './PackSelector';
import { useUI } from '@/context/UIContext';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useProductActions } from '@/hooks/useProductActions';

export default function QuickViewModal() {
  const { quickViewId, setQuickViewId } = useUI();
  const { getProduct } = useStore();
  const { t, l } = useLocalized();
  const { addToCart, toggleWishlist, inWishlist } = useProductActions();
  const product = quickViewId ? getProduct(quickViewId) : null;
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  useEffect(() => { if (product) { setSize(product.packs[0].size); setQty(1); } }, [product]);
  if (!product) return null;
  const pack = product.packs.find((p) => p.size === size) || product.packs[0];
  const close = () => setQuickViewId(null);

  return (
    <Modal open={!!product} onClose={close} title={l(product.name)} size="lg" hideHeader>
      <div className="grid gap-0 md:grid-cols-2">
        <div className="bg-cream md:rounded-l-3xl"><ProductImage product={product} size={pack.size} /></div>
        <div className="flex flex-col p-6 sm:p-8">
          <Rating value={product.rating} count={product.reviews} />
          <h2 className="mt-2 text-2xl">{l(product.name)}</h2>
          <p className="mt-2 text-sm text-charcoal-500">{l(product.short)}</p>
          <div className="mt-4"><Price price={pack.price} mrp={pack.mrp} size="lg" /></div>
          <p className="text-xs text-charcoal-400">{t('product.inclTaxes')}</p>
          <div className="mt-5"><p className="label">{t('product.packSize')}</p><PackSelector packs={product.packs} value={pack.size} onChange={setSize} /></div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <QuantitySelector value={qty} onChange={setQty} max={Math.min(10, pack.stock)} />
            <button type="button" className="btn-primary flex-1" disabled={pack.stock <= 0} onClick={() => { addToCart(product, pack.size, qty); close(); }}><ShoppingBag size={16} />{t('actions.addToCart')}</button>
            <button type="button" className="icon-btn border border-charcoal/15" onClick={() => toggleWishlist(product)} aria-label={t('product.wishlistAdd')}><Heart size={18} className={inWishlist(product.id) ? 'fill-chilli text-chilli' : ''} /></button>
          </div>
          <Link to={`/product/${product.slug}`} onClick={close} className="link mt-6 text-sm">{t('actions.viewDetails')} →</Link>
        </div>
      </div>
    </Modal>
  );
}
