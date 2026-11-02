import { Check } from 'lucide-react';
export default function Stepper({ steps, current, onStep }) {
  return (
    <ol className="flex items-center gap-1 sm:gap-2" aria-label="Checkout progress">
      {steps.map((s, i) => {
        const done = i < current; const active = i === current;
        return (
          <li key={s} className="flex flex-1 items-center gap-1 sm:gap-2">
            <button type="button" disabled={!done} onClick={() => onStep(i)} aria-current={active ? 'step' : undefined}
              className={`flex min-w-0 items-center gap-2 ${done ? 'cursor-pointer' : 'cursor-default'}`}>
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${done ? 'bg-chilli text-white' : active ? 'bg-chilli text-white ring-4 ring-chilli/15' : 'border border-line bg-white text-charcoal-500'}`}>
                {done ? <Check size={15} /> : i + 1}
              </span>
              <span className={`hidden truncate text-sm font-semibold md:block ${active ? 'text-charcoal' : 'text-charcoal-400'}`}>{s}</span>
            </button>
            {i < steps.length - 1 && <span className={`h-px flex-1 ${done ? 'bg-chilli' : 'bg-line'}`} />}
          </li>
        );
      })}
    </ol>
  );
}
