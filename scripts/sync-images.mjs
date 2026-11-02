/**
 * Scans public/images and writes src/assets/imageManifest.json so the site only
 * requests photos that exist (no 404s). Also writes public/images/EXPECTED.md with
 * every filename the site looks for. Runs automatically before `dev` and `build`.
 *
 * Naming: public/images/<group>/<name>.(webp|jpg|jpeg|png|avif)
 * Optional smaller copy for srcset: <name>-800.webp (or .jpg)
 */
import fs from 'node:fs';
import path from 'node:path';
import { defaultProducts } from '../src/data/products.js';
import { recipes } from '../src/data/recipes.js';
import { categories, regions } from '../src/data/categories.js';
import { defaultBanners } from '../src/data/banners.js';
import { journalPosts } from '../src/data/journal.js';

const ROOT = 'public/images';
const EXT = ['webp', 'avif', 'jpg', 'jpeg', 'png'];
const found = {};
const walk = (d) => {
  if (!fs.existsSync(d)) return;
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) { walk(p); continue; }
    const m = /^(.*?)(?:-(\d{3,4}))?\.([a-z]+)$/i.exec(path.relative(ROOT, p).split(path.sep).join('/'));
    if (!m || !EXT.includes(m[3].toLowerCase())) continue;
    const [, key, width, ext] = m;
    found[key] ||= { variants: [] };
    if (width) found[key].variants.push({ w: +width, file: `${key}-${width}.${ext}` });
    else if (!found[key].file || ext === 'webp') found[key].file = `${key}.${ext}`;
  }
};
walk(ROOT);
const manifest = Object.fromEntries(Object.entries(found).filter(([, v]) => v.file).map(([k, v]) => [k, { file: v.file, variants: v.variants.sort((a, b) => a.w - b.w) }]));
fs.mkdirSync('src/assets', { recursive: true });
fs.writeFileSync('src/assets/imageManifest.json', JSON.stringify(manifest, null, 2) + '\n');

const expected = [
  ['Hero banners (16:9, 1920×1080)', defaultBanners.map((b) => `hero/${b.id}`)],
  ['Categories (1:1, 1000×1000)', categories.map((c) => `categories/${c.id}`)],
  ['Regions (3:2, 1500×1000)', regions.map((r) => `regions/${r.id}`)],
  ['Products (4:5, 1000×1250) — 1 = front of pack, 2 = spice close-up / back', defaultProducts.flatMap((p) => [`products/${p.slug}-1`, `products/${p.slug}-2`])],
  ['Recipes (4:3, 1200×900)', recipes.map((r) => `recipes/${r.slug}`)],
  ['Festivals (16:9, 1600×900)', ['diwali', 'ganesh', 'gudipadwa', 'holi', 'navratri'].map((f) => `festivals/${f}`)],
  ['Journal articles (16:9, 1600×900)', journalPosts.map((j) => `journal/${j.slug}`)],
  ['Pages (various)', ['about-hero', 'about-story', 'heritage', 'manufacturing', 'contact', 'login', 'gift-boxes', 'bulk-orders', 'store'].map((n) => `pages/${n}`)],
  ['Instagram grid (1:1, 1080×1080)', [1, 2, 3, 4, 5, 6].map((n) => `instagram/${n}`)],
];
const md = ['# Expected image files', '', 'Put photos at `public/images/<name>.webp` (or .jpg/.png). Optional smaller copy `<name>-800.webp` is used for mobile.', 'Then run `npm run images` (also runs automatically with `npm run dev` / `npm run build`). ✅ = present.', '',
  ...expected.flatMap(([title, keys]) => [`## ${title}`, ...keys.map((k) => `- ${manifest[k] ? '✅' : '⬜'} \`${k}\``), ''])].join('\n');
fs.writeFileSync(path.join(ROOT, 'EXPECTED.md'), md);
const total = expected.reduce((s, [, k]) => s + k.length, 0);
console.log(`images: ${Object.keys(manifest).length} found, ${expected.reduce((s, [, k]) => s + k.filter((x) => manifest[x]).length, 0)}/${total} expected slots filled`);
