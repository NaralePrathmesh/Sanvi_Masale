import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import SmartImage from '@/components/common/SmartImage';
import { useLocalized } from '@/hooks/useLocalized';

/** Recipe card: photo · name · total time · View Recipe. */
export default function RecipeCard({ recipe }) {
  const { t, l } = useLocalized();
  return (
    <Link to={`/recipes/${recipe.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <SmartImage src={recipe.image} photo={`recipes/${recipe.slug}`} dish={recipe.art} seed={recipe.id} alt={l(recipe.name)} zoom className="aspect-[4/3] w-full" />
      <div className="flex flex-1 flex-col p-5">
        <p className="flex items-center gap-1.5 text-xs text-charcoal-500"><Clock size={13} />{t('recipes.mins', { n: recipe.prep + recipe.cook })}</p>
        <h3 className="mt-1.5 text-lg leading-snug">{l(recipe.name)}</h3>
        <span className="btn-link mt-auto pt-4">{t('actions.readRecipe')}<ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" /></span>
      </div>
    </Link>
  );
}
