import { useState } from 'react';
import { Copy, Check, Ticket } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import SectionHeading from '@/components/common/SectionHeading';
import ProductGrid from '@/components/product/ProductGrid';
import { Link } from 'react-router-dom';
import { festivals } from '@/data/products';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate, formatINR, discountPct } from '@/utils/format';

export default function OffersPage() {
  const { coupons, activeProducts } = useStore();
  const { setCouponCode } = useCart();
  const { toast } = useUI();
  const { t, l, lang } = useLocalized();
  const [copied, setCopied] = useState('');
  useDocumentTitle(t('offers.title'), 'Coupons, festival offers and the biggest discounts on Indian masalas.');
  const today = new Date().toISOString().slice(0, 10);
  const deals = [...activeProducts].sort((a, b) => Math.max(...b.packs.map((p) => discountPct(p.price, p.mrp))) - Math.max(...a.packs.map((p) => discountPct(p.price, p.mrp)))).slice(0, 4);

  const copy = async (code) => {
    try { await navigator.clipboard.writeText(code); } catch { /* clipboard blocked: still show feedback */ }
    setCopied(code); setTimeout(() => setCopied(''), 1800);
  };

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: t('offers.title') }]} />
      <div className="mb-8"><h1 className="h-page">{t('offers.title')}</h1><p className="mt-2 text-charcoal-500">{t('offers.subtitle')} · {t('offers.howTo')}</p></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {coupons.map((c) => {
          const expired = !c.active || (c.validTo && today > c.validTo);
          return (
            <div key={c.code} className={`relative overflow-hidden rounded-xl border border-line bg-white ${expired ? 'opacity-60' : ''}`}>
              <div className={`flex items-center justify-between px-5 py-4 text-white ${expired ? 'bg-charcoal-400' : 'bg-chilli'}`}>
                <span className="flex items-center gap-2 font-display text-2xl"><Ticket size={20} />{c.type === 'percent' ? `${c.value}%` : formatINR(c.value)}</span>
                {expired && <span className="badge bg-white/20 text-white">{t('offers.expired')}</span>}
              </div>
              <div className="border-t-2 border-dashed border-cream-300 p-5">
                <p className="text-sm font-medium">{l(c.description)}</p>
                <ul className="mt-2 space-y-0.5 text-xs text-charcoal-500">
                  {c.minOrder > 0 && <li>{t('offers.minOrder', { amount: formatINR(c.minOrder) })}</li>}
                  {c.maxDiscount > 0 && c.type === 'percent' && <li>{t('offers.upTo', { amount: formatINR(c.maxDiscount) })}</li>}
                  <li>{t('offers.validTill', { date: formatDate(c.validTo, lang) })}</li>
                </ul>
                <div className="mt-4 flex gap-2">
                  <span className="flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-chilli/40 bg-chilli-50 font-mono font-bold text-chilli">{c.code}</span>
                  <button type="button" disabled={expired} onClick={() => copy(c.code)} className="btn-outline btn-sm" aria-label={t('offers.copyCode')}>{copied === c.code ? <Check size={14} className="text-leaf" /> : <Copy size={14} />}{copied === c.code ? t('actions.copied') : t('actions.copy')}</button>
                </div>
                {!expired && <button type="button" onClick={() => { setCouponCode(c.code); toast(`${c.code} ✓`, 'success', { to: '/cart', label: t('actions.viewCart') }); }} className="mt-2 w-full text-center text-xs font-semibold text-chilli hover:underline">{t('actions.apply')} →</button>}
              </div>
            </div>
          );
        })}
      </div>
      <section className="mt-20"><SectionHeading title={t('home.festivalTitle')} subtitle={t('home.festivalSub')} action={{ to: '/festivals', label: t('actions.viewAll') }} />
        <div className="flex flex-wrap gap-2">{festivals.map((f) => <Link key={f.id} to={`/festivals/${f.slug}`} className="chip px-5 py-2.5">{l(f.name)}</Link>)}</div></section>
      <section className="mt-20"><SectionHeading title={t('offers.onSale')} /><ProductGrid products={deals} /></section>
    </div>
  );
}
