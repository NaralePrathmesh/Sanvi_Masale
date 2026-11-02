import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Plus, PackagePlus, Trash2, Sparkles } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import ProductImage from '@/components/product/ProductImage';
import { useStore } from '@/context/StoreContext';
import { useCart } from '@/context/CartContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { COMBO_BUILDER } from '@/config/site';
import { comboTierFor } from '@/utils/pricing';
import { formatINR } from '@/utils/format';

export default function ComboBuilderPage() {
  const { activeProducts, categories } = useStore();
  const { addMany } = useCart();
  const { toast } = useUI();
  const { t, l } = useLocalized();
  const navigate = useNavigate();
  const [cat, setCat] = useState('all');
  const [picked, setPicked] = useState({}); // id -> size
  useDocumentTitle(t('combo.title'), 'Build your own masala combo and save up to 20%.');

  const eligible = useMemo(() => activeProducts.filter((p) => p.type !== 'combo' && p.category !== 'ready-to-cook'), [activeProducts]);
  const shown = cat === 'all' ? eligible : eligible.filter((p) => p.category === cat);
  const ids = Object.keys(picked);
  const items = ids.map((id) => { const p = eligible.find((x) => x.id === id); return p ? { p, pack: p.packs.find((x) => x.size === picked[id]) || p.packs[0] } : null; }).filter(Boolean);
  const regular = items.reduce((s, i) => s + i.pack.price, 0);
  const tier = comboTierFor(items.length);
  const comboPrice = tier ? regular - Math.round((regular * tier.pct) / 100) : regular;
  const nextTier = COMBO_BUILDER.tiers.find((x) => x.min > items.length);

  const toggle = (p) => setPicked((s) => { const n = { ...s }; if (n[p.id]) delete n[p.id]; else n[p.id] = p.packs.find((x) => x.size === '100g')?.size || p.packs[0].size; return n; });
  const addCombo = () => {
    const comboId = `combo-${Date.now()}`;
    addMany(items.map(({ p, pack }) => ({ productId: p.id, size: pack.size, extra: { comboId, comboPct: tier.pct } })));
    toast(t('combo.added'), 'success', { to: '/cart', label: t('actions.viewCart') });
    setPicked({}); navigate('/cart');
  };

  return (
    <div className="container-x py-8">
      <Breadcrumbs items={[{ label: t('nav.comboBuilder') }]} />
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl"><h1 className="h-page">{t('combo.title')}</h1><p className="mt-2 text-charcoal-500">{t('combo.subtitle')}</p></div>
        <div className="flex flex-wrap gap-2">{COMBO_BUILDER.tiers.map((x) => <span key={x.min} className={`badge px-3 py-1.5 text-xs normal-case tracking-normal ${tier?.min === x.min ? 'bg-chilli text-white' : 'border border-line bg-white text-charcoal'}`}>{t('combo.tierLine', { min: x.min, pct: x.pct })}</span>)}</div>
      </div>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="min-w-0">
          <div className="scrollbar-none -mx-4 mb-5 flex gap-2 overflow-x-auto px-4">
            <button type="button" onClick={() => setCat('all')} className={`chip shrink-0 ${cat === 'all' ? 'chip-active' : ''}`}>{t('common.all')}</button>
            {categories.filter((c) => eligible.some((p) => p.category === c.id)).map((c) => <button key={c.id} type="button" onClick={() => setCat(c.id)} className={`chip shrink-0 ${cat === c.id ? 'chip-active' : ''}`}>{l(c.name)}</button>)}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
            {shown.map((p) => {
              const sel = !!picked[p.id];
              return (
                <div key={p.id} className={`relative overflow-hidden rounded-xl border border-line bg-white transition ${sel ? 'ring-2 ring-chilli' : ''}`}>
                  <button type="button" onClick={() => toggle(p)} className="block w-full text-left" aria-pressed={sel}>
                    <ProductImage product={p} size={picked[p.id] || p.packs[0].size} compact />
                    <span className={`absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full shadow-card ${sel ? 'bg-chilli text-white' : 'bg-white text-charcoal'}`}>{sel ? <Check size={16} /> : <Plus size={16} />}</span>
                  </button>
                  <div className="p-3">
                    <p className="truncate text-sm font-semibold">{l(p.name)}</p>
                    {sel ? (
                      <select value={picked[p.id]} onChange={(e) => setPicked({ ...picked, [p.id]: e.target.value })} className="mt-2 h-9 w-full rounded-full border border-charcoal/15 px-2 text-xs font-semibold" aria-label={t('product.packSize')}>
                        {p.packs.map((x) => <option key={x.size} value={x.size}>{x.size} · {formatINR(x.price)}</option>)}
                      </select>
                    ) : <p className="mt-1 text-xs text-charcoal-500">{t('product.packSizes')}: {p.packs.map((x) => x.size).join(', ')}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl bg-white p-5 shadow-lift">
            <h2 className="flex items-center gap-2 font-display text-xl"><PackagePlus size={20} className="text-chilli" />{t('combo.yourCombo')} <span className="font-sans text-sm font-normal text-charcoal-400">({t('combo.selected', { count: items.length })})</span></h2>
            {!items.length ? <p className="mt-4 rounded-xl bg-cream p-4 text-sm text-charcoal-500">{t('combo.emptyCombo')}</p> : (
              <ul className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                {items.map(({ p, pack }) => (
                  <li key={p.id} className="flex items-center gap-2 text-sm">
                    <div className="w-9 shrink-0 overflow-hidden rounded-md"><ProductImage product={p} compact /></div>
                    <span className="min-w-0 flex-1 truncate">{l(p.name)} <span className="text-charcoal-400">· {pack.size}</span></span>
                    <span className="font-medium">{formatINR(pack.price)}</span>
                    <button type="button" onClick={() => toggle(p)} className="text-charcoal-400 hover:text-chilli" aria-label={t('actions.remove')}><Trash2 size={14} /></button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-chilli transition-all" style={{ width: `${Math.min(100, (items.length / 7) * 100)}%` }} /></div>
            <p className="mt-2 text-xs font-medium text-charcoal-500">
              {items.length < COMBO_BUILDER.minItems ? t('combo.minNeeded', { n: COMBO_BUILDER.minItems }) : nextTier ? t('combo.nextTier', { n: nextTier.min - items.length, pct: nextTier.pct }) : <span className="flex items-center gap-1 text-leaf"><Sparkles size={13} />{t('combo.tierLine', { min: tier.min, pct: tier.pct })}</span>}
            </p>
            <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><span className="text-charcoal-500">{t('combo.regular')}</span><span className={tier ? 'text-charcoal-400 line-through' : ''}>{formatINR(regular)}</span></div>
              {tier && <div className="flex justify-between font-semibold text-leaf"><span>{t('cart.comboDiscount')} ({tier.pct}%)</span><span>−{formatINR(regular - comboPrice)}</span></div>}
              <div className="flex justify-between text-lg font-bold"><span>{t('combo.comboPrice')}</span><span>{formatINR(comboPrice)}</span></div>
            </div>
            <button type="button" disabled={!tier} onClick={addCombo} className="btn-primary mt-4 w-full py-3">{t('combo.addCombo')}</button>
            <Link to="/category/combo-packs" className="mt-3 block text-center text-xs font-semibold text-charcoal-500 hover:text-chilli">{t('home.combosTitle')} →</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
