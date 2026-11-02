import { createContext, useCallback, useContext, useMemo } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { MAX_COMPARE } from '@/config/site';

const CompareContext = createContext(null);
export function CompareProvider({ children }) {
  const [ids, setIds] = usePersistentState('compare', []);
  const has = useCallback((id) => ids.includes(id), [ids]);
  /** returns 'added' | 'removed' | 'full' */
  const toggle = useCallback((id) => {
    if (ids.includes(id)) { setIds(ids.filter((x) => x !== id)); return 'removed'; }
    if (ids.length >= MAX_COMPARE) return 'full';
    setIds([...ids, id]); return 'added';
  }, [ids, setIds]);
  const remove = useCallback((id) => setIds((l) => l.filter((x) => x !== id)), [setIds]);
  const clear = useCallback(() => setIds([]), [setIds]);
  const value = useMemo(() => ({ ids, has, toggle, remove, clear }), [ids, has, toggle, remove, clear]);
  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}
export const useCompare = () => useContext(CompareContext);
