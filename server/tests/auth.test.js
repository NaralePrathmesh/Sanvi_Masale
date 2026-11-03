import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import jwt from 'jsonwebtoken';
import { api, customer, staff, uniqueEmail, uniquePhone, refreshCookie, ORIGIN } from './helpers.js';
import { prisma, redis } from '../src/lib/core.js';

after(async () => { await prisma.$disconnect(); await redis?.quit(); });

test('email OTP: wrong codes count down, correct code signs in and creates the account', async () => {
  const email = uniqueEmail();
  const r1 = await api().post('/api/v1/auth/otp/request').send({ channel: 'email', identifier: email.toUpperCase() });
  assert.equal(r1.status, 202);
  assert.match(r1.body.sentTo, /•••/);
  const stored = await prisma.otpChallenge.findUnique({ where: { id: r1.body.challengeId } });
  assert.equal(stored.identifier, email, 'email is normalised to lower case');
  assert.notEqual(stored.codeHash, r1.body.devCode, 'code is never stored in plain text');

  const wrong = r1.body.devCode === '000000' ? '111111' : '000000';
  const bad = await api().post('/api/v1/auth/otp/verify').send({ challengeId: r1.body.challengeId, code: wrong });
  assert.equal(bad.status, 400);
  assert.equal(bad.body.error.details.attemptsLeft, 4);

  const ok = await api().post('/api/v1/auth/otp/verify').send({ challengeId: r1.body.challengeId, code: r1.body.devCode });
  assert.equal(ok.status, 200);
  assert.ok(ok.body.accessToken);
  assert.equal(ok.body.isNew, true);
  assert.equal(ok.body.user.emailVerified, true);
  assert.equal(ok.body.user.role, 'CUSTOMER');
  const cookie = ok.headers['set-cookie'].find((c) => c.startsWith('sm_rt='));
  assert.match(cookie, /HttpOnly/i); assert.match(cookie, /SameSite=Strict/i); assert.match(cookie, /Path=\/api\/v1\/auth/);

  const replay = await api().post('/api/v1/auth/otp/verify').send({ challengeId: r1.body.challengeId, code: r1.body.devCode });
  assert.equal(replay.status, 400, 'a code can only be used once');
});

test('OTP locks after 5 wrong attempts even with the right code afterwards', async () => {
  const r1 = await api().post('/api/v1/auth/otp/request').send({ channel: 'email', identifier: uniqueEmail() });
  const wrong = r1.body.devCode === '123456' ? '654321' : '123456';
  for (let i = 0; i < 5; i += 1) await api().post('/api/v1/auth/otp/verify').send({ challengeId: r1.body.challengeId, code: wrong });
  const ok = await api().post('/api/v1/auth/otp/verify').send({ challengeId: r1.body.challengeId, code: r1.body.devCode });
  assert.equal(ok.status, 400);
});

test('SMS OTP normalises Indian numbers and rejects invalid ones', async () => {
  const digits = uniquePhone();
  const r = await api().post('/api/v1/auth/otp/request').send({ channel: 'sms', identifier: `+91 ${digits.slice(0, 5)} ${digits.slice(5)}` });
  assert.equal(r.status, 202);
  const ch = await prisma.otpChallenge.findUnique({ where: { id: r.body.challengeId } });
  assert.equal(ch.identifier, `+91${digits}`);
  assert.equal((await api().post('/api/v1/auth/otp/request').send({ channel: 'sms', identifier: '12345' })).status, 400);
  const v = await api().post('/api/v1/auth/otp/verify').send({ challengeId: r.body.challengeId, code: r.body.devCode });
  assert.equal(v.body.user.phone, `+91${digits}`);
  assert.equal(v.body.user.phoneVerified, true);
});

test('resend cooldown and a new code invalidates the previous one', async () => {
  const email = uniqueEmail();
  const r1 = await api().post('/api/v1/auth/otp/request').send({ channel: 'email', identifier: email });
  const r2 = await api().post('/api/v1/auth/otp/request').send({ channel: 'email', identifier: email });
  assert.equal(r2.status, 429);
  assert.ok(Number(r2.headers['retry-after']) > 0);
  await redis.del(`otp:cd:LOGIN:${email}`);
  const r3 = await api().post('/api/v1/auth/otp/request').send({ channel: 'email', identifier: email });
  assert.equal(r3.status, 202);
  const old = await api().post('/api/v1/auth/otp/verify').send({ challengeId: r1.body.challengeId, code: r1.body.devCode });
  assert.equal(old.status, 400, 'old code no longer works');
});

