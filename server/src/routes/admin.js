import { Router } from 'express';
import multer from 'multer';
import argon2 from 'argon2';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { config } from '../config/env.js';
import { prisma, ah, errors, audit } from '../lib/core.js';
import { validate, zText, zI18n, zId, zSlug, zEmail, zPage } from '../lib/validate.js';
import { limits } from '../middleware/rateLimit.js';
import { requireAuth, requireStaff, requirePermission as can } from '../auth/middleware.js';
import { publicUser } from '../auth/routes.js';
import { revokeAllForUser, forgetUser } from '../auth/tokens.js';
import { serializeProduct, serializeCategory, serializeRecipe, serializeCoupon, serializeReview, getBlock, setBlock, getSettings, bumpCatalog } from '../services/catalog.js';
import { changeStatus, serializeOrder, orderInclude } from '../services/orders.js';
import { createUploadTicket, verifyUploaded, saveLocal, provider } from '../services/storage.js';
import { DEFAULT_SETTINGS, ORDER_FLOW } from '../config/store.js';

/**
 * Admin API — every route requires a signed-in staff account AND a specific permission.
 * All writes are rate limited per admin and recorded in the audit log.
 */
export const adminRouter = Router();
adminRouter.use(requireAuth, requireStaff);
adminRouter.use((req, res, next) => (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? limits.adminWrite(req, res, next) : next()));

const idParam = { params: z.object({ id: zId }) };

/* ═══ Dashboard ═══ */
adminRouter.get('/dashboard', can('dashboard:read'), ah(async (req, res) => {
  const settings = await getSettings();
  const since = new Date(); since.setMonth(since.getMonth() - 5, 1); since.setHours(0, 0, 0, 0);
  const [monthly, byStatus, top, low, customers, recentOrders, latestReviews, pendingReviews] = await Promise.all([
    prisma.$queryRaw`SELECT to_char(date_trunc('month', "createdAt" AT TIME ZONE 'Asia/Kolkata'), 'Mon') AS month,
        date_trunc('month', "createdAt" AT TIME ZONE 'Asia/Kolkata') AS m, SUM(total)::int AS sales, COUNT(*)::int AS orders
      FROM "Order" WHERE status <> 'cancelled' AND "createdAt" >= ${since} GROUP BY 1, 2 ORDER BY 2`,
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.$queryRaw`SELECT oi."productId" AS "productId", SUM(oi.qty)::int AS units FROM "OrderItem" oi JOIN "Order" o ON o.id = oi."orderId"
      WHERE o.status <> 'cancelled' GROUP BY 1 ORDER BY 2 DESC LIMIT 5`,
    prisma.productPack.findMany({ where: { stock: { lte: settings.lowStockThreshold } }, include: { product: { select: { id: true, name: true, slug: true } } }, orderBy: { stock: 'asc' }, take: 8 }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.findMany({ include: orderInclude, orderBy: { createdAt: 'desc' }, take: 6 }),
    prisma.review.findMany({ where: { hidden: false }, orderBy: { createdAt: 'desc' }, take: 3 }),
    prisma.review.count({ where: { source: 'CUSTOMER', seen: false } }),
  ]);
  res.json({
    monthly: monthly.map((m) => ({ month: m.month, sales: m.sales, orders: m.orders })),
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count._all])),
    top, low: low.map((k) => ({ productId: k.productId, name: k.product.name, slug: k.product.slug, size: k.size, stock: k.stock })),
    customers, recentOrders: recentOrders.map(serializeOrder), latestReviews: latestReviews.map((r) => serializeReview(r, true)), pendingReviews,
  });
}));

/* ═══ Products & categories ═══ */
const pack = z.object({ size: zText(40).min(1), grams: z.coerce.number().int().min(0).max(100_000).default(0), price: z.coerce.number().int().min(1).max(1_000_000), mrp: z.coerce.number().int().min(0).max(1_000_000), stock: z.coerce.number().int().min(0).max(1_000_000) })
  .refine((p) => !p.mrp || p.mrp >= p.price, { message: 'MRP cannot be lower than the price', path: ['mrp'] });
