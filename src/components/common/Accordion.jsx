import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function Accordion({ items, defaultOpen = 0 }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-white">
      {items.map((it, i) => (
        <div key={i}>
          <button type="button" className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-semibold" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
            <span>{it.title}</span>
            <ChevronDown size={18} className={`shrink-0 transition ${open === i ? 'rotate-180 text-chilli' : ''}`} />
          </button>
          {open === i && <div className="px-5 pb-5 text-sm leading-relaxed text-charcoal-600 animate-fadeUp">{it.content}</div>}
        </div>
      ))}
    </div>
  );
}
