import { useEffect, useRef, useState } from 'react';
import { storage } from '@/services/mock/storage';

/** useState that mirrors its value into localStorage (demo persistence). */
export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => storage.get(key, typeof initial === 'function' ? initial() : initial));
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; storage.set(key, value); return; }
    storage.set(key, value);
  }, [key, value]);
  return [value, setValue];
}
