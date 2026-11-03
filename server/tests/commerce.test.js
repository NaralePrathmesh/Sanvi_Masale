import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { api, customer, staff, checkoutBody, stockOf, setStock } from './helpers.js';
import { prisma, redis } from '../src/lib/core.js';

after(async () => { await prisma.$disconnect(); await redis?.quit(); });

test('public catalogue serves active products only, with ETag caching', async () => {
  const r = await api().get('/api/v1/catalog');
  assert.equal(r.status, 200);
  assert.equal(r.body.products.length, 44);
  assert.ok(r.body.categories.length >= 8);
  assert.equal(r.body.settings.lowStockThreshold, undefined, 'admin-only settings are not public');
  const again = await api().get('/api/v1/catalog').set('If-None-Match', r.headers.etag);
  assert.equal(again.status, 304);
});

test('cart quote ignores client prices and computes combo + coupon + delivery on the server', async () => {
  const items = [{ productId: 'p01', size: '100g', qty: 2, price: 1 }, { productId: 'p02', size: '100g', qty: 1, mrp: 1 }];
  const r = await api().post('/api/v1/cart/quote').send({ items, couponCode: 'welcome10', pin: '411005' });
  assert.equal(r.status, 200);
  const p01 = await prisma.productPack.findUnique({ where: { productId_size: { productId: 'p01', size: '100g' } } });
  const p02 = await prisma.productPack.findUnique({ where: { productId_size: { productId: 'p02', size: '100g' } } });
  const subtotal = p01.price * 2 + p02.price;
  assert.equal(r.body.totals.subtotal, subtotal);
  assert.equal(r.body.totals.couponCode, 'WELCOME10');
  assert.equal(r.body.totals.couponDiscount, Math.min(150, Math.round(subtotal * 0.1)));

  const combo = [1, 2, 3].map((i) => ({ productId: `p0${i}`, size: '100g', qty: 1, comboId: 'c1', comboPct: 90 }));
  const c = await api().post('/api/v1/cart/quote').send({ items: combo });
  assert.ok(c.body.lines.every((l) => l.comboPct === 10), 'client-sent 90% combo discount is replaced by the real 10% tier');
});

test('placing an order decrements stock atomically; idempotent retries do not double-charge', async () => {
  const c = await customer();
  await setStock('p05', '100g', 10);
  const body = checkoutBody([{ productId: 'p05', size: '100g', qty: 3 }]);
  const r1 = await api().post('/api/v1/account/orders').set(c.auth).set('Idempotency-Key', 'order-key-0001').send(body);
  assert.equal(r1.status, 201, JSON.stringify(r1.body));
  assert.equal(r1.body.order.paymentStatus, 'COD_PENDING');
  assert.match(r1.body.order.id, /^SM\d{4}[A-Z2-9]{6}$/);
  assert.equal(await stockOf('p05', '100g'), 7);
  const r2 = await api().post('/api/v1/account/orders').set(c.auth).set('Idempotency-Key', 'order-key-0001').send(body);
  assert.equal(r2.status, 200); assert.equal(r2.body.replay, true); assert.equal(r2.body.order.id, r1.body.order.id);
  assert.equal(await stockOf('p05', '100g'), 7, 'retry did not take stock twice');
});

test('concurrent checkouts can never oversell the last units', async () => {
  await setStock('p06', '100g', 3);
  const buyers = await Promise.all(Array.from({ length: 6 }, () => customer()));
  const results = await Promise.all(buyers.map((b) => api().post('/api/v1/account/orders').set(b.auth).send(checkoutBody([{ productId: 'p06', size: '100g', qty: 1 }]))));
  const ok = results.filter((r) => r.status === 201).length;
  assert.equal(ok, 3, `exactly 3 orders succeed (got ${results.map((r) => r.status).join(',')})`);
  assert.ok(results.filter((r) => r.status !== 201).every((r) => r.status === 409));
  assert.equal(await stockOf('p06', '100g'), 0);
});

test('orders are private: another customer gets 404, not the data', async () => {
  const a = await customer(); const b = await customer();
  const o = await api().post('/api/v1/account/orders').set(a.auth).send(checkoutBody([{ productId: 'p07', size: '100g', qty: 1 }]));
  assert.equal(o.status, 201);
  assert.equal((await api().get(`/api/v1/account/orders/${o.body.order.id}`).set(b.auth)).status, 404);
  assert.equal((await api().post(`/api/v1/account/orders/${o.body.order.id}/cancel`).set(b.auth)).status, 404);
  assert.equal((await api().get(`/api/v1/account/orders/${o.body.order.id}`).set(a.auth)).status, 200);
});

