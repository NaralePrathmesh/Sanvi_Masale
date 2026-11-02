import { useTranslation } from 'react-i18next';
import { formatINR, discountPct } from '@/utils/format';

export default function Price({ price, mrp, size = 'md', showOff = true }) {
  const { t } = useTranslation();
  const off = discountPct(price, mrp);
  const big = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-base' : 'text-lg';
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={`${big} font-bold text-charcoal`}>{formatINR(price)}</span>
      {off > 0 && <span className="text-sm text-charcoal-400 line-through">{formatINR(mrp)}</span>}
      {off > 0 && showOff && <span className="text-sm font-semibold text-leaf">{t('product.off', { pct: off })}</span>}
    </div>
  );
}
