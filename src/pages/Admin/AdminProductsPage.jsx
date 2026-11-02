import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Upload, X, ExternalLink } from 'lucide-react';
import Modal from '@/components/common/Modal';
import ProductImage from '@/components/product/ProductImage';
import { Panel, Toggle, I18nInput, readImage } from '@/components/admin/ui';
import { useStore } from '@/context/StoreContext';
import { useUI } from '@/context/UIContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { productTypes, regions } from '@/data/categories';
import { formatINR, slugify } from '@/utils/format';

const newProduct = (cat) => ({
  id: `p${Date.now()}`, slug: '', sku: '', category: cat, type: 'blend', region: 'pan-india', color: ['#A92324', '#E5A52B'],
  name: { en: '', hi: '', mr: '' }, short: { en: '', hi: '', mr: '' }, packs: [{ size: '100g', grams: 100, price: 0, mrp: 0, stock: 0 }],
  ingredients: [], dishes: [], rating: 0, reviews: 0, popularity: 50, createdAt: new Date().toISOString().slice(0, 10),
  bestseller: false, isNew: true, heat: 2, tags: [], images: [], active: true, festivals: [],
});

export default function AdminProductsPage() {
  const { products, upsertProduct, deleteProduct, categories, setCategories } = useStore();
  const { toast } = useUI();
  const [tab, setTab] = useState('products');
  const [q, setQ] = useState(''); const [cat, setCat] = useState('');
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  useDocumentTitle('Admin · Products');

  const list = useMemo(() => products.filter((p) => (!cat || p.category === cat) && (!q || `${p.name.en} ${p.sku}`.toLowerCase().includes(q.toLowerCase()))), [products, q, cat]);
  const stockOf = (p) => p.packs.reduce((s, x) => s + (Number(x.stock) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex gap-2">{[['products', 'Products'], ['categories', 'Categories']].map(([k, l]) => <button key={k} type="button" onClick={() => setTab(k)} className={`chip ${tab === k ? 'chip-active' : ''}`}>{l}</button>)}</div>
      {tab === 'products' ? (
        <Panel title={`Products (${list.length})`} action={<button type="button" className="btn-primary btn-sm" onClick={() => setEditing(newProduct(categories[0]?.id))}><Plus size={14} />Add product</button>}>
          <div className="mb-4 flex flex-col gap-2 sm:flex-row">
            <label className="relative flex-1"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" /><input className="input pl-10" placeholder="Search name or SKU" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" /></label>
            <select className="input sm:w-56" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Filter by category"><option value="">All categories</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name.en}</option>)}</select>
          </div>
          <div className="table-wrap"><table className="table">
            <thead><tr><th>Product</th><th>Category</th><th>Price (from)</th><th>Stock</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
            <tbody>{list.map((p) => {
              const stock = stockOf(p);
              return (
                <tr key={p.id}>
                  <td><div className="flex items-center gap-3"><div className="w-10 shrink-0 overflow-hidden rounded-lg"><ProductImage product={p} compact /></div><div className="min-w-0"><p className="font-semibold">{p.name.en}</p><p className="text-xs text-charcoal-400">{p.sku} · {p.packs.map((x) => x.size).join(', ')}</p></div></div></td>
                  <td className="text-charcoal-600">{categories.find((c) => c.id === p.category)?.name.en || p.category}</td>
                  <td>{formatINR(Math.min(...p.packs.map((x) => x.price)))}</td>
                  <td><span className={`badge ${stock === 0 ? 'bg-chilli-50 text-chilli' : stock < 40 ? 'bg-turmeric-100 text-turmeric-700' : 'bg-leaf-50 text-leaf'}`}>{stock} units</span></td>
                  <td><Toggle checked={p.active !== false} onChange={(v) => { upsertProduct({ ...p, active: v }); toast(`${p.name.en} ${v ? 'activated' : 'hidden from store'}`, 'info'); }} label={p.active !== false ? 'Active' : 'Hidden'} /></td>
                  <td className="text-right"><div className="inline-flex gap-1">
                    <Link to={`/product/${p.slug}`} target="_blank" className="icon-btn h-9 w-9" aria-label="View in store"><ExternalLink size={15} /></Link>
                    <button type="button" className="icon-btn h-9 w-9" onClick={() => setEditing(structuredClone(p))} aria-label={`Edit ${p.name.en}`}><Pencil size={15} /></button>
                    <button type="button" className="icon-btn h-9 w-9 hover:text-chilli" onClick={() => setConfirm(p)} aria-label={`Delete ${p.name.en}`}><Trash2 size={15} /></button>
                  </div></td>
                </tr>
              );
            })}</tbody>
          </table></div>
        </Panel>
      ) : <CategoryManager categories={categories} setCategories={setCategories} products={products} toast={toast} />}

      {editing && <ProductForm product={editing} categories={categories} onClose={() => setEditing(null)} onSave={(p) => { upsertProduct(p); setEditing(null); toast(`Saved ${p.name.en}`); }} existing={products} />}
      <Modal open={!!confirm} onClose={() => setConfirm(null)} title="Delete product" size="sm">
        <div className="p-5"><p className="text-sm">Delete <strong>{confirm?.name.en}</strong>? It will be removed from the store, carts and wishlists (demo data only).</p>
          <div className="mt-5 flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setConfirm(null)}>Cancel</button><button type="button" className="btn-primary" onClick={() => { deleteProduct(confirm.id); toast('Product deleted', 'info'); setConfirm(null); }}>Delete</button></div></div>
      </Modal>
    </div>
  );
}

function ProductForm({ product, categories, onClose, onSave, existing }) {
  const [p, setP] = useState(product);
  const [errors, setErrors] = useState({});
  const [imgError, setImgError] = useState('');
  const set = (patch) => setP((x) => ({ ...x, ...patch }));
  const setPack = (i, patch) => set({ packs: p.packs.map((x, j) => (j === i ? { ...x, ...patch } : x)) });
  const isNew = !existing.some((x) => x.id === product.id);

  const save = (e) => {
    e.preventDefault();
    const errs = {};
    if (!p.name.en?.trim()) errs.name = 'English name is required';
    if (!p.packs.length) errs.packs = 'Add at least one pack size';
    if (p.packs.some((x) => !x.size || Number(x.price) <= 0)) errs.packs = 'Each pack needs a size and a price above 0';
    if (p.packs.some((x) => Number(x.mrp) && Number(x.mrp) < Number(x.price))) errs.packs = 'MRP cannot be lower than price';
    const slug = p.slug || slugify(p.name.en || '');
    if (existing.some((x) => x.slug === slug && x.id !== p.id)) errs.name = 'Another product already uses this name/URL';
    setErrors(errs); if (Object.keys(errs).length) return;
    onSave({ ...p, slug, sku: p.sku || `RR-${p.id.toUpperCase().slice(-6)}`, name: { en: p.name.en, hi: p.name.hi || p.name.en, mr: p.name.mr || p.name.en }, short: { en: p.short.en, hi: p.short.hi || p.short.en, mr: p.short.mr || p.short.en },
      packs: p.packs.map((x) => ({ ...x, price: Number(x.price), mrp: Number(x.mrp) || Number(x.price), stock: Number(x.stock) || 0 })) });
  };
  const onFile = async (e) => {
    setImgError('');
    try { const url = await readImage(e.target.files?.[0]); set({ images: [url, ...p.images].slice(0, 4) }); } catch (err) { setImgError(err.message); }
    e.target.value = '';
  };

  return (
    <Modal open onClose={onClose} title={isNew ? 'Add product' : `Edit · ${product.name.en}`} size="lg">
      <form onSubmit={save} className="space-y-5 p-5" noValidate>
        <I18nInput label="Product name" value={p.name} onChange={(name) => set({ name })} error={errors.name} />
        <I18nInput label="Short description" as="textarea" value={p.short} onChange={(short) => set({ short })} />
        <div className="grid gap-4 sm:grid-cols-3">
          <label><span className="label">Category</span><select className="input" value={p.category} onChange={(e) => set({ category: e.target.value })}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name.en}</option>)}</select></label>
          <label><span className="label">Product type</span><select className="input" value={p.type} onChange={(e) => set({ type: e.target.value })}>{productTypes.map((c) => <option key={c.id} value={c.id}>{c.name.en}</option>)}</select></label>
          <label><span className="label">Region</span><select className="input" value={p.region} onChange={(e) => set({ region: e.target.value })}>{[...regions, { id: 'pan-india', name: { en: 'Pan-India' } }].map((c) => <option key={c.id} value={c.id}>{c.name.en}</option>)}</select></label>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between"><p className="label mb-0">Pack sizes, prices & stock</p><button type="button" className="btn-ghost btn-sm" onClick={() => set({ packs: [...p.packs, { size: '', grams: 0, price: 0, mrp: 0, stock: 0 }] })}><Plus size={13} />Add pack</button></div>
          <div className="space-y-2">
            {p.packs.map((x, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] items-end gap-2">
                <label><span className="text-[11px] text-charcoal-400">Size</span><input className="input" value={x.size} onChange={(e) => setPack(i, { size: e.target.value, grams: parseInt(e.target.value, 10) || 0 })} placeholder="100g" /></label>
                <label><span className="text-[11px] text-charcoal-400">Price ₹</span><input className="input" type="number" min="0" value={x.price} onChange={(e) => setPack(i, { price: e.target.value })} /></label>
                <label><span className="text-[11px] text-charcoal-400">MRP ₹</span><input className="input" type="number" min="0" value={x.mrp} onChange={(e) => setPack(i, { mrp: e.target.value })} /></label>
                <label><span className="text-[11px] text-charcoal-400">Stock</span><input className="input" type="number" min="0" value={x.stock} onChange={(e) => setPack(i, { stock: e.target.value })} /></label>
                <button type="button" className="icon-btn mb-0.5" onClick={() => set({ packs: p.packs.filter((_, j) => j !== i) })} aria-label="Remove pack"><X size={16} /></button>
              </div>
            ))}
          </div>
          {errors.packs && <p className="field-error">{errors.packs}</p>}
        </div>
        <div>
          <p className="label">Product images (preview — demo stores them in this browser only)</p>
          <div className="flex flex-wrap gap-3">
            {p.images.map((src, i) => (
              <div key={i} className="relative w-24 overflow-hidden rounded-xl border border-charcoal/10"><img src={src} alt="" className="aspect-[4/5] w-full object-cover" /><button type="button" onClick={() => set({ images: p.images.filter((_, j) => j !== i) })} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow" aria-label="Remove image"><X size={12} /></button></div>
            ))}
            <div className="w-24 overflow-hidden rounded-xl border border-charcoal/10 opacity-70"><ProductImage product={{ ...p, images: [], name: p.name.en ? p.name : { en: 'Preview' } }} compact /></div>
            <label className="flex w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-charcoal/20 text-xs font-semibold text-charcoal-500 hover:border-chilli hover:text-chilli"><Upload size={18} />Upload<input type="file" accept="image/*" className="sr-only" onChange={onFile} /></label>
          </div>
          <p className="mt-1 text-xs text-charcoal-400">Or paste an image path/URL (e.g. /images/products/turmeric.jpg):</p>
          <input className="input mt-1" placeholder="/images/products/…" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (e.currentTarget.value.trim()) { set({ images: [e.currentTarget.value.trim(), ...p.images] }); e.currentTarget.value = ''; } } }} />
          {imgError && <p className="field-error">{imgError}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-4">
          <label><span className="label">Pack colour</span><input type="color" className="h-11 w-full rounded-xl border border-charcoal/15" value={p.color[0]} onChange={(e) => set({ color: [e.target.value, p.color[1]] })} /></label>
          <label><span className="label">Accent colour</span><input type="color" className="h-11 w-full rounded-xl border border-charcoal/15" value={p.color[1]} onChange={(e) => set({ color: [p.color[0], e.target.value] })} /></label>
          <label><span className="label">Heat (0–5)</span><input type="number" min="0" max="5" className="input" value={p.heat} onChange={(e) => set({ heat: Math.max(0, Math.min(5, Number(e.target.value))) })} /></label>
          <label><span className="label">SKU</span><input className="input" value={p.sku} onChange={(e) => set({ sku: e.target.value })} /></label>
        </div>
        <div className="flex flex-wrap gap-6"><Toggle checked={!!p.bestseller} onChange={(v) => set({ bestseller: v })} label="Bestseller badge" /><Toggle checked={!!p.isNew} onChange={(v) => set({ isNew: v })} label="New badge" /><Toggle checked={p.active !== false} onChange={(v) => set({ active: v })} label="Visible in store" /></div>
        <div className="flex justify-end gap-2 border-t border-charcoal/10 pt-4"><button type="button" className="btn-ghost" onClick={onClose}>Cancel</button><button type="submit" className="btn-primary">Save product</button></div>
      </form>
    </Modal>
  );
}

