/**
 * Load test: simulates 500 shoppers at once against a running API.
 *   1) start the API (e.g. CLUSTER=true npm start)   2) npm run loadtest
 * Each simulated shopper uses its own client IP (X-Forwarded-For), like real traffic behind a
 * load balancer, so per-IP rate limits behave realistically. Shopper accounts for the checkout
 * phase are created directly in the database and get normal access tokens.
 *
 * Env: API_URL (default http://localhost:4000), CONNECTIONS (500), DURATION (20 s).
 */
import autocannon from 'autocannon';
import { PrismaClient } from '@prisma/client';
import { signAccess } from '../src/auth/tokens.js';

const API = process.env.API_URL || 'http://localhost:4000';
const CONNECTIONS = Number(process.env.CONNECTIONS || 500);
const DURATION = Number(process.env.DURATION || 20);
const prisma = new PrismaClient();
const ip = () => `10.${(Math.random() * 255) | 0}.${(Math.random() * 255) | 0}.${(Math.random() * 254 + 1) | 0}`;

function run(title, opts) {
  return new Promise((resolve, reject) => {
    const inst = autocannon({ url: API, connections: CONNECTIONS, duration: DURATION, timeout: 10, ...opts }, (err, r) => (err ? reject(err) : resolve(r)));
    autocannon.track(inst, { renderProgressBar: false, renderResultsTable: false, renderLatencyTable: false });
    console.log(`\n▶ ${title} — ${opts.connections || CONNECTIONS} concurrent connections for ${opts.duration || DURATION}s`);
  });
}
const summary = (name, r) => ({
  scenario: name,
  'req/s (avg)': Math.round(r.requests.average),
  'total requests': r.requests.total,
  'p50 ms': r.latency.p50, 'p90 ms': r.latency.p90, 'p99 ms': r.latency.p99, 'max ms': r.latency.max,
  '2xx': r['2xx'], 'non-2xx': r.non2xx, errors: r.errors, timeouts: r.timeouts,
});

const catalog = await (await fetch(`${API}/api/v1/catalog`)).json();
const slugs = catalog.products.map((p) => p.slug);
const items = catalog.products.slice(0, 12).map((p) => ({ productId: p.id, size: p.packs[0].size, qty: 1 }));
const results = [];

// 1) Browsing: catalogue, product pages, reviews, PIN checks, cart pricing — what most shoppers do.
results.push(summary('browse + cart (mixed)', await run('Browsing mix', {
  requests: [
    { method: 'GET', path: '/api/v1/catalog', setupRequest: (r) => ({ ...r, headers: { ...r.headers, 'x-forwarded-for': ip() } }) },
    { method: 'GET', setupRequest: (r) => ({ ...r, path: `/api/v1/products/${slugs[(Math.random() * slugs.length) | 0]}`, headers: { ...r.headers, 'x-forwarded-for': ip() } }) },
    { method: 'GET', path: '/api/v1/reviews', setupRequest: (r) => ({ ...r, headers: { ...r.headers, 'x-forwarded-for': ip() } }) },
    { method: 'GET', path: '/api/v1/pincode/411005', setupRequest: (r) => ({ ...r, headers: { ...r.headers, 'x-forwarded-for': ip() } }) },
    {
      method: 'POST', path: '/api/v1/cart/quote',
      setupRequest: (r) => ({ ...r, headers: { ...r.headers, 'content-type': 'application/json', 'x-forwarded-for': ip() }, body: JSON.stringify({ items: [items[(Math.random() * items.length) | 0], items[(Math.random() * items.length) | 0]], couponCode: 'WELCOME10', pin: '411005' }) }),
    },
  ],
})));

// 2) Checkout: hundreds of signed-in customers placing real orders at the same time.
const N = Math.min(CONNECTIONS, 500);
await prisma.productPack.updateMany({ where: { productId: { in: items.map((i) => i.productId) } }, data: { stock: 1_000_000 } });
const users = [];
for (let i = 0; i < N; i += 1) {
  const email = `loadtest+${Date.now()}-${i}@example.com`;
  users.push(await prisma.user.create({ data: { email, emailVerified: true, name: `Load Test ${i}` } }));
}
const tokens = users.map((u) => signAccess(u));
const body = (k) => JSON.stringify({
  items: [items[k % items.length]], paymentMethod: 'cod',
  customer: { name: 'Load Test', phone: '9876543210' },
  address: { house: '1', street: 'Test Road', area: 'Test Area', city: 'Pune', state: 'Maharashtra', pin: '411005' },
});
let k = 0;
// Bust the catalogue cache once per order, as in production (stock changed) — the worst case.
results.push(summary('checkout (orders)', await run('Placing orders', {
  connections: N, duration: Math.max(10, Math.round(DURATION / 2)),
  requests: [{
    method: 'POST', path: '/api/v1/account/orders',
    setupRequest: (r) => { k += 1; return { ...r, headers: { ...r.headers, 'content-type': 'application/json', authorization: `Bearer ${tokens[k % tokens.length]}`, 'x-forwarded-for': ip() }, body: body(k) }; },
  }],
})));

console.table(results);
// Clean up synthetic data (after in-flight requests settle).
await new Promise((r) => setTimeout(r, 5000));
const ids = users.map((u) => u.id);
const orders = await prisma.order.count({ where: { userId: { in: ids } } });
await prisma.order.deleteMany({ where: { userId: { in: ids } } });
await prisma.user.deleteMany({ where: { id: { in: ids } } });
console.log(`Orders created during the test: ${orders} (cleaned up)`);
await prisma.$disconnect();
process.exit(0); // close the Redis/DB handles opened by imported modules
