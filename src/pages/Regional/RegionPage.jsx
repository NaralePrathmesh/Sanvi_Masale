import { Link, useParams } from 'react-router-dom';
import { Utensils, MapPin, ArrowRight } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import EmptyState from '@/components/common/EmptyState';
import SectionHeading from '@/components/common/SectionHeading';
import SmartImage from '@/components/common/SmartImage';
import ProductGrid from '@/components/product/ProductGrid';
import RecipeCard from '@/components/recipe/RecipeCard';
import Reveal from '@/components/common/Reveal';
import { regions, regionSlug, regionFromSlug } from '@/data/categories';
import { regionImages } from '@/assets/images';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const RECIPE_CAT = { maharashtra: 'maharashtrian', north: 'punjabi', south: 'south-indian' };

export default function RegionPage() {
  const { slug } = useParams();
  const { activeProducts, activeRecipes } = useStore();
  const { t, l } = useLocalized();
  const region = regions.find((r) => r.id === regionFromSlug(slug));
  useDocumentTitle(region ? t('regional.masalasFrom', { region: l(region.name) }) : t('notFound.title'), region ? l(region.desc) : undefined);
  if (!region) return <div className="container-x py-16"><EmptyState icon={MapPin} title={t('notFound.title')}><Link to="/regional" className="btn-primary">{t('nav.regional')}</Link></EmptyState></div>;
  const items = activeProducts.filter((p) => p.region === region.id && p.type !== 'combo');
  const recipes = activeRecipes.filter((r) => r.categories.includes(RECIPE_CAT[region.id])).slice(0, 4);
  return (
    <>
      <PageHero image={regionImages[region.id]} eyebrow={t('nav.regional')} title={t('regional.masalasFrom', { region: l(region.name) })} subtitle={l(region.desc)} crumbs={[{ label: t('nav.regional'), to: '/regional' }, { label: l(region.name) }]}>
        <p className="flex items-start gap-2 text-sm text-charcoal-500"><Utensils size={16} className="mt-0.5 shrink-0 text-chilli" /><span><strong>{t('regional.signature')}:</strong> {l(region.dishes)}</span></p>
      </PageHero>
      <div className="container-x py-12">
        <ProductGrid products={items} />
        {recipes.length > 0 && (
          <section className="mt-20"><SectionHeading title={t('regional.recipesFrom', { region: l(region.name) })} action={{ to: `/recipes/category/${RECIPE_CAT[region.id]}`, label: t('actions.viewAll') }} />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{recipes.map((r, i) => <Reveal key={r.id} delay={i * 80}><RecipeCard recipe={r} /></Reveal>)}</div></section>
        )}
        <section className="mt-20"><SectionHeading title={t('regional.otherRegions')} />
          <div className="grid gap-5 md:grid-cols-2">
            {regions.filter((r) => r.id !== region.id).map((r) => (
              <Link key={r.id} to={`/regional/${regionSlug(r.id)}`} className="group relative block aspect-[16/7] overflow-hidden rounded-2xl shadow-card">
                <SmartImage image={regionImages[r.id]} alt={l(r.name)} className="absolute inset-0 h-full w-full transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white"><p className="font-display text-3xl font-semibold">{l(r.name)}</p><p className="mt-1 inline-flex items-center gap-1 text-sm text-turmeric">{t('regional.viewRegion', { region: l(r.name) })}<ArrowRight size={14} className="transition group-hover:translate-x-1" /></p></div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
