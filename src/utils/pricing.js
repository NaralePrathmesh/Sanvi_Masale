import { COMBO_BUILDER } from '@/config/site';

/**
 * Validate a coupon against the current subtotal.
 * Returns { ok, coupon, discount, error } where error is an i18n key.
 */
export function evaluateCoupon(code, subtotal, coupons, now = new Date()) {
  if (!code) return { ok: false, discount: 0, error: '' };
  const c = coupons.find((x) => x.code.toUpperCase() === String(code).trim().toUpperCase());
  if (!c) return { ok: false, discount: 0, error: 'cart.couponInvalid' };
  const today = now.toISOString().slice(0, 10);
  if (!c.active || (c.validTo && today > c.validTo) || (c.validFrom && today < c.validFrom)) return { ok: false, discount: 0, error: 'cart.couponExpired', coupon: c };
  if (subtotal < (c.minOrder || 0)) return { ok: false, discount: 0, error: 'cart.couponMinOrder', coupon: c };
  let discount = c.type === 'flat' ? c.value : Math.round((subtotal * c.value) / 100);
  if (c.maxDiscount) discount = Math.min(discount, c.maxDiscount);
  discount = Math.min(discount, subtotal);
  return { ok: true, coupon: c, discount, error: '' };
}

export const comboTierFor = (count) => [...COMBO_BUILDER.tiers].reverse().find((t) => count >= t.min) || null;

/**
 * Compute every cart total in one place so Cart, Checkout and Order use the same maths.
 * lines: [{ price, mrp, qty, comboId? , comboPct? }]
 */
export function computeTotals({ lines, couponCode, coupons, settings, deliveryMethod = 'standard', paymentMethod }) {
  const subtotal = lines.reduce((s, l) => s + l.price * l.qty, 0);
  const mrpTotal = lines.reduce((s, l) => s + (l.mrp || l.price) * l.qty, 0);
  const comboDiscount = lines.reduce((s, l) => s + (l.comboPct ? Math.round((l.price * l.qty * l.comboPct) / 100) : 0), 0);
  const afterCombo = subtotal - comboDiscount;
  const coupon = evaluateCoupon(couponCode, afterCombo, coupons);
  const couponDiscount = coupon.ok ? coupon.discount : 0;
  const afterDiscount = afterCombo - couponDiscount;
  const freeShipping = afterDiscount >= settings.freeShippingThreshold;
  let delivery = 0;
  if (lines.length) {
    if (deliveryMethod === 'express') delivery = settings.expressDeliveryCharge;
    else delivery = freeShipping ? 0 : settings.deliveryCharge;
  }
  const codCharge = paymentMethod === 'cod' ? settings.codCharge || 0 : 0;
  const total = Math.max(0, afterDiscount + delivery + codCharge);
  return {
    subtotal, mrpTotal, savings: mrpTotal - subtotal + comboDiscount + couponDiscount, comboDiscount,
    couponCode: coupon.ok ? coupon.coupon.code : null, couponDiscount, coupon, delivery, codCharge, freeShipping,
    amountForFreeShipping: Math.max(0, settings.freeShippingThreshold - afterDiscount), total,
  };
}
