import { Star } from 'lucide-react';

export default function Rating({ value = 0, count, size = 14, showValue = true, className = '' }) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <div className="flex" aria-label={`${value} out of 5`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} size={size} className={i <= Math.round(value) ? 'fill-turmeric text-turmeric' : 'fill-charcoal/10 text-charcoal/10'} />
        ))}
      </div>
      {showValue && <span className="text-xs font-semibold text-charcoal-600">{Number(value).toFixed(1)}</span>}
      {count != null && <span className="text-xs text-charcoal-400">({Number(count).toLocaleString('en-IN')})</span>}
    </div>
  );
}

export function RatingInput({ value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" role="radio" aria-checked={value === i} aria-label={`${i}`} onClick={() => onChange(i)} className="rounded p-0.5">
          <Star size={26} className={i <= value ? 'fill-turmeric text-turmeric' : 'text-charcoal/25'} />
        </button>
      ))}
    </div>
  );
}
