import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { api, uniqueEmail, staff } from './helpers.js';
import { prisma, redis } from '../src/lib/core.js';

before(() => { process.env.RATE_LIMIT_TESTS = 'true'; });
after(async () => { process.env.RATE_LIMIT_TESTS = 'false'; await prisma.$disconnect(); await redis?.quit(); });

test('OTP sending is limited per network (20/hour) with standard RateLimit headers', async () => {
  const ip = '203.0.113.7';
  let last;
  for (let i = 0; i < 21; i += 1) last = await api().post('/api/v1/auth/otp/request').set('X-Forwarded-For', ip).send({ channel: 'email', identifier: uniqueEmail('rl') });
  assert.equal(last.status, 429);
  assert.equal(last.body.error.code, 'RATE_LIMITED');
  assert.ok(last.headers.ratelimit || last.headers['ratelimit-policy']);
  const other = await api().post('/api/v1/auth/otp/request').set('X-Forwarded-For', '203.0.113.8').send({ channel: 'email', identifier: uniqueEmail('rl') });
  assert.equal(other.status, 202, 'other networks are unaffected');
});

test('one email/number gets at most 5 codes per hour, whatever the IP', async () => {
  process.env.RATE_LIMIT_TESTS = 'false';
  const email = uniqueEmail('cap');
  let last;
  for (let i = 0; i < 6; i += 1) {
    await redis.del(`otp:cd:LOGIN:${email}`); // skip the 45 s cooldown to reach the hourly cap
    last = await api().post('/api/v1/auth/otp/request').send({ channel: 'email', identifier: email });
  }
  assert.equal(last.status, 429);
  process.env.RATE_LIMIT_TESTS = 'true';
});

test('admin password guessing is throttled per network', async () => {
  await staff('ADMIN');
  const ip = '198.51.100.23';
  let last;
  for (let i = 0; i < 11; i += 1) last = await api().post('/api/v1/auth/admin/login').set('X-Forwarded-For', ip).send({ email: uniqueEmail('guess'), password: `wrong-${i}-password` });
  assert.equal(last.status, 429);
});
