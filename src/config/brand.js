/**
 * BRAND IDENTITY — सान्वी मसाले (Saanvi Masale)
 * --------------------------------------------
 * Everything brand-specific lives here. To use a real logo file, put it in
 * /public/brand/ and set `logo.src` (e.g. '/brand/logo.svg'); while it is null
 * the built-in SVG wordmark (components/common/Logo.jsx) is shown.
 */
export const brand = {
  name: 'सान्वी मसाले',          // primary (Devanagari) wordmark
  nameLatin: 'Saanvi Masale',      // Latin form for English copy, emails and URLs
  tagline: { en: 'Pure spices. Family recipes.', hi: 'शुद्ध मसाले। घर की रेसिपी।', mr: 'शुद्ध मसाले. घरच्या पाककृती.' },
  legalName: 'Saanvi Masale (Demo)',
  established: 1978,
  // Logo files live in /public/brand (wordmark for header/footer, round mark for favicon & small spaces)
  logo: { src: 'brand/logo-wordmark.webp', mark: 'brand/logo-mark.webp', alt: 'सान्वी मसाले — Saanvi Masale logo' },
  contact: {
    phone: '+91 98765 43210',
    whatsapp: '+91 98765 43210',
    email: 'care@saanvimasale.example',
    businessEmail: 'business@saanvimasale.example',
    hours: 'Mon–Sat, 9:00 AM – 7:00 PM IST',
    address: 'Plot 12, Spice Park MIDC, Pune, Maharashtra 411019 (placeholder)',
  },
  social: {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    youtube: 'https://youtube.com/',
    twitter: 'https://x.com/',
  },
  instagramHandle: '@saanvimasale',
};
