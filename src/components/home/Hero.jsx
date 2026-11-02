import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Truck } from 'lucide-react';
import SmartImage from '@/components/common/SmartImage';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import { photo } from '@/assets/images';
import { formatINR } from '@/utils/format';

/**
 * Hero = the brand campaign banner (public/images/hero/b1.webp,
 * shown whole at its natural ratio on every screen) followed by a floating action strip. The banner already carries the
 * headline, so no text is laid over it. Admin → Content can swap the banner image.
 */
export default function Hero() {
  const { banners, settings } = useStore();
  const { t, l } = useLocalized();
  const b = banners.find((x) => x.active) || banners[0];
  if (!b) return null;
  const desktop = b.image ? { src: b.image } : photo(`hero/${b.id}`);
  const alt = `${l(b.title)} — सान्वी मसाले`;

  return (
    <section className="relative overflow-hidden pb-14 pt-4 sm:pt-6 lg:pb-20">
      <div aria-hidden="true" className="pointer-events-none absolute -left-32 top-10 h-[360px] w-[360px] animate-drift rounded-full bg-turmeric-100/60 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-40 h-[320px] w-[320px] animate-drift rounded-full bg-chilli-50 blur-3xl [animation-delay:-8s]" />

      <div className="container-x relative">
        {/* Banner */}
        <div className="group relative animate-heroIn overflow-hidden rounded-2xl shadow-lift ring-1 ring-black/5 sm:rounded-3xl">
          {desktop ? (
            // Whole banner always visible at its natural 1920×650 ratio — never cropped or stretched.
            <img src={desktop.src} srcSet={desktop.srcSet} sizes="(min-width:1280px) 1216px, 100vw" alt={alt} fetchpriority="high"
              width={1920} height={650} className="block h-auto w-full" />
          ) : (
            <SmartImage art={b.art} alt={alt} eager className="aspect-[1920/650] w-full" />
          )}
          <Link to={b.link || '/shop'} className="absolute inset-0" aria-label={t('actions.shopNow')} tabIndex={-1} />
        </div>

        {/* Action strip */}
        <div className="relative mx-auto mt-5 max-w-5xl animate-heroIn rounded-2xl border border-line bg-white p-5 shadow-soft [animation-delay:200ms] sm:mt-6 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 lg:max-w-md">
              <h1 className="font-display text-xl leading-snug sm:text-2xl">{l(b.title)}</h1>
              <p className="mt-1 text-sm text-charcoal-500">{l(b.subtitle)}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to={b.link || '/shop'} className="btn-primary px-7">{t('actions.shopNow')}<ArrowRight size={16} /></Link>
              <Link to="/categories" className="btn-outline px-7">{t('actions.exploreMasalas')}</Link>
            </div>
          </div>
          <ul className="mt-5 grid gap-3 border-t border-line pt-4 text-[13px] text-charcoal-600 sm:grid-cols-3">
            <li className="flex items-center gap-2"><span className="flex">{[0, 1, 2, 3, 4].map((i) => <Star key={i} size={13} className="fill-turmeric text-turmeric" />)}</span><strong className="font-semibold">4.9</strong> · {t('home.heroTrust1')}</li>
            <li className="flex items-center gap-2"><ShieldCheck size={16} className="text-leaf" />{t('home.heroTrust2')}</li>
            <li className="flex items-center gap-2"><Truck size={16} className="text-chilli" />{t('cart.free')} · {formatINR(settings.freeShippingThreshold)}+</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
