const LOCALES = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };

export const formatINR = (n) => `₹${Math.round(Number(n) || 0).toLocaleString('en-IN')}`;

export function formatDate(iso, lang = 'en', opts = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!iso) return '';
  try { return new Date(iso).toLocaleDateString(LOCALES[lang] || 'en-IN', opts); } catch { return iso; }
}
export function formatDateTime(iso, lang = 'en') {
  return formatDate(iso, lang, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
export const addDays = (date, days) => { const d = new Date(date); d.setDate(d.getDate() + days); return d; };

export const discountPct = (price, mrp) => (mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0);

export const classNames = (...c) => c.filter(Boolean).join(' ');

export const slugify = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export function generateOrderId() {
  const d = new Date();
  const stamp = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `RR${stamp}${Math.floor(1000 + Math.random() * 9000)}`;
}

/** Pick the localized value from { en, hi, mr } with English fallback. */
export const pickLang = (obj, lang) => (obj && typeof obj === 'object' ? obj[lang] || obj.en || '' : obj || '');

/** Compact Indian format: ₹12.8L, ₹1.2Cr, ₹45.3K */
export function formatINRCompact(n) {
  const v = Math.round(Number(n) || 0);
  if (v >= 1e7) return `₹${(v / 1e7).toFixed(2)}Cr`;
  if (v >= 1e5) return `₹${(v / 1e5).toFixed(2)}L`;
  if (v >= 1e3) return `₹${(v / 1e3).toFixed(1)}K`;
  return `₹${v}`;
}
