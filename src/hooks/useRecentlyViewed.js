import { useCallback } from 'react';
import { usePersistentState } from './usePersistentState';

export function useRecentlyViewed() {
  const [ids, setIds] = usePersistentState('recentlyViewed', []);
  const push = useCallback((id) => setIds((l) => [id, ...l.filter((x) => x !== id)].slice(0, 12)), [setIds]);
  return { ids, push };
}
