import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, Upload, X, ExternalLink, LayoutGrid, List, Copy, Eye, EyeOff, Flame, Package, Check, FolderTree } from 'lucide-react';
import ProductImage from '@/components/product/ProductImage';
import { Panel, Toggle, I18nInput, readImage, PageHeader, Segmented, Badge, Empty } from '@/components/admin/ui';
import { Drawer, useStagger, spring } from '@/components/admin/motion';
import { useStore } from '@/context/StoreContext';
import { useUI } from '@/context/UIContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePersistentState } from '@/hooks/usePersistentState';
import { productTypes, regions } from '@/data/categories';
import { formatINR, slugify } from '@/utils/format';

const newProduct = (cat) => ({
  id: `p${Date.now()}`, slug: '', sku: '', category: cat, type: 'blend', region: 'pan-india', color: ['#A92324', '#E5A52B'],
  name: { en: '', hi: '', mr: '' }, short: { en: '', hi: '', mr: '' }, packs: [{ size: '100g', grams: 100, price: 0, mrp: 0, stock: 0 }],
  ingredients: [], dishes: [], rating: 0, reviews: 0, popularity: 50, createdAt: new Date().toISOString().slice(0, 10),
  bestseller: false, isNew: true, heat: 2, tags: [], images: [], active: true, festivals: [],
});
const stockOf = (p) => p.packs.reduce((s, x) => s + (Number(x.stock) || 0), 0);

