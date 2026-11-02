import { Leaf } from 'lucide-react';
import { useLocalized } from '@/hooks/useLocalized';

/** Light, slow ribbon of spice names (static when reduced motion is on). */
export default function SpiceMarquee() {
  const { t } = useLocalized();
  const words = t('home.marquee').split('·').map((w) => w.trim());
  const row = (hidden) => words.map((w, i) => (
    <span key={`${hidden}-${i}`} aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-6 pr-6">
      <span className="font-display text-xl text-charcoal-600 sm:text-2xl">{w}</span>
      <Leaf size={14} className="text-leaf" />
    </span>
  ));
  return (
    <div className="overflow-hidden border-y border-line bg-white py-4" aria-label={t('home.marquee')}>
      <div className="marquee-track flex w-max animate-marquee">{row(false)}{row(true)}</div>
    </div>
  );
}