test('protected routes reject missing, forged, expired and alg=none tokens', async () => {
  const c = await customer();
  assert.equal((await api().get('/api/v1/account/orders')).status, 401);
  assert.equal((await api().get('/api/v1/account/orders').set(c.auth)).status, 200);
  const forged = jwt.sign({ role: 'SUPER_ADMIN', tv: 0 }, 'not-the-real-secret-not-the-real-secret', { subject: c.user.id, issuer: 'saanvi-masale-api', audience: 'saanvi-masale-web' });
  assert.equal((await api().get('/api/v1/admin/products').set('Authorization', `Bearer ${forged}`)).status, 401);
  const none = `${Buffer.from('{"alg":"none","typ":"JWT"}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: c.user.id, role: 'SUPER_ADMIN', tv: 0 })).toString('base64url')}.`;
  assert.equal((await api().get('/api/v1/admin/products').set('Authorization', `Bearer ${none}`)).status, 401);
  const expired = jwt.sign({ role: 'CUSTOMER', tv: 0 }, process.env.JWT_ACCESS_SECRET, { subject: c.user.id, issuer: 'saanvi-masale-api', audience: 'saanvi-masale-web', expiresIn: -10 });
  assert.equal((await api().get('/api/v1/account/orders').set('Authorization', `Bearer ${expired}`)).status, 401);
});

test('refresh tokens rotate, and reusing an old one revokes the whole session family', async () => {
  const c = await customer();
  const r1 = await api().post('/api/v1/auth/refresh').set('Cookie', c.cookie).set('Origin', ORIGIN);
  assert.equal(r1.status, 200);
  const newer = refreshCookie(r1);
  assert.notEqual(newer, c.cookie);
  const reuse = await api().post('/api/v1/auth/refresh').set('Cookie', c.cookie).set('Origin', ORIGIN);
  assert.equal(reuse.status, 401, 'old token rejected');
  const after = await api().post('/api/v1/auth/refresh').set('Cookie', newer).set('Origin', ORIGIN);
  assert.equal(after.status, 401, 'thief and victim both signed out after reuse');
});

test('refresh without any cookie is a quiet "no session" (204), not an error', async () => {
  const r = await api().post('/api/v1/auth/refresh').set('Origin', ORIGIN);
  assert.equal(r.status, 204);
});

test('refresh from a foreign origin is refused (CSRF defence)', async () => {
  const c = await customer();
  const r = await api().post('/api/v1/auth/refresh').set('Cookie', c.cookie).set('Origin', 'https://evil.example');
  assert.equal(r.status, 403);
});

test('logout revokes the session; logout-all invalidates existing access tokens immediately', async () => {
  const c = await customer();
  assert.equal((await api().post('/api/v1/auth/logout').set('Cookie', c.cookie).set('Origin', ORIGIN)).status, 204);
  assert.equal((await api().post('/api/v1/auth/refresh').set('Cookie', c.cookie).set('Origin', ORIGIN)).status, 401);
  const d = await customer();
  assert.equal((await api().post('/api/v1/auth/logout-all').set(d.auth)).status, 204);
  assert.equal((await api().get('/api/v1/account/orders').set(d.auth)).status, 401, 'token version bumped');
});

test('customers cannot reach admin APIs; profile updates cannot escalate role (mass assignment)', async () => {
  const c = await customer();
  for (const path of ['/api/v1/admin/products', '/api/v1/admin/orders', '/api/v1/admin/customers', '/api/v1/admin/settings', '/api/v1/admin/dashboard']) {
    assert.equal((await api().get(path).set(c.auth)).status, 403, path);
  }
  const p = await api().patch('/api/v1/account/profile').set(c.auth).send({ name: 'Hacker', role: 'SUPER_ADMIN', status: 'ACTIVE', tokenVersion: 99 });
  assert.equal(p.status, 200);
  const u = await prisma.user.findUnique({ where: { id: c.user.id } });
  assert.equal(u.role, 'CUSTOMER'); assert.equal(u.name, 'Hacker'); assert.equal(u.tokenVersion, 0);
});

