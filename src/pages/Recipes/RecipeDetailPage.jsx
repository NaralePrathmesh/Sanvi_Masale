import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Clock, Flame, ChefHat, Users, ShoppingBag, Check, Utensils, Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import SmartImage from '@/components/common/SmartImage';
import EmptyState from '@/components/common/EmptyState';
import SectionHeading from '@/components/common/SectionHeading';
import ProductImage from '@/components/product/ProductImage';
import RecipeCard from '@/components/recipe/RecipeCard';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatINR } from '@/utils/format';

export default function RecipeDetailPage() {
  const { slug } = useParams();
  const { activeRecipes, getProduct } = useStore();
  const { addMany } = useCart();
  const { toast } = useUI();
  const { t, l } = useLocalized();
  const recipe = activeRecipes.find((r) => r.slug === slug);
  const products = useMemo(() => (recipe ? recipe.products.map(getProduct).filter((p) => p && p.active !== false) : []), [recipe, getProduct]);
  const [sizes, setSizes] = useState({});
  const [done, setDone] = useState([]);
  const [cook, setCook] = useState(null); // current step index in cook mode
  useEffect(() => {
    if (cook == null) return undefined;
    let lock; navigator.wakeLock?.request('screen').then((l) => { lock = l; }).catch(() => {});
    const onKey = (e) => { if (e.key === 'Escape') setCook(null); };
    document.body.style.overflow = 'hidden'; window.addEventListener('keydown', onKey);
    return () => { lock?.release?.().catch(() => {}); document.body.style.overflow = ''; window.removeEventListener('keydown', onKey); };
  }, [cook]);
  useDocumentTitle(recipe ? l(recipe.name) : t('recipes.notFound'), recipe ? l(recipe.desc) : undefined);
  if (!recipe) return <div className="container-x py-16"><EmptyState icon={Utensils} title={t('recipes.notFound')}><Link to="/recipes" className="btn-primary">{t('recipes.title')}</Link></EmptyState></div>;

  const sizeOf = (p) => sizes[p.id] || p.packs[0].size;
  const total = products.reduce((s, p) => s + (p.packs.find((x) => x.size === sizeOf(p))?.price || 0), 0);
  const addAll = () => { addMany(products.map((p) => ({ productId: p.id, size: sizeOf(p) }))); toast(t('recipes.addedAll'), 'success', { to: '/cart', label: t('actions.viewCart') }); };
  const more = activeRecipes.filter((r) => r.id !== recipe.id && r.categories.some((c) => recipe.categories.includes(c))).slice(0, 4);

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: t('recipes.title'), to: '/recipes' }, { label: l(recipe.name) }]} />
      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="min-w-0 self-start overflow-hidden rounded-2xl shadow-card"><SmartImage src={recipe.image} photo={`recipes/${recipe.slug}`} dish={recipe.art} seed={recipe.id} alt={l(recipe.name)} className="aspect-[4/3] w-full" eager /></div>
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">{recipe.categories.map((c) => <Link key={c} to={`/recipes/category/${c}`} className="badge bg-turmeric-100 text-turmeric-700">{t(`recipeCat.${c}`)}</Link>)}</div>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">{l(recipe.name)}</h1>
          <p className="mt-3 text-charcoal-600">{l(recipe.desc)}</p>
          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[[Clock, t('recipes.prep'), t('recipes.mins', { n: recipe.prep })], [Flame, t('recipes.cook'), t('recipes.mins', { n: recipe.cook })], [ChefHat, t('recipes.difficulty'), t(`difficulty.${recipe.difficulty}`)], [Users, '', t('recipes.serves', { n: recipe.serves })]].map(([Icon, k, v], i) => (
              <div key={i} className="rounded-2xl bg-white p-3 text-center shadow-card"><Icon size={18} className="mx-auto text-chilli" />{k && <dt className="mt-1 text-[11px] uppercase tracking-wide text-charcoal-400">{k}</dt>}<dd className="text-sm font-semibold">{v}</dd></div>
            ))}
          </dl>

          {/* Cook & Shop */}
          <section className="mt-6 rounded-xl border border-line bg-white p-5 sm:p-6" aria-labelledby="cookshop">
            <h2 id="cookshop" className="flex items-center gap-2 text-xl"><ShoppingBag size={20} className="text-chilli" />{t('recipes.cookShop')}</h2>
            <p className="mt-1 text-sm text-charcoal-500">{t('recipes.cookShopHint')}</p>
            <ul className="mt-4 space-y-2">
              {products.map((p) => (
                <li key={p.id} className="flex items-center gap-3 rounded-lg border border-line p-2.5">
                  <Link to={`/product/${p.slug}`} className="w-11 shrink-0 overflow-hidden rounded-lg"><ProductImage product={p} compact /></Link>
                  <Link to={`/product/${p.slug}`} className="min-w-0 flex-1 truncate text-sm font-semibold hover:text-chilli">{l(p.name)}</Link>
                  <select value={sizeOf(p)} onChange={(e) => setSizes({ ...sizes, [p.id]: e.target.value })} className="h-9 rounded-lg border border-line bg-white px-2 text-xs font-semibold text-charcoal" aria-label={t('product.packSize')}>
                    {p.packs.map((x) => <option key={x.size} value={x.size}>{x.size} · {formatINR(x.price)}</option>)}
                  </select>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="text-sm text-charcoal-500">{t('pdp.fbtTotal', { count: products.length })}: <strong className="text-lg text-charcoal">{formatINR(total)}</strong></p>
              <button type="button" onClick={addAll} className="btn-primary"><ShoppingBag size={16} />{t('actions.shopRecipe')}</button>
            </div>
          </section>
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_1.6fr]">
        <section className="rounded-xl border border-line bg-white p-6 lg:self-start">
          <h2 className="mb-4 text-xl">{t('recipes.ingredients')}</h2>
          <ul className="space-y-2.5 text-sm">{l(recipe.ingredients).map((ing, i) => <li key={i} className="flex gap-2.5"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-turmeric" />{ing}</li>)}</ul>
        </section>
        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl">{t('recipes.instructions')}</h2>
            <button type="button" className="btn-outline btn-sm" onClick={() => setCook(0)}><Maximize2 size={14} />{t('recipes.cookMode')}</button>
          </div>
          <div className="mb-4">
            <div className="h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-chilli transition-all duration-500" style={{ width: `${(done.length / l(recipe.steps).length) * 100}%` }} /></div>
            <p className="mt-1.5 text-xs font-medium text-charcoal-500">{t('recipes.progress', { done: done.length, total: l(recipe.steps).length })}</p>
          </div>
          <ol className="space-y-3">
            {l(recipe.steps).map((s, i) => {
              const checked = done.includes(i);
              return (
                <li key={i}>
                  <button type="button" onClick={() => setDone(checked ? done.filter((x) => x !== i) : [...done, i])} className={`flex w-full gap-4 rounded-2xl p-4 text-left transition ${checked ? 'border border-line bg-cream-200' : 'border border-line bg-white hover:border-chilli/40'}`} aria-pressed={checked}>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${checked ? 'bg-chilli text-white' : 'bg-chilli-50 text-chilli'}`}>{checked ? <Check size={16} /> : i + 1}</span>
                    <span><span className="block text-xs font-semibold uppercase tracking-wide text-charcoal-400">{t('recipes.step', { n: i + 1 })}</span><span className={`mt-0.5 block ${checked ? 'text-charcoal-400 line-through' : ''}`}>{s}</span></span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
      {cook != null && (() => {
        const steps = l(recipe.steps); const last = cook >= steps.length - 1;
        return (
          <div className="fixed inset-0 z-[75] flex flex-col bg-charcoal text-white animate-pageIn" role="dialog" aria-modal="true" aria-label={t('recipes.cookMode')}>
            <div className="flex items-center justify-between gap-3 px-5 py-4">
              <p className="truncate font-display text-lg">{l(recipe.name)}</p>
              <button type="button" className="icon-btn text-white hover:bg-white/10 hover:text-white" onClick={() => setCook(null)} aria-label={t('recipes.exitCookMode')}><X size={22} /></button>
            </div>
            <div className="h-1 bg-white/10"><div className="h-full bg-turmeric transition-all duration-500" style={{ width: `${((cook + 1) / steps.length) * 100}%` }} /></div>
            <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
              <p className="eyebrow text-turmeric">{t('recipes.step', { n: cook + 1 })} / {steps.length}</p>
              <p key={cook} className="mt-6 max-w-3xl animate-heroIn font-display text-3xl leading-snug sm:text-5xl">{steps[cook]}</p>
              <p className="mt-8 max-w-md text-xs text-white/50">{t('recipes.cookModeHint')}</p>
            </div>
            <div className="flex gap-3 px-5 pb-8">
              <button type="button" className="btn flex-1 border border-white/25 py-4 text-white hover:bg-white/10 disabled:opacity-30" disabled={cook === 0} onClick={() => setCook(cook - 1)}><ChevronLeft size={18} />{t('actions.prev')}</button>
              <button type="button" className="btn-secondary flex-1 py-4" onClick={() => { setDone((d) => [...new Set([...d, cook])]); if (last) setCook(null); else setCook(cook + 1); }}>{last ? t('recipes.finish') : t('actions.next')}{!last && <ChevronRight size={18} />}</button>
            </div>
          </div>
        );
      })()}
      {more.length > 0 && <section className="mt-16"><SectionHeading title={t('recipes.more')} action={{ to: '/recipes', label: t('actions.viewAll') }} /><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{more.map((r) => <RecipeCard key={r.id} recipe={r} />)}</div></section>}
    </div>
  );
}
