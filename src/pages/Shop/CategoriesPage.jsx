import CategoryGrid from '@/components/home/CategoryGrid';
import RegionalShowcase from '@/components/home/RegionalShowcase';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import SectionHeading from '@/components/common/SectionHeading';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Link } from 'react-router-dom';
import { useStore } from '@/context/StoreContext';
import { collectionBanner } from '@/assets/images';

export default function CategoriesPage() {
  const { t, l } = useLocalized();
  const { categories } = useStore();
  const banners = categories.map((c) => ({ c, b: collectionBanner(c.id) })).filter((x) => x.b);
  useDocumentTitle(t('nav.categories'), 'Browse all masala and spice categories.');
  return (
    <div className="container-x py-8 sm:py-10">
      <Breadcrumbs items={[{ label: t('nav.categories') }]} />
      <h1 className="h-page">{t('home.categoriesTitle')}</h1>
      <p className="mt-2 text-charcoal-500">{t('home.categoriesSub')}</p>
      {banners.length > 0 && (
        <div className="mt-8 grid gap-5">
          {banners.map(({ c, b }) => (
            <Link key={c.id} to={`/category/${c.id}`} className="group block overflow-hidden rounded-2xl shadow-soft ring-1 ring-black/5" aria-label={l(c.name)}>
              <img src={b.src} srcSet={b.srcSet} sizes="(min-width:1280px) 1216px, 100vw" alt={`${l(c.name)} — सान्वी मसाले`} loading="lazy" className="block aspect-[1920/650] w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
            </Link>
          ))}
        </div>
      )}
      <div className="mt-12"><CategoryGrid all /></div>
      <div className="mt-20"><SectionHeading title={t('home.regionalTitle')} subtitle={t('home.regionalSub')} /><RegionalShowcase /></div>
    </div>
  );
}
