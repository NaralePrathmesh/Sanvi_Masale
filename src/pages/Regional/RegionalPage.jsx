import { Link } from 'react-router-dom';
import { ArrowRight, Utensils } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import SmartImage from '@/components/common/SmartImage';
import ProductGrid from '@/components/product/ProductGrid';
import { regions, regionSlug } from '@/data/categories';
import { regionImages } from '@/assets/images';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function RegionalPage() {
  const { activeProducts } = useStore();
  const { t, l } = useLocalized();
  useDocumentTitle(t('regional.title'), 'Discover authentic regional masalas from Maharashtra, North India and South India.');
  return (
    <div className="py-8">
      <div className="container-x">
        <Breadcrumbs items={[{ label: t('nav.regional') }]} />
        <div className="mb-6 max-w-2xl"><h1 className="h-page">{t('regional.title')}</h1><p className="mt-2 text-charcoal-500">{t('regional.subtitle')}</p></div>
        <nav className="flex flex-wrap gap-2">{regions.map((r) => <a key={r.id} href={`#${r.id}`} className="chip">{l(r.name)}</a>)}</nav>
      </div>
      {regions.map((r, i) => {
        const items = activeProducts.filter((p) => p.region === r.id && p.type !== 'combo').sort((a, b) => b.popularity - a.popularity).slice(0, 4);
        return (
          <section key={r.id} id={r.id} className={`section scroll-mt-20 ${i % 2 ? 'border-y border-line bg-white' : ''}`}>
            <div className="container-x">
              <div className="mb-8 grid items-center gap-8 lg:grid-cols-2">
                <div className={`overflow-hidden rounded-2xl shadow-card ${i % 2 ? 'lg:order-2' : ''}`}><SmartImage image={regionImages[r.id]} alt={l(r.name)} className="aspect-[3/2] w-full" /></div>
                <div>
                  <p className="eyebrow">{t('regional.masalasFrom', { region: l(r.name) })}</p>
                  <h2 className="h-section mt-2">{l(r.name)}</h2>
                  <p className="mt-4 leading-relaxed text-charcoal-600">{l(r.desc)}</p>
                  <p className="mt-4 flex items-start gap-2 text-sm"><Utensils size={16} className="mt-0.5 shrink-0 text-chilli" /><span><strong>{t('regional.signature')}:</strong> {l(r.dishes)}</span></p>
                  <Link to={`/regional/${regionSlug(r.id)}`} className="btn-primary mt-6">{t('regional.shopRegion', { region: l(r.name) })}<ArrowRight size={16} /></Link>
                </div>
              </div>
              <ProductGrid products={items} />
            </div>
          </section>
        );
      })}
    </div>
  );
}
