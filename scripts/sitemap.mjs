// Writes public/sitemap.xml and public/robots.txt for every public page. Set SITE_URL before launch.
import fs from 'node:fs';
import { defaultProducts } from '../src/data/products.js';
import { festivals } from '../src/data/products.js';
import { recipes, recipeCategories } from '../src/data/recipes.js';
import { categories, REGION_SLUGS } from '../src/data/categories.js';
import { journalPosts } from '../src/data/journal.js';

const SITE = process.env.SITE_URL || 'https://www.saanvimasale.example';
const paths = [
  '/', '/shop', '/categories', '/recipes', '/about', '/reviews', '/contact', '/offers', '/combo-builder', '/spice-finder', '/regional', '/festivals',
  '/gift-boxes', '/bulk-orders', '/store-locator', '/journal', '/faq', '/shipping', '/returns', '/privacy', '/terms', '/track-order',
  ...categories.map((c) => `/category/${c.id}`),
  ...Object.values(REGION_SLUGS).map((r) => `/regional/${r}`),
  ...festivals.map((f) => `/festivals/${f.slug}`),
  ...recipeCategories.map((c) => `/recipes/category/${c}`),
  ...recipes.map((r) => `/recipes/${r.slug}`),
  ...journalPosts.map((j) => `/journal/${j.slug}`),
  ...defaultProducts.map((p) => `/product/${p.slug}`),
];
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((p) => `  <url><loc>${SITE}${p}</loc></url>`).join('\n')}\n</urlset>\n`;
fs.writeFileSync('public/sitemap.xml', xml);
fs.writeFileSync('public/robots.txt', `User-agent: *\nDisallow: /admin\nDisallow: /account\nDisallow: /checkout\nDisallow: /cart\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`sitemap: ${paths.length} URLs`);
