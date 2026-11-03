import { prisma, kv, logger } from '../lib/core.js';
import { DEFAULT_SETTINGS, PUBLIC_SETTING_KEYS } from '../config/store.js';

/* ─── Serializers: database rows → the exact shapes the storefront already uses ─── */

export const serializePack = (k) => ({ id: k.id, size: k.size, grams: k.grams, price: k.price, mrp: k.mrp, stock: k.stock });
export const serializeProduct = (p) => ({
  id: p.id, slug: p.slug, sku: p.sku, category: p.categoryId, type: p.type, region: p.region, color: p.color,
  name: p.name, short: p.short || { en: '', hi: '', mr: '' }, ...(p.description ? { description: p.description } : {}),
  packs: [...(p.packs || [])].sort((a, b) => a.sortOrder - b.sortOrder || a.grams - b.grams).map(serializePack),
  ingredients: p.ingredients, dishes: p.dishes, tags: p.tags, festivals: p.festivals, images: p.images,
  rating: p.rating, reviews: p.reviewCount, popularity: p.popularity, heat: p.heat,
  bestseller: p.bestseller, isNew: p.isNew, active: p.active, createdAt: p.createdAt.toISOString().slice(0, 10),
});
export const serializeCategory = (c) => ({ id: c.id, name: c.name, desc: c.desc || { en: '', hi: '', mr: '' }, icon: c.icon || 'Sparkles', active: c.active, sortOrder: c.sortOrder });
export const serializeRecipe = (r) => ({ ...r.data, id: r.id, slug: r.slug, active: r.active, featured: r.featured });
export const serializeCoupon = (c, admin = false) => ({
  code: c.code, type: c.type, value: c.value, minOrder: c.minOrder, maxDiscount: c.maxDiscount, validFrom: c.validFrom, validTo: c.validTo,
  active: c.active, description: c.description || { en: '', hi: '', mr: '' },
  ...(admin ? { usageLimit: c.usageLimit, perUserLimit: c.perUserLimit, usedCount: c.usedCount } : {}),
});
export const serializeReview = (r, admin = false) => ({
  id: r.id, name: r.name, city: r.city || '', product: r.productSlug || '', rating: r.rating, text: r.text,
  time: r.time || new Date(r.createdAt).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).toLowerCase(),
  pinned: r.pinned, createdAt: r.createdAt, sample: r.source === 'SAMPLE',
  ...(admin ? { hidden: r.hidden, seen: r.seen, source: r.source.toLowerCase(), userId: r.userId } : { source: r.source === 'SAMPLE' ? undefined : r.source.toLowerCase() }),
});

/* ─── Content blocks (settings, banners, announcements, homeContent) ─── */

export async function getBlock(key, fallback) {
  const row = await prisma.contentBlock.findUnique({ where: { key } });
  return row ? row.value : fallback;
}
export async function setBlock(key, value, userId) {
  await prisma.contentBlock.upsert({ where: { key }, create: { key, value, updatedBy: userId }, update: { value, updatedBy: userId } });
  await bumpCatalog();
}
export async function getSettings() {
  const cached = await kv.get('cache:settings');
  if (cached) return JSON.parse(cached);
  const s = { ...DEFAULT_SETTINGS, ...(await getBlock('settings', {})) };
  await kv.set('cache:settings', JSON.stringify(s), 300);
  return s;
}
export const publicSettings = (s) => Object.fromEntries(PUBLIC_SETTING_KEYS.map((k) => [k, s[k]]));

/* ─── Cached public catalogue ─────────────────────────────────────────────
 * One JSON document with everything the storefront needs to render. Built once, stored in Redis,
 * memoised in-process for a few seconds and rebuilt only when an admin change (or stock change)
 * bumps the version. Concurrent rebuilds in one process are de-duplicated.
 */
const VERSION_KEY = 'cache:catalog:ver';
let memo = { ver: null, at: 0, body: null };
let building = null;

export async function bumpCatalog() {
  if (await kv.get(VERSION_KEY)) await kv.incr(VERSION_KEY); else await kv.set(VERSION_KEY, String(Date.now()));
  await kv.del('cache:settings');
  memo = { ver: null, at: 0, body: null };
}

async function buildCatalog() {
  const [products, categories, recipes, coupons, settings, banners, announcements, homeContent] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, include: { packs: true }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] }),
    prisma.category.findMany({ where: { active: true }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] }),
    prisma.recipe.findMany({ where: { active: true }, orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] }),
    prisma.coupon.findMany({ where: { active: true }, orderBy: { code: 'asc' } }),
    getSettings(),
    getBlock('banners', []),
    getBlock('announcements', []),
    getBlock('homeContent', {}),
  ]);
  return JSON.stringify({
    products: products.map(serializeProduct),
    categories: categories.map(serializeCategory),
    recipes: recipes.map(serializeRecipe),
    coupons: coupons.map((c) => serializeCoupon(c)),
    settings: publicSettings(settings),
    banners, announcements, homeContent,
    generatedAt: new Date().toISOString(),
  });
}

/** Returns { ver, body } where body is a JSON string ready to send. */
export async function getCatalog() {
  let ver = await kv.get(VERSION_KEY);
  if (!ver) { ver = String(Date.now()); await kv.set(VERSION_KEY, ver); }
  if (memo.ver === ver && Date.now() - memo.at < 5000) return memo;
  const cached = await kv.get(`cache:catalog:${ver}`);
  if (cached) { memo = { ver, at: Date.now(), body: cached }; return memo; }
  if (!building) {
    building = buildCatalog()
      .then(async (body) => { await kv.set(`cache:catalog:${ver}`, body, 600); memo = { ver, at: Date.now(), body }; return memo; })
      .catch((e) => { logger.error({ err: e.message }, 'catalog build failed'); throw e; })
      .finally(() => { building = null; });
  }
  return building;
}