const strList = (n = 30) => z.array(zText(60)).max(n).default([]);
const productBody = z.object({
  slug: zSlug, sku: zText(40).min(1), category: zId, type: zText(20).default('blend'), region: zText(30).default('pan-india'),
  color: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).max(2).default(['#A92324', '#E5A52B']),
  name: zI18n(120), short: zI18n(400).optional(), description: zI18n(4000).optional(),
  packs: z.array(pack).min(1).max(12).refine((ps) => new Set(ps.map((p) => p.size)).size === ps.length, 'Pack sizes must be unique'),
  ingredients: strList(), dishes: strList(), tags: strList(), festivals: strList(10),
  images: z.array(z.string().trim().max(500).regex(/^(https?:\/\/|\/)/, 'Image URLs must start with https:// or /')).max(8).default([]),
  heat: z.coerce.number().int().min(0).max(5).default(2), popularity: z.coerce.number().int().min(0).max(100).default(50),
  bestseller: z.boolean().default(false), isNew: z.boolean().default(false), active: z.boolean().default(true),
});
const productData = (b) => ({
  slug: b.slug, sku: b.sku, categoryId: b.category, type: b.type, region: b.region, color: b.color, name: b.name, short: b.short, description: b.description,
  ingredients: b.ingredients, dishes: b.dishes, tags: b.tags, festivals: b.festivals, images: b.images, heat: b.heat, popularity: b.popularity,
  bestseller: b.bestseller, isNew: b.isNew, active: b.active,
});
const packData = (ps) => ps.map((p, i) => ({ ...p, mrp: p.mrp || p.price, sortOrder: i }));
const uniqueErr = (e) => { if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') throw errors.conflict(`Another product already uses this ${String(e.meta?.target || 'value').includes('sku') ? 'SKU' : 'URL slug'}.`); if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') throw errors.badRequest('Unknown category.'); throw e; };

adminRouter.get('/products', can('products:read'), ah(async (req, res) => {
  const rows = await prisma.product.findMany({ include: { packs: true }, orderBy: [{ createdAt: 'asc' }, { id: 'asc' }] });
  res.json({ products: rows.map(serializeProduct) });
}));
adminRouter.post('/products', can('products:write'), validate({ body: productBody }), ah(async (req, res) => {
  const p = await prisma.product.create({ data: { ...productData(req.body), packs: { create: packData(req.body.packs) } }, include: { packs: true } }).catch(uniqueErr);
  await bumpCatalog(); audit(req, 'product.create', 'product', p.id);
  res.status(201).json({ product: serializeProduct(p) });
}));
adminRouter.put('/products/:id', can('products:write'), validate({ ...idParam, body: productBody }), ah(async (req, res) => {
  const p = await prisma.$transaction(async (tx) => {
    if (!(await tx.product.findUnique({ where: { id: req.params.id }, select: { id: true } }))) throw errors.notFound('Product not found');
    await tx.product.update({ where: { id: req.params.id }, data: productData(req.body) });
    // Upsert packs by size (keeps pack ids stable), remove sizes that were deleted.
    const sizes = req.body.packs.map((x) => x.size);
    await tx.productPack.deleteMany({ where: { productId: req.params.id, size: { notIn: sizes } } });
    for (const k of packData(req.body.packs)) {
      await tx.productPack.upsert({ where: { productId_size: { productId: req.params.id, size: k.size } }, create: { ...k, productId: req.params.id }, update: k });
    }
    return tx.product.findUnique({ where: { id: req.params.id }, include: { packs: true } });
  }).catch(uniqueErr);
  await bumpCatalog(); audit(req, 'product.update', 'product', p.id);
  res.json({ product: serializeProduct(p) });
}));
adminRouter.patch('/products/:id', can('products:write'), validate({ ...idParam, body: z.object({ active: z.boolean().optional(), bestseller: z.boolean().optional(), isNew: z.boolean().optional() }) }), ah(async (req, res) => {
  const p = await prisma.product.update({ where: { id: req.params.id }, data: req.body, include: { packs: true } }).catch(() => { throw errors.notFound('Product not found'); });
  await bumpCatalog(); audit(req, 'product.patch', 'product', p.id, req.body);
  res.json({ product: serializeProduct(p) });
}));
adminRouter.post('/products/bulk', can('products:write'), validate({ body: z.object({ ids: z.array(zId).min(1).max(500), action: z.enum(['show', 'hide', 'bestseller_on', 'bestseller_off', 'delete']) }) }), ah(async (req, res) => {
  const { ids, action } = req.body;
  let count;
  if (action === 'delete') {
    count = (await prisma.$transaction([prisma.wishlistItem.deleteMany({ where: { productId: { in: ids } } }), prisma.product.deleteMany({ where: { id: { in: ids } } })]))[1].count;
  } else {
    const data = { show: { active: true }, hide: { active: false }, bestseller_on: { bestseller: true }, bestseller_off: { bestseller: false } }[action];
    count = (await prisma.product.updateMany({ where: { id: { in: ids } }, data })).count;
  }
  await bumpCatalog(); audit(req, `product.bulk_${action}`, 'product', null, { ids });
  res.json({ count });
}));
adminRouter.delete('/products/:id', can('products:write'), validate(idParam), ah(async (req, res) => {
  await prisma.$transaction([prisma.wishlistItem.deleteMany({ where: { productId: req.params.id } }), prisma.product.delete({ where: { id: req.params.id } })]).catch(() => { throw errors.notFound('Product not found'); });
  await bumpCatalog(); audit(req, 'product.delete', 'product', req.params.id);
  res.status(204).end();
}));

