import crypto from 'node:crypto';
import pino from 'pino';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';
import { config } from '../config/env.js';

/* ─── Logger ──────────────────────────────────────────────────────────
 * Sensitive values are redacted everywhere they could appear. */
export const logger = pino({
  level: config.isTest ? 'silent' : config.LOG_LEVEL,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]', '*.password', '*.code', '*.otp', '*.token', '*.refreshToken', '*.passwordHash', '*.codeHash'],
    censor: '[redacted]',
  },
  ...(config.isProd ? {} : { transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } } }),
});

/* ─── Database ────────────────────────────────────────────────────────── */
export const prisma = new PrismaClient({ log: config.isProd ? ['error'] : ['error', 'warn'] });

/* ─── Redis (optional in development; required in production) ────────── */
export const redis = config.REDIS_URL
  ? new Redis(config.REDIS_URL, { maxRetriesPerRequest: 2, enableOfflineQueue: true, lazyConnect: false })
  : null;
if (redis) redis.on('error', (e) => logger.warn({ err: e.message }, 'redis error'));

/** Tiny key/value helper that uses Redis when available, otherwise process memory (dev only). */
const mem = new Map();
export const kv = {
  async get(key) {
    if (redis) return redis.get(key);
    const v = mem.get(key); if (!v) return null;
    if (v.exp && v.exp < Date.now()) { mem.delete(key); return null; }
    return v.val;
  },
  async set(key, val, ttlSec) {
    if (redis) return ttlSec ? redis.set(key, val, 'EX', ttlSec) : redis.set(key, val);
    mem.set(key, { val: String(val), exp: ttlSec ? Date.now() + ttlSec * 1000 : 0 });
    return 'OK';
  },
  /** SET if not exists, with TTL. Returns true when the key was set. */
  async setNX(key, val, ttlSec) {
    if (redis) return (await redis.set(key, val, 'EX', ttlSec, 'NX')) === 'OK';
    if (await kv.get(key)) return false;
    await kv.set(key, val, ttlSec); return true;
  },
  async incr(key, ttlSec) {
    if (redis) { const n = await redis.incr(key); if (n === 1 && ttlSec) await redis.expire(key, ttlSec); return n; }
    const cur = Number(await kv.get(key)) || 0;
    const v = mem.get(key);
    mem.set(key, { val: String(cur + 1), exp: v?.exp && v.exp > Date.now() ? v.exp : (ttlSec ? Date.now() + ttlSec * 1000 : 0) });
    return cur + 1;
  },
  async ttl(key) {
    if (redis) return redis.ttl(key);
    const v = mem.get(key); return v?.exp ? Math.max(0, Math.ceil((v.exp - Date.now()) / 1000)) : -1;
  },
  async del(...keys) {
    if (redis) return keys.length ? redis.del(...keys) : 0;
    keys.forEach((k) => mem.delete(k)); return keys.length;
  },
};

/* ─── Errors ──────────────────────────────────────────────────────────── */
export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status; this.code = code; this.details = details; this.expose = true;
  }
}
export const errors = {
  badRequest: (msg = 'Invalid request', details) => new AppError(400, 'BAD_REQUEST', msg, details),
  unauthorized: (msg = 'Please sign in to continue') => new AppError(401, 'UNAUTHORIZED', msg),
  forbidden: (msg = 'You do not have permission to do this') => new AppError(403, 'FORBIDDEN', msg),
  notFound: (msg = 'Not found') => new AppError(404, 'NOT_FOUND', msg),
  conflict: (msg = 'Conflict', details) => new AppError(409, 'CONFLICT', msg, details),
  tooMany: (msg = 'Too many requests, please try again later', retryAfter) => Object.assign(new AppError(429, 'RATE_LIMITED', msg), { retryAfter }),
  unprocessable: (msg, details) => new AppError(422, 'UNPROCESSABLE', msg, details),
};

/** Wrap async route handlers so rejections reach the error middleware. */
export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

/* ─── Crypto helpers ──────────────────────────────────────────────────── */
export const randomToken = (bytes = 48) => crypto.randomBytes(bytes).toString('base64url');
export const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');
export const hmac = (key, s) => crypto.createHmac('sha256', key).update(s).digest('hex');
export const safeEqual = (a, b) => {
  const ba = Buffer.from(String(a)); const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
};
/** Uniform 6-digit OTP from a CSPRNG. */
export const otpCode = () => String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');

/* ─── Audit log (fire-and-forget; never blocks a request) ────────────── */
export function audit(req, action, entity, entityId, meta) {
  prisma.auditLog.create({ data: { actorId: req.user?.id || null, action, entity, entityId: entityId ? String(entityId) : null, meta: meta ?? undefined, ip: req.ip } })
    .catch((e) => logger.warn({ err: e.message, action }, 'audit write failed'));
}

/* ─── Masking for logs / responses ───────────────────────────────────── */
export const maskEmail = (e) => String(e).replace(/^(.{2}).*(@.*)$/, '$1•••$2');
export const maskPhone = (p) => String(p).replace(/^(\+\d{2})\d+(\d{3})$/, '$1•••••$2');
