import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, Ticket, LayoutTemplate, Settings, LogOut, Menu, X, ExternalLink, FlaskConical } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';

const NAV = [
  ['/admin', 'Overview', LayoutDashboard, true], ['/admin/products', 'Products', Package], ['/admin/orders', 'Orders', ShoppingCart],
  ['/admin/customers', 'Customers', Users], ['/admin/coupons', 'Coupons & Offers', Ticket], ['/admin/content', 'Content', LayoutTemplate], ['/admin/settings', 'Settings', Settings],
];

/** Admin dashboard shell — DEMO ONLY (no real admin APIs; data lives in localStorage). Admin UI is English-only. */
export default function AdminLayout() {
  const { admin, adminLogout } = useAuth();
  const { orders } = useOrders();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const pending = orders.filter((o) => ['placed', 'confirmed'].includes(o.status)).length;
  const title = NAV.find(([to, , , end]) => (end ? pathname === to : pathname.startsWith(to)))?.[1] || 'Admin';

  const Side = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-5"><span className="rounded-lg bg-white px-2 py-1"><Logo to="/admin" size="sm" /></span><button type="button" className="text-white/70 lg:hidden" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button></div>
      <nav className="flex-1 space-y-1 p-3" aria-label="Admin">
        {NAV.map(([to, label, Icon, end]) => (
          <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${isActive ? 'bg-chilli text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'}`}>
            <Icon size={18} />{label}{to === '/admin/orders' && pending > 0 && <span className="ml-auto rounded-full bg-turmeric px-2 text-xs font-bold text-charcoal">{pending}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="space-y-2 border-t border-white/10 p-3">
        <Link to="/" className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"><ExternalLink size={18} />View store</Link>
        <button type="button" onClick={() => { adminLogout(); navigate('/admin/login'); }} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"><LogOut size={18} />Logout</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-charcoal lg:block">{Side}</aside>
      {open && <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-charcoal/60" onClick={() => setOpen(false)} /><aside className="absolute inset-y-0 left-0 w-72 bg-charcoal animate-fadeUp">{Side}</aside></div>}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur sm:px-6">
          <button type="button" className="icon-btn -ml-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
          <h1 className="text-lg sm:text-xl">{title}</h1>
          <span className="demo-pill ml-1 hidden sm:inline-flex"><FlaskConical size={11} />Demo admin</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden text-right text-xs sm:block"><span className="block font-semibold">{admin?.name}</span><span className="text-charcoal-400">{admin?.email}</span></span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-chilli font-bold text-white">A</span>
          </div>
        </header>
        <main className="p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
