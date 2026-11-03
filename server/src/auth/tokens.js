import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { prisma, kv, randomToken, sha256, errors, logger } from '../lib/core.js';

/**
 * Token model
 *  • Access token: HS256 JWT, 15 min, sent as `Authorization: Bearer` (kept in memory by the shop).
 *    Claims: sub (user id), role, tv (tokenVersion). Pinned algorithm, issuer and audience.
 *  • Refresh token: 48 random bytes in an httpOnly, Secure, SameSite cookie scoped to /api/v1/auth.
 *    Only its SHA-256 hash is stored. It ROTATES on every refresh; presenting an already-rotated
 *    token is treated as theft and revokes the whole session family.
 */
const ISS = 'saanvi-masale-api';
const AUD = 'saanvi-masale-web';
export const REFRESH_COOKIE = 'sm_rt';
const isStaff = (role) => role !== 'CUSTOMER';

export function signAccess(user) {
  return jwt.sign({ role: user.role, tv: user.tokenVersion }, config.JWT_ACCESS_SECRET, {
    algorithm: 'HS256', subject: user.id, issuer: ISS, audience: AUD, expiresIn: config.ACCESS_TOKEN_TTL,
  });
}

export function verifyAccess(token) {
  try {
    return jwt.verify(token, config.JWT_ACCESS_SECRET, { algorithms: ['HS256'], issuer: ISS, audience: AUD });
  } catch {
    throw errors.unauthorized('Your session has expired. Please sign in again.');
  }
}

const sessionMs = (role) => (isStaff(role) ? config.ADMIN_SESSION_HOURS * 3600_000 : config.CUSTOMER_SESSION_DAYS * 86_400_000);

export function cookieOptions(role, clear = false) {
  return {
    httpOnly: true,
    secure: config.isProd || config.COOKIE_SAMESITE === 'none',
    sameSite: config.COOKIE_SAMESITE,
    path: '/api/v1/auth',
    ...(config.COOKIE_DOMAIN ? { domain: config.COOKIE_DOMAIN } : {}),
    ...(clear ? {} : { maxAge: sessionMs(role) }),
  };
}

/** Create a new session (new family) and return both tokens. */
export async function issueSession(user, req, familyId = randomToken(16)) {
  const refreshToken = randomToken(48);
  await prisma.session.create({
    data: {
      userId: user.id, tokenHash: sha256(refreshToken), familyId,
      expiresAt: new Date(Date.now() + sessionMs(user.role)),
      ip: req.ip, userAgent: String(req.get('user-agent') || '').slice(0, 300),
    },
  });
  return { accessToken: signAccess(user), refreshToken };
}

/** Rotate a refresh token. Detects reuse and revokes the family. */
export async function rotateSession(rawToken, req) {
  if (!rawToken || typeof rawToken !== 'string' || rawToken.length > 200) throw errors.unauthorized();
  const tokenHash = sha256(rawToken);
  const session = await prisma.session.findUnique({ where: { tokenHash }, include: { user: true } });
  if (!session) throw errors.unauthorized();

  if (session.revokedAt || session.replacedBy) {
    // Reuse of an old token ⇒ someone else may hold the newer one. Kill the whole family.
    await prisma.session.updateMany({ where: { familyId: session.familyId, revokedAt: null }, data: { revokedAt: new Date() } });
    logger.warn({ userId: session.userId, familyId: session.familyId }, 'refresh token reuse detected — family revoked');
    throw errors.unauthorized('For your security you have been signed out. Please sign in again.');
  }
  if (session.expiresAt < new Date()) throw errors.unauthorized('Your session has expired. Please sign in again.');
  if (session.user.status !== 'ACTIVE') throw errors.forbidden('This account is disabled.');

  const next = randomToken(48);
  // Optimistic concurrency: only rotate if nobody rotated it in the meantime.
  const claimed = await prisma.session.updateMany({ where: { id: session.id, replacedBy: null, revokedAt: null }, data: { replacedBy: sha256(next), lastUsedAt: new Date() } });
  if (claimed.count !== 1) throw errors.unauthorized();
  await prisma.session.create({
    data: {
      userId: session.userId, tokenHash: sha256(next), familyId: session.familyId,
      expiresAt: session.expiresAt, // absolute lifetime — rotation never extends a session forever
      ip: req.ip, userAgent: String(req.get('user-agent') || '').slice(0, 300),
    },
  });
  return { user: session.user, accessToken: signAccess(session.user), refreshToken: next };
}

export async function revokeSession(rawToken) {
  if (!rawToken) return;
  const s = await prisma.session.findUnique({ where: { tokenHash: sha256(rawToken) } });
  if (s) await prisma.session.updateMany({ where: { familyId: s.familyId, revokedAt: null }, data: { revokedAt: new Date() } });
}

/** Sign out everywhere: revoke all sessions and invalidate every outstanding access token. */
export async function revokeAllForUser(userId) {
  await prisma.$transaction([
    prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    prisma.user.update({ where: { id: userId }, data: { tokenVersion: { increment: 1 } } }),
  ]);
  await forgetUser(userId);
}

/* ─── Cached user state for per-request checks (role, status, tokenVersion) ─── */
const userKey = (id) => `user:auth:${id}`;
export async function loadAuthUser(id) {
  const cached = await kv.get(userKey(id));
  if (cached) return JSON.parse(cached);
  const u = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, status: true, tokenVersion: true, name: true, email: true, phone: true } });
  if (u) await kv.set(userKey(id), JSON.stringify(u), 60);
  return u;
}
export const forgetUser = (id) => kv.del(userKey(id));
