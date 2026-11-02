import { useRef, useState } from 'react';
import { Palette, Check } from 'lucide-react';
import { useLocalized } from '@/hooks/useLocalized';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useTheme } from '@/context/ThemeContext';
import { themes } from '@/config/themes';

const Swatch = ({ colors, big }) => (
  <span aria-hidden="true" className={`relative flex shrink-0 overflow-hidden rounded-full ring-1 ring-black/10 ${big ? 'h-9 w-9' : 'h-5 w-5'}`}>
    <span className="h-full w-1/2" style={{ background: colors[0] }} />
    <span className="flex h-full w-1/2 flex-col"><span className="h-1/2" style={{ background: colors[1] }} /><span className="h-1/2" style={{ background: colors[2] }} /></span>
  </span>
);

/** Header palette button + popover, or `inline` cards for the mobile menu. */
export default function ThemeSwitcher({ variant = 'dropdown' }) {
  const { t } = useLocalized();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const current = themes.find((x) => x.id === theme);

  const options = (onPick) => themes.map((x) => (
    <button key={x.id} type="button" role="radio" aria-checked={theme === x.id} onClick={() => { setTheme(x.id); onPick?.(); }}
      className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${theme === x.id ? 'border-chilli bg-chilli-50' : 'border-transparent hover:bg-cream-200'}`}>
      <Swatch colors={x.swatches} big />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-charcoal">{t(`theme.${x.id}`)}</span>
        <span className="block text-xs text-charcoal-500">{t(`theme.${x.id}Desc`)}</span>
      </span>
      {theme === x.id && <Check size={16} className="shrink-0 text-chilli" />}
    </button>
  ));

  if (variant === 'inline') {
    return <div className="space-y-1.5" role="radiogroup" aria-label={t('theme.title')}>{options()}</div>;
  }
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="dialog" aria-expanded={open} aria-label={t('theme.title')} title={t('theme.title')}
        className="icon-btn"><span className="relative"><Palette size={20} /><span aria-hidden="true" className="absolute -bottom-1 -right-1.5 h-2.5 w-2.5 rounded-full ring-2 ring-white" style={{ background: current.swatches[0] }} /></span></button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-72 rounded-2xl border border-line bg-white p-2 shadow-lift animate-fadeUp">
          <p className="px-2.5 pb-2 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-charcoal-400">{t('theme.title')}</p>
          <div className="space-y-1" role="radiogroup" aria-label={t('theme.title')}>{options(() => setOpen(false))}</div>
        </div>
      )}
    </div>
  );
}
