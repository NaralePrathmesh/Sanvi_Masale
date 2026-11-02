import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

/** Toasts, cart drawer, quick-view modal and other transient UI state. */
const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [quickViewId, setQuickViewId] = useState(null);
  const idRef = useRef(0);

  const toast = useCallback((message, type = 'success', action) => {
    const id = ++idRef.current;
    setToasts((t) => [...t.slice(-2), { id, message, type, action }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);
  const dismissToast = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const value = useMemo(() => ({ toasts, toast, dismissToast, cartOpen, setCartOpen, quickViewId, setQuickViewId }), [toasts, toast, dismissToast, cartOpen, quickViewId]);
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}
export const useUI = () => useContext(UIContext);
