import { Truck, PartyPopper } from 'lucide-react';
import { useLocalized } from '@/hooks/useLocalized';
import { useStore } from '@/context/StoreContext';
import { formatINR } from '@/utils/format';

/** Free-delivery progress with a truck riding the bar. */
export default function FreeShippingBar({ totals, compact = false }) {
  const { t } = useLocalized();
  const { settings } = useStore();
  const pct = Math.max(4, Math.min(100, ((settings.freeShippingThreshold - totals.amountForFreeShipping) / settings.freeShippingThreshold) * 100));
  const done = totals.freeShipping;
  return (
    <div className={`rounded-2xl border ${done ? 'border-leaf/25 bg-leaf-50' : 'border-turmeric/30 bg-turmeric-50'} ${compact ? 'p-3' : 'p-4 sm:p-5'}`}>
      <p className={`flex items-center gap-2 font-medium ${compact ? 'text-[13px]' : 'text-sm'} ${done ? 'text-leaf-700' : 'text-charcoal'}`}>
        {done ? <PartyPopper size={16} className="shrink-0 text-leaf" /> : <Truck size={16} className="shrink-0 text-turmeric-700" />}
        {done ? t('cart.freeShippingUnlocked') : t('cart.freeShippingProgress', { amount: formatINR(totals.amountForFreeShipping) })}
      </p>
      <div className={`relative ${compact ? 'mt-3' : 'mt-4'} h-2 rounded-full bg-white`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pct)}>
        <div className={`h-full rounded-full transition-[width] duration-700 ease-out ${done ? 'bg-leaf' : 'bg-gradient-to-r from-turmeric to-chilli'}`} style={{ width: `${pct}%` }} />
        <span className="absolute top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white shadow-soft transition-[left] duration-700 ease-out" style={{ left: `${pct}%` }}>
          <Truck size={13} className={done ? 'text-leaf' : 'text-chilli'} />
        </span>
      </div>
    </div>
  );
}
