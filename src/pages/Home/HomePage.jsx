import { Link } from 'react-router-dom';
import { ArrowRight, Plus } from 'lucide-react';
import Hero from '@/components/home/Hero';
import SpiceMarquee from '@/components/home/SpiceMarquee';
import CategoryGrid from '@/components/home/CategoryGrid';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Newsletter from '@/components/home/Newsletter';
import ReviewWall from '@/components/home/ReviewWall';
import SectionHeading from '@/components/common/SectionHeading';
import SmartImage from '@/components/common/SmartImage';
import Reveal from '@/components/common/Reveal';
import ProductCard from '@/components/product/ProductCard';
import ProductImage from '@/components/product/ProductImage';
import RecipeCard from '@/components/recipe/RecipeCard';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useProductActions } from '@/hooks/useProductActions';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { regionImages, pageImages } from '@/assets/images';
import { formatINR } from '@/utils/format';

/**
 * Homepage — deliberately short: hero · categories · bestsellers · Maharashtra editorial ·
 * why us · customer reviews (WhatsApp wall) · recipes · brand story · newsletter. Everything else lives on its own page.
 */
export default function HomePage() {
  const { activeProducts, getProduct, activeRecipes, homeContent } = useStore();
  const { t } = useLocalized();
  useDocumentTitle('', 'Authentic Indian masalas and pure spices, stone-ground in small batches.');
  const sec = homeContent.sections || {};
  const bestsellers = activeProducts.filter((p) => p.bestseller).sort((a, b) => b.popularity - a.popularity).slice(0, 4);
  const recipes = activeRecipes.filter((r) => r.featured !== false).slice(0, 3);
  const maharashtra = ['p18', 'p17', 'p21'].map(getProduct).filter((p) => p && p.active !== false);

  return (
    <>
      <Hero />
      <SpiceMarquee />

      <section className="container-x section">
        <SectionHeading title={t('home.categoriesTitle')} action={{ to: '/categories', label: t('actions.viewAll') }} />
        <CategoryGrid />
      </section>

      <section className="border-t border-line bg-white">
        <div className="container-x section">
          <SectionHeading title={t('home.bestsellersTitle')} subtitle={t('home.bestsellersShort')} action={{ to: '/shop?sort=popularity', label: t('actions.viewAll') }} />
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">{bestsellers.map((p, i) => <Reveal key={p.id} delay={i * 80} className="h-full"><ProductCard product={p} /></Reveal>)}</div>
        </div>
      </section>

      {sec.regional !== false && <MaharashtraFeature products={maharashtra} />}
      {sec.why !== false && <WhyChooseUs />}
      {sec.reviews !== false && <ReviewWall />}

      {sec.recipes !== false && recipes.length > 0 && (
        <section className="container-x section">
          <SectionHeading title={t('home.recipesTitle')} subtitle={t('home.recipesShort')} action={{ to: '/recipes', label: t('actions.viewAll') }} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{recipes.map((r, i) => <Reveal key={r.id} delay={i * 60}><RecipeCard recipe={r} /></Reveal>)}</div>
        </section>
      )}

      {sec.story !== false && (
        <section className="border-y border-line bg-white">
          <div className="container-x grid items-center gap-10 py-16 sm:py-20 md:grid-cols-2 lg:gap-16">
            <Reveal variant="image"><SmartImage image={pageImages.aboutStory} alt={t('about.storyTitle')} className="aspect-[4/3] w-full rounded-2xl" /></Reveal>
            <Reveal>
              <p className="eyebrow">{t('about.storyTitle')}</p>
              <h2 className="h-section mt-3">{t('about.subtitle')}</h2>
              <p className="mt-4 max-w-md leading-relaxed text-charcoal-500">{t('home.storyText')}</p>
              <Link to="/about" className="btn-outline mt-7">{t('home.storyCta')}<ArrowRight size={15} /></Link>
            </Reveal>
          </div>
        </section>
      )}

      {sec.newsletter !== false && <Newsletter />}
    </>
  );
}

/** Editorial block: one large photo, short copy, three featured Maharashtrian masalas. */
function MaharashtraFeature({ products }) {
  const { t, l } = useLocalized();
  const { addToCart } = useProductActions();
  return (
    <section className="container-x section">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal variant="image"><SmartImage image={regionImages.maharashtra} alt={t('home.mhTitle')} sizes="(min-width:1024px) 50vw, 100vw" className="aspect-[4/3] w-full rounded-2xl" /></Reveal>
        <Reveal>
          <p className="eyebrow">{t('home.mhEyebrow')}</p>
          <h2 className="h-section mt-3">{t('home.mhTitle')}</h2>
          <p className="mt-4 max-w-lg leading-relaxed text-charcoal-500">{t('home.mhText')}</p>
          <ul className="mt-7 divide-y divide-line border-y border-line">
            {products.map((p) => (
              <li key={p.id} className="flex items-center gap-4 py-3">
                <Link to={`/product/${p.slug}`} className="w-14 shrink-0 overflow-hidden rounded-lg"><ProductImage product={p} compact sizes="56px" /></Link>
                <div className="min-w-0 flex-1">
                  <Link to={`/product/${p.slug}`} className="block truncate text-[15px] font-semibold hover:text-chilli">{l(p.name)}</Link>
                  <p className="text-[13px] text-charcoal-500">{p.packs[0].size} · {formatINR(p.packs[0].price)}</p>
                </div>
                <button type="button" onClick={() => addToCart(p, p.packs[0].size)} className="icon-btn border border-line" aria-label={`${t('actions.addToCart')}: ${l(p.name)}`}><Plus size={17} /></button>
              </li>
            ))}
          </ul>
          <Link to="/regional/maharashtra" className="btn-primary mt-7">{t('home.mhCta')}<ArrowRight size={15} /></Link>
        </Reveal>
      </div>
    </section>
  );
}
