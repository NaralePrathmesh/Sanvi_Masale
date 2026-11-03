import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { defaultProducts } from '@/data/products';
import { categories as defaultCategories } from '@/data/categories';
import { recipes as defaultRecipes } from '@/data/recipes';
import { defaultBanners, defaultAnnouncements, defaultHomeContent } from '@/data/banners';
import { defaultCoupons, defaultSettings } from '@/config/site';
import { customerReviews as defaultReviews } from '@/data/customerReviews';
import { API_MODE, api } from '@/services/api/client';
import { storage } from '@/services/mock/storage';

/**
 * Catalogue + store configuration.
 *  • DEMO mode: seeded from /src/data and persisted in localStorage (the original behaviour).
 *  • API mode: loaded from GET /catalog (and the admin endpoints for staff). The last catalogue is
 *    cached in the browser so pages render instantly, then refreshed from the server.
 * Admin pages use the action functions below (saveProduct, updateStock, saveCoupon…), which work in
 * both modes — in API mode every change is validated, authorised and stored by the server.
 */
const StoreContext = createContext(null);
const recipeDefaults = () => defaultRecipes.map((r) => ({ active: true, featured: true, ...r }));
const isSampleReview = (r) => !!r.sample || (/^r\d+$/.test(r.id) && !r.source);