const categoryBody = z.object({ id: zSlug.optional(), name: zI18n(80), desc: zI18n(200).optional(), icon: zText(30).optional(), sortOrder: z.coerce.number().int().min(0).max(1000).default(0), active: z.boolean().default(true) });
adminRouter.get('/categories', can('products:read'), ah(async (_req, res) => {
  res.json({ categories: (await prisma.category.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }], include: { _count: { select: { products: true } } } })).map((c) => ({ ...serializeCategory(c), productCount: c._count.products })) });
}));
adminRouter.post('/categories', can('products:write'), validate({ body: categoryBody }), ah(async (req, res) => {
  const { id, ...rest } = req.body;
  const slug = id || rest.name.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!slug) throw errors.badRequest('Category name is required');
  const c = await prisma.category.create({ data: { id: slug, ...rest } }).catch(() => { throw errors.conflict('A category with this id already exists.'); });
  await bumpCatalog(); audit(req, 'category.create', 'category', c.id);
  res.status(201).json({ category: serializeCategory(c) });
}));
adminRouter.put('/categories/:id', can('products:write'), validate({ params: z.object({ id: zSlug }), body: categoryBody }), ah(async (req, res) => {
  const { id: _ignored, ...rest } = req.body;
  const c = await prisma.category.update({ where: { id: req.params.id }, data: rest }).catch(() => { throw errors.notFound('Category not found'); });
  await bumpCatalog(); audit(req, 'category.update', 'category', c.id);
  res.json({ category: serializeCategory(c) });
}));
adminRouter.delete('/categories/:id', can('products:write'), validate({ params: z.object({ id: zSlug }) }), ah(async (req, res) => {
  if (await prisma.product.count({ where: { categoryId: req.params.id } })) throw errors.conflict('Move or delete this category’s products first.');
  await prisma.category.delete({ where: { id: req.params.id } }).catch(() => { throw errors.notFound('Category not found'); });
  await bumpCatalog(); audit(req, 'category.delete', 'category', req.params.id);
  res.status(204).end();
}));

/* ═══ Inventory ═══ */
adminRouter.patch('/inventory', can('inventory:write'), validate({ body: z.object({ updates: z.array(z.object({ productId: zId, size: zText(40), stock: z.coerce.number().int().min(0).max(1_000_000).optional(), delta: z.coerce.number().int().min(-1_000_000).max(1_000_000).optional() })
  .refine((u) => u.stock !== undefined || u.delta !== undefined, 'Provide stock or delta')).min(1).max(500) }) }), ah(async (req, res) => {
  const results = [];
  await prisma.$transaction(async (tx) => {
    for (const u of req.body.updates) {
      if (u.stock !== undefined) {
        const r = await tx.productPack.updateMany({ where: { productId: u.productId, size: u.size }, data: { stock: u.stock } });
        if (!r.count) throw errors.notFound(`Pack ${u.productId} ${u.size} not found`);
      } else {
        // Atomic delta that can never take stock below zero.
        const n = await tx.$executeRaw`UPDATE "ProductPack" SET stock = GREATEST(stock + ${u.delta}, 0) WHERE "productId" = ${u.productId} AND size = ${u.size}`;
        if (!n) throw errors.notFound(`Pack ${u.productId} ${u.size} not found`);
      }
      const k = await tx.productPack.findUnique({ where: { productId_size: { productId: u.productId, size: u.size } } });
      results.push({ productId: u.productId, size: u.size, stock: k.stock });
    }
  });
  await bumpCatalog(); audit(req, 'inventory.update', 'inventory', null, { count: results.length });
  res.json({ packs: results });
}));
adminRouter.post('/inventory/restock-low', can('inventory:write'), validate({ body: z.object({ amount: z.coerce.number().int().min(1).max(100_000).default(100) }) }), ah(async (req, res) => {
  const { lowStockThreshold } = await getSettings();
  const r = await prisma.productPack.updateMany({ where: { stock: { lte: lowStockThreshold } }, data: { stock: { increment: req.body.amount } } });
  await bumpCatalog(); audit(req, 'inventory.restock_low', 'inventory', null, { count: r.count, amount: req.body.amount });
  res.json({ count: r.count });
}));

