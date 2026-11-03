import { prisma, errors } from '../lib/core.js';
import { COMBO_TIERS, SERVICEABLE_PINS, MAX_QTY_PER_LINE, MAX_LINES } from '../config/store.js';

/**
 * Server-side pricing — the single source of truth for every amount charged.
 * Client-sent prices/discounts are ignored; everything is recomputed from the database.
 * Mirrors the storefront's computeTotals() so the cart and the order always agree.
 */

/** "Today" as an IST calendar day (YYYY-MM-DD) — coupon dates are IST days. */
export const istToday = (d = new Date()) => new Date(d.getTime() + 5.5 * 3600_000).toISOString().slice(0, 10);

export function checkPincode(pin, settings) {
  if (!/^[1-9]\d{5}$/.test(String(pin || ''))) return { valid: false, serviceable: false };
  const p = String(pin);
  if (!SERVICEABLE_PINS.prefixes.some((x) => p.startsWith(x))) return { valid: true, serviceable: false };
  const express = SERVICEABLE_PINS.expressPrefixes.some((x) => p.startsWith(x));
  const cod = !SERVICEABLE_PINS.codUnavailable.some((x) => p.startsWith(x));
  const days = express ? settings.expressDeliveryDays + 1 : settings.standardDeliveryDays;
  const eta = new Date(); eta.setDate(eta.getDate() + days);
  return { valid: true, serviceable: true, express, cod, eta: eta.toISOString(), days };
}

const comboPctFor = (count) => [...COMBO_TIERS].reverse().find((t) => count >= t.min)?.pct || 0;

/** Validate a coupon for a subtotal (and optionally a user's past redemptions). */
export async function evaluateCoupon(code, subtotal, { userId, db = prisma } = {}) {
  if (!code) return { ok: false, discount: 0, error: '' };
  const c = await db.coupon.findUnique({ where: { code: String(code).trim().toUpperCase() } });
  if (!c) return { ok: false, discount: 0, error: 'cart.couponInvalid' };
  const today = istToday();
  if (!c.active || (c.validTo && today > c.validTo) || (c.validFrom && today < c.validFrom)) return { ok: false, discount: 0, error: 'cart.couponExpired', coupon: c };
  if (c.usageLimit != null && c.usedCount >= c.usageLimit) return { ok: false, discount: 0, error: 'cart.couponExpired', coupon: c };
  if (subtotal < (c.minOrder || 0)) return { ok: false, discount: 0, error: 'cart.couponMinOrder', coupon: c };
  if (userId && c.perUserLimit != null) {
    const used = await db.order.count({ where: { userId, couponCode: c.code, status: { not: 'cancelled' } } });
    if (used >= c.perUserLimit) return { ok: false, discount: 0, error: 'cart.couponUsed', coupon: c };
  }
  let discount = c.type === 'flat' ? c.value : Math.round((subtotal * c.value) / 100);
  if (c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
  discount = Math.min(discount, subtotal);
  return { ok: true, coupon: c, discount, error: '' };
}

/**
 * Price a cart.
 * items: [{ productId, size, qty, comboId? }]
 * Returns { lines, totals, issues } — issues lists unavailable/insufficient-stock lines.
 */
export async function quote({ items, couponCode, deliveryMethod = 'standard', paymentMethod, pin, settings, userId, db = prisma }) {
  if (!Array.isArray(items) || !items.length) throw errors.badRequest('Your cart is empty.');
  if (items.length > MAX_LINES) throw errors.badRequest(`A single order can have at most ${MAX_LINES} lines.`);
  const ids = [...new Set(items.map((i) => i.productId))];
  const products = await db.product.findMany({ where: { id: { in: ids } }, include: { packs: true } });
  const byId = new Map(products.map((p) => [p.id, p]));

  // Combo discounts are decided here from the number of lines in each combo, never from the client.
  const comboCounts = {};
  items.forEach((i) => { if (i.comboId) comboCounts[i.comboId] = (comboCounts[i.comboId] || 0) + 1; });

  const issues = [];
  const merged = new Map();
  for (const it of items) {
    const p = byId.get(it.productId);
    const pack = p?.packs.find((x) => x.size === it.size);
    if (!p || !p.active || !pack) { issues.push({ productId: it.productId, size: it.size, reason: 'unavailable' }); continue; }
    const key = `${p.id}|${pack.size}|${it.comboId || ''}`;
    const prev = merged.get(key);
    const qty = Math.min(MAX_QTY_PER_LINE, (prev?.qty || 0) + Math.max(1, Math.min(MAX_QTY_PER_LINE, Number(it.qty) || 1)));
    merged.set(key, { productId: p.id, packId: pack.id, name: p.name, size: pack.size, qty, price: pack.price, mrp: pack.mrp, stock: pack.stock, comboId: it.comboId || null, comboPct: it.comboId ? comboPctFor(comboCounts[it.comboId]) : 0 });
  }
  const lines = [...merged.values()];
  // Same pack may appear in several lines (e.g. inside and outside a combo): check stock per pack.
  const demand = {};
  lines.forEach((l) => { demand[l.packId] = (demand[l.packId] || 0) + l.qty; });
  lines.forEach((l) => { if (demand[l.packId] > l.stock) issues.push({ productId: l.productId, size: l.size, reason: 'stock', available: l.stock }); });

  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const mrpTotal = lines.reduce((s, l) => s + l.mrp * l.qty, 0);
  const comboDiscount = lines.reduce((s, l) => s + (l.comboPct ? Math.round((l.price * l.qty * l.comboPct) / 100) : 0), 0);
  const afterCombo = subtotal - comboDiscount;
  const coupon = await evaluateCoupon(couponCode, afterCombo, { userId, db });
  const couponDiscount = coupon.ok ? coupon.discount : 0;
  const afterDiscount = afterCombo - couponDiscount;

  const pinInfo = pin ? checkPincode(pin, settings) : null;
  const express = deliveryMethod === 'express' && (!pinInfo || pinInfo.express);
  const freeShipping = afterDiscount >= settings.freeShippingThreshold;
  const delivery = lines.length ? (express ? settings.expressDeliveryCharge : freeShipping ? 0 : settings.deliveryCharge) : 0;
  const codCharge = paymentMethod === 'cod' ? settings.codCharge || 0 : 0;
  const total = Math.max(0, afterDiscount + delivery + codCharge);

  return {
    lines,
    issues,
    pin: pinInfo,
    totals: {
      subtotal, mrpTotal, savings: mrpTotal - subtotal + comboDiscount + couponDiscount, comboDiscount,
      couponCode: coupon.ok ? coupon.coupon.code : null, couponDiscount, couponError: coupon.ok ? '' : coupon.error,
      deliveryMethod: express ? 'express' : 'standard', delivery, codCharge, freeShipping,
      amountForFreeShipping: Math.max(0, settings.freeShippingThreshold - afterDiscount), total,
    },
  };
}
