import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChefHat } from 'lucide-react';
import RecipeCard from '@/components/recipe/RecipeCard';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import EmptyState from '@/components/common/EmptyState';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { recipeCategories } from '@/data/recipes';

export default function RecipesPage() {
  const { activeRecipes } = useStore();
  const { t } = useLocalized();
  const [params] = useSearchParams();
  const { category } = useParams();
  const cat = (category && recipeCategories.includes(category) ? category : params.get('category')) || 'all';
  useDocumentTitle(cat === 'all' ? t('recipes.title') : `${t(`recipeCat.${cat}`)} · ${t('recipes.title')}`, 'Indian recipes with one-click Cook & Shop for every masala you need.');
  const list = cat === 'all' ? activeRecipes : activeRecipes.filter((r) => r.categories.includes(cat));
  return (
    <div className="container-x py-8 sm:py-10">
      <Breadcrumbs items={cat === 'all' ? [{ label: t('recipes.title') }] : [{ label: t('recipes.title'), to: '/recipes' }, { label: t(`recipeCat.${cat}`) }]} />
      <div className="mb-8 max-w-2xl"><h1 className="h-page">{cat === 'all' ? t('recipes.title') : t(`recipeCat.${cat}`)}</h1><p className="mt-2 text-charcoal-500">{t('recipes.subtitle')}</p></div>
      <div className="scrollbar-none -mx-4 mb-8 flex gap-2 overflow-x-auto px-4" aria-label={t('recipes.title')}>
        {['all', ...recipeCategories].map((c) => (
          <Link key={c} to={c === 'all' ? '/recipes' : `/recipes/category/${c}`} aria-current={cat === c ? 'page' : undefined} className={`chip shrink-0 ${cat === c ? 'chip-active' : ''}`}>
            {c === 'all' ? t('recipes.all') : t(`recipeCat.${c}`)}
          </Link>
        ))}
      </div>
      {list.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{list.map((r) => <RecipeCard key={r.id} recipe={r} />)}</div>
        : <EmptyState icon={ChefHat} title={t('recipes.noRecipes')} />}
    </div>
  );
}
