import { Award, Wheat, BookOpen, PackageCheck } from 'lucide-react';
import Reveal, { CountUp } from '@/components/common/Reveal';
import { useLocalized } from '@/hooks/useLocalized';

/** Four benefits: icon + title + one line. */
export default function WhyChooseUs() {
  const { t } = useLocalized();
  const items = [[Award, 'why.authentic', 'why.s1'], [Wheat, 'why.quality', 'why.s2'], [BookOpen, 'why.traditional', 'why.s3'], [PackageCheck, 'why.packed', 'why.s4']];
  return (
    <section className="border-y border-line bg-white">
      <div className="container-x py-16 sm:py-20">
        <h2 className="h-section text-center">{t('why.title')}</h2>
        <dl className="mx-auto mb-14 mt-8 grid max-w-2xl grid-cols-3 gap-4 text-center">
          {[[new Date().getFullYear() - 1978, '+', 'why.statsYears'], [200000, '+', 'why.statsKitchens'], [40, '+', 'why.statsFarms']].map(([v, suf, k]) => (
            <div key={k}><dd className="font-display text-3xl text-chilli sm:text-4xl"><CountUp value={v} suffix={suf} /></dd><dt className="mt-1 text-xs text-charcoal-500 sm:text-sm">{t(k)}</dt></div>
          ))}
        </dl>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {items.map(([Icon, title, text], i) => (
            <Reveal key={title} delay={i * 60} className="text-center">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-chilli-50 text-chilli"><Icon size={21} strokeWidth={1.75} /></span>
              <h3 className="mt-4 font-sans text-base font-semibold">{t(title)}</h3>
              <p className="mx-auto mt-1 max-w-[220px] text-sm text-charcoal-500">{t(text)}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
