import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Search, User, Heart, ShoppingBag, ChevronDown, X } from 'lucide-react';
import Logo from '@/components/common/Logo';
import LanguageSelector from './LanguageSelector';
import ThemeSwitcher from './ThemeSwitcher';
import SearchBox from './SearchBox';
import MobileMenu from './MobileMenu';
import { exploreLinks } from './navLinks';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useStore } from '@/context/StoreContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useClickOutside } from '@/hooks/useClickOutside';

const navCls = ({ isActive }) => `nav-link whitespace-nowrap px-3 py-2 text-[14px] font-medium transition-colors hover:text-chilli ${isActive ? 'active text-chilli' : 'text-charcoal'}`;
const Badge = ({ n, tone = 'bg-chilli text-white' }) => (n > 0 ? <span key={n} className={`absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] animate-bump items-center justify-center rounded-full px-1 text-[10px] font-bold ${tone}`}>{n}</span> : null);

export default function Header() {
  const { t, l } = useLocalized();
  const { count } = useCart();
  const wishlist = useWishlist();
  const { user } = useAuth();
  const { categories } = useStore();
  const { setCartOpen } = useUI();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const catRef = useRef(null);
  const { pathname, search } = useLocation();
  useClickOutside(catRef, () => setCatOpen(false), catOpen);

  useEffect(() => { setMenuOpen(false); setSearchOpen(false); setCatOpen(false); }, [pathname, search]);
  useEffect(() => {
    let last = window.scrollY;
    const fn = () => {
      const y = window.scrollY;
      setScrolled(y > 4);
      if (Math.abs(y - last) > 6) { setHidden(y > last && y > 240); last = y; }
    };
    fn(); window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  const hide = hidden && !catOpen && !searchOpen && !menuOpen;

  return (
    <header className={`sticky top-0 z-50 border-b border-line bg-white/85 backdrop-blur-xl transition-[transform,box-shadow] duration-300 ${scrolled ? 'shadow-soft' : ''} ${hide ? '-translate-y-full' : 'translate-y-0'}`}>
      <div className="container-x flex h-16 items-center gap-2 lg:h-[72px]">
        <button type="button" className="icon-btn -ml-2 lg:hidden" onClick={() => setMenuOpen(true)} aria-label={t('nav.menu')}><Menu size={22} /></button>
        <Logo />

        <nav className="ml-8 hidden items-center lg:flex" aria-label="Main">
          <NavLink to="/" end className={navCls}>{t('nav.home')}</NavLink>
          <NavLink to="/shop" className={navCls}>{t('nav.shop')}</NavLink>
          <div className="relative" ref={catRef}>
            <button type="button" className={`nav-link flex items-center gap-1 whitespace-nowrap px-3 py-2 text-[14px] font-medium transition-colors hover:text-chilli ${catOpen || pathname.startsWith('/category') ? 'text-chilli' : ''}`}
              aria-expanded={catOpen} aria-haspopup="true" onClick={() => setCatOpen((o) => !o)}>
              {t('nav.categories')} <ChevronDown size={14} className={`transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`absolute left-0 top-12 z-50 grid w-[460px] grid-cols-2 gap-6 rounded-xl border border-line bg-white p-5 shadow-lift transition duration-200 ${catOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'}`}>
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-charcoal-400">{t('nav.categories')}</p>
                <ul className="space-y-0.5">
                  {categories.map((c) => <li key={c.id}><Link to={`/category/${c.id}`} tabIndex={catOpen ? 0 : -1} className="block rounded-md px-2 py-1.5 text-sm text-charcoal-600 hover:bg-cream hover:text-chilli">{l(c.name)}</Link></li>)}
                </ul>
                <Link to="/categories" tabIndex={catOpen ? 0 : -1} className="btn-link mt-2 px-2 text-[13px]">{t('nav.allCategories')} →</Link>
              </div>
              <div className="border-l border-line pl-6">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-charcoal-400">{t('nav.explore')}</p>
                <ul className="space-y-0.5">
                  {exploreLinks.slice(0, 7).map(({ to, key }) => <li key={to}><Link to={to} tabIndex={catOpen ? 0 : -1} className="block rounded-md px-2 py-1.5 text-sm text-charcoal-600 hover:bg-cream hover:text-chilli">{t(key)}</Link></li>)}
                </ul>
              </div>
            </div>
          </div>
          <NavLink to="/recipes" className={navCls}>{t('nav.recipes')}</NavLink>
          <NavLink to="/about" className={navCls}>{t('nav.about')}</NavLink>
        </nav>

        <div className="ml-auto flex items-center">
          <button type="button" className="icon-btn" onClick={() => setSearchOpen((s) => !s)} aria-label={t('header.search')} aria-expanded={searchOpen}>{searchOpen ? <X size={20} /> : <Search size={20} />}</button>
          <div className="hidden sm:block"><ThemeSwitcher /></div>
          <div className="hidden sm:block"><LanguageSelector /></div>
          <Link to={user ? '/account' : '/login'} className="icon-btn hidden sm:inline-flex" aria-label={t('header.account')} title={user ? t('header.hello', { name: user.name.split(' ')[0] }) : t('header.login')}><User size={20} /></Link>
          <Link to="/wishlist" className="icon-btn relative hidden sm:inline-flex" aria-label={`${t('header.wishlist')} (${wishlist.count})`}><Heart size={20} /><Badge n={wishlist.count} /></Link>
          <button type="button" id="cart-button" onClick={() => setCartOpen(true)} className="icon-btn relative -mr-2" aria-label={`${t('header.cart')} (${count})`}><ShoppingBag size={20} /><Badge n={count} tone="bg-turmeric text-charcoal" /></button>
        </div>
      </div>
      {searchOpen && (
        <div className="border-t border-line bg-white animate-fadeUp">
          <div className="container-x max-w-3xl py-4"><SearchBox autoFocus onDone={() => setSearchOpen(false)} /></div>
        </div>
      )}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
