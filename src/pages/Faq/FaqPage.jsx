import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import Accordion from '@/components/common/Accordion';
import Reveal from '@/components/common/Reveal';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const GROUPS = { products: [1, 2, 8], orders: [5, 6, 7, 10], delivery: [3, 4, 9] };

export default function FaqPage() {
  const { t } = useLocalized();
  useDocumentTitle(t('faq.title'), t('faq.subtitle'));
  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: t('nav.faq') }]} />
      <div className="mb-10 max-w-2xl"><h1 className="h-page">{t('faq.title')}</h1><p className="mt-3 text-charcoal-500">{t('faq.subtitle')}</p></div>
      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          {Object.entries(GROUPS).map(([g, ids]) => (
            <Reveal as="section" key={g} id={g} className="scroll-mt-24">
              <h2 className="mb-4 text-2xl font-semibold">{t(`faq.groups.${g}`)}</h2>
              <Accordion defaultOpen={-1} items={ids.map((i) => ({ title: t(`faq.q${i}`), content: t(`faq.a${i}`) }))} />
            </Reveal>
          ))}
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-line bg-white p-6">
            <MessageCircle size={24} strokeWidth={1.75} className="text-chilli" />
            <h2 className="mt-3 text-2xl font-semibold">{t('faq.stillHelp')}</h2>
            <p className="mt-2 text-sm text-charcoal-500">{t('contact.subtitle')}</p>
            <Link to="/contact" className="btn-primary mt-5 w-full">{t('footer.contactUs')}</Link>
          </div>
          <nav className="mt-4 rounded-2xl bg-white p-5 text-sm shadow-card" aria-label={t('legal.related')}>
            <p className="mb-2 font-semibold">{t('legal.related')}</p>
            {['shipping', 'returns', 'privacy', 'terms'].map((k) => <Link key={k} to={`/${k}`} className="block py-1.5 text-charcoal-600 hover:text-chilli">{t(`legal.${k}`)}</Link>)}
          </nav>
        </aside>
      </div>
    </div>
  );
}
