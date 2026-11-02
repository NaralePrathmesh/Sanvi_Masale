import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, CornerDownLeft, Package, ShoppingCart, User, Zap, ExternalLink } from 'lucide-react';
import { useStore } from '@/context/StoreContext';
import { useOrders } from '@/context/OrderContext';
import { NAV_FLAT } from './nav';

/**
 * ⌘K / Ctrl+K command palette: jump to any admin page, run quick actions, or find a
 * product, order or customer. Arrow keys + Enter, Esc to close.
 */
export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const { products } = useStore();
  const { orders, customers } = useOrders();
  const [q, setQ] = useState('');
  const [i, setI] = useState(0);
  const input = useRef(null);
  const listRef = useRef(null);

  useEffect(() => { if (open) { setQ(''); setI(0); setTimeout(() => input.current?.focus(), 30); } }, [open]);

  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    const has = (txt) => !s || txt.toLowerCase().includes(s);
    const pages = NAV_FLAT.filter((n) => has(`${n.label} ${n.desc}`)).map((n) => ({ group: 'Pages', icon: n.icon, label: n.label, hint: n.desc, go: n.to }));
    const actions = [
      { label: 'Add a new product', go: '/admin/products?new=1', kw: 'create product new' },
      { label: 'Create a coupon', go: '/admin/coupons?new=1', kw: 'discount offer code' },
      { label: 'Add a customer review', go: '/admin/reviews?new=1', kw: 'testimonial feedback' },
      { label: 'Change WhatsApp / phone number', go: '/admin/settings?tab=contact', kw: 'contact call whatsapp' },
      { label: 'Change website theme', go: '/admin/settings?tab=appearance', kw: 'colour color design' },
      { label: 'Download data backup', go: '/admin/settings?tab=data', kw: 'export json' },
      { label: 'Open the storefront', go: '/', kw: 'website shop view', icon: ExternalLink },
    ].filter((a) => has(`${a.label} ${a.kw}`)).map((a) => ({ group: 'Actions', icon: a.icon || Zap, label: a.label, go: a.go }));
    const prods = s ? products.filter((p) => has(`${p.name.en} ${p.sku} ${p.slug}`)).slice(0, 6).map((p) => ({ group: 'Products', icon: Package, label: p.name.en, hint: `${p.sku} · ${p.packs.map((x) => x.size).join(', ')}`, go: `/admin/products?edit=${p.id}` })) : [];
    const ords = s ? orders.filter((o) => has(`${o.id} ${o.customer.name} ${o.customer.phone}`)).slice(0, 5).map((o) => ({ group: 'Orders', icon: ShoppingCart, label: o.id, hint: `${o.customer.name} · ₹${o.totals.total}`, go: `/admin/orders?view=${o.id}` })) : [];
    const custs = s ? customers.filter((c) => has(`${c.name} ${c.email} ${c.phone}`)).slice(0, 5).map((c) => ({ group: 'Customers', icon: User, label: c.name, hint: c.email, go: `/admin/customers?view=${c.id}` })) : [];
    return [...pages, ...actions, ...prods, ...ords, ...custs];
  }, [q, products, orders, customers]);

  useEffect(() => { setI(0); }, [q]);
  useEffect(() => { listRef.current?.querySelector(`[data-i="${i}"]`)?.scrollIntoView({ block: 'nearest' }); }, [i]);

  const run = (it) => { if (!it) return; onClose(); navigate(it.go); };
  const onKey = (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setI((x) => Math.min(items.length - 1, x + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => Math.max(0, x - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); run(items[i]); }
    else if (e.key === 'Escape') onClose();
  };

  let lastGroup = '';
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="adm-scope fixed inset-0 z-[90] flex items-start justify-center p-3 pt-[12vh] text-charcoal">
          <motion.div className="absolute inset-0 bg-[#0F0D0C]/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div role="dialog" aria-modal="true" aria-label="Command palette" onKeyDown={onKey}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-2xl backdrop-blur-xl"
            initial={{ opacity: 0, y: -16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10, scale: 0.98 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }}>
            <div className="flex items-center gap-3 border-b border-black/[.06] px-5">
              <Search size={18} className="text-charcoal-400" />
              <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search pages, products, orders, customers…" aria-label="Search admin"
                className="h-14 flex-1 bg-transparent text-[15px] !outline-none !ring-0 placeholder:text-charcoal-400" />
              <kbd className="rounded-md border border-black/10 px-1.5 py-0.5 text-[10px] font-semibold text-charcoal-400">ESC</kbd>
            </div>
            <ul ref={listRef} className="max-h-[52vh] overflow-y-auto p-2" role="listbox">
              {!items.length && <li className="px-4 py-10 text-center text-sm text-charcoal-500">No results for “{q}”.</li>}
              {items.map((it, idx) => {
                const head = it.group !== lastGroup; lastGroup = it.group;
                const Icon = it.icon;
                return (
                  <li key={`${it.group}-${it.label}-${idx}`}>
                    {head && <p className="px-3 pb-1 pt-3 text-[10px] font-bold uppercase tracking-[.14em] text-charcoal-400">{it.group}</p>}
                    <button type="button" data-i={idx} role="option" aria-selected={idx === i} onMouseMove={() => setI(idx)} onClick={() => run(it)}
                      className="relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left">
                      {idx === i && <motion.span layoutId="cmdk-hl" className="absolute inset-0 rounded-2xl bg-chilli/[.07]" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                      <span className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${idx === i ? 'bg-chilli text-white' : 'bg-black/[.04] text-charcoal-500'}`}><Icon size={16} /></span>
                      <span className="relative min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{it.label}</span>{it.hint && <span className="block truncate text-xs text-charcoal-500">{it.hint}</span>}</span>
                      {idx === i && <CornerDownLeft size={15} className="relative text-charcoal-400" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center gap-4 border-t border-black/[.06] bg-[#FAFAF8] px-5 py-2.5 text-[11px] text-charcoal-400">
              <span><kbd className="font-semibold">↑↓</kbd> navigate</span><span><kbd className="font-semibold">↵</kbd> open</span><span className="ml-auto">Saanvi Masale admin</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
