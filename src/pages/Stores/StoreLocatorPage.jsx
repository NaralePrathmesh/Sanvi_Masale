import { useState } from 'react';
import { MapPin, Phone, Clock, Search, Navigation, Star } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import Reveal from '@/components/common/Reveal';
import DemoNotice from '@/components/common/DemoBadge';
import { stores } from '@/data/pages';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { pageImages } from '@/assets/images';

export default function StoreLocatorPage() {
  const { t, l } = useLocalized();
  const [q, setQ] = useState('');
  useDocumentTitle(t('stores.title'), t('stores.subtitle'));
  const query = q.trim().toLowerCase();
  const list = stores.filter((s) => !query || [...Object.values(s.city), ...Object.values(s.name), s.address].join(' ').toLowerCase().includes(query));
  return (
    <>
      <PageHero image={pageImages.store} eyebrow={t('nav.stores')} title={t('stores.title')} subtitle={t('stores.subtitle')} crumbs={[{ label: t('nav.stores') }]}>
        <label className="relative block max-w-md">
          <span className="sr-only">{t('stores.search')}</span>
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('stores.search')} className="input pl-11" />
        </label>
      </PageHero>
      <div className="container-x py-12">
        <DemoNotice text={t('stores.demo')} className="mb-6" />
        {!list.length ? <p className="rounded-2xl bg-white p-8 text-center text-charcoal-500 shadow-card">{t('stores.none')}</p> : (
          <div className="grid gap-5 md:grid-cols-2">
            {list.map((s, i) => (
              <Reveal key={s.id} delay={i * 80} className={`rounded-xl border border-line bg-white p-6 ${s.flagship ? 'ring-1 ring-chilli/40' : ''}`}>
                <div className="flex flex-wrap items-center gap-2"><p className="eyebrow">{l(s.city)}</p>{s.flagship && <span className="badge bg-turmeric-100 text-turmeric-700"><Star size={11} className="fill-current" />{t('stores.flagship')}</span>}</div>
                <h2 className="mt-2 text-2xl font-semibold">{l(s.name)}</h2>
                <ul className="mt-4 space-y-2.5 text-sm text-charcoal-600">
                  <li className="flex gap-2.5"><MapPin size={17} className="shrink-0 text-chilli" />{s.address}</li>
                  <li className="flex gap-2.5"><Phone size={17} className="shrink-0 text-chilli" /><span className="select-all">{s.phone}</span></li>
                  <li className="flex gap-2.5"><Clock size={17} className="shrink-0 text-chilli" />{t('stores.hours')}: {s.hours}</li>
                </ul>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`} target="_blank" rel="noreferrer noopener" className="btn-outline btn-sm mt-5"><Navigation size={14} />{t('stores.directions')}</a>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