/* ═══ Orders ═══ */
adminRouter.get('/orders', can('orders:read'), validate({ query: zPage.extend({ status: z.enum([...ORDER_FLOW, 'cancelled']).optional(), payment: z.enum(['cod', 'upi', 'card', 'netbanking']).optional(), q: zText(80).optional() }) }), ah(async (req, res) => {
  const { page, limit, status, payment, q } = req.query;
  const where = {
    ...(status ? { status } : {}), ...(payment ? { paymentMethod: payment } : {}),
    ...(q ? { OR: [{ id: { contains: q.toUpperCase() } }, { customer: { path: ['name'], string_contains: q } }, { customer: { path: ['phone'], string_contains: q } }, { customer: { path: ['email'], string_contains: q.toLowerCase() } }] } : {}),
  };
  const [rows, total, counts] = await Promise.all([
    prisma.order.findMany({ where, include: orderInclude, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.order.count({ where }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);
  res.json({ orders: rows.map(serializeOrder), total, page, limit, counts: Object.fromEntries(counts.map((c) => [c.status, c._count._all])) });
}));
adminRouter.get('/orders/:id', can('orders:read'), validate(idParam), ah(async (req, res) => {
  const o = await prisma.order.findUnique({ where: { id: req.params.id.toUpperCase() }, include: orderInclude });
  if (!o) throw errors.notFound('Order not found');
  res.json({ order: serializeOrder(o) });
}));
adminRouter.patch('/orders/:id/status', can('orders:write'), validate({ ...idParam, body: z.object({ status: z.enum([...ORDER_FLOW, 'cancelled']), note: zText(200).optional() }) }), ah(async (req, res) => {
  const o = await changeStatus(req.params.id.toUpperCase(), req.body.status, req.user.id, req.body.note);
  audit(req, 'order.status', 'order', o.id, { status: req.body.status });
  res.json({ order: serializeOrder(o) });
}));
adminRouter.patch('/orders/:id/payment', can('orders:write'), validate({ ...idParam, body: z.object({ paymentStatus: z.enum(['PENDING', 'COD_PENDING', 'PAID', 'FAILED', 'REFUNDED']) }) }), ah(async (req, res) => {
  const o = await prisma.order.update({ where: { id: req.params.id.toUpperCase() }, data: { paymentStatus: req.body.paymentStatus }, include: orderInclude }).catch(() => { throw errors.notFound('Order not found'); });
  audit(req, 'order.payment', 'order', o.id, req.body);
  res.json({ order: serializeOrder(o) });
}));

/* ═══ Customers ═══ */
adminRouter.get('/customers', can('customers:read'), validate({ query: zPage.extend({ q: zText(80).optional() }) }), ah(async (req, res) => {
  const { page, limit, q } = req.query;
  const where = { role: 'CUSTOMER', ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q.toLowerCase() } }, { phone: { contains: q } }] } : {}) };
  const [users, total] = await Promise.all([
    prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.user.count({ where }),
  ]);
  const stats = users.length ? await prisma.order.groupBy({ by: ['userId'], where: { userId: { in: users.map((u) => u.id) }, status: { not: 'cancelled' } }, _count: { _all: true }, _sum: { total: true } }) : [];
  const byUser = Object.fromEntries(stats.map((s) => [s.userId, { orders: s._count._all, spent: s._sum.total || 0 }]));
  res.json({ customers: users.map((u) => ({ ...publicUser(u), status: u.status, lastLoginAt: u.lastLoginAt, ...(byUser[u.id] || { orders: 0, spent: 0 }) })), total, page, limit });
}));
adminRouter.get('/customers/:id', can('customers:read'), validate(idParam), ah(async (req, res) => {
  const u = await prisma.user.findFirst({ where: { id: req.params.id, role: 'CUSTOMER' }, include: { orders: { include: orderInclude, orderBy: { createdAt: 'desc' } }, addresses: true } });
  if (!u) throw errors.notFound('Customer not found');
  res.json({ customer: { ...publicUser(u), status: u.status, lastLoginAt: u.lastLoginAt, addresses: u.addresses.map(({ userId, ...a }) => a) }, orders: u.orders.map(serializeOrder) });
}));
adminRouter.patch('/customers/:id', can('customers:write'), validate({ ...idParam, body: z.object({ status: z.enum(['ACTIVE', 'BLOCKED']) }) }), ah(async (req, res) => {
  const u = await prisma.user.findFirst({ where: { id: req.params.id, role: 'CUSTOMER' } });
  if (!u) throw errors.notFound('Customer not found');
  const updated = await prisma.user.update({ where: { id: u.id }, data: { status: req.body.status } });
  if (req.body.status === 'BLOCKED') await revokeAllForUser(u.id); else await forgetUser(u.id);
  audit(req, 'customer.status', 'user', u.id, req.body);
  res.json({ customer: { ...publicUser(updated), status: updated.status } });
}));

