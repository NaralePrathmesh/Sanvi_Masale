import { Check, Package, ClipboardCheck, Cog, Truck, Bike, Home, XCircle } from 'lucide-react';
import { useLocalized } from '@/hooks/useLocalized';
import { ORDER_STATUSES } from '@/config/site';
import { formatDateTime } from '@/utils/format';

const ICONS = { placed: Package, confirmed: ClipboardCheck, processing: Cog, shipped: Truck, out_for_delivery: Bike, delivered: Home };

export default function OrderTimeline({ order }) {
  const { t, lang } = useLocalized();
  if (order.status === 'cancelled') {
    return <p className="flex items-center gap-2 rounded-xl bg-chilli-50 p-4 font-semibold text-chilli"><XCircle size={18} />{t('status.cancelled')}</p>;
  }
  const idx = ORDER_STATUSES.indexOf(order.status);
  const when = (s) => order.history?.find((h) => h.status === s)?.at;
  return (
    <>
      {/* Horizontal on md+, vertical on mobile */}
      <ol className="hidden grid-cols-6 md:grid">
        {ORDER_STATUSES.map((s, i) => {
          const Icon = ICONS[s]; const done = i <= idx;
          return (
            <li key={s} className="relative flex flex-col items-center text-center">
              {i > 0 && <span className={`absolute right-1/2 top-5 h-1 w-full -translate-y-1/2 ${i <= idx ? 'bg-chilli' : 'bg-line'}`} />}
              <span className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full ${done ? 'bg-chilli text-white' : 'bg-white text-charcoal-400 ring-1 ring-line'} ${i === idx ? 'ring-4 ring-chilli/15' : ''}`}>{done && i < idx ? <Check size={18} /> : <Icon size={18} />}</span>
              <span className={`mt-2 px-1 text-xs font-semibold ${done ? 'text-charcoal' : 'text-charcoal-400'}`}>{t(`status.${s}`)}</span>
              {when(s) && <span className="mt-0.5 text-[10px] text-charcoal-400">{formatDateTime(when(s), lang)}</span>}
            </li>
          );
        })}
      </ol>
      <ol className="space-y-0 md:hidden">
        {ORDER_STATUSES.map((s, i) => {
          const Icon = ICONS[s]; const done = i <= idx;
          return (
            <li key={s} className="relative flex gap-4 pb-6 last:pb-0">
              {i < ORDER_STATUSES.length - 1 && <span className={`absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 ${i < idx ? 'bg-chilli' : 'bg-line'}`} />}
              <span className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${done ? 'bg-chilli text-white' : 'bg-white text-charcoal-400 ring-1 ring-line'}`}>{done && i < idx ? <Check size={18} /> : <Icon size={18} />}</span>
              <span className="pt-2"><span className={`block text-sm font-semibold ${done ? '' : 'text-charcoal-400'}`}>{t(`status.${s}`)}</span>{when(s) && <span className="text-xs text-charcoal-400">{formatDateTime(when(s), lang)}</span>}</span>
            </li>
          );
        })}
      </ol>
    </>
  );
}

export function StatusBadge({ status }) {
  const { t } = useLocalized();
  const cls = status === 'delivered' ? 'bg-leaf-50 text-leaf' : status === 'cancelled' ? 'bg-chilli-50 text-chilli' : status === 'placed' ? 'bg-turmeric-100 text-turmeric-700' : 'bg-blue-50 text-blue-700';
  return <span className={`badge ${cls}`}>{t(`status.${status}`)}</span>;
}
