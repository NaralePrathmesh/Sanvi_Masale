/**
 * CENTRAL IMAGE REGISTRY
 * ----------------------
 * Real photos live in /public/images/<group>/<name>.webp (see public/images/EXPECTED.md
 * for every filename). `npm run images` (auto-run by dev/build) records which files exist
 * in imageManifest.json, so the site only requests photos that are present.
 * While a photo is missing, the `art` illustration is shown instead — never a broken image.
 *
 * Products:  products/<slug>-1, products/<slug>-2 …   (or set product.images in data/products.js)
 * Recipes:   recipes/<slug>        Banners: hero/<bannerId>      Festivals: festivals/<id>
 * Journal:   journal/<slug>        Categories/regions/pages/instagram: keys below
 */
import manifest from './imageManifest.json';

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');

/** Resolve a photo key to { src, srcSet } or null when the file is not present. */
export function photo(key) {
  const m = key && manifest[key];
  if (!m) return null;
  const url = (f) => `${BASE}images/${f}`;
  const srcSet = m.variants?.length ? [...m.variants.map((v) => `${url(v.file)} ${v.w}w`), `${url(m.file)} 1920w`].join(', ') : undefined;
  return { src: url(m.file), srcSet };
}
export const hasPhoto = (key) => !!(key && manifest[key]);

export const categoryImages = {
  'pure-spices': { photo: 'categories/pure-spices', art: 'pure' },
  'blended-masalas': { photo: 'categories/blended-masalas', art: 'blend' },
  maharashtrian: { photo: 'categories/maharashtrian', art: 'maharashtra' },
  'south-indian': { photo: 'categories/south-indian', art: 'south' },
  'north-indian': { photo: 'categories/north-indian', art: 'north' },
  'instant-mixes': { photo: 'categories/instant-mixes', art: 'instant' },
  'ready-to-cook': { photo: 'categories/ready-to-cook', art: 'ready' },
  'combo-packs': { photo: 'categories/combo-packs', art: 'combo' },
};
export const categoryImage = (id) => categoryImages[id] || { photo: `categories/${id}`, art: 'bowls' };

/** Brand collection banners (public/images/collections/<categoryId>.webp) shown on category pages. */
export const collectionBanner = (categoryId) => (manifest[`collections/${categoryId}`] ? photo(`collections/${categoryId}`) : null);

export const regionImages = {
  maharashtra: { photo: 'regions/maharashtra', art: 'maharashtra' },
  north: { photo: 'regions/north', art: 'north' },
  south: { photo: 'regions/south', art: 'south' },
};

export const pageImages = {
  aboutHero: { photo: 'pages/about-hero', art: 'bowls' },
  aboutStory: { photo: 'pages/about-story', art: 'blend' },
  heritage: { photo: 'pages/heritage', art: 'pure' },
  manufacturing: { photo: 'pages/manufacturing', art: 'ready' },
  contact: { photo: 'pages/contact', art: 'south' },
  login: { photo: 'pages/login', art: 'maharashtra' },
  giftBoxes: { photo: 'pages/gift-boxes', art: 'festive' },
  bulk: { photo: 'pages/bulk-orders', art: 'combo' },
  store: { photo: 'pages/store', art: 'blend' },
  admin: { photo: 'pages/about-hero', art: 'bowls' },
};

export const festivalImage = (id) => ({ photo: `festivals/${id}`, art: 'festive' });

export const instagramImages = [1, 2, 3, 4, 5, 6].map((n, i) => ({ photo: `instagram/${n}`, art: ['bowls', 'maharashtra', 'south', 'festive', 'north', 'pure'][i] }));