test('admin sign-in needs password AND emailed OTP; wrong passwords lock the account', async () => {
  const s = await staff('ADMIN');
  assert.equal((await api().get('/api/v1/admin/products').set(s.auth)).status, 200);
  assert.equal(s.user.role, 'ADMIN');

  // password alone never yields a token
  const step1 = await api().post('/api/v1/auth/admin/login').send({ email: s.email, password: s.password });
  assert.equal(step1.status, 202); assert.equal(step1.body.accessToken, undefined); assert.equal(step1.body.twoFactor, true);

  for (let i = 0; i < 5; i += 1) assert.equal((await api().post('/api/v1/auth/admin/login').send({ email: s.email, password: 'wrong-password-123' })).status, 401);
  const locked = await api().post('/api/v1/auth/admin/login').send({ email: s.email, password: s.password });
  assert.equal(locked.status, 429, 'locked even with the right password');

  // unknown email behaves exactly like a wrong password (no account enumeration)
  const unknown = await api().post('/api/v1/auth/admin/login').send({ email: uniqueEmail('nobody'), password: 'whatever-123' });
  assert.equal(unknown.status, 401);
});

test('customers cannot use the admin login, and staff cannot use customer OTP login', async () => {
  const c = await customer();
  assert.equal((await api().post('/api/v1/auth/admin/login').send({ email: c.user.email, password: 'anything-123' })).status, 401);
  const s = await staff('STAFF');
  const r1 = await api().post('/api/v1/auth/otp/request').send({ channel: 'email', identifier: s.email });
  assert.equal(r1.status, 202, 'same response as a normal request');
  assert.equal(r1.body.devCode, undefined, 'but no code is actually issued');
  assert.equal(await prisma.otpChallenge.count({ where: { id: r1.body.challengeId } }), 0);
});

test('STAFF role has least privilege', async () => {
  const s = await staff('STAFF');
  assert.equal((await api().get('/api/v1/admin/orders').set(s.auth)).status, 200);
  assert.equal((await api().patch('/api/v1/admin/inventory').set(s.auth).send({ updates: [{ productId: 'p01', size: '50g', delta: 1 }] })).status, 200);
  assert.equal((await api().put('/api/v1/admin/settings').set(s.auth).send({ codCharge: 0 })).status, 403);
  assert.equal((await api().post('/api/v1/admin/coupons').set(s.auth).send({ code: 'HACK90', type: 'percent', value: 90, validTo: '2030-01-01' })).status, 403);
  assert.equal((await api().patch('/api/v1/admin/products/p01').set(s.auth).send({ active: false })).status, 403);
  assert.equal((await api().get('/api/v1/admin/staff').set(s.auth)).status, 403);
});

test('blocking a customer cuts off access immediately', async () => {
  const c = await customer();
  const admin = await staff('ADMIN');
  assert.equal((await api().patch(`/api/v1/admin/customers/${c.user.id}`).set(admin.auth).send({ status: 'BLOCKED' })).status, 200);
  assert.ok([401, 403].includes((await api().get('/api/v1/account/orders').set(c.auth)).status), 'existing access token refused');
  assert.ok([401, 403].includes((await api().post('/api/v1/auth/refresh').set('Cookie', c.cookie).set('Origin', ORIGIN)).status), 'refresh refused');
});

test('super admin can create staff with strong passwords only; admins cannot', async () => {
  const sa = await staff('SUPER_ADMIN');
  const weak = await api().post('/api/v1/admin/staff').set(sa.auth).send({ name: 'Packer', email: uniqueEmail('packer'), role: 'STAFF', password: 'password' });
  assert.equal(weak.status, 400);
  const ok = await api().post('/api/v1/admin/staff').set(sa.auth).send({ name: 'Packer', email: uniqueEmail('packer'), role: 'STAFF', password: 'Packing-Team-2026' });
  assert.equal(ok.status, 201);
  const ad = await staff('ADMIN');
  assert.equal((await api().post('/api/v1/admin/staff').set(ad.auth).send({ name: 'X', email: uniqueEmail('x'), role: 'SUPER_ADMIN', password: 'Escalate-Me-2026' })).status, 403);
});

test('adding a second contact needs its own OTP and cannot steal another account’s number', async () => {
  const a = await customer();
  const phone = uniquePhone();
  const r1 = await api().post('/api/v1/auth/contact/request').set(a.auth).send({ channel: 'sms', identifier: phone });
  assert.equal(r1.status, 202);
  const r2 = await api().post('/api/v1/auth/contact/verify').set(a.auth).send({ challengeId: r1.body.challengeId, code: r1.body.devCode });
  assert.equal(r2.status, 200); assert.equal(r2.body.user.phone, `+91${phone}`);
  const b = await customer();
  assert.equal((await api().post('/api/v1/auth/contact/request').set(b.auth).send({ channel: 'sms', identifier: phone })).status, 409);
});
