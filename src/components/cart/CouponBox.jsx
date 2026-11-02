import { useState } from 'react';
import { Tag, X, Check, ChevronDown, TicketPercent } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from '@/hooks/useLocalized';
import { evaluateCoupon } from '@/utils/pricing';
import { formatINR } from '@/utils/format';

/** Coupon entry + ticket-style list of available codes. */
export default function CouponBox({ defaultOpen = false }) {
  const { t, l } = useLocalized();
  const { couponCode, setCouponCode, totals } = useCart();
  const { coupons } = useStore();
  const { toast } = useUI();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(defaultOpen);
  const base = totals.subtotal - totals.comboDiscount;

  const apply = (c) => {
    const value = (c ?? code).trim().toUpperCase();
    if (!value) return;
    const res = evaluateCoupon(value, base, coupons);
    if (!res.ok) { setError(res.error === 'cart.couponMinOrder' ? t(res.error, { amount: formatINR(res.coupon.minOrder - base) }) : t(res.error)); return; }
    setError(''); setCouponCode(value); setCode('');
    toast(t('cart.couponApplied', { code: value, amount: formatINR(res.discount) }));
  };
  const appliedInvalid = couponCode && !totals.coupon.ok;
  const available = coupons.filter((c) => c.active);

  if (couponCode && totals.coupon.ok) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-leaf bg-leaf-50 px-4 py-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-leaf-700"><Check size={16} className="shrink-0" />{t('cart.couponApplied', { code: couponCode, amount: formatINR(totals.couponDiscount) })}</p>
        <button type="button" onClick={() => { setCouponCode(''); toast(t('cart.couponRemoved'), 'info'); }} className="shrink-0 text-charcoal-500 hover:text-chilli" aria-label={t('actions.remove')}><X size={16} /></button>
      </div>
    );
  }

  return (
    <div>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center justify-between text-sm font-semibold">
        <span className="flex items-center gap-2"><TicketPercent size={17} className="text-chilli" />{t('cart.haveCoupon')}</span>
        <ChevronDown size={16} className={`text-charcoal-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {appliedInvalid && (
        <p className="field-error" role="alert">
          {totals.coupon.error === 'cart.couponMinOrder' ? t('cart.couponMinOrder', { amount: formatINR((totals.coupon.coupon?.minOrder || 0) - base) }) : t(totals.coupon.error)}
          {' '}<button type="button" className="underline" onClick={() => setCouponCode('')}>{t('actions.remove')}</button>
        </p>
      )}
      {open && (
        <div className="mt-3 animate-fadeUp">
          <form onSubmit={(e) => { e.preventDefault(); apply(); }} className="flex gap-2">
            <label className="relative flex-1">
              <span className="sr-only">{t('cart.couponPlaceholder')}</span>
              <Tag size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" />
              <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }} placeholder={t('cart.couponPlaceholder')} className={`input pl-9 uppercase ${error ? 'input-error' : ''}`} aria-invalid={!!error} />
            </label>
            <button type="submit" className="btn-outline px-4">{t('actions.apply')}</button>
          </form>
          {error && <p className="field-error" role="alert">{error}</p>}
          <p className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wider text-charcoal-400">{t('cart.availableCoupons')}</p>
          <div className="space-y-2">
            {available.map((c) => (
              <button type="button" key={c.code} onClick={() => apply(c.code)}
                className="group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border border-dashed border-chilli/30 bg-chilli-50/40 py-2.5 pl-4 pr-3 text-left transition hover:border-chilli hover:bg-chilli-50">
                <span aria-hidden="true" className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-dashed border-chilli/30 bg-white" />
                <span aria-hidden="true" className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-dashed border-chilli/30 bg-white" />
                <span className="min-w-0 flex-1"><span className="font-mono text-sm font-bold tracking-wide text-chilli">{c.code}</span><span className="block truncate text-xs text-charcoal-500">{l(c.description)}</span></span>
                <span className="shrink-0 text-[11px] font-semibold text-chilli opacity-70 transition group-hover:opacity-100">{t('cart.tapToApply')}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