function CategoryManager({ categories, setCategories, products, toast }) {
  const [edit, setEdit] = useState(null);
  const save = (e) => {
    e.preventDefault();
    if (!edit.name.en?.trim()) return;
    const id = edit.id || slugify(edit.name.en);
    const c = { icon: 'Sparkles', desc: { en: '', hi: '', mr: '' }, ...edit, id };
    setCategories(categories.some((x) => x.id === id) ? categories.map((x) => (x.id === id ? c : x)) : [...categories, c]);
    setEdit(null); toast('Category saved');
  };
  return (
    <Panel title={`Categories (${categories.length})`} action={<button type="button" className="btn-primary btn-sm" onClick={() => setEdit({ id: '', name: { en: '', hi: '', mr: '' }, desc: { en: '', hi: '', mr: '' } })}><Plus size={14} />Add category</button>}>
      <div className="table-wrap"><table className="table">
        <thead><tr><th>Name (EN / HI / MR)</th><th>Products</th><th className="text-right">Actions</th></tr></thead>
        <tbody>{categories.map((c) => {
          const n = products.filter((p) => p.category === c.id).length;
          return (
            <tr key={c.id}><td><p className="font-semibold">{c.name.en}</p><p className="text-xs text-charcoal-400">{c.name.hi} · {c.name.mr}</p></td><td>{n}</td>
              <td className="text-right"><button type="button" className="icon-btn h-9 w-9" onClick={() => setEdit(structuredClone(c))} aria-label="Edit"><Pencil size={15} /></button>
                <button type="button" className="icon-btn h-9 w-9 hover:text-chilli disabled:opacity-30" disabled={n > 0} title={n ? 'Move or delete its products first' : 'Delete'} onClick={() => { setCategories(categories.filter((x) => x.id !== c.id)); toast('Category deleted', 'info'); }} aria-label="Delete"><Trash2 size={15} /></button></td></tr>
          );
        })}</tbody>
      </table></div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Edit category' : 'Add category'}>
        {edit && <form onSubmit={save} className="space-y-4 p-5"><I18nInput label="Name" value={edit.name} onChange={(name) => setEdit({ ...edit, name })} /><I18nInput label="Short description" value={edit.desc} onChange={(desc) => setEdit({ ...edit, desc })} />
          <div className="flex justify-end gap-2"><button type="button" className="btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button type="submit" className="btn-primary">Save</button></div></form>}
      </Modal>
    </Panel>
  );
}
