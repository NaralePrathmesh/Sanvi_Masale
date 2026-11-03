import { Router } from 'express';
import { z } from 'zod';
import { prisma, ah, errors, audit } from '../lib/core.js';
import { validate, zText, zPin, zPhoneIN, zId, zEmail } from '../lib/validate.js';
import { limits } from '../middleware/rateLimit.js';
import { requireAuth, requireCustomer } from '../auth/middleware.js';
import { publicUser } from '../auth/routes.js';
import { revokeAllForUser, forgetUser } from '../auth/tokens.js';
import { placeOrder, changeStatus, serializeOrder, orderInclude } from '../services/orders.js';
import { CUSTOMER_CANCELLABLE } from '../config/store.js';
import { quoteSchema } from './public.js';

/** Everything here belongs to the signed-in customer only — every query is scoped by req.user.id. */
export const accountRouter = Router();
accountRouter.use(requireAuth, requireCustomer);

/* ─── Profile ─── */
accountRouter.patch('/profile', validate({ body: z.object({ name: zText(80).min(2) }) }), ah(async (req, res) => {
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { name: req.body.name } });
  await forgetUser(user.id);
  res.json({ user: publicUser(user) });
}));

/** Right to erasure: anonymise the account, keep order records (tax/legal), revoke all sessions. */
accountRouter.delete('/', ah(async (req, res) => {
  const id = req.user.id;
  await prisma.$transaction([
    prisma.address.deleteMany({ where: { userId: id } }),
    prisma.wishlistItem.deleteMany({ where: { userId: id } }),
    prisma.user.update({ where: { id }, data: { name: 'Deleted user', email: null, phone: null, emailVerified: false, phoneVerified: false, status: 'BLOCKED' } }),
  ]);
  await revokeAllForUser(id);
  audit(req, 'account.deleted', 'user', id);
  res.status(204).end();
}));

/* ─── Addresses ─── */
const address = z.object({
  label: zText(30).optional(), name: zText(80).min(2), phone: zPhoneIN, house: zText(120).min(1), street: zText(160).min(1), area: zText(120).min(1),
  landmark: zText(120).optional().default(''), city: zText(60).min(2), state: zText(60).min(2), pin: zPin, isDefault: z.boolean().optional().default(false),
});
const serializeAddress = (a) => ({ id: a.id, label: a.label || '', name: a.name, phone: a.phone, house: a.house, street: a.street, area: a.area, landmark: a.landmark || '', city: a.city, state: a.state, pin: a.pin, isDefault: a.isDefault });

accountRouter.get('/addresses', ah(async (req, res) => {
  const rows = await prisma.address.findMany({ where: { userId: req.user.id }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }] });
  res.json({ addresses: rows.map(serializeAddress) });
}));
accountRouter.post('/addresses', validate({ body: address }), ah(async (req, res) => {
  const count = await prisma.address.count({ where: { userId: req.user.id } });
  if (count >= 10) throw errors.badRequest('You can save up to 10 addresses.');
  const isDefault = req.body.isDefault || count === 0;
  const a = await prisma.$transaction(async (tx) => {
    if (isDefault) await tx.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    return tx.address.create({ data: { ...req.body, isDefault, userId: req.user.id } });
  });
  res.status(201).json({ address: serializeAddress(a) });
}));
accountRouter.put('/addresses/:id', validate({ params: z.object({ id: zId }), body: address }), ah(async (req, res) => {
  const own = await prisma.address.findFirst({ where: { id: req.params.id, userId: req.user.id } });
  if (!own) throw errors.notFound('Address not found');
  const a = await prisma.$transaction(async (tx) => {
    if (req.body.isDefault) await tx.address.updateMany({ where: { userId: req.user.id }, data: { isDefault: false } });
    return tx.address.update({ where: { id: own.id }, data: req.body });
  });
  res.json({ address: serializeAddress(a) });
}));
accountRouter.delete('/addresses/:id', validate({ params: z.object({ id: zId }) }), ah(async (req, res) => {
  const r = await prisma.address.deleteMany({ where: { id: req.params.id, userId: req.user.id } });
  if (!r.count) throw errors.notFound('Address not found');
  res.status(204).end();
}));

