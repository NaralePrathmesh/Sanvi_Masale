import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, BookOpen, HandHeart, Sprout, Sun, Flame, FlaskConical } from 'lucide-react';
import SmartImage from '@/components/common/SmartImage';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Reveal from '@/components/common/Reveal';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { pageImages } from '@/assets/images';

/** About: hero photo · introduction · values · quality commitment · closing. */
export default function AboutPage() {
  const { t } = useLocalized();
  useDocumentTitle(t('about.title'), 'Our story, values and commitment to pure Indian spices.');
  return (
    <>
      <section className="container-x pb-16 pt-8 sm:pt-10">
        <Breadcrumbs items={[{ label: t('nav.about') }]} />
        <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
          <div>
            <h1 className="h-page">{t('about.title')}</h1>
            <p className="mt-4 text-lg text-charcoal-500">{t('about.subtitle')}</p>
            <p className="mt-6 leading-relaxed text-charcoal-600">{t('about.story1')}</p>
            <p className="mt-4 leading-relaxed text-charcoal-600">{t('about.story2')}</p>
            <ol className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-6 sm:grid-cols-4">
              {[1, 2, 3, 4].map((i) => <li key={i}><p className="font-display text-xl text-chilli">{t(`about.j${i}y`)}</p><p className="mt-1 text-[13px] leading-snug text-charcoal-500">{t(`about.j${i}`)}</p></li>)}
            </ol>
          </div>
          <SmartImage image={pageImages.aboutHero} alt={t('about.title')} eager sizes="(min-width:1024px) 50vw, 100vw" className="aspect-[4/3] w-full rounded-2xl lg:aspect-[5/4]" />
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="container-x section">
          <h2 className="h-section text-center">{t('about.valuesTitle')}</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {[[Leaf, 'v1'], [BookOpen, 'v2'], [HandHeart, 'v3']].map(([Icon, k], i) => (
              <Reveal key={k} delay={i * 60} className="text-center">
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-chilli-50 text-chilli"><Icon size={21} strokeWidth={1.75} /></span>
                <h3 className="mt-4 font-sans text-base font-semibold">{t(`about.${k}`)}</h3>
                <p className="mx-auto mt-1 max-w-xs text-sm text-charcoal-500">{t(`about.${k}d`)}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x section grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal variant="image"><SmartImage image={pageImages.manufacturing} alt={t('about.qualityTitle')} className="aspect-[4/3] w-full rounded-2xl" /></Reveal>
        <Reveal>
          <h2 className="h-section">{t('about.qualityTitle')}</h2>
          <p className="mt-4 leading-relaxed text-charcoal-500">{t('about.heritage')}</p>
          <ul className="mt-7 grid gap-4 sm:grid-cols-2">
            {[[Sprout, 'q1'], [Sun, 'q2'], [Flame, 'q3'], [FlaskConical, 'q4']].map(([Icon, k]) => (
              <li key={k} className="flex items-center gap-3 text-sm font-medium"><Icon size={18} strokeWidth={1.75} className="shrink-0 text-chilli" />{t(`about.${k}`)}</li>
            ))}
          </ul>
          <p className="mt-7 border-t border-line pt-5 text-xs text-charcoal-500">{t('about.mfg')}</p>
        </Reveal>
      </section>

      <section className="container-x">
        <div className="rounded-2xl bg-chilli px-6 py-14 text-center text-white sm:px-12">
          <h2 className="h-section text-white">{t('about.closingTitle')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-white/80">{t('about.mission')}</p>
          <Link to="/shop" className="btn mt-7 bg-white text-chilli hover:bg-cream">{t('actions.shopNow')}<ArrowRight size={15} /></Link>
        </div>
      </section>
    </>
  );
}