/* ═══ Coupons ═══ */
const ymd = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');
const couponBody = z.object({
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{3,15}$/, '3–15 letters or numbers'), type: z.enum(['percent', 'flat']), value: z.coerce.number().int().min(1).max(100_000),
  minOrder: z.coerce.number().int().min(0).max(1_000_000).default(0), maxDiscount: z.coerce.number().int().min(0).max(1_000_000).default(0),
  validFrom: ymd.optional(), validTo: ymd, active: z.boolean().default(true), description: zI18n(200).optional(),
  usageLimit: z.coerce.number().int().min(1).max(10_000_000).nullable().optional(), perUserLimit: z.coerce.number().int().min(1).max(1000).nullable().optional(),
}).refine((c) => c.type !== 'percent' || c.value <= 90, { message: 'Percentage must be 90 or less', path: ['value'] })
  .refine((c) => !c.validFrom || c.validTo >= c.validFrom, { message: 'End date must be after the start date', path: ['validTo'] });
adminRouter.get('/coupons', can('coupons:write'), ah(async (_req, res) => {
  res.json({ coupons: (await prisma.coupon.findMany({ orderBy: { createdAt: 'asc' } })).map((c) => serializeCoupon(c, true)) });
}));
adminRouter.post('/coupons', can('coupons:write'), validate({ body: couponBody }), ah(async (req, res) => {
  const c = await prisma.coupon.create({ data: req.body }).catch(() => { throw errors.conflict('A coupon with this code already exists.'); });
  await bumpCatalog(); audit(req, 'coupon.create', 'coupon', c.code);
  res.status(201).json({ coupon: serializeCoupon(c, true) });
}));
adminRouter.put('/coupons/:code', can('coupons:write'), validate({ params: z.object({ code: z.string().regex(/^[A-Z0-9]{3,15}$/) }), body: couponBody }), ah(async (req, res) => {
  const { code, ...rest } = req.body;
  if (code !== req.params.code) throw errors.badRequest('Coupon codes cannot be renamed. Create a new coupon instead.');
  const c = await prisma.coupon.update({ where: { code }, data: rest }).catch(() => { throw errors.notFound('Coupon not found'); });
  await bumpCatalog(); audit(req, 'coupon.update', 'coupon', c.code);
  res.json({ coupon: serializeCoupon(c, true) });
}));
adminRouter.patch('/coupons/:code', can('coupons:write'), validate({ params: z.object({ code: z.string().regex(/^[A-Z0-9]{3,15}$/) }), body: z.object({ active: z.boolean() }) }), ah(async (req, res) => {
  const c = await prisma.coupon.update({ where: { code: req.params.code }, data: req.body }).catch(() => { throw errors.notFound('Coupon not found'); });
  await bumpCatalog(); audit(req, 'coupon.toggle', 'coupon', c.code, req.body);
  res.json({ coupon: serializeCoupon(c, true) });
}));
adminRouter.delete('/coupons/:code', can('coupons:write'), validate({ params: z.object({ code: z.string().regex(/^[A-Z0-9]{3,15}$/) }) }), ah(async (req, res) => {
  await prisma.coupon.delete({ where: { code: req.params.code } }).catch(() => { throw errors.notFound('Coupon not found'); });
  await bumpCatalog(); audit(req, 'coupon.delete', 'coupon', req.params.code);
  res.status(204).end();
}));