export default function AdminProductsPage() {
  const { products, setProducts, upsertProduct, deleteProduct, categories, setCategories, settings } = useStore();
  const { toast } = useUI();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState('products');
  const [view, setView] = usePersistentState('adminProductView', 'grid');
  const [q, setQ] = useState(''); const [cat, setCat] = useState(''); const [status, setStatus] = useState('all');
  const [selected, setSelected] = useState([]);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  useDocumentTitle('Admin · Products');
  const ref = useStagger([tab]);

  // Deep links from the command palette / dashboard: ?new=1, ?edit=<id>
  useEffect(() => {
    if (params.get('new')) { setEditing(newProduct(categories[0]?.id)); setParams({}, { replace: true }); }
    const id = params.get('edit');
    if (id) { const p = products.find((x) => x.id === id); if (p) setEditing(structuredClone(p)); setParams({}, { replace: true }); }
  }, [params]); // eslint-disable-line react-hooks/exhaustive-deps

  const low = (p) => p.packs.some((x) => Number(x.stock) <= settings.lowStockThreshold);
  const counts = {
    all: products.length, active: products.filter((p) => p.active !== false).length, hidden: products.filter((p) => p.active === false).length,
    low: products.filter(low).length, out: products.filter((p) => stockOf(p) === 0).length,
  };
  const list = useMemo(() => products.filter((p) => (!cat || p.category === cat)
    && (!q || `${p.name.en} ${p.name.hi} ${p.name.mr} ${p.sku}`.toLowerCase().includes(q.toLowerCase()))
    && (status === 'all' || (status === 'active' && p.active !== false) || (status === 'hidden' && p.active === false) || (status === 'low' && low(p)) || (status === 'out' && stockOf(p) === 0))),
  [products, q, cat, status, settings.lowStockThreshold]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSel = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const allSel = list.length > 0 && list.every((p) => selected.includes(p.id));
  const bulk = (fn, msg) => { setProducts((all) => all.map((p) => (selected.includes(p.id) ? fn(p) : p))); toast(msg); setSelected([]); };
  const bulkDelete = () => { setProducts((all) => all.filter((p) => !selected.includes(p.id))); toast(`${selected.length} products deleted`, 'info'); setSelected([]); setConfirm(null); };
  const duplicate = (p) => { const c = { ...structuredClone(p), id: `p${Date.now()}`, slug: `${p.slug}-copy`, sku: `${p.sku}-C`, name: { ...p.name, en: `${p.name.en} (copy)` }, active: false }; upsertProduct(c); toast(`Duplicated as hidden draft: ${c.name.en}`); };
  const setActive = (p, v) => { upsertProduct({ ...p, active: v }); toast(`${p.name.en} ${v ? 'is live in the store' : 'hidden from the store'}`, 'info'); };

  return (
    <div ref={ref} className="space-y-6">
      <PageHeader title="Products" subtitle={`${products.length} products · ${categories.length} categories`}
        actions={<>
          <Segmented id="ptab" value={tab} onChange={setTab} options={[['products', 'Products'], ['categories', 'Categories']]} />
          <button type="button" className="adm-btn-accent" onClick={() => setEditing(newProduct(categories[0]?.id))}><Plus size={16} />Add product</button>
        </>} />

      {tab === 'categories' ? <CategoryManager categories={categories} setCategories={setCategories} products={products} toast={toast} /> : (
        <>
          <div data-anim className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <Segmented id="pstatus" value={status} onChange={setStatus} options={[['all', 'All', counts.all], ['active', 'Live', counts.active], ['hidden', 'Hidden', counts.hidden], ['low', 'Low stock', counts.low], ['out', 'Out of stock', counts.out]]} />
            <div className="flex flex-1 gap-2">
              <label className="relative flex-1"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" /><input className="adm-input pl-10" placeholder="Search name or SKU" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" /></label>
              <select className="adm-input w-auto max-w-[44%]" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category"><option value="">All categories</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name.en}</option>)}</select>
              <div className="flex rounded-xl border border-black/10 bg-white p-0.5">
                {[['grid', LayoutGrid], ['table', List]].map(([v, Icon]) => (
                  <button key={v} type="button" onClick={() => setView(v)} aria-label={`${v} view`} aria-pressed={view === v} className="relative flex h-9 w-9 items-center justify-center rounded-[10px]">
                    {view === v && <motion.span layoutId="pview" transition={spring} className="absolute inset-0 rounded-[10px] bg-charcoal" />}
                    <Icon size={16} className={`relative ${view === v ? 'text-white' : 'text-charcoal-500'}`} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {!list.length ? <div data-anim className="adm-card"><Empty icon={Package} title="No products match" text="Try another filter or add a new product." /></div> : view === 'grid' ? (
            <motion.div layout className="grid grid-cols-2 gap-4 md:grid-cols-3 2xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {list.map((p) => {
                  const stock = stockOf(p); const sel = selected.includes(p.id);
                  return (
                    <motion.article layout key={p.id} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={spring}
                      whileHover={{ y: -4 }} className={`adm-card group relative flex flex-col overflow-hidden p-2 ${sel ? 'ring-2 ring-chilli' : ''} ${p.active === false ? 'opacity-70' : ''}`}>
                      <div className="relative overflow-hidden rounded-2xl bg-[#FEFDF8]">
                        <button type="button" onClick={() => setEditing(structuredClone(p))} className="block w-full" aria-label={`Edit ${p.name.en}`}><ProductImage product={p} compact /></button>
                        <button type="button" onClick={() => toggleSel(p.id)} aria-pressed={sel} aria-label={`Select ${p.name.en}`}
                          className={`absolute left-2 top-2 flex h-6 w-6 items-center justify-center rounded-lg border transition ${sel ? 'border-chilli bg-chilli text-white' : 'border-black/15 bg-white/90 text-transparent opacity-0 group-hover:opacity-100'}`}><Check size={14} /></button>
                        <div className="absolute right-2 top-2 flex flex-col gap-1">
                          {p.bestseller && <Badge tone="dark"><Flame size={10} />Best</Badge>}
                          {p.active === false && <Badge tone="neutral">Hidden</Badge>}
                        </div>
                        <div className="absolute inset-x-2 bottom-2 flex translate-y-3 justify-center gap-1 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                          <button type="button" className="adm-icon bg-white/95 shadow" onClick={() => setEditing(structuredClone(p))} aria-label="Edit"><Pencil size={15} /></button>
                          <button type="button" className="adm-icon bg-white/95 shadow" onClick={() => duplicate(p)} aria-label="Duplicate"><Copy size={15} /></button>
                          <Link to={`/product/${p.slug}`} target="_blank" className="adm-icon bg-white/95 shadow" aria-label="View in store"><ExternalLink size={15} /></Link>
                          <button type="button" className="adm-icon bg-white/95 shadow hover:text-chilli" onClick={() => setConfirm({ one: p })} aria-label="Delete"><Trash2 size={15} /></button>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col px-2 pb-2 pt-3">
                        <p className="truncate text-[11px] font-semibold uppercase tracking-wider text-charcoal-400">{categories.find((c) => c.id === p.category)?.name.en}</p>
                        <p className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug">{p.name.en}</p>
                        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                          <span className="text-sm font-bold">{formatINR(Math.min(...p.packs.map((x) => x.price)))}</span>
                          <Badge tone={stock === 0 ? 'red' : low(p) ? 'amber' : 'green'}>{stock} in stock</Badge>
                        </div>
                        <div className="mt-3 flex items-center justify-between border-t border-black/[.05] pt-3"><Toggle size="sm" checked={p.active !== false} onChange={(v) => setActive(p, v)} label={p.active !== false ? 'Live' : 'Hidden'} /><span className="text-[11px] text-charcoal-400">{p.packs.length} sizes</span></div>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          ) : (
            <Panel pad={false}>
              <div className="overflow-x-auto"><table className="adm-table">
                <thead><tr>
                  <th className="w-10"><input type="checkbox" className="h-4 w-4 accent-chilli" checked={allSel} onChange={() => setSelected(allSel ? [] : list.map((p) => p.id))} aria-label="Select all" /></th>
                  <th>Product</th><th>Category</th><th>From</th><th>Stock</th><th>Live</th><th className="text-right">Actions</th>
                </tr></thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {list.map((p) => {
                      const stock = stockOf(p);
                      return (
                        <motion.tr layout key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className={selected.includes(p.id) ? 'bg-chilli/[.04]' : ''}>
                          <td><input type="checkbox" className="h-4 w-4 accent-chilli" checked={selected.includes(p.id)} onChange={() => toggleSel(p.id)} aria-label={`Select ${p.name.en}`} /></td>
                          <td><button type="button" onClick={() => setEditing(structuredClone(p))} className="flex items-center gap-3 text-left"><div className="w-11 shrink-0 overflow-hidden rounded-xl"><ProductImage product={p} compact /></div><div className="min-w-0"><p className="font-semibold hover:text-chilli">{p.name.en}</p><p className="text-xs text-charcoal-400">{p.sku} · {p.packs.map((x) => x.size).join(', ')}</p></div></button></td>
                          <td className="text-charcoal-600">{categories.find((c) => c.id === p.category)?.name.en || p.category}</td>
                          <td className="font-semibold">{formatINR(Math.min(...p.packs.map((x) => x.price)))}</td>
                          <td><Badge tone={stock === 0 ? 'red' : low(p) ? 'amber' : 'green'}>{stock} units</Badge></td>
                          <td><Toggle size="sm" checked={p.active !== false} onChange={(v) => setActive(p, v)} label={p.active !== false ? 'Live' : 'Hidden'} /></td>
                          <td className="text-right"><div className="inline-flex gap-0.5">
                            <Link to={`/product/${p.slug}`} target="_blank" className="adm-icon" aria-label="View in store"><ExternalLink size={15} /></Link>
                            <button type="button" className="adm-icon" onClick={() => duplicate(p)} aria-label={`Duplicate ${p.name.en}`}><Copy size={15} /></button>
                            <button type="button" className="adm-icon" onClick={() => setEditing(structuredClone(p))} aria-label={`Edit ${p.name.en}`}><Pencil size={15} /></button>
                            <button type="button" className="adm-icon hover:text-chilli" onClick={() => setConfirm({ one: p })} aria-label={`Delete ${p.name.en}`}><Trash2 size={15} /></button>
                          </div></td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table></div>
            </Panel>
          )}
        </>
      )}

      {/* Floating bulk action bar */}
      <AnimatePresence>
        {selected.length > 0 && (
          <motion.div initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 90, opacity: 0 }} transition={spring}
            className="fixed inset-x-3 bottom-4 z-40 mx-auto flex max-w-2xl flex-wrap items-center gap-2 rounded-2xl bg-[#121010] p-2.5 pl-4 text-white shadow-2xl">
            <span className="mr-auto text-sm font-semibold">{selected.length} selected</span>
            <button type="button" className="adm-btn h-9 bg-white/10 px-3 hover:bg-white/20" onClick={() => bulk((p) => ({ ...p, active: true }), 'Products are live')}><Eye size={15} />Show</button>
            <button type="button" className="adm-btn h-9 bg-white/10 px-3 hover:bg-white/20" onClick={() => bulk((p) => ({ ...p, active: false }), 'Products hidden')}><EyeOff size={15} />Hide</button>
            <button type="button" className="adm-btn h-9 bg-white/10 px-3 hover:bg-white/20" onClick={() => bulk((p) => ({ ...p, bestseller: !p.bestseller }), 'Bestseller badge toggled')}><Flame size={15} />Bestseller</button>
            <button type="button" className="adm-btn h-9 bg-chilli px-3 hover:bg-chilli-700" onClick={() => setConfirm({ many: true })}><Trash2 size={15} />Delete</button>
            <button type="button" className="adm-icon text-white/60 hover:bg-white/10 hover:text-white" onClick={() => setSelected([])} aria-label="Clear selection"><X size={16} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {editing && <ProductEditor product={editing} categories={categories} existing={products} onClose={() => setEditing(null)} onSave={(p) => { upsertProduct(p); setEditing(null); toast(`Saved ${p.name.en}`); }} />}
      <Drawer open={!!confirm} onClose={() => setConfirm(null)} title={confirm?.many ? `Delete ${selected.length} products?` : 'Delete product?'} width="max-w-md"
        footer={<><button type="button" className="adm-btn-ghost" onClick={() => setConfirm(null)}>Cancel</button><button type="button" className="adm-btn-accent" onClick={() => { if (confirm.many) bulkDelete(); else { deleteProduct(confirm.one.id); toast('Product deleted', 'info'); setConfirm(null); } }}><Trash2 size={15} />Delete</button></>}>
        <p className="p-6 text-sm text-charcoal-600">{confirm?.many ? `${selected.length} products` : <strong>{confirm?.one?.name.en}</strong>} will be removed from the store, carts and wishlists. Tip: use <em>Hide</em> instead if you might sell it again. (Demo data only — you can restore everything from Settings → Data.)</p>
      </Drawer>
    </div>
  );
}

const TABS = [['details', 'Details'], ['pricing', 'Pricing & stock'], ['media', 'Images'], ['visibility', 'Badges & visibility']];

function ProductEditor({ product, categories, onClose, onSave, existing }) {
  const [p, setP] = useState(product);
  const [tab, setTab] = useState('details');
  const [errors, setErrors] = useState({});
  const [imgError, setImgError] = useState('');
  const set = (patch) => setP((x) => ({ ...x, ...patch }));
  const setPack = (i, patch) => set({ packs: p.packs.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const isNew = !existing.some((x) => x.id === product.id);

  const save = () => {
    const errs = {};
    if (!p.name.en?.trim()) errs.name = 'English name is required';
    if (!p.packs.length) errs.packs = 'Add at least one pack size';
    else if (p.packs.some((x) => !x.size || Number(x.price) <= 0)) errs.packs = 'Each pack needs a size and a price above 0';
    else if (p.packs.some((x) => Number(x.mrp) && Number(x.mrp) < Number(x.price))) errs.packs = 'MRP cannot be lower than price';
    const slug = p.slug || slugify(p.name.en || '');
    if (existing.some((x) => x.slug === slug && x.id !== p.id)) errs.name = 'Another product already uses this name/URL';
    setErrors(errs);
    if (errs.name) { setTab('details'); return; }
    if (errs.packs) { setTab('pricing'); return; }
    onSave({ ...p, slug, sku: p.sku || `SM-${p.id.toUpperCase().slice(-6)}`, name: { en: p.name.en, hi: p.name.hi || p.name.en, mr: p.name.mr || p.name.en }, short: { en: p.short.en, hi: p.short.hi || p.short.en, mr: p.short.mr || p.short.en },
      packs: p.packs.map((x) => ({ ...x, price: Number(x.price), mrp: Number(x.mrp) || Number(x.price), stock: Number(x.stock) || 0 })) });
  };
  const onFile = async (e) => {
    setImgError('');
    try { const url = await readImage(e.target.files?.[0]); set({ images: [url, ...p.images].slice(0, 4) }); } catch (err) { setImgError(err.message); }
    e.target.value = '';
  };

  return (
    <Drawer open onClose={onClose} title={isNew ? 'New product' : product.name.en} subtitle={isNew ? 'Fill in the details and save to publish' : `${product.sku} · last saved in this browser`} width="max-w-3xl"
      footer={<><button type="button" className="adm-btn-ghost" onClick={onClose}>Cancel</button><button type="button" className="adm-btn-accent" onClick={save}><Check size={16} />{isNew ? 'Create product' : 'Save changes'}</button></>}>
      <div className="sticky top-0 z-10 border-b border-black/[.06] bg-white/90 px-6 py-3 backdrop-blur"><Segmented id="ptabs" value={tab} onChange={setTab} options={TABS} /></div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }} className="space-y-5 p-6">
          {tab === 'details' && (<>
            <I18nInput label="Product name" value={p.name} onChange={(name) => set({ name })} error={errors.name} />
            <I18nInput label="Short description" as="textarea" value={p.short} onChange={(short) => set({ short })} />
            <div className="grid gap-4 sm:grid-cols-3">
              <label><span className="label">Category</span><select className="adm-input" value={p.category} onChange={(e) => set({ category: e.target.value })}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name.en}</option>)}</select></label>
              <label><span className="label">Product type</span><select className="adm-input" value={p.type} onChange={(e) => set({ type: e.target.value })}>{productTypes.map((c) => <option key={c.id} value={c.id}>{c.name.en}</option>)}</select></label>
              <label><span className="label">Region</span><select className="adm-input" value={p.region} onChange={(e) => set({ region: e.target.value })}>{[...regions, { id: 'pan-india', name: { en: 'Pan-India' } }].map((c) => <option key={c.id} value={c.id}>{c.name.en}</option>)}</select></label>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label><span className="label">SKU</span><input className="adm-input" value={p.sku} onChange={(e) => set({ sku: e.target.value })} placeholder="Auto" /></label>
              <label><span className="label">URL slug</span><input className="adm-input" value={p.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} placeholder={slugify(p.name.en || 'auto')} /></label>
              <label><span className="label">Heat level (0–5)</span><input type="range" min="0" max="5" className="mt-3 w-full accent-chilli" value={p.heat} onChange={(e) => set({ heat: Number(e.target.value) })} /><span className="text-xs text-charcoal-500">{'🌶️'.repeat(p.heat) || 'Mild'}</span></label>
            </div>
          </>)}

          {tab === 'pricing' && (<>
            <div className="flex items-center justify-between"><p className="label mb-0">Pack sizes, prices & stock</p><button type="button" className="adm-btn-ghost h-9" onClick={() => set({ packs: [...p.packs, { size: '', grams: 0, price: 0, mrp: 0, stock: 0 }] })}><Plus size={14} />Add size</button></div>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {p.packs.map((x, i) => {
                  const off = Number(x.mrp) > Number(x.price) ? Math.round(((x.mrp - x.price) / x.mrp) * 100) : 0;
                  return (
                    <motion.div key={i} layout initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="grid grid-cols-2 items-end gap-2 rounded-2xl border border-black/[.06] bg-[#FAFAF8] p-3 sm:grid-cols-[1fr_1fr_1fr_1fr_auto]">
                        <label><span className="text-[11px] font-semibold text-charcoal-400">Size</span><input className="adm-input" value={x.size} onChange={(e) => setPack(i, { size: e.target.value, grams: parseInt(e.target.value, 10) || 0 })} placeholder="100g" /></label>
                        <label><span className="text-[11px] font-semibold text-charcoal-400">Price ₹</span><input className="adm-input" type="number" min="0" value={x.price} onChange={(e) => setPack(i, { price: e.target.value })} /></label>
                        <label><span className="text-[11px] font-semibold text-charcoal-400">MRP ₹ {off > 0 && <span className="text-leaf-700">· {off}% off</span>}</span><input className="adm-input" type="number" min="0" value={x.mrp} onChange={(e) => setPack(i, { mrp: e.target.value })} /></label>
                        <label><span className="text-[11px] font-semibold text-charcoal-400">Stock</span><input className="adm-input" type="number" min="0" value={x.stock} onChange={(e) => setPack(i, { stock: e.target.value })} /></label>
                        <button type="button" className="adm-icon mb-0.5 hover:text-chilli" onClick={() => set({ packs: p.packs.filter((_, j) => j !== i) })} aria-label="Remove size"><X size={16} /></button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            {errors.packs && <p className="field-error">{errors.packs}</p>}
          </>)}

          {tab === 'media' && (<>
            <p className="text-sm text-charcoal-500">The first image is the main photo. Demo: uploaded images are stored in this browser only (max 700 KB each). Tip: add pack photos named <code>products/&lt;slug&gt;-1.webp</code> to <code>public/images</code> for permanent images.</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
              {p.images.map((src, i) => (
                <motion.div layout key={src.slice(-40) + i} className="relative overflow-hidden rounded-2xl border border-black/[.06]">
                  <img src={src} alt="" className="aspect-[4/5] w-full object-cover" />
                  {i === 0 && <span className="absolute left-1.5 top-1.5"><Badge tone="dark">Main</Badge></span>}
                  <button type="button" onClick={() => set({ images: p.images.filter((_, j) => j !== i) })} className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow" aria-label="Remove image"><X size={13} /></button>
                </motion.div>
              ))}
              {!p.images.length && <div className="overflow-hidden rounded-2xl border border-black/[.06]"><ProductImage product={{ ...p, images: [], name: p.name.en ? p.name : { en: 'Preview' } }} compact /></div>}
              <label className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-black/15 text-xs font-semibold text-charcoal-500 transition hover:border-chilli hover:bg-chilli/[.03] hover:text-chilli"><Upload size={20} />Upload<input type="file" accept="image/*" className="sr-only" onChange={onFile} /></label>
            </div>
            <label className="block"><span className="label">…or add an image path / URL and press Enter</span>
              <input className="adm-input" placeholder="/images/products/turmeric-powder-1.webp" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const v = e.currentTarget.value.trim(); if (v) { set({ images: [v, ...p.images] }); e.currentTarget.value = ''; } } }} /></label>
            {imgError && <p className="field-error">{imgError}</p>}
          </>)}

          {tab === 'visibility' && (
            <div className="space-y-3">
              {[['active', 'Visible in store', 'Customers can find and buy this product', p.active !== false], ['bestseller', 'Bestseller badge', 'Shows the 🔥 Bestseller tag and puts it on the homepage', !!p.bestseller], ['isNew', 'New badge', 'Shows the ✨ New tag', !!p.isNew]].map(([k, l, d, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 rounded-2xl border border-black/[.06] p-4"><span><span className="block font-semibold">{l}</span><span className="text-sm text-charcoal-500">{d}</span></span><Toggle checked={v} onChange={(val) => set({ [k]: val })} label={l} /></div>
              ))}
              <div className="grid gap-4 rounded-2xl border border-black/[.06] p-4 sm:grid-cols-2">
                <label><span className="label">Fallback pack colour</span><input type="color" className="h-11 w-full rounded-xl border border-black/10" value={p.color[0]} onChange={(e) => set({ color: [e.target.value, p.color[1]] })} /></label>
                <label><span className="label">Accent colour</span><input type="color" className="h-11 w-full rounded-xl border border-black/10" value={p.color[1]} onChange={(e) => set({ color: [p.color[0], e.target.value] })} /></label>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Drawer>
  );
}

function CategoryManager({ categories, setCategories, products, toast }) {
  const [edit, setEdit] = useState(null);
  const save = () => {
    if (!edit.name.en?.trim()) return;
    const id = edit.id || slugify(edit.name.en);
    const c = { icon: 'Sparkles', desc: { en: '', hi: '', mr: '' }, ...edit, id };
    setCategories(categories.some((x) => x.id === id) ? categories.map((x) => (x.id === id ? c : x)) : [...categories, c]);
    setEdit(null); toast('Category saved');
  };
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {categories.map((c) => {
          const n = products.filter((p) => p.category === c.id).length;
          return (
            <motion.div key={c.id} data-anim layout whileHover={{ y: -3 }} className="adm-card group flex flex-col p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-chilli/10 text-chilli"><FolderTree size={20} /></span>
              <p className="mt-4 font-bold">{c.name.en}</p>
              <p className="text-xs text-charcoal-500">{c.name.hi} · {c.name.mr}</p>
              <div className="mt-4 flex items-center justify-between border-t border-black/[.05] pt-3">
                <Badge>{n} products</Badge>
                <div className="flex gap-0.5">
                  <button type="button" className="adm-icon" onClick={() => setEdit(structuredClone(c))} aria-label={`Edit ${c.name.en}`}><Pencil size={15} /></button>
                  <button type="button" className="adm-icon hover:text-chilli disabled:opacity-30" disabled={n > 0} title={n ? 'Move or delete its products first' : 'Delete'} onClick={() => { setCategories(categories.filter((x) => x.id !== c.id)); toast('Category deleted', 'info'); }} aria-label={`Delete ${c.name.en}`}><Trash2 size={15} /></button>
                </div>
              </div>
            </motion.div>
          );
        })}
        <button type="button" data-anim onClick={() => setEdit({ id: '', name: { en: '', hi: '', mr: '' }, desc: { en: '', hi: '', mr: '' } })} className="flex min-h-[180px] flex-col items-center justify-center gap-2 rounded-[22px] border-2 border-dashed border-black/15 text-sm font-semibold text-charcoal-500 transition hover:border-chilli hover:text-chilli"><Plus size={22} />Add category</button>
      </div>
      <Drawer open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit category' : 'New category'} width="max-w-xl"
        footer={<><button type="button" className="adm-btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button type="button" className="adm-btn-accent" onClick={save}><Check size={16} />Save</button></>}>
        {edit && <div className="space-y-5 p-6"><I18nInput label="Name" value={edit.name} onChange={(name) => setEdit({ ...edit, name })} /><I18nInput label="Short description" value={edit.desc} onChange={(desc) => setEdit({ ...edit, desc })} /></div>}
      </Drawer>
    </>
  );
}
