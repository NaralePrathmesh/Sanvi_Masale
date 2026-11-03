import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { API_MODE, api } from '@/services/api/client';
import { useAuth } from './AuthContext';

/**
 * Wishlist. Guests keep it in this browser. In API mode a signed-in customer's wishlist is saved
 * on the server (so it follows them across devices) and the guest list is merged in on sign-in.
 */
const WishlistContext = createContext(null);
export function WishlistProvider({ children }) {
  const [ids, setIds] = usePersistentState('wishlist', []);
  const { user } = useAuth();
  const synced = API_MODE && !!user;
  const merging = useRef(null);

  useEffect(() => {
    if (!synced || merging.current === user.id) return;
    merging.current = user.id;
    api('/account/wishlist/merge', { method: 'POST', body: { productIds: ids.slice(0, 200) } }).then((r) => setIds(r.productIds)).catch(() => {});
  }, [synced, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (API_MODE && !user) merging.current = null; }, [user]);

  const has = useCallback((id) => ids.includes(id), [ids]);
  const toggle = useCallback((id) => {
    const adding = !ids.includes(id);
    setIds(adding ? [...ids, id] : ids.filter((x) => x !== id));
    if (synced) api(`/account/wishlist/${id}`, { method: adding ? 'PUT' : 'DELETE' }).catch(() => setIds((l) => (adding ? l.filter((x) => x !== id) : [...l, id])));
    return adding;
  }, [ids, setIds, synced]);
  const remove = useCallback((id) => {
    setIds((l) => l.filter((x) => x !== id));
    if (synced) api(`/account/wishlist/${id}`, { method: 'DELETE' }).catch(() => {});
  }, [setIds, synced]);
  const value = useMemo(() => ({ ids, has, toggle, remove, count: ids.length }), [ids, has, toggle, remove]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
export const useWishlist = () => useContext(WishlistContext);
