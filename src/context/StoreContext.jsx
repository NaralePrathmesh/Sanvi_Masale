import { createContext, useCallback, useContext, useMemo } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { defaultProducts } from '@/data/products';
import { categories as defaultCategories } from '@/data/categories';
import { recipes as defaultRecipes } from '@/data/recipes';
import { defaultBanners, defaultAnnouncements, defaultHomeContent } from '@/data/banners';
import { defaultCoupons, defaultSettings } from '@/config/site';
import { customerReviews as defaultReviews } from '@/data/customerReviews';

/**
 * Catalogue + store configuration. Seeded from /src/data and editable from the
 * admin dashboard (DEMO: persisted in localStorage). In Phase 2 each setter maps
 * to an API call.
 */
const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [products, setProducts] = usePersistentState('products', defaultProducts);
  const [categories, setCategories] = usePersistentState('categories', defaultCategories);
  const [recipes, setRecipes] = usePersistentState('recipes', defaultRecipes.map((r) => ({ active: true, featured: true, ...r })));
  const [coupons, setCoupons] = usePersistentState('coupons', defaultCoupons);
  const [banners, setBanners] = usePersistentState('banners', defaultBanners);
  const [announcements, setAnnouncements] = usePersistentState('announcements', defaultAnnouncements);
  const [homeContent, setHomeContent] = usePersistentState('homeContent', defaultHomeContent);
  const [storedSettings, setSettings] = usePersistentState('settings', defaultSettings);
  // New settings keys added after a visitor's data was saved still get their defaults.
  const settings = useMemo(() => ({ ...defaultSettings, ...storedSettings }), [storedSettings]);
  const [reviews, setReviews] = usePersistentState('reviews', defaultReviews);

  const byId = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
  const activeProducts = useMemo(() => products.filter((p) => p.active !== false), [products]);
  const getProduct = useCallback((id) => byId[id], [byId]);
  const getBySlug = useCallback((slug) => products.find((p) => p.slug === slug), [products]);

  const upsertProduct = useCallback((p) => setProducts((list) => (list.some((x) => x.id === p.id) ? list.map((x) => (x.id === p.id ? p : x)) : [p, ...list])), [setProducts]);
  const deleteProduct = useCallback((id) => setProducts((list) => list.filter((x) => x.id !== id)), [setProducts]);

  const resetStore = useCallback(() => {
    setProducts(defaultProducts); setCategories(defaultCategories); setCoupons(defaultCoupons);
    setBanners(defaultBanners); setAnnouncements(defaultAnnouncements); setHomeContent(defaultHomeContent);
    setSettings(defaultSettings); setReviews(defaultReviews); setRecipes(defaultRecipes.map((r) => ({ active: true, featured: true, ...r })));
  }, [setProducts, setCategories, setCoupons, setBanners, setAnnouncements, setHomeContent, setSettings, setRecipes, setReviews]);

  const value = useMemo(() => ({
    products, activeProducts, setProducts, getProduct, getBySlug, upsertProduct, deleteProduct,
    categories, setCategories, recipes, setRecipes, activeRecipes: recipes.filter((r) => r.active !== false),
    coupons, setCoupons, banners, setBanners, announcements, setAnnouncements, homeContent, setHomeContent,
    settings, setSettings, reviews, setReviews, resetStore,
  }), [reviews, setReviews, products, activeProducts, setProducts, getProduct, getBySlug, upsertProduct, deleteProduct, categories, setCategories, recipes, setRecipes, coupons, setCoupons, banners, setBanners, announcements, setAnnouncements, homeContent, setHomeContent, settings, setSettings, resetStore]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
