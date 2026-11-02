import { Link, useParams } from 'react-router-dom';
import { Tag, PartyPopper } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import EmptyState from '@/components/common/EmptyState';
import SectionHeading from '@/components/common/SectionHeading';
import ProductGrid from '@/components/product/ProductGrid';
import RecipeCard from '@/components/recipe/RecipeCard';
import Reveal from '@/components/common/Reveal';
import { festivals, festivalRecipes } from '@/data/products';
import { festivalImage } from '@/assets/images';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export default function FestivalPage() {
  const { slug } = useParams();
  const { getProduct, activeRecipes } = useStore();
  const { setCouponCode } = useCart();
  const { toast } = useUI();
  const { t, l } = useLocalized();
  const f = festivals.find((x) => x.slug === slug);
  useDocumentTitle(f ? t('festival.pageTitle', { name: l(f.name) }) : t('notFound.title'), f ? t(`festival.${f.id}`) : undefined);
  if (!f) return <div className="container-x py-16"><EmptyState icon={PartyPopper} title={t('notFound.title')}><Link to="/festivals" className="btn-primary">{t('festival.indexTitle')}</Link></EmptyState></div>;
  const items = f.products.map(getProduct).filter((p) => p && p.active !== false);
  const recipes = (festivalRecipes[f.id] || []).map((id) => activeRecipes.find((r) => r.id === id)).filter(Boolean);
  return (
    <>
      <PageHero image={festivalImage(f.id)} eyebrow={t('festival.indexTitle')} title={t('festival.pageTitle', { name: l(f.name) })} subtitle={t(`festival.${f.id}`)} crumbs={[{ label: t('festival.indexTitle'), to: '/festivals' }, { label: l(f.name) }]}>
        <button type="button" onClick={() => { setCouponCode(f.coupon); toast(t('festival.copied', { code: f.coupon }), 'success', { to: '/cart', label: t('actions.viewCart') }); }} className="btn-outline"><Tag size={16} />{t('festival.useCode', { code: f.coupon })}</button>
      </PageHero>
      <div className="container-x py-12">
        <ProductGrid products={items} />
        {recipes.length > 0 && <section className="mt-20"><SectionHeading title={t('festival.recipes')} /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{recipes.map((r, i) => <Reveal key={r.id} delay={i * 80}><RecipeCard recipe={r} /></Reveal>)}</div></section>}
        <section className="mt-20"><SectionHeading title={t('festival.others')} />
          <div className="flex flex-wrap gap-3">{festivals.filter((x) => x.id !== f.id).map((x) => <Link key={x.id} to={`/festivals/${x.slug}`} className="rounded-full px-5 py-3 font-semibold text-white transition hover:shadow-soft" style={{ background: x.color }}>{l(x.name)}</Link>)}</div>
        </section>
      </div>
    </>
  );
}