/* ═══ Content (banners, announcement bar, homepage) & recipes ═══ */
const banner = z.object({
  id: zId, active: z.boolean().default(true), image: z.string().trim().max(500).regex(/^(https?:\/\/|\/)/).nullable().optional(), art: zText(30).optional(), link: z.string().trim().max(200).regex(/^\//, 'Links must start with /').default('/shop'),
  eyebrow: zI18n(120).partial().optional(), title: zI18n(160).partial(), subtitle: zI18n(300).partial().optional(),
});
const CONTENT = {
  banners: z.array(banner).max(10),
  announcements: z.array(zI18n(160).partial()).max(5),
  homeContent: z.object({
    featuredProductIds: z.array(zId).max(24).default([]),
    sections: z.record(z.string().max(30), z.boolean()).default({}),
    promo: z.object({ active: z.boolean(), title: zI18n(120).partial(), text: zI18n(300).partial() }).optional(),
  }),
};
adminRouter.get('/content/:key', can('content:write'), validate({ params: z.object({ key: z.enum(Object.keys(CONTENT)) }) }), ah(async (req, res) => {
  res.json({ value: await getBlock(req.params.key, req.params.key === 'homeContent' ? {} : []) });
}));
adminRouter.put('/content/:key', can('content:write'), validate({ params: z.object({ key: z.enum(Object.keys(CONTENT)) }) }), ah(async (req, res) => {
  const r = CONTENT[req.params.key].safeParse(req.body?.value);
  if (!r.success) throw errors.badRequest('Please check the content fields', r.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })));
  await setBlock(req.params.key, r.data, req.user.id);
  audit(req, 'content.update', 'content', req.params.key);
  res.json({ value: r.data });
}));

adminRouter.get('/recipes', can('content:write'), ah(async (_req, res) => {
  res.json({ recipes: (await prisma.recipe.findMany({ orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }] })).map(serializeRecipe) });
}));
adminRouter.patch('/recipes/:id', can('content:write'), validate({ ...idParam, body: z.object({ active: z.boolean().optional(), featured: z.boolean().optional(), name: zI18n(120).partial().optional() }) }), ah(async (req, res) => {
  const r = await prisma.recipe.findUnique({ where: { id: req.params.id } });
  if (!r) throw errors.notFound('Recipe not found');
  const { name, ...flags } = req.body;
  const updated = await prisma.recipe.update({ where: { id: r.id }, data: { ...flags, ...(name ? { data: { ...r.data, name: { ...r.data.name, ...name } } } : {}) } });
  await bumpCatalog(); audit(req, 'recipe.update', 'recipe', r.id);
  res.json({ recipe: serializeRecipe(updated) });
}));

