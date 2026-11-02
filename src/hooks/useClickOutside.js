import { useEffect } from 'react';
export function useClickOutside(ref, handler, active = true) {
  useEffect(() => {
    if (!active) return undefined;
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) handler(e); };
    const esc = (e) => { if (e.key === 'Escape') handler(e); };
    document.addEventListener('mousedown', fn);
    document.addEventListener('touchstart', fn);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', fn); document.removeEventListener('touchstart', fn); document.removeEventListener('keydown', esc); };
  }, [ref, handler, active]);
}
