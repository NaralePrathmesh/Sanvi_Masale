import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink } from 'react-router-dom';
import { X, User, ChevronRight, Heart } from 'lucide-react';
import Logo from '@/components/common/Logo';
import LanguageSelector from './LanguageSelector';
import ThemeSwitcher from './ThemeSwitcher';
import { exploreLinks } from './navLinks';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { useLocalized } from '@/hooks/useLocalized';

export default function MobileMenu({ open, onClose }) {
  const { t, l } = useLocalized();
  const { categories } = useStore();
  const { user } = useAuth();
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);
  if (!open) return null;
  const item = 'flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-semibold hover:bg-cream';
  return createPortal(
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className="absolute inset-0 bg-charcoal/50" onClick={onClose} />
      <nav className="absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-white shadow-lift animate-fadeUp" aria-label={t('nav.menu')}>
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <Logo size="sm" /><button type="button" className="icon-btn" onClick={onClose} aria-label={t('nav.closeMenu')}><X size={22} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <Link to={user ? '/account' : '/login'} className="mb-3 flex items-center gap-3 rounded-2xl bg-cream p-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-chilli text-white"><User size={18} /></span>
            <span className="text-sm font-semibold">{user ? t('header.hello', { name: user.name.split(' ')[0] }) : `${t('header.login')} / ${t('auth.register')}`}</span>
          </Link>
          {[['/', 'nav.home'], ['/shop', 'nav.shop'], ['/recipes', 'nav.recipes'], ['/about', 'nav.about'], ['/contact', 'nav.contact'], ['/wishlist', 'header.wishlist']].map(([to, key]) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `${item} ${isActive ? 'text-chilli' : ''}`}>{t(key)}<ChevronRight size={16} className="text-charcoal-400" /></NavLink>
          ))}
          <p className="eyebrow mt-4 px-3 pb-1">{t('nav.categories')}</p>
          {categories.map((c) => <Link key={c.id} to={`/category/${c.id}`} className="block rounded-xl px-3 py-2.5 text-sm hover:bg-cream">{l(c.name)}</Link>)}
          <p className="eyebrow mt-4 px-3 pb-1">{t('nav.explore')}</p>
          {exploreLinks.map(({ to, key, icon: Icon }) => <Link key={to} to={to} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm hover:bg-cream"><Icon size={16} className="text-leaf" />{t(key)}</Link>)}
          <Link to="/compare" className="block rounded-xl px-3 py-2.5 text-sm hover:bg-cream">{t('nav.compare')}</Link>
        </div>
        <div className="border-t border-line p-4"><p className="label">{t('header.language')}</p><LanguageSelector variant="inline" /></div>
        <div className="border-t border-line p-4"><p className="label">{t('theme.title')}</p><ThemeSwitcher variant="inline" /></div>
      </nav>
    </div>,
    document.body,
  );
}
