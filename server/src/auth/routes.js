import { Router } from 'express';
import argon2 from 'argon2';
import { z } from 'zod';
import { config } from '../config/env.js';
import { prisma, kv, ah, errors, audit, maskEmail, maskPhone } from '../lib/core.js';
import { validate, zEmail, zPhoneIN, zText } from '../lib/validate.js';
import { limits } from '../middleware/rateLimit.js';
import { requestOtp, verifyOtp } from './otp.js';
import { issueSession, rotateSession, revokeSession, revokeAllForUser, cookieOptions, REFRESH_COOKIE, forgetUser } from './tokens.js';
import { requireAuth } from './middleware.js';

export const authRouter = Router();

/** Public shape of a user returned to the client. */
export const publicUser = (u) => ({
  id: u.id, name: u.name || '', email: u.email || '', phone: u.phone || '', role: u.role,
  emailVerified: !!u.emailVerified, phoneVerified: !!u.phoneVerified, joinedAt: u.createdAt,
});

const contactSchema = z.discriminatedUnion('channel', [
  z.object({ channel: z.literal('email'), identifier: zEmail }),
  z.object({ channel: z.literal('sms'), identifier: zPhoneIN }),
]);
const CH = { email: 'EMAIL', sms: 'SMS' };
const field = (channel) => (channel === 'email' ? 'email' : 'phone');

/** Cookie-authenticated endpoints must come from an allowed origin (CSRF defence in depth). */
function assertOrigin(req) {
  const origin = req.get('origin');
  if (!origin) return; // same-origin navigations / non-browser clients
  if (!config.CORS_ORIGINS.includes(origin)) throw errors.forbidden('Origin not allowed');
}

async function startSession(res, req, user) {
  const { accessToken, refreshToken } = await issueSession(user, req);
  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(user.role));
  return accessToken;
}

/* ─── Customer: passwordless OTP sign-in / sign-up (email or Indian mobile) ─── */

authRouter.post('/otp/request', limits.otpSend, validate({ body: contactSchema }), ah(async (req, res) => {
  const { channel, identifier } = req.body;
  const existing = await prisma.user.findUnique({ where: { [field(channel)]: identifier }, select: { role: true, status: true } });
  // Staff accounts must use the admin sign-in; blocked accounts get no code. The response is identical
  // either way so the endpoint can't be used to discover which emails/numbers are registered.
  const deliver = !existing || (existing.role === 'CUSTOMER' && existing.status === 'ACTIVE');
  const r = await requestOtp({ channel: CH[channel], identifier, purpose: 'LOGIN', req, deliver });
  res.status(202).json({ ...r, sentTo: channel === 'email' ? maskEmail(identifier) : maskPhone(identifier) });
}));

