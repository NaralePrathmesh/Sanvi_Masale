import { useRef, useState } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLocalized } from '@/hooks/useLocalized';
import { languages } from '@/config/site';
import { useClickOutside } from '@/hooks/useClickOutside';

export default function LanguageSelector({ variant = 'dropdown' }) {
  const { t, i18n, lang } = useLocalized();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const current = languages.find((l) => l.code === lang) || languages[0];

  if (variant === 'inline') {
    return (
      <div className="flex gap-2" role="radiogroup" aria-label={t('header.language')}>
        {languages.map((l) => (
          <button key={l.code} type="button" role="radio" aria-checked={lang === l.code} onClick={() => i18n.changeLanguage(l.code)} className={`chip ${lang === l.code ? 'chip-active' : ''}`}>{l.label}</button>
        ))}
      </div>
    );
  }
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open} aria-label={t('header.language')}
        className="flex h-10 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold text-charcoal transition hover:bg-charcoal/5">
        <Globe size={18} /><span className="hidden sm:inline">{current.short}</span><ChevronDown size={14} className="hidden sm:block" />
      </button>
      {open && (
        <ul role="listbox" className="absolute right-0 top-12 z-50 w-44 overflow-hidden rounded-xl border border-line bg-white p-1.5 shadow-lift animate-fadeUp">
          {languages.map((l) => (
            <li key={l.code}>
              <button type="button" role="option" aria-selected={lang === l.code} onClick={() => { i18n.changeLanguage(l.code); setOpen(false); }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm ${lang === l.code ? 'bg-chilli-50 font-semibold text-chilli' : 'hover:bg-cream'}`}>
                {l.label}{lang === l.code && <Check size={15} />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
