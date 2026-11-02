import { useLocalized } from '@/hooks/useLocalized';
import { formatINR } from '@/utils/format';

/** Totals breakdown shared by cart, checkout, confirmation and admin. */
export default function OrderSummary({ totals, showMrp = true }) {
  const { t } = useLocalized();
  const row = 'flex justify-between gap-4 text-sm';
  const productDiscount = (totals.mrpTotal || totals.subtotal) - totals.subtotal;
  return (
    <div className="space-y-2.5">
      {showMrp && productDiscount > 0 && <div className={row}><span className="text-charcoal-500">{t('cart.mrpTotal')}</span><span>{formatINR(totals.mrpTotal)}</span></div>}
      {showMrp && productDiscount > 0 && <div className={row}><span className="text-charcoal-500">{t('cart.productDiscount')}</span><span className="text-leaf">−{formatINR(productDiscount)}</span></div>}
      <div className={row}><span className="text-charcoal-500">{t('cart.subtotal')}</span><span className="font-medium">{formatINR(totals.subtotal)}</span></div>
      {totals.comboDiscount > 0 && <div className={row}><span className="text-charcoal-500">{t('cart.comboDiscount')}</span><span className="text-leaf">−{formatINR(totals.comboDiscount)}</span></div>}
      {totals.couponDiscount > 0 && <div className={row}><span className="text-charcoal-500">{t('cart.coupon')} ({totals.couponCode})</span><span className="text-leaf">−{formatINR(totals.couponDiscount)}</span></div>}
      <div className={row}><span className="text-charcoal-500">{t('cart.delivery')}</span><span className={totals.delivery === 0 ? 'font-semibold text-leaf' : ''}>{totals.delivery === 0 ? t('cart.free') : formatINR(totals.delivery)}</span></div>
      {totals.codCharge > 0 && <div className={row}><span className="text-charcoal-500">{t('payment.cod')}</span><span>{formatINR(totals.codCharge)}</span></div>}
      <div className="flex justify-between gap-4 border-t border-line pt-3 text-base font-bold"><span>{t('cart.total')}</span><span>{formatINR(totals.total)}</span></div>
      {totals.savings > 0 && <p className="rounded-lg bg-leaf-50 px-3 py-2 text-center text-xs font-semibold text-leaf">{t('cart.savings', { amount: formatINR(totals.savings) })}</p>}
      <p className="text-center text-[11px] text-charcoal-400">{t('product.inclTaxes')}</p>
    </div>
  );
}