authRouter.post('/otp/verify', limits.auth, validate({ body: z.object({ challengeId: z.string().max(64), code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code'), name: zText(80).optional() }) }), ah(async (req, res) => {
  const ch = await verifyOtp({ challengeId: req.body.challengeId, code: req.body.code, purpose: 'LOGIN' });
  const key = ch.channel === 'EMAIL' ? 'email' : 'phone';
  const verifiedFlag = ch.channel === 'EMAIL' ? 'emailVerified' : 'phoneVerified';

  let user = await prisma.user.findUnique({ where: { [key]: ch.identifier } });
  let isNew = false;
  if (user && (user.role !== 'CUSTOMER' || user.status !== 'ACTIVE')) throw errors.forbidden('This account cannot sign in here.');
  if (!user) {
    user = await prisma.user.create({ data: { [key]: ch.identifier, [verifiedFlag]: true, name: req.body.name || null, lastLoginAt: new Date() } });
    isNew = true;
  } else {
    user = await prisma.user.update({ where: { id: user.id }, data: { [verifiedFlag]: true, lastLoginAt: new Date(), ...(req.body.name && !user.name ? { name: req.body.name } : {}) } });
  }
  const accessToken = await startSession(res, req, user);
  audit({ ...req, user }, isNew ? 'auth.signup' : 'auth.login', 'user', user.id, { channel: ch.channel });
  res.json({ accessToken, user: publicUser(user), isNew });
}));

/* ─── Staff/admin: password + mandatory email OTP (2FA) ─── */

const DUMMY_HASH = await argon2.hash('timing-equaliser-not-a-real-password');
const LOCK_MAX = 5;

authRouter.post('/admin/login', limits.adminLogin, validate({ body: z.object({ email: zEmail, password: z.string().min(1).max(200) }) }), ah(async (req, res) => {
  const { email, password } = req.body;
  const lockKey = `adm:fail:${email}`;
  if ((Number(await kv.get(lockKey)) || 0) >= LOCK_MAX) throw errors.tooMany('This account is temporarily locked after failed attempts. Try again in 15 minutes.', await kv.ttl(lockKey));

  const user = await prisma.user.findUnique({ where: { email } });
  const ok = await argon2.verify(user?.passwordHash || DUMMY_HASH, password).catch(() => false);
  if (!user || !ok || user.role === 'CUSTOMER' || !user.passwordHash) {
    await kv.incr(lockKey, 15 * 60);
    audit(req, 'admin.login_failed', 'user', user?.id, { email: maskEmail(email) });
    throw errors.unauthorized('Incorrect email or password.');
  }
  if (user.status !== 'ACTIVE') throw errors.forbidden('This account is disabled.');
  await kv.del(lockKey);
  const r = await requestOtp({ channel: 'EMAIL', identifier: email, purpose: 'ADMIN_2FA', userId: user.id, req });
  res.status(202).json({ twoFactor: true, ...r, sentTo: maskEmail(email) });
}));

authRouter.post('/admin/verify', limits.auth, validate({ body: z.object({ challengeId: z.string().max(64), code: z.string().trim().regex(/^\d{6}$/) }) }), ah(async (req, res) => {
  const ch = await verifyOtp({ challengeId: req.body.challengeId, code: req.body.code, purpose: 'ADMIN_2FA' });
  const user = await prisma.user.update({ where: { id: ch.userId }, data: { lastLoginAt: new Date() } });
  if (user.role === 'CUSTOMER' || user.status !== 'ACTIVE') throw errors.forbidden();
  const accessToken = await startSession(res, req, user);
  audit({ ...req, user }, 'admin.login', 'user', user.id);
  res.json({ accessToken, user: publicUser(user) });
}));

/* ─── Session lifecycle ─── */

authRouter.post('/refresh', limits.refresh, ah(async (req, res) => {
  assertOrigin(req);
  // No cookie at all = a signed-out visitor: answer "no session" without an error.
  if (!req.cookies?.[REFRESH_COOKIE]) return res.status(204).end();
  try {
    const { user, accessToken, refreshToken } = await rotateSession(req.cookies?.[REFRESH_COOKIE], req);
    res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions(user.role));
    res.json({ accessToken, user: publicUser(user) });
  } catch (e) {
    res.clearCookie(REFRESH_COOKIE, cookieOptions('CUSTOMER', true));
    throw e;
  }
}));

authRouter.post('/logout', limits.refresh, ah(async (req, res) => {
  assertOrigin(req);
  await revokeSession(req.cookies?.[REFRESH_COOKIE]);
  res.clearCookie(REFRESH_COOKIE, cookieOptions('CUSTOMER', true));
  res.status(204).end();
}));

authRouter.post('/logout-all', requireAuth, ah(async (req, res) => {
  await revokeAllForUser(req.user.id);
  res.clearCookie(REFRESH_COOKIE, cookieOptions('CUSTOMER', true));
  audit(req, 'auth.logout_all', 'user', req.user.id);
  res.status(204).end();
}));

authRouter.get('/me', requireAuth, ah(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  res.json({ user: publicUser(user) });
}));

/* ─── Add / verify a second contact (e.g. add a mobile to an email account) ─── */

authRouter.post('/contact/request', requireAuth, limits.otpSend, validate({ body: contactSchema }), ah(async (req, res) => {
  const { channel, identifier } = req.body;
  const taken = await prisma.user.findUnique({ where: { [field(channel)]: identifier }, select: { id: true } });
  if (taken && taken.id !== req.user.id) throw errors.conflict(`This ${channel === 'email' ? 'email' : 'mobile number'} is already linked to another account.`);
  const r = await requestOtp({ channel: CH[channel], identifier, purpose: 'LINK', userId: req.user.id, req });
  res.status(202).json({ ...r, sentTo: channel === 'email' ? maskEmail(identifier) : maskPhone(identifier) });
}));

authRouter.post('/contact/verify', requireAuth, limits.auth, validate({ body: z.object({ challengeId: z.string().max(64), code: z.string().trim().regex(/^\d{6}$/) }) }), ah(async (req, res) => {
  const ch = await verifyOtp({ challengeId: req.body.challengeId, code: req.body.code, purpose: 'LINK' });
  if (ch.userId !== req.user.id) throw errors.forbidden();
  const key = ch.channel === 'EMAIL' ? 'email' : 'phone';
  const taken = await prisma.user.findUnique({ where: { [key]: ch.identifier }, select: { id: true } });
  if (taken && taken.id !== req.user.id) throw errors.conflict('Already linked to another account.');
  const user = await prisma.user.update({ where: { id: req.user.id }, data: { [key]: ch.identifier, [ch.channel === 'EMAIL' ? 'emailVerified' : 'phoneVerified']: true } });
  await forgetUser(user.id);
  audit(req, 'account.contact_verified', 'user', user.id, { channel: ch.channel });
  res.json({ user: publicUser(user) });
}));