export function StoreProvider({ children }) {
  const cached = API_MODE ? storage.get('catalogCache', null) : null;
  // API_MODE is a build-time constant, so the hook used here never changes between renders.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const usePS = API_MODE ? (_key, initial) => useState(initial) : usePersistentState;
  const [products, setProducts] = usePS('products', cached?.products || defaultProducts);
  const [categories, setCategories] = usePS('categories', cached?.categories || defaultCategories);
  const [recipes, setRecipes] = usePS('recipes', cached?.recipes || recipeDefaults());
  const [coupons, setCoupons] = usePS('coupons', cached?.coupons || defaultCoupons);
  const [banners, setBanners] = usePS('banners', cached?.banners || defaultBanners);
  const [announcements, setAnnouncements] = usePS('announcements', cached?.announcements || defaultAnnouncements);
  const [homeContent, setHomeContent] = usePS('homeContent', cached?.homeContent || defaultHomeContent);
  const [storedSettings, setSettings] = usePS('settings', cached?.settings || defaultSettings);
  const [reviews, setReviews] = usePS('reviews', API_MODE ? [] : defaultReviews);
  const [status, setStatus] = useState(API_MODE ? (cached ? 'stale' : 'loading') : 'ready');
  const [adminLoaded, setAdminLoaded] = useState(false);
  // New settings keys added after a visitor's data was saved still get their defaults.
  const settings = useMemo(() => ({ ...defaultSettings, ...storedSettings }), [storedSettings]);

  /* ─── API loading ─── */
  const applyCatalog = useCallback((c) => {
    setProducts(c.products); setCategories(c.categories); setRecipes(c.recipes); setCoupons(c.coupons);
    setBanners(c.banners?.length ? c.banners : defaultBanners); setAnnouncements(c.announcements || []);
    setHomeContent({ ...defaultHomeContent, ...(c.homeContent || {}) }); setSettings(c.settings);
  }, [setProducts, setCategories, setRecipes, setCoupons, setBanners, setAnnouncements, setHomeContent, setSettings]);

  const refreshCatalog = useCallback(async () => {
    if (!API_MODE) return;
    try {
      const [c, r] = await Promise.all([api('/catalog', { auth: false }), api('/reviews', { auth: false })]);
      applyCatalog(c); setReviews(r.reviews); setStatus('ready');
      storage.set('catalogCache', c);
    } catch { setStatus((s) => (s === 'loading' ? 'error' : s)); }
  }, [applyCatalog, setReviews]);
  useEffect(() => { refreshCatalog(); }, [refreshCatalog]);

  /** Staff only: load the full admin view (hidden products, all reviews, private settings). */
  const loadAdminData = useCallback(async () => {
    if (!API_MODE) return;
    const [p, c, cp, rv, rc, st, ann, ban, home] = await Promise.all([
      api('/admin/products'), api('/admin/categories'), api('/admin/coupons').catch(() => null), api('/admin/reviews').catch(() => null),
      api('/admin/recipes').catch(() => null), api('/admin/settings'), api('/admin/content/announcements').catch(() => null),
      api('/admin/content/banners').catch(() => null), api('/admin/content/homeContent').catch(() => null),
    ]);
    setProducts(p.products); setCategories(c.categories);
    if (cp) setCoupons(cp.coupons); if (rv) setReviews(rv.reviews); if (rc) setRecipes(rc.recipes);
    setSettings(st.settings);
    if (ann) setAnnouncements(ann.value || []); if (ban) setBanners(ban.value?.length ? ban.value : defaultBanners);
    if (home) setHomeContent({ ...defaultHomeContent, ...(home.value || {}) });
    setAdminLoaded(true);
  }, [setProducts, setCategories, setCoupons, setReviews, setRecipes, setSettings, setAnnouncements, setBanners, setHomeContent]);

  /* ─── Lookups ─── */
  const byId = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p])), [products]);
  const activeProducts = useMemo(() => products.filter((p) => p.active !== false), [products]);
  const getProduct = useCallback((id) => byId[id], [byId]);
  const getBySlug = useCallback((slug) => products.find((p) => p.slug === slug), [products]);

  /* ─── Actions (both modes) ─── */
  const replaceProduct = useCallback((p) => setProducts((list) => (list.some((x) => x.id === p.id) ? list.map((x) => (x.id === p.id ? p : x)) : [p, ...list])), [setProducts]);

  const saveProduct = useCallback(async (p, isNew) => {
    if (!API_MODE) { replaceProduct(p); return p; }
    const body = { ...p, category: p.category };
    ['id', 'rating', 'reviews', 'createdAt'].forEach((k) => delete body[k]);
    body.packs = p.packs.map(({ id, ...k }) => k);
    const { product } = isNew ? await api('/admin/products', { method: 'POST', body }) : await api(`/admin/products/${p.id}`, { method: 'PUT', body });
    replaceProduct(product); return product;
  }, [replaceProduct]);
  const upsertProduct = saveProduct; // backwards-compatible name

  const patchProduct = useCallback(async (id, patch) => {
    if (!API_MODE) { setProducts((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x))); return; }
    const { product } = await api(`/admin/products/${id}`, { method: 'PATCH', body: patch });
    replaceProduct(product);
  }, [setProducts, replaceProduct]);

  const deleteProduct = useCallback(async (id) => {
    if (API_MODE) await api(`/admin/products/${id}`, { method: 'DELETE' });
    setProducts((list) => list.filter((x) => x.id !== id));
  }, [setProducts]);

  const bulkProducts = useCallback(async (ids, action) => {
    if (API_MODE) await api('/admin/products/bulk', { method: 'POST', body: { ids, action } });
    setProducts((all) => (action === 'delete' ? all.filter((p) => !ids.includes(p.id)) : all.map((p) => {
      if (!ids.includes(p.id)) return p;
      return { show: { ...p, active: true }, hide: { ...p, active: false }, bestseller_on: { ...p, bestseller: true }, bestseller_off: { ...p, bestseller: false } }[action] || p;
    })));
  }, [setProducts]);

  /** updates: [{ productId, size, stock? , delta? }] */
  const updateStock = useCallback(async (updates) => {
    const apply = (list) => setProducts((all) => all.map((p) => {
      const mine = list.filter((u) => u.productId === p.id);
      if (!mine.length) return p;
      return { ...p, packs: p.packs.map((k) => { const u = mine.find((x) => x.size === k.size); return u ? { ...k, stock: u.stock !== undefined ? u.stock : Math.max(0, Number(k.stock) + u.delta) } : k; }) };
    }));
    if (!API_MODE) { apply(updates); return; }
    const { packs } = await api('/admin/inventory', { method: 'PATCH', body: { updates } });
    apply(packs.map((k) => ({ productId: k.productId, size: k.size, stock: k.stock })));
  }, [setProducts]);

  const restockLow = useCallback(async (amount = 100) => {
    const th = settings.lowStockThreshold;
    if (API_MODE) await api('/admin/inventory/restock-low', { method: 'POST', body: { amount } });
    setProducts((all) => all.map((p) => ({ ...p, packs: p.packs.map((k) => (Number(k.stock) <= th ? { ...k, stock: Number(k.stock) + amount } : k)) })));
  }, [setProducts, settings.lowStockThreshold]);

  const saveCategory = useCallback(async (c, isNew) => {
    if (!API_MODE) { setCategories((l) => (l.some((x) => x.id === c.id) ? l.map((x) => (x.id === c.id ? c : x)) : [...l, c])); return c; }
    const body = { name: c.name, desc: c.desc, icon: c.icon, ...(isNew && c.id ? { id: c.id } : {}) };
    const { category } = isNew ? await api('/admin/categories', { method: 'POST', body }) : await api(`/admin/categories/${c.id}`, { method: 'PUT', body });
    setCategories((l) => (l.some((x) => x.id === category.id) ? l.map((x) => (x.id === category.id ? category : x)) : [...l, category]));
    return category;
  }, [setCategories]);
  const deleteCategory = useCallback(async (id) => {
    if (API_MODE) await api(`/admin/categories/${id}`, { method: 'DELETE' });
    setCategories((l) => l.filter((x) => x.id !== id));
  }, [setCategories]);

  const saveCoupon = useCallback(async (c, isNew) => {
    if (!API_MODE) { setCoupons((l) => (isNew ? [...l, c] : l.map((x) => (x.code === c.code ? c : x)))); return c; }
    const body = { ...c, maxDiscount: c.maxDiscount || 0, minOrder: c.minOrder || 0 };
    ['usedCount'].forEach((k) => delete body[k]);
    const { coupon } = isNew ? await api('/admin/coupons', { method: 'POST', body }) : await api(`/admin/coupons/${c.code}`, { method: 'PUT', body });
    setCoupons((l) => (isNew ? [...l, coupon] : l.map((x) => (x.code === coupon.code ? coupon : x))));
    return coupon;
  }, [setCoupons]);
  const toggleCoupon = useCallback(async (code, active) => {
    if (API_MODE) await api(`/admin/coupons/${code}`, { method: 'PATCH', body: { active } });
    setCoupons((l) => l.map((x) => (x.code === code ? { ...x, active } : x)));
  }, [setCoupons]);
  const deleteCoupon = useCallback(async (code) => {
    if (API_MODE) await api(`/admin/coupons/${code}`, { method: 'DELETE' });
    setCoupons((l) => l.filter((x) => x.code !== code));
  }, [setCoupons]);

  /* Content blocks: update the UI instantly, save to the server shortly after typing stops. */
  const timers = useRef({});
  const [saving, setSaving] = useState(false);
  const contentSetters = { banners: setBanners, announcements: setAnnouncements, homeContent: setHomeContent };
  const saveContent = useCallback((key, value, { immediate = false } = {}) => {
    contentSetters[key](value);
    if (!API_MODE) return Promise.resolve();
    clearTimeout(timers.current[key]);
    setSaving(true);
    return new Promise((resolve, reject) => {
      timers.current[key] = setTimeout(() => {
        api(`/admin/content/${key}`, { method: 'PUT', body: { value } }).then(resolve, reject).finally(() => setSaving(false));
      }, immediate ? 0 : 700);
    });
  }, [setBanners, setAnnouncements, setHomeContent]); // eslint-disable-line react-hooks/exhaustive-deps

  const patchRecipe = useCallback((id, patch) => {
    setRecipes((l) => l.map((x) => (x.id === id ? { ...x, ...patch, ...(patch.name ? { name: { ...x.name, ...patch.name } } : {}) } : x)));
    if (!API_MODE) return Promise.resolve();
    clearTimeout(timers.current[`r:${id}`]);
    return new Promise((resolve, reject) => {
      timers.current[`r:${id}`] = setTimeout(() => api(`/admin/recipes/${id}`, { method: 'PATCH', body: patch }).then(resolve, reject), patch.name ? 700 : 0);
    });
  }, [setRecipes]);

  const saveSettings = useCallback(async (next) => {
    if (!API_MODE) { setSettings(next); return next; }
    const { settings: saved } = await api('/admin/settings', { method: 'PUT', body: next });
    setSettings(saved); return saved;
  }, [setSettings]);

  /* Reviews */
  const addReview = useCallback(async (r) => {
    if (!API_MODE) { const rev = { ...r, id: `u${Date.now()}`, source: 'customer', createdAt: new Date().toISOString() }; setReviews((l) => [rev, ...l]); return rev; }
    const { review } = await api('/reviews', { method: 'POST', body: { name: r.name, city: r.city || '', product: r.product || '', rating: r.rating, text: r.text } });
    setReviews((l) => [review, ...l]); return review;
  }, [setReviews]);
  const adminAddReview = useCallback(async (r) => {
    if (!API_MODE) { const rev = { ...r, id: `a${Date.now()}`, source: 'admin', seen: true, createdAt: new Date().toISOString() }; setReviews((l) => [rev, ...l]); return rev; }
    const { review } = await api('/admin/reviews', { method: 'POST', body: { name: r.name, city: r.city || '', product: r.product || '', rating: r.rating, text: r.text, time: r.time } });
    setReviews((l) => [review, ...l]); return review;
  }, [setReviews]);
  const patchReview = useCallback(async (id, patch) => {
    setReviews((l) => l.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    if (API_MODE) await api(`/admin/reviews/${id}`, { method: 'PATCH', body: patch });
  }, [setReviews]);
  const deleteReview = useCallback(async (id) => {
    if (API_MODE) await api(`/admin/reviews/${id}`, { method: 'DELETE' });
    setReviews((l) => l.filter((x) => x.id !== id));
  }, [setReviews]);
  const removeSampleReviews = useCallback(async () => {
    if (API_MODE) await api('/admin/reviews/remove-samples', { method: 'POST' });
    setReviews((l) => l.filter((r) => !isSampleReview(r)));
  }, [setReviews]);
  const markReviewsSeen = useCallback(async () => {
    setReviews((l) => l.map((r) => (r.source === 'customer' ? { ...r, seen: true } : r)));
    if (API_MODE) await api('/admin/reviews/mark-seen', { method: 'POST' }).catch(() => {});
  }, [setReviews]);

  const resetStore = useCallback(() => {
    if (API_MODE) return;
    setProducts(defaultProducts); setCategories(defaultCategories); setCoupons(defaultCoupons);
    setBanners(defaultBanners); setAnnouncements(defaultAnnouncements); setHomeContent(defaultHomeContent);
    setSettings(defaultSettings); setReviews(defaultReviews); setRecipes(recipeDefaults());
  }, [setProducts, setCategories, setCoupons, setBanners, setAnnouncements, setHomeContent, setSettings, setRecipes, setReviews]);

  const value = useMemo(() => ({
    apiMode: API_MODE, status, adminLoaded, saving, refreshCatalog, loadAdminData,
    products, activeProducts, getProduct, getBySlug, setProducts,
    saveProduct, upsertProduct, patchProduct, deleteProduct, bulkProducts, updateStock, restockLow,
    categories, setCategories, saveCategory, deleteCategory,
    recipes, setRecipes, patchRecipe, activeRecipes: recipes.filter((r) => r.active !== false),
    coupons, setCoupons, saveCoupon, toggleCoupon, deleteCoupon,
    banners, setBanners, announcements, setAnnouncements, homeContent, setHomeContent, saveContent,
    settings, setSettings, saveSettings,
    reviews, setReviews, addReview, adminAddReview, patchReview, deleteReview, removeSampleReviews, markReviewsSeen, isSampleReview,
    resetStore,
  }), [status, adminLoaded, saving, refreshCatalog, loadAdminData, products, activeProducts, getProduct, getBySlug, setProducts, saveProduct, upsertProduct, patchProduct, deleteProduct,
    bulkProducts, updateStock, restockLow, categories, setCategories, saveCategory, deleteCategory, recipes, setRecipes, patchRecipe, coupons, setCoupons, saveCoupon, toggleCoupon,
    deleteCoupon, banners, setBanners, announcements, setAnnouncements, homeContent, setHomeContent, saveContent, settings, setSettings, saveSettings, reviews, setReviews,
    addReview, adminAddReview, patchReview, deleteReview, removeSampleReviews, markReviewsSeen, resetStore]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