/* ═══ Reviews ═══ */
const reviewBody = z.object({ name: zText(60).min(2), city: zText(40).optional().default(''), product: z.string().trim().max(120).optional().default(''), rating: z.coerce.number().int().min(1).max(5), text: zText(400).min(5), time: zText(20).optional() });
adminRouter.get('/reviews', can('reviews:moderate'), ah(async (_req, res) => {
  res.json({ reviews: (await prisma.review.findMany({ orderBy: [{ pinned: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }] })).map((r) => serializeReview(r, true)) });
}));
adminRouter.post('/reviews', can('reviews:moderate'), validate({ body: reviewBody }), ah(async (req, res) => {
  const b = req.body;
  const r = await prisma.review.create({ data: { name: b.name, city: b.city || null, productSlug: b.product || null, rating: b.rating, text: b.text, time: b.time || null, source: 'ADMIN', seen: true } });
  audit(req, 'review.create', 'review', r.id);
  res.status(201).json({ review: serializeReview(r, true) });
}));
adminRouter.patch('/reviews/:id', can('reviews:moderate'), validate({ ...idParam, body: reviewBody.partial().extend({ hidden: z.boolean().optional(), pinned: z.boolean().optional(), seen: z.boolean().optional() }) }), ah(async (req, res) => {
  const { product, ...rest } = req.body;
  const r = await prisma.review.update({ where: { id: req.params.id }, data: { ...rest, ...(product !== undefined ? { productSlug: product || null } : {}) } }).catch(() => { throw errors.notFound('Review not found'); });
  audit(req, 'review.update', 'review', r.id, { hidden: req.body.hidden, pinned: req.body.pinned });
  res.json({ review: serializeReview(r, true) });
}));
adminRouter.post('/reviews/mark-seen', can('reviews:moderate'), ah(async (_req, res) => {
  res.json({ count: (await prisma.review.updateMany({ where: { seen: false }, data: { seen: true } })).count });
}));
adminRouter.post('/reviews/remove-samples', can('reviews:moderate'), ah(async (req, res) => {
  const r = await prisma.review.deleteMany({ where: { source: 'SAMPLE' } });
  audit(req, 'review.remove_samples', 'review', null, { count: r.count });
  res.json({ count: r.count });
}));
adminRouter.delete('/reviews/:id', can('reviews:moderate'), validate(idParam), ah(async (req, res) => {
  await prisma.review.delete({ where: { id: req.params.id } }).catch(() => { throw errors.notFound('Review not found'); });
  audit(req, 'review.delete', 'review', req.params.id);
  res.status(204).end();
}));

/* ═══ Settings ═══ */
const phone = z.string().trim().regex(/^\+?[\d\s-]{10,16}$/, 'Enter a phone number with country code, e.g. +91 98765 43210');
const settingsBody = z.object({
  storeName: zText(80).min(1), supportEmail: zEmail, supportPhone: phone, whatsapp: phone, address: zText(300), gstin: zText(30),
  defaultLanguage: z.enum(['en', 'hi', 'mr']),
  deliveryCharge: z.coerce.number().int().min(0).max(10_000), expressDeliveryCharge: z.coerce.number().int().min(0).max(10_000),
  freeShippingThreshold: z.coerce.number().int().min(0).max(1_000_000), codCharge: z.coerce.number().int().min(0).max(10_000),
  standardDeliveryDays: z.coerce.number().int().min(1).max(30), expressDeliveryDays: z.coerce.number().int().min(1).max(30),
  defaultTheme: z.enum(['classic', 'noir', 'fresh']), allowThemePicker: z.boolean(), lowStockThreshold: z.coerce.number().int().min(0).max(100_000),
}).partial();
adminRouter.get('/settings', can('dashboard:read'), ah(async (_req, res) => res.json({ settings: await getSettings() })));
adminRouter.put('/settings', can('settings:write'), validate({ body: settingsBody }), ah(async (req, res) => {
  const next = { ...DEFAULT_SETTINGS, ...(await getBlock('settings', {})), ...req.body };
  await setBlock('settings', next, req.user.id);
  audit(req, 'settings.update', 'settings', null, { keys: Object.keys(req.body) });
  res.json({ settings: next });
}));

/* ═══ Media (Cloudinary / Supabase / local) ═══ */
adminRouter.post('/media/sign', can('media:write'), limits.uploads, validate({ body: z.object({ folder: zText(20).default('misc'), contentType: zText(40), bytes: z.coerce.number().int().positive() }) }), ah(async (req, res) => {
  res.json(await createUploadTicket(req.body));
}));
adminRouter.post('/media', can('media:write'), limits.uploads, ah(async (req, res) => {
  const m = verifyUploaded(req.body || {});
  const asset = await prisma.mediaAsset.create({ data: { ...m, uploadedById: req.user.id } });
  audit(req, 'media.create', 'media', asset.id, { provider: m.provider });
  res.status(201).json({ asset });
}));
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: config.MAX_UPLOAD_MB * 1024 * 1024, files: 1, fields: 5 } });
adminRouter.post('/media/upload', can('media:write'), limits.uploads, (req, res, next) => {
  if (provider() !== 'local') return next(errors.badRequest(`Uploads go directly to ${provider()} — request /media/sign first.`));
  upload.single('file')(req, res, (err) => (err ? next(errors.badRequest(err.code === 'LIMIT_FILE_SIZE' ? `Images must be smaller than ${config.MAX_UPLOAD_MB} MB.` : 'Upload failed')) : next()));
}, ah(async (req, res) => {
  if (!req.file) throw errors.badRequest('Choose an image to upload.');
  const m = await saveLocal(req.file.buffer, String(req.body?.folder || 'misc'));
  const asset = await prisma.mediaAsset.create({ data: { ...m, uploadedById: req.user.id } });
  audit(req, 'media.create', 'media', asset.id, { provider: 'local' });
  res.status(201).json({ asset });
}));
adminRouter.get('/media', can('media:write'), ah(async (_req, res) => {
  res.json({ assets: await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }) });
}));

