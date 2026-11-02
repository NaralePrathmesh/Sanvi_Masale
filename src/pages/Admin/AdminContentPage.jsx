import { useState } from 'react';
import { Plus, Trash2, Upload, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Panel, Toggle, I18nInput, readImage } from '@/components/admin/ui';
import SmartImage from '@/components/common/SmartImage';
import { useStore } from '@/context/StoreContext';
import { useUI } from '@/context/UIContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const ARTS = ['bowls', 'pure', 'blend', 'maharashtra', 'south', 'north', 'instant', 'ready', 'combo', 'festive'];
const SECTIONS = [['regional', 'Maharashtra editorial'], ['why', 'Why Saanvi Masale'], ['reviews', 'Customer reviews (WhatsApp wall)'], ['recipes', 'Recipe inspiration'], ['story', 'Brand story'], ['newsletter', 'Newsletter']];

export default function AdminContentPage() {
  const { banners, setBanners, announcements, setAnnouncements, homeContent, setHomeContent, products, recipes, setRecipes } = useStore();
  const { toast } = useUI();
  const [tab, setTab] = useState('banners');
  useDocumentTitle('Admin · Content');
  const setBanner = (id, patch) => setBanners(banners.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const move = (i, d) => { const a = [...banners]; [a[i], a[i + d]] = [a[i + d], a[i]]; setBanners(a); };

  return (
    <div className="space-y-6">
      <div className="scrollbar-none flex gap-2 overflow-x-auto">{[['banners', 'Homepage banners'], ['announce', 'Announcement bar'], ['featured', 'Featured products'], ['sections', 'Promotional sections'], ['recipes', 'Recipes']].map(([k, l]) => <button key={k} type="button" onClick={() => setTab(k)} className={`chip shrink-0 ${tab === k ? 'chip-active' : ''}`}>{l}</button>)}</div>

      {tab === 'banners' && (
        <Panel title="Hero banners" action={<button type="button" className="btn-primary btn-sm" onClick={() => setBanners([...banners, { id: `b${Date.now()}`, active: true, image: null, art: 'bowls', link: '/shop', eyebrow: { en: 'New' }, title: { en: 'New banner' }, subtitle: { en: '' } }])}><Plus size={14} />Add banner</button>}>
          <div className="space-y-5">
            {banners.map((b, i) => (
              <div key={b.id} className="grid gap-4 rounded-2xl border border-charcoal/10 p-4 lg:grid-cols-[260px_1fr]">
                <div>
                  <div className="relative overflow-hidden rounded-xl"><SmartImage src={b.image} photo={`hero/${b.id}`} art={b.art} alt="" className="aspect-video w-full" /><span className="absolute bottom-2 left-2 right-2 truncate rounded bg-charcoal/70 px-2 py-1 text-xs font-semibold text-white">{b.title.en}</span></div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <label className="btn-outline btn-sm cursor-pointer"><Upload size={13} />Image<input type="file" accept="image/*" className="sr-only" onChange={async (e) => { try { setBanner(b.id, { image: await readImage(e.target.files?.[0], 900) }); toast('Banner image updated'); } catch (err) { toast(err.message, 'error'); } e.target.value = ''; }} /></label>
                    {b.image && <button type="button" className="btn-ghost btn-sm" onClick={() => setBanner(b.id, { image: null })}><X size={13} />Remove</button>}
                    <select className="h-9 rounded-full border border-charcoal/15 px-2 text-xs" value={b.art} onChange={(e) => setBanner(b.id, { art: e.target.value })} aria-label="Placeholder art">{ARTS.map((a) => <option key={a}>{a}</option>)}</select>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Toggle checked={b.active} onChange={(v) => setBanner(b.id, { active: v })} label={b.active ? 'Active' : 'Hidden'} />
                    <label className="flex items-center gap-2 text-sm">Link<input className="input h-9 min-h-0 w-40 py-1" value={b.link} onChange={(e) => setBanner(b.id, { link: e.target.value })} /></label>
                    <div className="ml-auto flex gap-1">
                      <button type="button" className="icon-btn h-9 w-9" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up"><ArrowUp size={15} /></button>
                      <button type="button" className="icon-btn h-9 w-9" disabled={i === banners.length - 1} onClick={() => move(i, 1)} aria-label="Move down"><ArrowDown size={15} /></button>
                      <button type="button" className="icon-btn h-9 w-9 hover:text-chilli" onClick={() => setBanners(banners.filter((x) => x.id !== b.id))} aria-label="Delete banner"><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <I18nInput label="Eyebrow" value={b.eyebrow} onChange={(v) => setBanner(b.id, { eyebrow: v })} />
                  <I18nInput label="Title" value={b.title} onChange={(v) => setBanner(b.id, { title: v })} />
                  <I18nInput label="Subtitle" as="textarea" value={b.subtitle} onChange={(v) => setBanner(b.id, { subtitle: v })} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-charcoal-400">Changes save automatically and show on the homepage immediately (demo: stored in this browser).</p>
        </Panel>
      )}

      {tab === 'announce' && (
        <Panel title="Announcement bar messages" action={<button type="button" className="btn-primary btn-sm" onClick={() => setAnnouncements([...announcements, { en: 'New message', hi: '', mr: '' }])}><Plus size={14} />Add message</button>}>
          <div className="space-y-4">{announcements.map((a, i) => (
            <div key={i} className="flex items-start gap-2 rounded-2xl border border-charcoal/10 p-4"><div className="flex-1"><I18nInput label={`Message ${i + 1}`} value={a} onChange={(v) => setAnnouncements(announcements.map((x, j) => (j === i ? v : x)))} /></div>
              <button type="button" className="icon-btn hover:text-chilli" onClick={() => setAnnouncements(announcements.filter((_, j) => j !== i))} aria-label="Delete message"><Trash2 size={16} /></button></div>
          ))}</div>
        </Panel>
      )}

      {tab === 'featured' && (
        <Panel title={`Featured products — "Our Signature Picks" (${homeContent.featuredProductIds.length} selected)`}>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const on = homeContent.featuredProductIds.includes(p.id);
              return <label key={p.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm ${on ? 'border-chilli bg-chilli-50/50' : 'border-charcoal/10'}`}><input type="checkbox" className="h-4 w-4 accent-chilli" checked={on} onChange={() => setHomeContent({ ...homeContent, featuredProductIds: on ? homeContent.featuredProductIds.filter((x) => x !== p.id) : [...homeContent.featuredProductIds, p.id] })} />{p.name.en}</label>;
            })}
          </div>
        </Panel>
      )}

      {tab === 'sections' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Panel title="Homepage sections">
            <div className="space-y-3">{SECTIONS.map(([k, l]) => <div key={k} className="flex items-center justify-between rounded-xl border border-charcoal/10 p-3 text-sm"><span>{l}</span><Toggle checked={homeContent.sections[k] !== false} onChange={(v) => setHomeContent({ ...homeContent, sections: { ...homeContent.sections, [k]: v } })} /></div>)}</div>
          </Panel>
          <Panel title="Combo promo block">
            <div className="space-y-4">
              <Toggle checked={!!homeContent.promo.active} onChange={(v) => setHomeContent({ ...homeContent, promo: { ...homeContent.promo, active: v } })} label="Show promo block" />
              <I18nInput label="Title" value={homeContent.promo.title} onChange={(title) => setHomeContent({ ...homeContent, promo: { ...homeContent.promo, title } })} />
              <I18nInput label="Text" as="textarea" value={homeContent.promo.text} onChange={(text) => setHomeContent({ ...homeContent, promo: { ...homeContent.promo, text } })} />
            </div>
          </Panel>
        </div>
      )}

      {tab === 'recipes' && (
        <Panel title={`Recipes (${recipes.length})`}>
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Recipe</th><th>Categories</th><th>Masalas</th><th>Visible</th><th>Featured on home</th></tr></thead>
            <tbody>{recipes.map((r) => (
              <tr key={r.id}>
                <td><input className="input h-9 min-h-0 py-1 font-semibold" value={r.name.en} onChange={(e) => setRecipes(recipes.map((x) => (x.id === r.id ? { ...x, name: { ...x.name, en: e.target.value } } : x)))} aria-label="Recipe name (English)" /></td>
                <td className="text-xs">{r.categories.join(', ')}</td>
                <td className="text-xs">{r.products.map((id) => products.find((p) => p.id === id)?.name.en).filter(Boolean).join(', ')}</td>
                <td><Toggle checked={r.active !== false} onChange={(v) => setRecipes(recipes.map((x) => (x.id === r.id ? { ...x, active: v } : x)))} /></td>
                <td><Toggle checked={r.featured !== false} onChange={(v) => setRecipes(recipes.map((x) => (x.id === r.id ? { ...x, featured: v } : x)))} /></td>
              </tr>
            ))}</tbody>
          </table></div>
          <p className="mt-3 text-xs text-charcoal-400">Full recipe text (ingredients/steps in 3 languages) is edited in src/data/recipes.js for now; a recipe CMS arrives with the Phase 2 backend.</p>
        </Panel>
      )}
    </div>
  );
}
