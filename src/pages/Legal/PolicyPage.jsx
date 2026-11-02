import { Link } from 'react-router-dom';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DemoNotice from '@/components/common/DemoBadge';
import { policyPages } from '@/data/pages';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate } from '@/utils/format';

/** Shipping / Returns / Privacy / Terms — content in data/pages.js (placeholder text). */
export default function PolicyPage({ page }) {
  const { t, l, lang } = useLocalized();
  const data = policyPages[page];
  useDocumentTitle(t(`legal.${page}`));
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: t('nav.faq'), to: '/faq' }, { label: t(`legal.${page}`) }]} />
      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        <nav className="flex gap-2 overflow-x-auto scrollbar-none lg:sticky lg:top-24 lg:flex-col lg:self-start" aria-label={t('legal.related')}>
          {Object.keys(policyPages).map((k) => <Link key={k} to={`/${k}`} className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold ${k === page ? 'bg-chilli text-white' : 'bg-white text-charcoal hover:bg-cream-200'}`}>{t(`legal.${k}`)}</Link>)}
        </nav>
        <article className="min-w-0 max-w-3xl">
          <h1 className="h-page">{t(`legal.${page}`)}</h1>
          <p className="mt-2 text-sm text-charcoal-400">{t('legal.updated', { date: formatDate(data.updated, lang, { day: 'numeric', month: 'long', year: 'numeric' }) })}</p>
          <DemoNotice text={t('legal.placeholder')} className="mt-5" />
          <div className="mt-8 space-y-8">
            {data.sections.map((sec, i) => (
              <section key={i}><h2 className="text-xl font-semibold">{i + 1}. {l(sec.title)}</h2><p className="mt-2 leading-relaxed text-charcoal-600">{l(sec.body)}</p></section>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