/* ═══ Enquiries & newsletter ═══ */
adminRouter.get('/enquiries', can('enquiries:read'), ah(async (_req, res) => {
  res.json({ enquiries: await prisma.enquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 300 }), subscribers: await prisma.newsletterSubscriber.count() });
}));
adminRouter.patch('/enquiries/:id', can('enquiries:read'), validate({ ...idParam, body: z.object({ handled: z.boolean() }) }), ah(async (req, res) => {
  res.json({ enquiry: await prisma.enquiry.update({ where: { id: req.params.id }, data: req.body }).catch(() => { throw errors.notFound('Enquiry not found'); }) });
}));

/* ═══ Staff accounts & audit (SUPER_ADMIN only) ═══ */
const strongPassword = z.string().min(12, 'At least 12 characters').max(128).regex(/[a-z]/, 'Add a lowercase letter').regex(/[A-Z]/, 'Add an uppercase letter').regex(/\d/, 'Add a number');
adminRouter.get('/staff', can('staff:manage'), ah(async (_req, res) => {
  const rows = await prisma.user.findMany({ where: { role: { not: 'CUSTOMER' } }, orderBy: { createdAt: 'asc' } });
  res.json({ staff: rows.map((u) => ({ ...publicUser(u), status: u.status, lastLoginAt: u.lastLoginAt })) });
}));
adminRouter.post('/staff', can('staff:manage'), validate({ body: z.object({ name: zText(80).min(2), email: zEmail, role: z.enum(['STAFF', 'ADMIN', 'SUPER_ADMIN']), password: strongPassword }) }), ah(async (req, res) => {
  const existing = await prisma.user.findUnique({ where: { email: req.body.email } });
  if (existing) throw errors.conflict('An account with this email already exists.');
  const u = await prisma.user.create({ data: { name: req.body.name, email: req.body.email, emailVerified: true, role: req.body.role, passwordHash: await argon2.hash(req.body.password, { type: argon2.argon2id }) } });
  audit(req, 'staff.create', 'user', u.id, { role: u.role });
  res.status(201).json({ staff: publicUser(u) });
}));
adminRouter.patch('/staff/:id', can('staff:manage'), validate({ ...idParam, body: z.object({ role: z.enum(['STAFF', 'ADMIN', 'SUPER_ADMIN']).optional(), status: z.enum(['ACTIVE', 'BLOCKED']).optional(), password: strongPassword.optional() }) }), ah(async (req, res) => {
  if (req.params.id === req.user.id && (req.body.role || req.body.status)) throw errors.badRequest('You cannot change your own role or status.');
  const u = await prisma.user.findFirst({ where: { id: req.params.id, role: { not: 'CUSTOMER' } } });
  if (!u) throw errors.notFound('Staff account not found');
  const data = { ...(req.body.role ? { role: req.body.role } : {}), ...(req.body.status ? { status: req.body.status } : {}), ...(req.body.password ? { passwordHash: await argon2.hash(req.body.password, { type: argon2.argon2id }) } : {}) };
  const updated = await prisma.user.update({ where: { id: u.id }, data });
  await revokeAllForUser(u.id); // any change to a staff account signs it out everywhere
  audit(req, 'staff.update', 'user', u.id, { role: req.body.role, status: req.body.status, passwordChanged: !!req.body.password });
  res.json({ staff: publicUser(updated) });
}));
adminRouter.get('/audit', can('audit:read'), validate({ query: zPage }), ah(async (req, res) => {
  const { page, limit } = req.query;
  res.json({ logs: await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }) });
}));
