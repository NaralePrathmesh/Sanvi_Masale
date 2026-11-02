import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import SmartImage from '@/components/common/SmartImage';
import Reveal from '@/components/common/Reveal';
import { festivals } from '@/data/products';
import { festivalImage } from '@/assets/images';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function FestivalsPage() {
  const { t, l } = useLocalized();
  useDocumentTitle(t('festival.indexTitle'), t('festival.indexSub'));
  return (
    <>
      <PageHero image={festivalImage('diwali')} eyebrow={t('nav.offers')} title={t('festival.indexTitle')} subtitle={t('festival.indexSub')} crumbs={[{ label: t('festival.indexTitle') }]} />
      <div className="container-x grid gap-5 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {festivals.map((f, i) => (
          <Reveal key={f.id} delay={i * 80} className={i === 0 ? 'sm:col-span-2 lg:row-span-2' : ''}>
            <Link to={`/festivals/${f.slug}`} className={`group relative block h-full overflow-hidden rounded-2xl shadow-card ${i === 0 ? 'min-h-[420px]' : 'min-h-[260px]'}`}>
              <SmartImage image={festivalImage(f.id)} alt={l(f.name)} className="absolute inset-0 h-full w-full transition duration-700 group-hover:scale-105" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${f.color}ee, ${f.color}55 45%, transparent)` }} />
              <span className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition group-hover:rotate-45 group-hover:bg-white group-hover:text-charcoal"><ArrowUpRight size={18} /></span>
              <div className="absolute inset-x-6 bottom-6 text-white">
                <h2 className={`font-display font-semibold ${i === 0 ? 'text-5xl' : 'text-3xl'}`}>{l(f.name)}</h2>
                <p className="mt-2 max-w-md text-sm text-white/85">{t(`festival.${f.id}`)}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </>
  );
}