test('cancelling restocks; cancelled orders cannot be reopened; delivered COD becomes paid', async () => {
  const c = await customer(); const admin = await staff('ADMIN');
  await setStock('p08', '50g', 5);
  const o = await api().post('/api/v1/account/orders').set(c.auth).send(checkoutBody([{ productId: 'p08', size: '50g', qty: 2 }]));
  assert.equal(await stockOf('p08', '50g'), 3);
  assert.equal((await api().post(`/api/v1/account/orders/${o.body.order.id}/cancel`).set(c.auth)).status, 200);
  assert.equal(await stockOf('p08', '50g'), 5);
  assert.equal((await api().patch(`/api/v1/admin/orders/${o.body.order.id}/status`).set(admin.auth).send({ status: 'confirmed' })).status, 409);

  const o2 = await api().post('/api/v1/account/orders').set(c.auth).send(checkoutBody([{ productId: 'p08', size: '50g', qty: 1 }]));
  assert.equal((await api().patch(`/api/v1/admin/orders/${o2.body.order.id}/status`).set(admin.auth).send({ status: 'shipped' })).status, 200);
  assert.equal((await api().post(`/api/v1/account/orders/${o2.body.order.id}/cancel`).set(c.auth)).status, 409, 'customers cannot cancel shipped orders');
  const d = await api().patch(`/api/v1/admin/orders/${o2.body.order.id}/status`).set(admin.auth).send({ status: 'delivered' });
  assert.equal(d.body.order.paymentStatus, 'PAID');
});

test('checkout rejects unserviceable PINs, COD where unavailable, and full card numbers', async () => {
  const c = await customer();
  const items = [{ productId: 'p09', size: '100g', qty: 1 }];
  assert.equal((await api().post('/api/v1/account/orders').set(c.auth).send(checkoutBody(items, { address: { ...checkoutBody([]).address, pin: '799001' } }))).status, 422);
  assert.equal((await api().post('/api/v1/account/orders').set(c.auth).send(checkoutBody(items, { address: { ...checkoutBody([]).address, pin: '416003' } }))).status, 422);
  assert.equal((await api().post('/api/v1/account/orders').set(c.auth).send(checkoutBody(items, { paymentMethod: 'card', paymentInfo: '4111 1111 1111 1111' }))).status, 400);
});

test('coupon usage limits are enforced under concurrency', async () => {
  const admin = await staff('ADMIN');
  assert.equal((await api().post('/api/v1/admin/coupons').set(admin.auth).send({ code: 'ONLY2', type: 'flat', value: 20, validTo: '2030-12-31', usageLimit: 2 })).status, 201);
  const buyers = await Promise.all(Array.from({ length: 4 }, () => customer()));
  const res = await Promise.all(buyers.map((b) => api().post('/api/v1/account/orders').set(b.auth).send(checkoutBody([{ productId: 'p10', size: '100g', qty: 1 }], { couponCode: 'ONLY2' }))));
  assert.equal(res.filter((r) => r.status === 201).length, 2);
  assert.equal((await prisma.coupon.findUnique({ where: { code: 'ONLY2' } })).usedCount, 2);
});

test('addresses and wishlist are scoped to their owner', async () => {
  const a = await customer(); const b = await customer();
  const addr = await api().post('/api/v1/account/addresses').set(a.auth).send({ ...checkoutBody([]).address, name: 'Asha', phone: '9876543210' });
  assert.equal(addr.status, 201, JSON.stringify(addr.body)); assert.equal(addr.body.address.isDefault, true);
  assert.equal((await api().delete(`/api/v1/account/addresses/${addr.body.address.id}`).set(b.auth)).status, 404);
  assert.equal((await api().put('/api/v1/account/wishlist/p01').set(a.auth)).status, 204);
  assert.deepEqual((await api().get('/api/v1/account/wishlist').set(b.auth)).body.productIds, []);
  assert.deepEqual((await api().get('/api/v1/account/wishlist').set(a.auth)).body.productIds, ['p01']);
});

