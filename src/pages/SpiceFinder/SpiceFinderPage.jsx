import { useSearchParams } from 'react-router-dom';
import { ShoppingBag, Compass } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ProductGrid from '@/components/product/ProductGrid';
import RecipeCard from '@/components/recipe/RecipeCard';
import { DishEmoji } from '@/components/common/DishEmoji';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { spiceFinderOptions } from '@/data/products';

/** Maps finder dishes to recipe ids for "Recipes you can try". */
const DISH_RECIPES = { paneer: ['r06', 'r12'], biryani: ['r09'], pavBhaji: ['r02'], misal: ['r01'], dal: ['r07', 'r05', 'r08'], chickenCurry: ['r09'], vegetables: ['r10', 'r03'], snacks: ['r11', 'r12', 'r02'] };

export default function SpiceFinderPage() {
  const { activeProducts, activeRecipes } = useStore();
  const { addMany } = useCart();
  const { toast } = useUI();
  const { t } = useLocalized();
  const [params, setParams] = useSearchParams();
  const dish = spiceFinderOptions.includes(params.get('dish')) ? params.get('dish') : '';
  useDocumentTitle(t('finder.title'), 'Find the right masala for what you are cooking today.');
  const recs = dish ? activeProducts.filter((p) => p.dishes.includes(dish) && p.type !== 'combo').sort((a, b) => (b.category !== 'pure-spices') - (a.category !== 'pure-spices') || b.popularity - a.popularity).slice(0, 8) : [];
  const recipes = dish ? (DISH_RECIPES[dish] || []).map((id) => activeRecipes.find((r) => r.id === id)).filter(Boolean) : [];
  const top = recs.slice(0, 4);

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: t('finder.title') }]} />
      <div className="rounded-2xl border border-line bg-white p-6 text-center sm:p-10">
        <Compass size={32} className="mx-auto text-chilli" />
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{t('finder.subtitle')}</h1>
        <p className="mt-2 text-charcoal-500">{t('finder.pick')}</p>
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-4" role="radiogroup" aria-label={t('finder.pick')}>
          {spiceFinderOptions.map((d) => (
            <button key={d} type="button" role="radio" aria-checked={dish === d} onClick={() => setParams({ dish: d }, { replace: true })}
              className={`flex flex-col items-center gap-2 rounded-2xl p-4 transition ${dish === d ? 'bg-chilli text-white shadow-lift' : 'bg-white shadow-card hover:-translate-y-0.5'}`}>
              <DishEmoji dish={d} /><span className="text-sm font-semibold">{t(`dishes.${d}`)}</span>
            </button>
          ))}
        </div>
      </div>
      {!dish ? <p className="mt-10 text-center text-charcoal-500">{t('finder.none')}</p> : (
        <div className="mt-10 animate-fadeUp" key={dish}>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl">{t('finder.results', { dish: t(`dishes.${dish}`) })}</h2>
            <button type="button" className="btn-primary" onClick={() => { addMany(top.map((p) => ({ productId: p.id, size: p.packs[0].size }))); toast(t('finder.addedAll'), 'success', { to: '/cart', label: t('actions.viewCart') }); }}><ShoppingBag size={16} />{t('finder.addAll')} ({top.length})</button>
          </div>
          <ProductGrid products={recs} />
          {recipes.length > 0 && <section className="mt-12"><h2 className="mb-5 text-2xl">{t('finder.recipesFor')}</h2><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}</div></section>}
        </div>
      )}
    </div>
  );
}