/* ─── Wishlist ─── */
accountRouter.get('/wishlist', ah(async (req, res) => {
  const rows = await prisma.wishlistItem.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'asc' } });
  res.json({ productIds: rows.map((r) => r.productId) });
}));
accountRouter.put('/wishlist/:productId', validate({ params: z.object({ productId: zId }) }), ah(async (req, res) => {
  if (!(await prisma.product.findUnique({ where: { id: req.params.productId }, select: { id: true } }))) throw errors.notFound('Product not found');
  if ((await prisma.wishlistItem.count({ where: { userId: req.user.id } })) >= 200) throw errors.badRequest('Wishlist is full.');
  await prisma.wishlistItem.upsert({ where: { userId_productId: { userId: req.user.id, productId: req.params.productId } }, create: { userId: req.user.id, productId: req.params.productId }, update: {} });
  res.status(204).end();
}));
accountRouter.delete('/wishlist/:productId', validate({ params: z.object({ productId: zId }) }), ah(async (req, res) => {
  await prisma.wishlistItem.deleteMany({ where: { userId: req.user.id, productId: req.params.productId } });
  res.status(204).end();
}));
/** Merge a guest wishlist from the browser after sign-in. */
accountRouter.post('/wishlist/merge', validate({ body: z.object({ productIds: z.array(zId).max(200) }) }), ah(async (req, res) => {
  const valid = await prisma.product.findMany({ where: { id: { in: req.body.productIds } }, select: { id: true } });
  await prisma.wishlistItem.createMany({ data: valid.map((p) => ({ userId: req.user.id, productId: p.id })), skipDuplicates: true });
  const rows = await prisma.wishlistItem.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'asc' } });
  res.json({ productIds: rows.map((r) => r.productId) });
}));

/* ─── Orders ─── */
const checkout = quoteSchema.extend({
  paymentMethod: z.enum(['cod', 'upi', 'card', 'netbanking']),
  paymentInfo: zText(60).optional(), // display hint only (e.g. "•••• 4242") — card numbers must never be sent
  customer: z.object({ name: zText(80).min(2), phone: zPhoneIN, email: zEmail.optional().or(z.literal('').transform(() => undefined)) }),
  address: address.omit({ isDefault: true, label: true, name: true, phone: true }),
  saveAddress: z.boolean().optional().default(false),
});

accountRouter.post('/orders', limits.orders, validate({ body: checkout }), ah(async (req, res) => {
  const key = req.get('idempotency-key');
  if (key && !/^[\w-]{8,64}$/.test(key)) throw errors.badRequest('Invalid Idempotency-Key header');
  if (req.body.paymentInfo && /\d{8,}/.test(req.body.paymentInfo.replace(/\s/g, ''))) throw errors.badRequest('Never send full card or account numbers.');
  const { order, replay } = await placeOrder(req.user, { ...req.body, pin: req.body.address.pin }, key);
  if (!replay && req.body.saveAddress) {
    const exists = await prisma.address.findFirst({ where: { userId: req.user.id, pin: req.body.address.pin, house: req.body.address.house } });
    const n = await prisma.address.count({ where: { userId: req.user.id } });
    if (!exists && n < 10) await prisma.address.create({ data: { ...req.body.address, name: req.body.customer.name, phone: req.body.customer.phone, userId: req.user.id, isDefault: n === 0 } });
  }
  res.status(replay ? 200 : 201).json({ order: serializeOrder(order), replay });
}));

accountRouter.get('/orders', ah(async (req, res) => {
  const rows = await prisma.order.findMany({ where: { userId: req.user.id }, include: orderInclude, orderBy: { createdAt: 'desc' }, take: 100 });
  res.json({ orders: rows.map(serializeOrder) });
}));

accountRouter.get('/orders/:id', validate({ params: z.object({ id: zId }) }), ah(async (req, res) => {
  const o = await prisma.order.findFirst({ where: { id: req.params.id.toUpperCase(), userId: req.user.id }, include: orderInclude });
  if (!o) throw errors.notFound('Order not found'); // same response whether it doesn't exist or isn't yours
  res.json({ order: serializeOrder(o) });
}));

accountRouter.post('/orders/:id/cancel', validate({ params: z.object({ id: zId }) }), ah(async (req, res) => {
  const o = await prisma.order.findFirst({ where: { id: req.params.id.toUpperCase(), userId: req.user.id }, select: { id: true, status: true } });
  if (!o) throw errors.notFound('Order not found');
  if (!CUSTOMER_CANCELLABLE.includes(o.status)) throw errors.conflict('This order is already being packed or shipped and can’t be cancelled online. Please contact us.');
  const updated = await changeStatus(o.id, 'cancelled', req.user.id, 'Cancelled by customer');
  res.json({ order: serializeOrder(updated) });
}));
