import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame } from 'lucide-react';
import Reviews from './Reviews';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import { productTypes, regions } from '@/data/categories';

/**
 * Compact tabs: Description · Ingredients · Usage · Storage · Nutrition · Reviews.
 * Text is configurable per product (product.description / usage / storage / nutrition / allergens)
 * with templated fallbacks.
 */
export default function ProductTabs({ product }) {
  const { t, l } = useLocalized();
  const { getProduct } = useStore();
  const [tab, setTab] = useState('description');
  const name = l(product.name);
  const region = regions.find((r) => r.id === product.region);
  const nutrition = product.nutrition || { energy: '— kcal', protein: '— g', carbs: '— g', fat: '— g', fibre: '— g', sodium: '— mg' };
  const tabs = ['description', 'ingredients', 'usage', 'storage', 'nutrition', 'reviews'];
  const panel = {
    description: (
      <div className="grid gap-10 md:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <p>{product.description ? l(product.description) : t('pdp.descTemplate', { name })}</p>
          <ul className="space-y-1.5 text-sm">{['h1', 'h2', 'h3', 'h4'].map((h) => <li key={h} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-chilli" />{t(`pdp.${h}`)}</li>)}</ul>
          {product.includes?.length > 0 && (
            <div><p className="mb-2 text-sm font-semibold text-charcoal">{t('product.includes')}</p>
              <div className="flex flex-wrap gap-2">{product.includes.map(getProduct).filter(Boolean).map((p) => <Link key={p.id} to={`/product/${p.slug}`} className="chip">{l(p.name)}</Link>)}</div></div>
          )}
        </div>
        <dl className="divide-y divide-line self-start rounded-xl border border-line bg-white text-sm">
          {[[t('pdp.dishes'), product.dishes.map((d) => t(`dishes.${d}`)).join(', ')], [t('product.type'), l(productTypes.find((x) => x.id === product.type)?.name)], [t('product.region'), region ? l(region.name) : t('product.panIndia')],
            [t('product.heat'), <span key="h" className="inline-flex gap-0.5">{Array.from({ length: 5 }, (_, i) => <Flame key={i} size={13} className={i < product.heat ? 'fill-chilli text-chilli' : 'text-charcoal/20'} />)}</span>], [t('product.sku'), product.sku]].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 px-4 py-3"><dt className="text-charcoal-500">{k}</dt><dd className="text-right font-medium text-charcoal">{v}</dd></div>
          ))}
        </dl>
      </div>
    ),
    ingredients: product.ingredients.length ? (
      <><ul className="flex flex-wrap gap-2">{product.ingredients.map((i) => <li key={i} className="chip">{t(`ingredients.${i}`)}</li>)}</ul>
        <p className="mt-6 text-sm text-charcoal-500"><strong className="font-semibold text-charcoal">{t('pdp.allergens')}:</strong> {product.allergens ? l(product.allergens) : t('pdp.allergenNote')}</p></>
    ) : <p>{l(product.short)}</p>,
    usage: <p>{product.usage ? l(product.usage) : t('pdp.usageTemplate')}</p>,
    storage: <p>{product.storage ? l(product.storage) : t('pdp.storageTemplate')}</p>,
    nutrition: (
      <div>
        <p className="mb-3 text-xs text-charcoal-500">{t('pdp.perServing')}</p>
        <table className="w-full max-w-md text-sm"><tbody>
          {Object.entries(nutrition).map(([k, v]) => <tr key={k} className="border-b border-line"><td className="py-2.5 text-charcoal-500">{t(`pdp.${k}`)}</td><td className="py-2.5 text-right font-medium">{v}</td></tr>)}
        </tbody></table>
        <p className="mt-3 text-xs text-charcoal-500">{t('pdp.nutritionNote')}</p>
      </div>
    ),
    reviews: <Reviews product={product} embedded />,
  };
  return (
    <section id="details" className="mt-20 scroll-mt-24">
      <div className="scrollbar-none flex gap-1 overflow-x-auto border-b border-line" role="tablist">
        {tabs.map((k) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${tab === k ? 'border-chilli text-chilli' : 'border-transparent text-charcoal-500 hover:text-charcoal'}`}>
            {k === 'reviews' ? `${t('pdp.reviews')} (${product.reviews.toLocaleString('en-IN')})` : t(`pdp.${k}`)}
          </button>
        ))}
      </div>
      <div className="max-w-4xl py-8 leading-relaxed text-charcoal-600 animate-fadeUp" key={tab} role="tabpanel">{panel[tab]}</div>
    </section>
  );
}
