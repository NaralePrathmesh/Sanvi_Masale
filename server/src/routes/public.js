import { Router } from 'express';
import { z } from 'zod';
import { prisma, ah, errors } from '../lib/core.js';
import { validate, zEmail, zPhoneIN, zText, zPin, zId } from '../lib/validate.js';
import { limits } from '../middleware/rateLimit.js';
import { requireAuth, optionalAuth, requireCustomer } from '../auth/middleware.js';
import { getCatalog, getSettings, serializeReview } from '../services/catalog.js';
import { quote, checkPincode } from '../services/pricing.js';
import { MAX_QTY_PER_LINE } from '../config/store.js';

export const publicRouter = Router();

/** Everything the storefront needs in one cached document (products, categories, recipes, content, settings). */
publicRouter.get('/catalog', ah(async (req, res) => {
  const { ver, body } = await getCatalog();
  res.set('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
  res.set('X-Catalog-Version', ver);
  res.type('application/json').send(body); // Express adds an ETag → 304 when unchanged
}));

publicRouter.get('/products/:slug', validate({ params: z.object({ slug: z.string().max(120) }) }), ah(async (req, res) => {
  const { body } = await getCatalog();
  const p = JSON.parse(body).products.find((x) => x.slug === req.params.slug);
  if (!p) throw errors.notFound('Product not found');
  res.set('Cache-Control', 'public, max-age=30');
  res.json({ product: p });
}));

publicRouter.get('/pincode/:pin', validate({ params: z.object({ pin: zPin }) }), ah(async (req, res) => {
  res.json(checkPincode(req.params.pin, await getSettings()));
}));

const cartItem = z.object({ productId: zId, size: zText(40).min(1), qty: z.coerce.number().int().min(1).max(MAX_QTY_PER_LINE), comboId: zText(64).optional() });
export const quoteSchema = z.object({
  items: z.array(cartItem).min(1).max(40),
  couponCode: zText(20).optional().default(''),
  deliveryMethod: z.enum(['standard', 'express']).default('standard'),
  paymentMethod: z.enum(['cod', 'upi', 'card', 'netbanking']).optional(),
  pin: zPin.optional(),
});
/** Authoritative cart pricing (used for the cart, coupon checks and checkout summary). */
publicRouter.post('/cart/quote', optionalAuth, validate({ body: quoteSchema }), ah(async (req, res) => {
  const q = await quote({ ...req.body, settings: await getSettings(), userId: req.user?.id });
  res.json({ lines: q.lines.map(({ packId, stock, ...l }) => ({ ...l, maxQty: Math.min(MAX_QTY_PER_LINE, stock) })), issues: q.issues, totals: q.totals, pin: q.pin });
}));

/* ─── Reviews ─── */
publicRouter.get('/reviews', ah(async (req, res) => {
  const rows = await prisma.review.findMany({ where: { hidden: false }, orderBy: [{ pinned: 'desc' }, { sortOrder: 'asc' }, { createdAt: 'desc' }], take: 300 });
  res.set('Cache-Control', 'public, max-age=30');
  res.json({ reviews: rows.map((r) => serializeReview(r)) });
}));

/** Only signed-in, verified customers can post reviews (no anonymous spam). */
publicRouter.post('/reviews', requireAuth, requireCustomer, limits.forms, validate({ body: z.object({
  name: zText(60).min(2), city: zText(40).optional().default(''), product: z.string().trim().max(120).optional().default(''),
  rating: z.coerce.number().int().min(1).max(5), text: zText(400).min(10),
}) }), ah(async (req, res) => {
  const recent = await prisma.review.count({ where: { userId: req.user.id, createdAt: { gt: new Date(Date.now() - 86_400_000) } } });
  if (recent >= 3) throw errors.tooMany('You can post up to 3 reviews per day.');
  const b = req.body;
  if (b.product && !(await prisma.product.findUnique({ where: { slug: b.product }, select: { id: true } }))) b.product = '';
  const r = await prisma.review.create({ data: { userId: req.user.id, name: b.name, city: b.city || null, productSlug: b.product || null, rating: b.rating, text: b.text, source: 'CUSTOMER' } });
  res.status(201).json({ review: serializeReview(r) });
}));

/* ─── Forms ─── */
publicRouter.post('/newsletter', limits.forms, validate({ body: z.object({ email: zEmail }) }), ah(async (req, res) => {
  await prisma.newsletterSubscriber.upsert({ where: { email: req.body.email }, create: { email: req.body.email }, update: {} });
  res.status(201).json({ ok: true });
}));

const enquiry = z.object({
  type: z.enum(['contact', 'bulk']).default('contact'),
  name: zText(80).min(2), email: zEmail, phone: zPhoneIN.optional().or(z.literal('').transform(() => undefined)),
  subject: zText(120).optional(), message: zText(2000).min(10),
  meta: z.object({ company: zText(120).optional(), city: zText(80).optional(), quantity: zText(80).optional(), products: zText(300).optional() }).optional(),
});
publicRouter.post('/enquiries', limits.forms, validate({ body: enquiry }), ah(async (req, res) => {
  const b = req.body;
  await prisma.enquiry.create({ data: { type: b.type === 'bulk' ? 'BULK' : 'CONTACT', name: b.name, email: b.email, phone: b.phone || null, subject: b.subject || null, message: b.message, meta: b.meta } });
  res.status(201).json({ ok: true });
}));
