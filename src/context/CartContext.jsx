import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useStore } from './StoreContext';
import { computeTotals } from '@/utils/pricing';

/**
 * Shopping cart (DEMO: persisted in localStorage).
 * A line is { key, productId, size, qty, comboId?, comboPct? }. Prices are always
 * resolved from the live catalogue so admin price changes apply immediately.
 */
const CartContext = createContext(null);
const keyOf = (productId, size, comboId) => `${productId}|${size}${comboId ? `|${comboId}` : ''}`;

export function CartProvider({ children }) {
  const { getProduct, coupons, settings } = useStore();
  const [items, setItems] = usePersistentState('cart', []);
  const [couponCode, setCouponCode] = usePersistentState('cartCoupon', '');
  const [deliveryMethod, setDeliveryMethod] = useState('standard');

  const lines = useMemo(() => items.map((it) => {
    const product = getProduct(it.productId);
    if (!product || product.active === false) return null;
    const pack = product.packs.find((p) => p.size === it.size) || product.packs[0];
    return { ...it, size: pack.size, product, pack, price: pack.price, mrp: pack.mrp, maxQty: Math.max(1, Math.min(10, pack.stock || 10)) };
  }).filter(Boolean), [items, getProduct]);

  const add = useCallback((productId, size, qty = 1, extra = {}) => {
    setItems((list) => {
      const key = keyOf(productId, size, extra.comboId);
      const found = list.find((l) => l.key === key);
      if (found) return list.map((l) => (l.key === key ? { ...l, qty: Math.min(10, l.qty + qty) } : l));
      return [...list, { key, productId, size, qty: Math.min(10, qty), ...extra }];
    });
  }, [setItems]);

  const addMany = useCallback((entries) => entries.forEach((e) => add(e.productId, e.size, e.qty || 1, e.extra || {})), [add]);
  const remove = useCallback((key) => setItems((l) => l.filter((x) => x.key !== key)), [setItems]);
  const setQty = useCallback((key, qty) => setItems((l) => (qty <= 0 ? l.filter((x) => x.key !== key) : l.map((x) => (x.key === key ? { ...x, qty: Math.min(10, qty) } : x)))), [setItems]);
  const changeSize = useCallback((key, size) => setItems((l) => {
    const item = l.find((x) => x.key === key); if (!item) return l;
    const newKey = keyOf(item.productId, size, item.comboId);
    const existing = l.find((x) => x.key === newKey);
    if (existing && newKey !== key) return l.filter((x) => x.key !== key).map((x) => (x.key === newKey ? { ...x, qty: Math.min(10, x.qty + item.qty) } : x));
    return l.map((x) => (x.key === key ? { ...x, key: newKey, size } : x));
  }), [setItems]);
  const clear = useCallback(() => { setItems([]); setCouponCode(''); }, [setItems, setCouponCode]);

  const totals = useMemo(() => computeTotals({ lines, couponCode, coupons, settings, deliveryMethod }), [lines, couponCode, coupons, settings, deliveryMethod]);
  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);

  const value = useMemo(() => ({ items, lines, count, add, addMany, remove, setQty, changeSize, clear, couponCode, setCouponCode, totals, deliveryMethod, setDeliveryMethod }),
    [items, lines, count, add, addMany, remove, setQty, changeSize, clear, couponCode, setCouponCode, totals, deliveryMethod]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
export const useCart = () => useContext(CartContext);
