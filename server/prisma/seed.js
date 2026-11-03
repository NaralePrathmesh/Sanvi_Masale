/**
 * Seed the database from the storefront's own data files (single source of truth for the
 * launch catalogue). Safe to re-run: existing rows are never overwritten, so admin edits survive.
 *   npm run db:seed
 */
import { PrismaClient } from '@prisma/client';
import { defaultProducts } from '../../src/data/products.js';
import { categories } from '../../src/data/categories.js';
import { recipes } from '../../src/data/recipes.js';
import { customerReviews } from '../../src/data/customerReviews.js';
import { defaultBanners, defaultAnnouncements, defaultHomeContent } from '../../src/data/banners.js';
import { defaultCoupons } from '../../src/config/site.js';

const prisma = new PrismaClient();

async function main() {
  const log = (m) => console.log(`  • ${m}`);
  console.log('Seeding Saanvi Masale…');

  const cats = await prisma.category.createMany({
    data: categories.map((c, i) => ({ id: c.id, name: c.name, desc: c.desc, icon: c.icon, sortOrder: i })), skipDuplicates: true,
  });
  log(`categories: ${cats.count} new`);

  let newProducts = 0;
  for (const p of defaultProducts) {
    if (await prisma.product.findUnique({ where: { id: p.id }, select: { id: true } })) continue;
    await prisma.product.create({
      data: {
        id: p.id, slug: p.slug, sku: p.sku.replace(/^RR-/, 'SM-'), categoryId: p.category, type: p.type, region: p.region, color: p.color,
        name: p.name, short: p.short, description: p.description, ingredients: p.ingredients || [], dishes: p.dishes || [], tags: p.tags || [],
        festivals: p.festivals || [], images: p.images || [], rating: p.rating || 0, reviewCount: p.reviews || 0, popularity: p.popularity || 50,
        heat: p.heat ?? 2, bestseller: !!p.bestseller, isNew: !!p.isNew, active: p.active !== false, createdAt: new Date(p.createdAt || Date.now()),
        packs: { create: p.packs.map((k, i) => ({ size: k.size, grams: k.grams || parseInt(k.size, 10) || 0, price: k.price, mrp: k.mrp || k.price, stock: k.stock ?? 0, sortOrder: i })) },
      },
    });
    newProducts += 1;
  }
  log(`products: ${newProducts} new (${defaultProducts.length} in catalogue)`);

  const rec = await prisma.recipe.createMany({
    data: recipes.map((r, i) => {
      const { id, slug, active, featured, ...rest } = r;
      return { id, slug, active: active !== false, featured: featured !== false, sortOrder: i, data: { id, slug, ...rest } };
    }), skipDuplicates: true,
  });
  log(`recipes: ${rec.count} new`);

  const cps = await prisma.coupon.createMany({ data: defaultCoupons.map((c) => ({ ...c, code: c.code.toUpperCase() })), skipDuplicates: true });
  log(`coupons: ${cps.count} new`);

  if (!(await prisma.review.count())) {
    await prisma.review.createMany({
      data: customerReviews.map((r, i) => ({ name: r.name, city: r.city, productSlug: r.product, rating: r.rating, text: r.text, time: r.time, source: 'SAMPLE', seen: true, sortOrder: i })),
    });
    log(`reviews: ${customerReviews.length} SAMPLE reviews (replace with real ones in Admin → Reviews)`);
  }

  for (const [key, value] of [['banners', defaultBanners], ['announcements', defaultAnnouncements], ['homeContent', defaultHomeContent]]) {
    if (!(await prisma.contentBlock.findUnique({ where: { key } }))) { await prisma.contentBlock.create({ data: { key, value } }); log(`content: ${key}`); }
  }
  console.log('Done. Create your first admin with:  npm run admin:create');
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
