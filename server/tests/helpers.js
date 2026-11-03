import request from 'supertest';
import argon2 from 'argon2';
import { createApp } from '../src/app.js';
import { prisma } from '../src/lib/core.js';

export const app = createApp();
export const api = () => request(app);
export const ORIGIN = 'http://localhost:5173';

let n = 0;
export const uniqueEmail = (tag = 'u') => `${tag}${Date.now()}${(n += 1)}@example.com`;
export const uniquePhone = () => `9${String(Date.now()).slice(-6)}${String((n += 1) % 1000).padStart(3, '0')}`;

/** Pull the refresh cookie value from a response. */
export const refreshCookie = (res) => (res.headers['set-cookie'] || []).find((c) => c.startsWith('sm_rt='))?.split(';')[0];

/** Full customer OTP sign-in. */
export async function customer(identifier = uniqueEmail(), channel = 'email') {
  const r1 = await api().post('/api/v1/auth/otp/request').send({ channel, identifier });
  if (r1.status !== 202) throw new Error(`otp request failed ${r1.status} ${JSON.stringify(r1.body)}`);
  const r2 = await api().post('/api/v1/auth/otp/verify').send({ challengeId: r1.body.challengeId, code: r1.body.devCode, name: 'Test Customer' });
  if (r2.status !== 200) throw new Error(`otp verify failed ${r2.status} ${JSON.stringify(r2.body)}`);
  return { token: r2.body.accessToken, user: r2.body.user, cookie: refreshCookie(r2), auth: { Authorization: `Bearer ${r2.body.accessToken}` } };
}

/** Create a staff account directly and sign in through password + OTP. */
export async function staff(role = 'SUPER_ADMIN') {
  const email = uniqueEmail(role.toLowerCase());
  const password = 'Correct-Horse-9-Battery';
  await prisma.user.create({ data: { email, name: role, role, emailVerified: true, passwordHash: await argon2.hash(password) } });
  const r1 = await api().post('/api/v1/auth/admin/login').send({ email, password });
  if (r1.status !== 202) throw new Error(`admin login failed ${r1.status} ${JSON.stringify(r1.body)}`);
  const r2 = await api().post('/api/v1/auth/admin/verify').send({ challengeId: r1.body.challengeId, code: r1.body.devCode });
  if (r2.status !== 200) throw new Error(`admin verify failed ${r2.status}`);
  return { email, password, token: r2.body.accessToken, user: r2.body.user, auth: { Authorization: `Bearer ${r2.body.accessToken}` } };
}

export const address = { house: '12, Shanti Niwas', street: 'FC Road', area: 'Shivajinagar', landmark: '', city: 'Pune', state: 'Maharashtra', pin: '411005' };
export const checkoutBody = (items, extra = {}) => ({ items, paymentMethod: 'cod', customer: { name: 'Test Customer', phone: '9876543210' }, address, ...extra });
export const stockOf = async (productId, size) => (await prisma.productPack.findUnique({ where: { productId_size: { productId, size } } })).stock;
export const setStock = (productId, size, stock) => prisma.productPack.update({ where: { productId_size: { productId, size } }, data: { stock } });
