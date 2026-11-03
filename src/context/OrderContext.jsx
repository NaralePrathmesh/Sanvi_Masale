import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { demoOrders, demoCustomers } from '@/services/mock/seed';
import { ORDER_STATUSES } from '@/config/site';
import { generateOrderId } from '@/utils/format';
import { API_MODE, api, idempotencyKey } from '@/services/api/client';
import { useAuth } from './AuthContext';

/**
 * Orders & customers.
 *  • API mode: customers see only their own orders (/account/orders); staff see /admin/orders and
 *    /admin/customers. Orders are created by the server, which re-prices and reserves stock.
 *  • DEMO mode: localStorage simulation.
 */
const OrderContext = createContext(null);

export function OrderProvider({ children }) {
  return API_MODE ? <ApiOrderProvider>{children}</ApiOrderProvider> : <DemoOrderProvider>{children}</DemoOrderProvider>;
}
export const useOrders = () => useContext(OrderContext);

/* ═══════════════════════════ API mode ═══════════════════════════ */
function ApiOrderProvider({ children }) {
  const { user, admin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [counts, setCounts] = useState({});

  const loadMine = useCallback(async () => { const r = await api('/account/orders'); setOrders(r.orders); }, []);
  const loadAdmin = useCallback(async () => {
    const [o, c] = await Promise.all([api('/admin/orders?limit=100'), api('/admin/customers?limit=100').catch(() => ({ customers: [] }))]);
    setOrders(o.orders); setCounts(o.counts || {});
    setCustomers(c.customers.map((x) => ({ ...x, city: x.city || '' })));
  }, []);
  useEffect(() => {
    if (admin) loadAdmin().catch(() => {});
    else if (user) loadMine().catch(() => {});
    else { setOrders([]); setCustomers([]); }
  }, [user?.id, admin?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const replace = (o) => setOrders((l) => (l.some((x) => x.id === o.id) ? l.map((x) => (x.id === o.id ? o : x)) : [o, ...l]));

  /** Places the order on the server. Same key for retries of the same checkout → no duplicates. */
  const placeOrder = useCallback(async (data, key = idempotencyKey()) => {
    const body = {
      items: data.items.map((i) => ({ productId: i.productId, size: i.size, qty: i.qty, ...(i.comboId ? { comboId: i.comboId } : {}) })),
      couponCode: data.totals?.couponCode || '',
      deliveryMethod: data.delivery?.method || 'standard',
      paymentMethod: data.payment,
      paymentInfo: data.paymentInfo || undefined,
      customer: { name: data.customer.name, phone: data.customer.phone, email: data.customer.email || '' },
      address: { house: data.address.house, street: data.address.street, area: data.address.area, landmark: data.address.landmark || '', city: data.address.city, state: data.address.state, pin: data.address.pin },
      saveAddress: !!data.saveAddress,
    };
    const { order } = await api('/account/orders', { method: 'POST', body, headers: { 'Idempotency-Key': key } });
    replace(order);
    return order;
  }, []);

  const getOrder = useCallback((id) => orders.find((o) => o.id.toUpperCase() === String(id).trim().toUpperCase()), [orders]);
  const fetchOrder = useCallback(async (id) => {
    const { order } = await api(admin ? `/admin/orders/${id}` : `/account/orders/${id}`);
    replace(order); return order;
  }, [admin]);
  /** Guest tracking: order id + phone used at checkout. */
  const trackOrder = useCallback(async (orderId, phone) => (await api('/orders/track', { method: 'POST', auth: false, body: { orderId, phone } })).order, []);

  const updateStatus = useCallback(async (id, status, note) => {
    const { order } = await api(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status, ...(note ? { note } : {}) } });
    replace(order); return order;
  }, []);
  const cancelOrder = useCallback(async (id) => {
    const { order } = await api(`/account/orders/${id}/cancel`, { method: 'POST' });
    replace(order); return order;
  }, []);
  const setCustomerStatus = useCallback(async (id, status) => {
    await api(`/admin/customers/${id}`, { method: 'PATCH', body: { status } });
    setCustomers((l) => l.map((c) => (c.id === id ? { ...c, status } : c)));
  }, []);

  const value = useMemo(() => ({
    apiMode: true, orders, setOrders, placeOrder, getOrder, fetchOrder, trackOrder, updateStatus, cancelOrder, customers, setCustomers, setCustomerStatus,
    counts, reload: admin ? loadAdmin : loadMine, advanceStatus: null,
  }), [orders, placeOrder, getOrder, fetchOrder, trackOrder, updateStatus, cancelOrder, customers, setCustomerStatus, counts, admin, loadAdmin, loadMine]);
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

/* ═══════════════════════════ DEMO mode ═══════════════════════════ */
function DemoOrderProvider({ children }) {
  const [orders, setOrders] = usePersistentState('orders', demoOrders);
  const [customers, setCustomers] = usePersistentState('customers', demoCustomers);

  const placeOrder = useCallback((data) => {
    const id = generateOrderId();
    const now = new Date().toISOString();
    const order = { ...data, id, placedAt: now, status: 'placed', history: [{ status: 'placed', at: now }], demo: true };
    setOrders((l) => [order, ...l]);
    if (data.customerId) {
      setCustomers((l) => (l.some((c) => c.id === data.customerId || c.email === data.customer.email) ? l
        : [{ id: data.customerId, name: data.customer.name, email: data.customer.email, phone: data.customer.phone, city: data.address.city, joinedAt: now }, ...l]));
    }
    return order;
  }, [setOrders, setCustomers]);

  const getOrder = useCallback((id) => orders.find((o) => o.id.toUpperCase() === String(id).trim().toUpperCase()), [orders]);
  const updateStatus = useCallback((id, status) => setOrders((l) => l.map((o) => (o.id === id ? { ...o, status, history: [...(o.history || []), { status, at: new Date().toISOString() }] } : o))), [setOrders]);

  /** DEMO: move an order to its next status (used by the tracking page simulator). */
  const advanceStatus = useCallback((id) => {
    const o = orders.find((x) => x.id === id); if (!o || o.status === 'cancelled') return;
    const i = ORDER_STATUSES.indexOf(o.status);
    if (i < ORDER_STATUSES.length - 1) updateStatus(id, ORDER_STATUSES[i + 1]);
  }, [orders, updateStatus]);

  const cancelOrder = useCallback((id) => updateStatus(id, 'cancelled'), [updateStatus]);
  const setCustomerStatus = useCallback((id, status) => setCustomers((l) => l.map((c) => (c.id === id ? { ...c, status } : c))), [setCustomers]);

  const value = useMemo(() => ({ apiMode: false, orders, setOrders, placeOrder, getOrder, updateStatus, advanceStatus, cancelOrder, customers, setCustomers, setCustomerStatus, counts: null, reload: () => {} }),
    [orders, setOrders, placeOrder, getOrder, updateStatus, advanceStatus, cancelOrder, customers, setCustomers, setCustomerStatus]);
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}
