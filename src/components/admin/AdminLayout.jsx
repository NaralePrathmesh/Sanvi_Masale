import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Link, useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, MotionConfig, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Menu, X, Search, Bell, ExternalLink, LogOut, ChevronsLeft, ShoppingCart, PackageX, MessageSquareHeart, FlaskConical, Command } from 'lucide-react';
import { BrandMark } from '@/components/common/Logo';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';
import { useStore } from '@/context/StoreContext';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useClickOutside } from '@/hooks/useClickOutside';
import { ADMIN_NAV, navTitle } from './nav';
import CommandPalette from './CommandPalette';
import { reduced } from './motion';

/**
 * Premium admin shell — DEMO ONLY (no real admin APIs; data lives in localStorage).
 * Collapsible glass sidebar with a shared-layout active pill, sticky top bar with ⌘K
 * search + notifications, and Framer page transitions between admin pages.
 */
export default function AdminLayout() {
  const { admin, adminLogout } = useAuth();
  const { orders } = useOrders();
  const { products, reviews, settings } = useStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const outlet = useOutlet();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = usePersistentState('adminSidebarCollapsed', false);
  const [cmdk, setCmdk] = useState(false);
  const sideRef = useRef(null);

  const pending = orders.filter((o) => ['placed', 'confirmed'].includes(o.status));
  const lowStock = useMemo(() => products.flatMap((p) => p.packs.filter((x) => Number(x.stock) <= settings.lowStockThreshold).map((x) => ({ p, x }))), [products, settings.lowStockThreshold]);
  const newReviews = reviews.filter((r) => r.source === 'customer' && !r.seen);
  const badges = { '/admin/orders': pending.length, '/admin/inventory': lowStock.length, '/admin/reviews': newReviews.length };

  useEffect(() => { setMobileOpen(false); }, [pathname]);
  useEffect(() => {
    const onKey = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmdk((v) => !v); } };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);
  // GSAP: sidebar links cascade in on first load.
  useLayoutEffect(() => {
    if (!sideRef.current || reduced()) return undefined;
    const ctx = gsap.context(() => gsap.from('[data-nav]', { x: -18, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.04, delay: 0.1, clearProps: 'all' }), sideRef);
    return () => ctx.revert();
  }, []);

  const logout = () => { adminLogout(); navigate('/admin/login'); };
  const w = collapsed ? 84 : 264;

  const renderSide = (mobile) => {
    const mini = collapsed && !mobile;
    return (
      <div className="flex h-full flex-col text-white">
        <div className={`flex items-center gap-3 px-5 pb-4 pt-5 ${mini ? 'justify-center px-0' : ''}`}>
          <Link to="/admin" className="flex items-center gap-3" aria-label="Admin home">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-lg"><BrandMark className="h-8 w-8" /></span>
            {!mini && <span className="min-w-0 leading-tight"><span className="block font-brand text-lg">सान्वी मसाले</span><span className="block text-[10px] font-semibold uppercase tracking-[.2em] text-white/45">Admin studio</span></span>}
          </Link>
          {mobile && <button type="button" className="ml-auto text-white/70" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={20} /></button>}
        </div>
        <LayoutGroup id={mobile ? 'm' : 'd'}>
          <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-3 [scrollbar-width:none]" aria-label="Admin">
            {ADMIN_NAV.map((g) => (
              <div key={g.group}>
                {!mini && <p data-nav className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[.18em] text-white/35">{g.group}</p>}
                <ul className="space-y-0.5">
                  {g.items.map(({ to, label, icon: Icon, end }) => (
                    <li key={to} data-nav>
                      <NavLink to={to} end={end} title={mini ? label : undefined}
                        className={({ isActive }) => `group relative flex items-center gap-3 rounded-2xl py-2.5 text-sm font-medium transition-colors ${mini ? 'justify-center px-0' : 'px-3'} ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}>
                        {({ isActive }) => (
                          <>
                            {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-2xl bg-gradient-to-r from-chilli to-chilli-deep shadow-[0_10px_25px_-10px_rgb(var(--chilli)/.9)]" transition={{ type: 'spring', stiffness: 420, damping: 36 }} />}
                            {!isActive && <span className="absolute inset-0 rounded-2xl bg-white/0 transition group-hover:bg-white/[.06]" />}
                            <Icon size={19} className="relative shrink-0" />
                            {!mini && <span className="relative truncate">{label}</span>}
                            {badges[to] > 0 && (mini
                              ? <span className="absolute right-3 top-2 h-2 w-2 rounded-full bg-turmeric ring-2 ring-[#121010]" />
                              : <span className="relative ml-auto rounded-full bg-turmeric px-2 text-[11px] font-bold text-charcoal">{badges[to]}</span>)}
                          </>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </LayoutGroup>
        <div className="space-y-1 border-t border-white/10 p-3">
          <Link to="/" target="_blank" className={`flex items-center gap-3 rounded-2xl py-2.5 text-sm text-white/60 transition hover:bg-white/[.06] hover:text-white ${mini ? 'justify-center' : 'px-3'}`} title="View store"><ExternalLink size={18} />{!mini && 'View store'}</Link>
          <button type="button" onClick={logout} className={`flex w-full items-center gap-3 rounded-2xl py-2.5 text-sm text-white/60 transition hover:bg-white/[.06] hover:text-white ${mini ? 'justify-center' : 'px-3'}`} title="Logout"><LogOut size={18} />{!mini && 'Logout'}</button>
          {!mobile && (
            <button type="button" onClick={() => setCollapsed(!collapsed)} className={`hidden w-full items-center gap-3 rounded-2xl py-2.5 text-sm text-white/45 transition hover:bg-white/[.06] hover:text-white lg:flex ${mini ? 'justify-center' : 'px-3'}`} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <ChevronsLeft size={18} className={`transition-transform duration-500 ${collapsed ? 'rotate-180' : ''}`} />{!mini && 'Collapse'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="adm-scope adm-bg min-h-screen font-sans text-charcoal">
        <motion.aside ref={sideRef} className="adm-side fixed inset-y-0 left-0 z-40 hidden overflow-hidden lg:block" animate={{ width: w }} initial={false} transition={{ type: 'spring', stiffness: 300, damping: 34 }}>
          {renderSide(false)}
        </motion.aside>
        <AnimatePresence>
          {mobileOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
              <motion.aside className="adm-side absolute inset-y-0 left-0 w-72" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', stiffness: 340, damping: 34 }}>{renderSide(true)}</motion.aside>
            </div>
          )}
        </AnimatePresence>

        <div className="min-w-0 transition-[padding] duration-500 ease-out lg:pl-[var(--sbw)]" style={{ '--sbw': `${w}px` }}>
          <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-black/[.05] bg-[#F6F5F2]/80 px-4 backdrop-blur-xl sm:gap-3 sm:px-6 lg:px-8">
            <button type="button" className="adm-icon -ml-2 lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
            <div className="min-w-0">
              <p className="hidden text-[11px] font-semibold uppercase tracking-[.14em] text-charcoal-400 sm:block">Admin</p>
              <p className="truncate text-sm font-bold sm:text-base">{navTitle(pathname)}</p>
            </div>
            <span className="ml-1 hidden items-center gap-1 rounded-full bg-turmeric-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-turmeric-700 md:inline-flex"><FlaskConical size={11} />Demo data</span>
            <button type="button" onClick={() => setCmdk(true)} className="ml-auto flex h-10 items-center gap-2 rounded-xl border border-black/[.08] bg-white px-3 text-sm text-charcoal-400 shadow-sm transition hover:border-black/15 sm:w-64" aria-label="Search (Ctrl+K)">
              <Search size={16} /><span className="hidden flex-1 text-left sm:inline">Search…</span>
              <kbd className="hidden items-center gap-0.5 rounded-md border border-black/10 px-1.5 text-[10px] font-semibold sm:inline-flex"><Command size={10} />K</kbd>
            </button>
            <Notifications pending={pending} lowStock={lowStock} newReviews={newReviews} />
            <span className="hidden h-6 w-px bg-black/10 sm:block" />
            <div className="hidden items-center gap-2.5 sm:flex">
              <span className="text-right text-xs leading-tight"><span className="block font-semibold">{admin?.name}</span><span className="text-charcoal-400">{admin?.email}</span></span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-chilli to-turmeric text-sm font-bold text-white shadow-md">{admin?.name?.[0] || 'A'}</span>
            </div>
          </header>

          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={pathname} initial={{ opacity: 0, y: 14, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }} transition={{ duration: 0.32, ease: [0.2, 0.75, 0.25, 1] }}>
                <Suspense fallback={<AdminSkeleton />}>{outlet}</Suspense>
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <CommandPalette open={cmdk} onClose={() => setCmdk(false)} />
      </div>
    </MotionConfig>
  );
}

function Notifications({ pending, lowStock, newReviews }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useClickOutside(ref, () => setOpen(false), open);
  const total = pending.length + lowStock.length + newReviews.length;
  const rows = [
    ...pending.slice(0, 4).map((o) => ({ icon: ShoppingCart, tone: 'bg-turmeric-100 text-turmeric-700', title: `New order ${o.id}`, text: `${o.customer.name} · ₹${o.totals.total}`, to: `/admin/orders?view=${o.id}` })),
    ...lowStock.slice(0, 4).map(({ p, x }) => ({ icon: PackageX, tone: 'bg-chilli-50 text-chilli', title: `${Number(x.stock) === 0 ? 'Out of stock' : 'Low stock'}: ${p.name.en}`, text: `${x.size} · ${x.stock} left`, to: '/admin/inventory?filter=low' })),
    ...newReviews.slice(0, 3).map((r) => ({ icon: MessageSquareHeart, tone: 'bg-leaf-50 text-leaf-700', title: `New review from ${r.name}`, text: `${'★'.repeat(r.rating)} ${r.text.slice(0, 40)}…`, to: '/admin/reviews?filter=customer' })),
  ];
  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="adm-icon relative h-10 w-10" aria-label={`Notifications (${total})`} aria-expanded={open}>
        <Bell size={19} className={total ? 'origin-top animate-[wiggle_2.4s_ease-in-out_infinite]' : ''} />
        {total > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-chilli px-1 text-[10px] font-bold text-white ring-2 ring-[#F6F5F2]">{total}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.98 }} transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            className="absolute right-0 top-12 z-50 w-[min(92vw,360px)] origin-top-right overflow-hidden rounded-3xl border border-black/[.06] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-black/[.06] px-5 py-3.5"><p className="font-bold">Notifications</p><span className="text-xs text-charcoal-400">{total} alerts</span></div>
            <ul className="max-h-[60vh] overflow-y-auto p-2">
              {!rows.length && <li className="px-4 py-10 text-center text-sm text-charcoal-500">All caught up 🎉</li>}
              {rows.map((r, idx) => (
                <motion.li key={idx} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
                  <Link to={r.to} onClick={() => setOpen(false)} className="flex items-start gap-3 rounded-2xl p-3 transition hover:bg-black/[.03]">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${r.tone}`}><r.icon size={16} /></span>
                    <span className="min-w-0"><span className="block truncate text-sm font-semibold">{r.title}</span><span className="block truncate text-xs text-charcoal-500">{r.text}</span></span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AdminSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="h-9 w-56 animate-pulse rounded-xl bg-black/[.06]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-32 animate-pulse rounded-[22px] bg-black/[.05]" />)}</div>
      <div className="h-80 animate-pulse rounded-[22px] bg-black/[.05]" />
    </div>
  );
}
