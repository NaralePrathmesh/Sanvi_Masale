import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Heart, ShoppingBag, GitCompareArrows, Check, Share2, PackageSearch } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Rating from '@/components/common/Rating';
import Price from '@/components/common/Price';
import QuantitySelector from '@/components/common/QuantitySelector';
import EmptyState from '@/components/common/EmptyState';
import SectionHeading from '@/components/common/SectionHeading';
import ProductImage, { productPhotoCount } from '@/components/product/ProductImage';
import PackSelector from '@/components/product/PackSelector';
import PincodeChecker from '@/components/product/PincodeChecker';
import ProductCard from '@/components/product/ProductCard';
import ProductTabs from './ProductTabs';
import { useStore } from '@/context/StoreContext';
import { useUI } from '@/context/UIContext';
import { useCart } from '@/context/CartContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useProductActions } from '@/hooks/useProductActions';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatINR } from '@/utils/format';

/** Product page: gallery left · buying decisions right · details in tabs · four related products. */
export default function ProductDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { getBySlug, activeProducts, categories } = useStore();
  const { t, l } = useLocalized();
  const { toast } = useUI();
  const cart = useCart();
  const { addToCart, toggleWishlist, toggleCompare, inWishlist, inCompare } = useProductActions();
  const { push } = useRecentlyViewed();
  const product = getBySlug(slug);
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [showSticky, setShowSticky] = useState(false);
  const atcRef = useRef(null);

  useEffect(() => { if (product) { setSize(product.packs[0].size); setQty(1); setImg(0); push(product.id); } }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useDocumentTitle(product ? l(product.name) : t('pdp.notFound'), product ? l(product.short) : undefined);
  useEffect(() => {
    const el = atcRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el); return () => io.disconnect();
  }, [product?.id]);

  const related = useMemo(() => (product ? activeProducts.filter((p) => p.id !== product.id && (p.category === product.category || p.region === product.region)).sort((a, b) => b.popularity - a.popularity).slice(0, 4) : []), [product, activeProducts]);

  if (!product || product.active === false) {
    return <div className="container-x py-16"><EmptyState icon={PackageSearch} title={t('pdp.notFound')}><Link to="/shop" className="btn-primary">{t('actions.continueShopping')}</Link></EmptyState></div>;
  }
  const pack = product.packs.find((p) => p.size === size) || product.packs[0];
  const category = categories.find((c) => c.id === product.category);
  const count = Math.max(1, productPhotoCount(product));
  const gallery = Array.from({ length: count }, (_, i) => i);
  const wished = inWishlist(product.id);
  const out = pack.stock <= 0;

  const buyNow = () => { cart.add(product.id, pack.size, qty); navigate('/checkout'); };
  const share = async () => {
    try { if (navigator.share) await navigator.share({ title: l(product.name), url: window.location.href }); else { await navigator.clipboard.writeText(window.location.href); toast(t('actions.copied')); } } catch { /* cancelled */ }
  };

  return (
    <div className="container-x py-8 sm:py-10">
      <Breadcrumbs items={[{ label: t('nav.shop'), to: '/shop' }, { label: l(category?.name), to: `/category/${product.category}` }, { label: l(product.name) }]} />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Gallery */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-xl border border-line bg-white">
            <ProductImage product={product} index={img} size={pack.size} eager sizes="(min-width:1024px) 45vw, 100vw" />
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-3" role="tablist" aria-label="Product images">
              {gallery.map((i) => (
                <button key={i} type="button" role="tab" aria-selected={img === i} onClick={() => setImg(i)} className={`w-20 overflow-hidden rounded-lg border-2 transition ${img === i ? 'border-chilli' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <ProductImage product={product} index={i} compact sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Buy box */}
        <div>
          <p className="eyebrow">{l(category?.name)}</p>
          <h1 className="mt-3 text-[30px] leading-tight sm:text-[36px]">{l(product.name)}</h1>
          <a href="#details" className="mt-3 inline-flex"><Rating value={product.rating} count={product.reviews} /></a>

          <div className="mt-6"><Price price={pack.price} mrp={pack.mrp} size="lg" /></div>
          <p className="mt-1 text-xs text-charcoal-500">{t('product.inclTaxes')}</p>

          <div className="mt-7"><p className="label">{t('product.packSize')}</p><PackSelector packs={product.packs} value={pack.size} onChange={(s) => { setSize(s); setQty(1); }} /></div>
          <p className={`mt-3 text-[13px] font-medium ${out ? 'text-chilli-deep' : pack.stock < 15 ? 'text-turmeric-700' : 'text-leaf'}`}>
            {out ? t('product.outOfStock') : pack.stock < 15 ? t('product.lowStock', { count: pack.stock }) : t('product.inStock')}
          </p>

          <div ref={atcRef} className="mt-6 flex flex-wrap items-center gap-3">
            <QuantitySelector value={qty} onChange={setQty} max={Math.max(1, Math.min(10, pack.stock))} />
            <button type="button" disabled={out} onClick={() => addToCart(product, pack.size, qty)} className="btn-primary min-w-[150px] flex-1"><ShoppingBag size={17} />{t('actions.addToCart')}</button>
            <button type="button" disabled={out} onClick={buyNow} className="btn-outline min-w-[120px] flex-1">{t('actions.buyNow')}</button>
          </div>

          <p className="mt-7 max-w-lg leading-relaxed text-charcoal-600">{l(product.short)}</p>

          <div className="mt-7"><PincodeChecker /></div>

          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[13px] font-medium text-charcoal-500">
            <button type="button" onClick={() => toggleWishlist(product)} aria-pressed={wished} className="inline-flex items-center gap-1.5 hover:text-chilli"><Heart size={15} className={wished ? 'fill-chilli text-chilli' : ''} />{wished ? t('product.wishlistRemove') : t('product.wishlistAdd')}</button>
            <button type="button" onClick={() => toggleCompare(product)} aria-pressed={inCompare(product.id)} className="inline-flex items-center gap-1.5 hover:text-chilli">{inCompare(product.id) ? <Check size={15} className="text-leaf" /> : <GitCompareArrows size={15} />}{t('actions.compare')}</button>
            <button type="button" onClick={share} className="inline-flex items-center gap-1.5 hover:text-chilli"><Share2 size={15} />{t('actions.share')}</button>
          </div>
        </div>
      </div>

      <ProductTabs product={product} />

      {related.length > 0 && <section className="mt-20"><SectionHeading title={t('pdp.related')} /><div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div></section>}

      {/* Mobile sticky add-to-cart */}
      <div className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur transition-transform duration-300 lg:hidden ${showSticky ? 'translate-y-0' : 'translate-y-full'}`} aria-hidden={!showSticky}>
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{l(product.name)} · {pack.size}</p><p className="text-sm font-bold text-chilli">{formatINR(pack.price * qty)}</p></div>
          <button type="button" tabIndex={showSticky ? 0 : -1} disabled={out} onClick={() => addToCart(product, pack.size, qty)} className="btn-primary btn-sm px-4">{t('actions.addToCart')}</button>
        </div>
      </div>
    </div>
  );
}
