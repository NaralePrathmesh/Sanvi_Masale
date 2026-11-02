/**
 * Thin localStorage wrapper used for DEMO persistence only.
 * In Phase 2 these reads/writes move to real API calls (see services/*Service.js).
 */
const PREFIX = 'sm:';
const VERSION = 'v3'; // bumped for the redesign so new default content loads

export const storage = {
  get(key, fallback) {
    try {
      const raw = window.localStorage.getItem(`${PREFIX}${VERSION}:${key}`);
      return raw == null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(`${PREFIX}${VERSION}:${key}`, JSON.stringify(value));
    } catch {
      /* storage full or blocked – demo keeps working in memory */
    }
  },
  remove(key) {
    try { window.localStorage.removeItem(`${PREFIX}${VERSION}:${key}`); } catch { /* ignore */ }
  },
  clearAll() {
    try {
      Object.keys(window.localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => window.localStorage.removeItem(k));
    } catch { /* ignore */ }
  },
};
