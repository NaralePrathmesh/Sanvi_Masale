import { useTranslation } from 'react-i18next';
import { formatINR } from '@/utils/format';

export default function PackSelector({ packs, value, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={t('product.packSize')}>
      {packs.map((p) => {
        const active = p.size === value;
        return (
          <button key={p.size} type="button" role="radio" aria-checked={active} disabled={p.stock <= 0} onClick={() => onChange(p.size)}
            className={`min-w-[84px] rounded-xl border-2 px-3 py-2 text-left transition disabled:opacity-40 ${active ? 'border-chilli bg-chilli-50' : 'border-line bg-white hover:border-charcoal/30'}`}>
            <span className={`block text-sm font-bold ${active ? 'text-chilli' : ''}`}>{p.size}</span>
            <span className="block text-xs text-charcoal-500">{formatINR(p.price)}</span>
          </button>
        );
      })}
    </div>
  );
}
