import { createContext, useCallback, useContext, useMemo } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { demoOrders, demoCustomers } from '@/services/mock/seed';
import { ORDER_STATUSES } from '@/config/site';
import { generateOrderId } from '@/utils/format';

/** DEMO orders & customers (localStorage). Replace with order APIs in Phase 2. */
const OrderContext = createContext(null);

export function OrderProvider({ children }) {
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

  const value = useMemo(() => ({ orders, setOrders, placeOrder, getOrder, updateStatus, advanceStatus, cancelOrder, customers, setCustomers }),
    [orders, setOrders, placeOrder, getOrder, updateStatus, advanceStatus, cancelOrder, customers, setCustomers]);
  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}
export const useOrders = () => useContext(OrderContext);
