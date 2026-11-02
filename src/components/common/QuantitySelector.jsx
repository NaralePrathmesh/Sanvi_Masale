import { Minus, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function QuantitySelector({ value, onChange, min = 1, max = 10, size = 'md' }) {
  const { t } = useTranslation();
  const h = size === 'sm' ? 'h-9' : 'h-11';
  return (
    <div className={`inline-flex ${h} items-center rounded-full border border-charcoal/15 bg-white`} role="group" aria-label={t('product.quantity')}>
      <button type="button" className={`flex ${h} w-9 items-center justify-center rounded-l-full text-charcoal hover:text-chilli disabled:opacity-40`} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="−">
        <Minus size={15} />
      </button>
      <span className="min-w-[2rem] text-center text-sm font-semibold tabular-nums" aria-live="polite">{value}</span>
      <button type="button" className={`flex ${h} w-9 items-center justify-center rounded-r-full text-charcoal hover:text-chilli disabled:opacity-40`} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="+">
        <Plus size={15} />
      </button>
    </div>
  );
}
