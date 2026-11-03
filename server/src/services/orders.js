import crypto from 'node:crypto';
import { Prisma } from '@prisma/client';
import { prisma, errors, AppError } from '../lib/core.js';
import { quote } from './pricing.js';
import { bumpCatalog, getSettings } from './catalog.js';
import { ORDER_FLOW } from '../config/store.js';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const newOrderId = () => {
  const d = new Date(Date.now() + 5.5 * 3600_000);
  const yymm = `${String(d.getUTCFullYear()).slice(2)}${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  const rnd = Array.from(crypto.randomBytes(6), (b) => ALPHABET[b % ALPHABET.length]).join('');
  return `SM${yymm}${rnd}`;
};

export const orderInclude = { items: true, events: { orderBy: { at: 'asc' } } };

/** Database order → the storefront's order shape. */
export const serializeOrder = (o) => ({
  id: o.id, customerId: o.userId, status: o.status, placedAt: o.createdAt,
  customer: o.customer, address: o.address,
  items: o.items.map((i) => ({ productId: i.productId, name: i.productName, size: i.size, qty: i.qty, price: i.price, mrp: i.mrp, comboPct: i.comboPct })),
  payment: o.paymentMethod, paymentStatus: o.paymentStatus, paymentInfo: o.paymentInfo || '',
  delivery: { method: o.deliveryMethod, charge: o.deliveryCharge, eta: o.deliveryEta },
  totals: {
    subtotal: o.subtotal, mrpTotal: o.mrpTotal, savings: o.mrpTotal - o.subtotal + o.comboDiscount + o.couponDiscount,
    comboDiscount: o.comboDiscount, couponCode: o.couponCode, couponDiscount: o.couponDiscount, delivery: o.deliveryCharge, codCharge: o.codCharge, total: o.total,
  },
  history: o.events.map((e) => ({ status: e.status, at: e.at, note: e.note || undefined })),
});

/**
 * Place an order atomically:
 *  1. re-price everything from the database (client prices ignored),
 *  2. decrement stock with a conditional update per pack (never below zero, safe under concurrency),
 *  3. redeem the coupon within its usage limit,
 *  4. write order + items + first status event.
 * Any failure rolls the whole transaction back. Idempotency-Key makes retries safe.
 */
export async function placeOrder(user, input, idempotencyKey) {
  if (idempotencyKey) {
    const existing = await prisma.order.findUnique({ where: { userId_idempotencyKey: { userId: user.id, idempotencyKey } }, include: orderInclude });
    if (existing) return { order: existing, replay: true };
  }
  const settings = await getSettings();

  const run = () => prisma.$transaction(async (tx) => {
    const q = await quote({ items: input.items, couponCode: input.couponCode, deliveryMethod: input.deliveryMethod, paymentMethod: input.paymentMethod, pin: input.address.pin, settings, userId: user.id, db: tx });
    if (q.issues.length) throw new AppError(409, 'CART_CHANGED', 'Some items in your cart are no longer available in that quantity.', q.issues);
    if (!q.pin?.serviceable) throw errors.unprocessable('Sorry, we do not deliver to this PIN code yet.');
    if (input.paymentMethod === 'cod' && !q.pin.cod) throw errors.unprocessable('Cash on Delivery is not available for this PIN code.');
    if (input.couponCode && !q.totals.couponCode) throw new AppError(409, 'COUPON_INVALID', 'This coupon can no longer be applied.', { error: q.totals.couponError });

    // Stock: per pack, aggregate demand, then a guarded decrement.
    const demand = {};
    q.lines.forEach((l) => { demand[l.packId] = (demand[l.packId] || 0) + l.qty; });
    for (const [packId, qty] of Object.entries(demand)) {
      const r = await tx.productPack.updateMany({ where: { id: packId, stock: { gte: qty } }, data: { stock: { decrement: qty } } });
      if (r.count !== 1) throw new AppError(409, 'OUT_OF_STOCK', 'An item just went out of stock. Please review your cart.');
    }
    if (q.totals.couponCode) {
      const n = await tx.$executeRaw`UPDATE "Coupon" SET "usedCount" = "usedCount" + 1 WHERE code = ${q.totals.couponCode} AND ("usageLimit" IS NULL OR "usedCount" < "usageLimit")`;
      if (n !== 1) throw new AppError(409, 'COUPON_INVALID', 'This coupon has reached its usage limit.');
    }

    const eta = q.pin.eta ? new Date(q.pin.eta) : null;
    if (eta && q.totals.deliveryMethod === 'express') eta.setDate(eta.getDate() - Math.max(0, settings.standardDeliveryDays - settings.expressDeliveryDays));
    return tx.order.create({
      data: {
        id: newOrderId(), userId: user.id,
        customer: { name: input.customer.name, email: input.customer.email || user.email || '', phone: input.customer.phone },
        address: { ...input.address, name: input.customer.name, phone: input.customer.phone },
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === 'cod' ? 'COD_PENDING' : 'PENDING',
        paymentInfo: input.paymentInfo || null,
        deliveryMethod: q.totals.deliveryMethod, deliveryEta: eta,
        subtotal: q.totals.subtotal, mrpTotal: q.totals.mrpTotal, comboDiscount: q.totals.comboDiscount,
        couponCode: q.totals.couponCode, couponDiscount: q.totals.couponDiscount,
        deliveryCharge: q.totals.delivery, codCharge: q.totals.codCharge, total: q.totals.total,
        idempotencyKey: idempotencyKey || null,
        items: { create: q.lines.map((l) => ({ productId: l.productId, productName: l.name, size: l.size, qty: l.qty, price: l.price, mrp: l.mrp, comboPct: l.comboPct })) },
        events: { create: { status: 'placed', byUserId: user.id } },
      },
      include: orderInclude,
    });
  }, { maxWait: 5000, timeout: 15000 });

  try {
    const order = await run();
    await bumpCatalog(); // stock changed
    return { order, replay: false };
  } catch (e) {
    // Two identical requests racing with the same Idempotency-Key: return the winner.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002' && idempotencyKey) {
      const existing = await prisma.order.findUnique({ where: { userId_idempotencyKey: { userId: user.id, idempotencyKey } }, include: orderInclude });
      if (existing) return { order: existing, replay: true };
    }
    throw e;
  }
}

/** Put stock back and release the coupon redemption (used when an order is cancelled). */
async function releaseOrder(tx, order) {
  for (const it of order.items) {
    await tx.productPack.updateMany({ where: { productId: it.productId, size: it.size }, data: { stock: { increment: it.qty } } });
  }
  if (order.couponCode) await tx.$executeRaw`UPDATE "Coupon" SET "usedCount" = GREATEST("usedCount" - 1, 0) WHERE code = ${order.couponCode}`;
}

/**
 * Change status. Rules: cancelled is final (no re-opening); delivered COD orders are marked paid;
 * cancelling restocks items. Optimistic check on the previous status prevents double-processing.
 */
export async function changeStatus(orderId, nextStatus, actorId, note) {
  const updated = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw errors.notFound('Order not found');
    if (order.status === nextStatus) return order;
    if (order.status === 'cancelled') throw errors.conflict('Cancelled orders cannot be reopened.');
    if (order.status === 'delivered' && nextStatus !== 'delivered') throw errors.conflict('Delivered orders cannot be changed. Create a return/refund instead.');
    if (!ORDER_FLOW.includes(nextStatus) && nextStatus !== 'cancelled') throw errors.badRequest('Unknown status');

    const r = await tx.order.updateMany({
      where: { id: orderId, status: order.status },
      data: { status: nextStatus, ...(nextStatus === 'delivered' && order.paymentStatus === 'COD_PENDING' ? { paymentStatus: 'PAID' } : {}) },
    });
    if (r.count !== 1) throw errors.conflict('This order was just updated by someone else. Please refresh.');
    if (nextStatus === 'cancelled') await releaseOrder(tx, order);
    await tx.orderEvent.create({ data: { orderId, status: nextStatus, byUserId: actorId, note: note || null } });
    return order;
  });
  if (nextStatus === 'cancelled') await bumpCatalog();
  return prisma.order.findUnique({ where: { id: updated.id }, include: orderInclude });
}
