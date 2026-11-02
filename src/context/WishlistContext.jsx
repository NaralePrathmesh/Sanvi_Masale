import { createContext, useCallback, useContext, useMemo } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';

const WishlistContext = createContext(null);
export function WishlistProvider({ children }) {
  const [ids, setIds] = usePersistentState('wishlist', []);
  const has = useCallback((id) => ids.includes(id), [ids]);
  const toggle = useCallback((id) => { const adding = !ids.includes(id); setIds(adding ? [...ids, id] : ids.filter((x) => x !== id)); return adding; }, [ids, setIds]);
  const remove = useCallback((id) => setIds((l) => l.filter((x) => x !== id)), [setIds]);
  const value = useMemo(() => ({ ids, has, toggle, remove, count: ids.length }), [ids, has, toggle, remove]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
export const useWishlist = () => useContext(WishlistContext);
