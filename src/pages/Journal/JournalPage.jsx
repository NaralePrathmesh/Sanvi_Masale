import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import SmartImage from '@/components/common/SmartImage';
import Reveal from '@/components/common/Reveal';
import { journalPosts } from '@/data/journal';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate } from '@/utils/format';

export function ArticleCard({ post, big = false }) {
  const { t, l, lang } = useLocalized();
  return (
    <Link to={`/journal/${post.slug}`} className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-white transition duration-500 hover:shadow-soft">
      <SmartImage photo={`journal/${post.slug}`} art={post.art} alt={l(post.title)} zoom className={big ? 'aspect-[16/9] w-full' : 'aspect-[3/2] w-full'} />
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="flex flex-wrap items-center gap-2 text-xs font-semibold text-charcoal-400"><span className="badge bg-turmeric-100 text-turmeric-700">{t(`journal.tags.${post.tag}`)}</span>{formatDate(post.date, lang)}<span className="flex items-center gap-1"><Clock size={12} />{t('journal.minRead', { n: post.minutes })}</span></p>
        <h2 className={`text-balance mt-3 font-display font-semibold leading-snug group-hover:text-chilli ${big ? 'text-3xl' : 'text-xl'}`}>{l(post.title)}</h2>
        <p className="mt-2 line-clamp-3 text-sm text-charcoal-500">{l(post.excerpt)}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-chilli">{t('journal.read')}<ArrowRight size={15} className="transition group-hover:translate-x-1" /></span>
      </div>
    </Link>
  );
}

export default function JournalPage() {
  const { t } = useLocalized();
  const [tag, setTag] = useState('all');
  useDocumentTitle(t('journal.title'), t('journal.subtitle'));
  const posts = [...journalPosts].sort((a, b) => b.date.localeCompare(a.date)).filter((p) => tag === 'all' || p.tag === tag);
  return (
    <>
      <PageHero photo="journal/how-to-store-spices" eyebrow={t('nav.journal')} title={t('journal.title')} subtitle={t('journal.subtitle')} crumbs={[{ label: t('nav.journal') }]} />
      <div className="container-x py-12">
        <div className="scrollbar-none -mx-4 mb-8 flex gap-2 overflow-x-auto px-4" role="tablist">
          {['all', 'tips', 'heritage', 'guides', 'festivals'].map((k) => <button key={k} type="button" role="tab" aria-selected={tag === k} onClick={() => setTag(k)} className={`chip shrink-0 ${tag === k ? 'chip-active' : ''}`}>{k === 'all' ? t('journal.all') : t(`journal.tags.${k}`)}</button>)}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => <Reveal key={p.slug} delay={(i % 3) * 80} className={i === 0 && tag === 'all' ? 'md:col-span-2' : ''}><ArticleCard post={p} big={i === 0 && tag === 'all'} /></Reveal>)}
        </div>
      </div>
    </>
  );
}