test('admin product edits go live in the public catalogue immediately', async () => {
  const admin = await staff('ADMIN');
  const list = await api().get('/api/v1/admin/products').set(admin.auth);
  const p = list.body.products.find((x) => x.id === 'p11');
  const body = { ...p, packs: p.packs.map(({ id, ...k }) => ({ ...k, price: k.size === '100g' ? 77 : k.price, mrp: Math.max(k.mrp, 77) })) };
  delete body.id; delete body.reviews; delete body.rating; delete body.createdAt;
  const r = await api().put('/api/v1/admin/products/p11').set(admin.auth).send(body);
  assert.equal(r.status, 200, JSON.stringify(r.body));
  const cat = await api().get('/api/v1/catalog');
  assert.equal(cat.body.products.find((x) => x.id === 'p11').packs.find((k) => k.size === '100g').price, 77);
  assert.equal((await api().patch('/api/v1/admin/products/p11').set(admin.auth).send({ active: false })).status, 200);
  assert.equal((await api().get('/api/v1/catalog')).body.products.some((x) => x.id === 'p11'), false);
  const bad = await api().put('/api/v1/admin/products/p12').set(admin.auth).send({ ...body, slug: 'garam-masala' });
  assert.equal(bad.status, 409, 'duplicate slug rejected');
});

test('reviews: only signed-in customers can post; admins moderate; samples removable', async () => {
  assert.equal((await api().post('/api/v1/reviews').send({ name: 'Anon', rating: 5, text: 'Spam spam spam spam' })).status, 401);
  const c = await customer();
  const r = await api().post('/api/v1/reviews').set(c.auth).send({ name: 'Real Buyer', rating: 5, text: 'Lovely fresh garam masala!', product: 'garam-masala' });
  assert.equal(r.status, 201);
  const admin = await staff('ADMIN');
  assert.equal((await api().patch(`/api/v1/admin/reviews/${r.body.review.id}`).set(admin.auth).send({ hidden: true })).status, 200);
  assert.equal((await api().get('/api/v1/reviews')).body.reviews.some((x) => x.id === r.body.review.id), false);
  const removed = await api().post('/api/v1/admin/reviews/remove-samples').set(admin.auth);
  assert.equal(removed.body.count, 50);
});

test('settings: only admins can change them; contact numbers flow to the public catalogue', async () => {
  const admin = await staff('ADMIN');
  assert.equal((await api().put('/api/v1/admin/settings').set(admin.auth).send({ whatsapp: '+91 90000 11111', defaultTheme: 'noir' })).status, 200);
  const cat = await api().get('/api/v1/catalog');
  assert.equal(cat.body.settings.whatsapp, '+91 90000 11111');
  assert.equal(cat.body.settings.defaultTheme, 'noir');
  assert.equal((await api().put('/api/v1/admin/settings').set(admin.auth).send({ deliveryCharge: -5 })).status, 400);
});

test('uploads: images only (checked by content, not extension), admins only', async () => {
  const admin = await staff('ADMIN'); const c = await customer();
  const png = Buffer.from('89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA63F8FFFF3F0005FE02FEA7D6A5A80000000049454E44AE426082', 'hex');
  assert.equal((await api().post('/api/v1/admin/media/upload').set(c.auth).attach('file', png, 'a.png')).status, 403);
  const fake = Buffer.from('<?php system($_GET["c"]); ?> pretend image');
  assert.equal((await api().post('/api/v1/admin/media/upload').set(admin.auth).attach('file', fake, { filename: 'evil.png', contentType: 'image/png' })).status, 400);
  const ok = await api().post('/api/v1/admin/media/upload').set(admin.auth).field('folder', 'products').attach('file', png, 'a.png');
  assert.equal(ok.status, 201);
  assert.match(ok.body.asset.url, /\/uploads\/products\/.+\.png$/);
});

test('order tracking needs the matching phone number', async () => {
  const c = await customer();
  const o = await api().post('/api/v1/account/orders').set(c.auth).send(checkoutBody([{ productId: 'p13', size: '100g', qty: 1 }]));
  assert.equal((await api().post('/api/v1/orders/track').send({ orderId: o.body.order.id, phone: '9123456789' })).status, 404);
  const t = await api().post('/api/v1/orders/track').send({ orderId: o.body.order.id, phone: '98765 43210' });
  assert.equal(t.status, 200);
  assert.equal(t.body.order.address.house, undefined, 'tracking never exposes the full address');
});

test('errors never leak internals and malformed input is rejected cleanly', async () => {
  const r = await api().post('/api/v1/auth/otp/verify').set('content-type', 'application/json').send('{"broken');
  assert.equal(r.status, 400); assert.equal(r.body.error.code, 'BAD_REQUEST'); assert.ok(r.body.error.requestId);
  const big = await api().post('/api/v1/newsletter').send({ email: 'a@b.co', junk: 'x'.repeat(300_000) });
  assert.equal(big.status, 413);
  const h = await api().get('/healthz');
  assert.equal(h.headers['x-powered-by'], undefined);
  assert.equal(h.headers['x-content-type-options'], 'nosniff');
});
