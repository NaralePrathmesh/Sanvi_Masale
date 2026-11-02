import { storage } from '@/services/mock/storage';

/** Clears all demo data and returns to the homepage (works with browser or hash routing). */
export function resetDemoAndGoHome() {
  storage.clearAll();
  if (import.meta.env.VITE_HASH_ROUTER === '1') { window.location.hash = '#/'; window.location.reload(); }
  else window.location.href = '/';
}
