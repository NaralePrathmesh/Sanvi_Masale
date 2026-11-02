import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Lock, ShieldCheck, Banknote, RotateCcw, Leaf, Plus, CalendarDays, Check } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import SectionHeading from '@/components/common/SectionHeading';
import SmartImage from '@/components/common/SmartImage';
import CartLine from '@/components/cart/CartLine';
import CouponBox from '@/components/cart/CouponBox';
import OrderSummary from '@/components/cart/OrderSummary';
import FreeShippingBar from '@/components/cart/FreeShippingBar';
import ProductCard from '@/components/product/ProductCard';
import ProductImage from '@/components/product/ProductImage';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useProductActions } from '@/hooks/useProductActions';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { getComplements } from '@/pages/ProductDetails/FrequentlyBought';
import { addDays, formatDate, formatINR } from '@/utils/format';

/** Checkout journey indicator: Cart → Details → Payment → Done. */
export function CartSteps({ current = 0 }) {
  const { t } = useLocalized();
  const steps = [t('cart.stepCart'), t('cart.stepDetails'), t('cart.stepPayment'), t('cart.stepDone')];
  return (
    <ol className="flex items-center gap-2 text-xs font-semibold sm:text-sm" aria-label="Checkout steps">
      {steps.map((s, i) => (
        <li key={s} className="flex flex-1 items-center gap-2 last:flex-none">
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[12px] ${i < current ? 'bg-leaf text-white' : i === current ? 'bg-chilli text-white ring-4 ring-chilli/15' : 'border border-line bg-white text-charcoal-400'}`}>{i < current ? <Check size={14} /> : i + 1}</span>
          <span className={i === current ? 'text-charcoal' : 'text-charcoal-400'}>{s}</span>
          {i < steps.length - 1 && <span className={`hidden h-px flex-1 sm:block ${i < current ? 'bg-leaf' : 'bg-line'}`} />}
        </li>
      ))}
    </ol>
  );
}

export function TrustBadges() {
  const { t } = useLocalized();
  return (
    <ul className="grid grid-cols-2 gap-2 text-[12px] text-charcoal-600">
      {[[ShieldCheck, 'cart.trustSecure'], [Banknote, 'cart.trustCod'], [RotateCcw, 'cart.trustReturns'], [Leaf, 'cart.trustFresh']].map(([Icon, k]) => (
        <li key={k} className="flex items-center gap-2 rounded-lg bg-cream-200/70 px-2.5 py-2"><Icon size={15} className="shrink-0 text-leaf" />{t(k)}</li>
      ))}
    </ul>
  );
}

export default function CartPage() {
  const { lines, count, totals } = useCart();
  const { activeProducts, settings } = useStore();
  const { t, l, lang } = useLocalized();
  const { addToCart } = useProductActions();
  useDocumentTitle(t('cart.title'));
  const inCart = new Set(lines.map((x) => x.productId));
  const pairs = lines.length
    ? [...new Map(lines.flatMap((x) => getComplements(x.product, activeProducts, 4)).filter((p) => !inCart.has(p.id)).map((p) => [p.id, p])).values()]
    : [];
  const bestsellers = activeProducts.filter((p) => p.bestseller).slice(0, 4);
  const eta = addDays(new Date(), settings.standardDeliveryDays).toISOString();

  if (!lines.length) {
    return (
      <div className="container-x py-10">
        <Breadcrumbs items={[{ label: t('cart.title') }]} />
        <section className="relative mx-auto mt-6 max-w-2xl overflow-hidden rounded-3xl border border-line bg-white px-6 py-14 text-center">
          <div aria-hidden="true" className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-turmeric-100/70 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -right-10 h-48 w-48 rounded-full bg-leaf-50 blur-3xl" />
          <div className="relative mx-auto h-36 w-36">
            <div className="absolute inset-0 rounded-full bg-chilli-50" />
            {['hero/accent-turmeric', 'hero/accent-chilli', 'hero/accent-cardamom'].map((ph, i) => (
              <div key={ph} className={`absolute h-14 w-14 animate-float overflow-hidden rounded-full shadow-soft ring-4 ring-white ${['left-0 top-2', 'right-0 top-6', 'bottom-0 left-1/2 -translate-x-1/2'][i]}`} style={{ animationDelay: `${-i * 1.6}s` }}>
                <SmartImage photo={ph} art="pure" alt="" className="h-full w-full" />
              </div>
            ))}
          </div>
          <h1 className="relative mt-8 h-section">{t('cart.emptyTitle')}</h1>
          <p className="relative mx-auto mt-2 max-w-md text-charcoal-500">{t('cart.emptyText')}</p>
          <div className="relative mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/shop" className="btn-primary px-7">{t('actions.shopNow')}<ArrowRight size={16} /></Link>
            <Link to="/categories" className="btn-outline px-7">{t('nav.allCategories')}</Link>
          </div>
        </section>
        <section className="mt-20"><SectionHeading title={t('home.bestsellersTitle')} /><div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{bestsellers.map((p) => <ProductCard key={p.id} product={p} />)}</div></section>
      </div>
    );
  }

  return (
    <div className="container-x pb-28 pt-8 sm:pt-10 lg:pb-10">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Breadcrumbs items={[{ label: t('cart.title') }]} />
          <h1 className="h-page">{t('cart.title')} <span className="align-middle font-sans text-base font-medium text-charcoal-500">· {t('cart.items', { count })}</span></h1>
        </div>
        <div className="w-full max-w-xl"><CartSteps current={0} /></div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_390px] lg:gap-10">
        <div className="min-w-0 space-y-4">
          <FreeShippingBar totals={totals} />
          <div className="space-y-4">{lines.map((x) => <CartLine key={x.key} line={x} />)}</div>
          <Link to="/shop" className="btn-link mt-2"><ArrowLeft size={15} />{t('actions.continueShopping')}</Link>

          {pairs.length > 0 && (
            <section className="!mt-10 rounded-2xl border border-line bg-white p-5">
              <h2 className="text-lg">{t('cart.pairsWell')}</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-3">
                {pairs.slice(0, 3).map((p) => (
                  <li key={p.id} className="flex items-center gap-3 rounded-xl border border-line p-2.5 transition hover:border-chilli/40">
                    <Link to={`/product/${p.slug}`} className="w-12 shrink-0 overflow-hidden rounded-lg"><ProductImage product={p} compact sizes="48px" /></Link>
                    <div className="min-w-0 flex-1"><Link to={`/product/${p.slug}`} className="block truncate text-sm font-semibold hover:text-chilli">{l(p.name)}</Link><p className="text-xs text-charcoal-500">{p.packs[0].size} · {formatINR(p.packs[0].price)}</p></div>
                    <button type="button" onClick={() => addToCart(p, p.packs[0].size)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-chilli text-white transition hover:scale-110" aria-label={`${t('actions.addToCart')}: ${l(p.name)}`}><Plus size={15} /></button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
            <div className="border-b border-line bg-gradient-to-r from-turmeric-50 via-white to-leaf-50 px-5 py-4">
              <h2 className="text-lg">{t('cart.summary')}</h2>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-charcoal-500"><CalendarDays size={13} />{t('cart.estDelivery', { date: formatDate(eta, lang, { weekday: 'short', day: 'numeric', month: 'short' }) })}</p>
            </div>
            <div className="space-y-5 p-5">
              <CouponBox />
              <div className="border-t border-dashed border-line pt-5"><OrderSummary totals={totals} /></div>
              <Link to="/checkout" className="btn-primary w-full py-3 text-[15px]"><Lock size={16} />{t('actions.checkout')} · {formatINR(totals.total)}</Link>
              <TrustBadges />
              <div className="flex flex-wrap items-center justify-center gap-1.5 border-t border-line pt-4">
                {['UPI', 'Visa', 'Mastercard', 'RuPay', 'COD'].map((m) => <span key={m} className="rounded border border-line px-1.5 py-0.5 text-[10px] font-semibold text-charcoal-500">{m}</span>)}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile sticky checkout */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1"><p className="text-xs text-charcoal-500">{t('cart.total')}</p><p className="text-lg font-bold">{formatINR(totals.total)}</p></div>
          <Link to="/checkout" className="btn-primary px-6"><Lock size={15} />{t('actions.checkout')}</Link>
        </div>
      </div>
    </div>
  );
}
