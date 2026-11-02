import { Link, useParams } from 'react-router-dom';
import { Clock, BookOpen } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import EmptyState from '@/components/common/EmptyState';
import SectionHeading from '@/components/common/SectionHeading';
import ProductGrid from '@/components/product/ProductGrid';
import Reveal from '@/components/common/Reveal';
import { ArticleCard } from './JournalPage';
import { journalPosts } from '@/data/journal';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate } from '@/utils/format';
import { brand } from '@/config/brand';

export default function ArticlePage() {
  const { slug } = useParams();
  const { getProduct } = useStore();
  const { t, l, lang } = useLocalized();
  const post = journalPosts.find((p) => p.slug === slug);
  useDocumentTitle(post ? l(post.title) : t('journal.notFound'), post ? l(post.excerpt) : undefined);
  if (!post) return <div className="container-x py-16"><EmptyState icon={BookOpen} title={t('journal.notFound')}><Link to="/journal" className="btn-primary">{t('journal.title')}</Link></EmptyState></div>;
  const products = post.products.map(getProduct).filter((p) => p && p.active !== false);
  const more = journalPosts.filter((p) => p.slug !== post.slug).slice(0, 3);
  return (
    <>
      <PageHero photo={`journal/${post.slug}`} art={post.art} eyebrow={t(`journal.tags.${post.tag}`)} title={l(post.title)} crumbs={[{ label: t('nav.journal'), to: '/journal' }, { label: l(post.title) }]}>
        <p className="flex flex-wrap items-center gap-3 text-sm text-charcoal-500"><span>{brand.name}</span>·<span>{formatDate(post.date, lang, { day: 'numeric', month: 'long', year: 'numeric' })}</span>·<span className="flex items-center gap-1"><Clock size={14} />{t('journal.minRead', { n: post.minutes })}</span></p>
      </PageHero>
      <article className="container-x py-12">
        <div className="mx-auto max-w-2xl">
          <p className="text-xl leading-relaxed text-charcoal-600 sm:text-2xl">{l(post.excerpt)}</p>
          <div className="mt-8 space-y-6 text-[17px] leading-[1.85] text-charcoal-600">
            {l(post.body).map((para, i) => <Reveal as="p" key={i} className={i === 0 && lang === 'en' ? 'first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-6xl first-letter:leading-[.85] first-letter:text-chilli' : ''}>{para}</Reveal>)}
          </div>
        </div>
        {products.length > 0 && <section className="mt-16"><SectionHeading title={t('journal.shop')} /><ProductGrid products={products} /></section>}
        <section className="mt-16"><SectionHeading title={t('journal.more')} action={{ to: '/journal', label: t('actions.viewAll') }} />
          <div className="grid gap-6 md:grid-cols-3">{more.map((p, i) => <Reveal key={p.slug} delay={i * 80}><ArticleCard post={p} /></Reveal>)}</div></section>
      </article>
    </>
  );
}
