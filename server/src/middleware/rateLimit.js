import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import { redis, logger } from '../lib/core.js';
import { config } from '../config/env.js';

/**
 * Rate limits are stored in Redis so every API process/instance shares the same counters.
 * Without Redis (local development) each process keeps its own in-memory counters.
 * Limits are per client IP (IPv6 grouped by /56) unless a route keys by account/identifier.
 */
const store = (prefix) => (redis ? new RedisStore({ sendCommand: (cmd, ...args) => redis.call(cmd, ...args), prefix: `rl:${prefix}:` }) : undefined);
if (!redis && !config.isTest) logger.warn('REDIS_URL not set — rate limits are per-process (fine for local development only)');

const handler = (req, res, _next, options) => {
  res.status(options.statusCode).json({ error: { code: 'RATE_LIMITED', message: options.message } });
};

function limiter(name, { windowMs, limit, message, keyGenerator, skipSuccessfulRequests = false }) {
  return rateLimit({
    windowMs, limit, standardHeaders: 'draft-8', legacyHeaders: false, store: store(name), handler,
    message: message || 'Too many requests. Please slow down and try again shortly.',
    keyGenerator: keyGenerator || ((req) => ipKeyGenerator(req.ip, 56)),
    skipSuccessfulRequests,
    // Tests hammer endpoints on purpose; a dedicated test enables limits explicitly.
    skip: () => config.isTest && process.env.RATE_LIMIT_TESTS !== 'true',
  });
}

const min = 60_000;
export const limits = {
  /** Every API request: generous enough for shoppers behind shared mobile-carrier IPs. */
  global: limiter('global', { windowMs: min, limit: 600 }),
  /** Code verification / admin 2FA per IP (brute-force protection on top of per-code attempt limits). */
  auth: limiter('auth', { windowMs: 15 * min, limit: 60, message: 'Too many sign-in attempts. Please wait a few minutes.' }),
  /** Silent session refresh on page loads — generous so shoppers on shared networks are never locked out. */
  refresh: limiter('refresh', { windowMs: 15 * min, limit: 600, message: 'Too many session refreshes. Please wait a moment.' }),
  /** Sending OTPs per IP (cost + abuse control). Per-identifier limits live in the OTP service. */
  otpSend: limiter('otp-send', { windowMs: 60 * min, limit: 20, message: 'Too many verification codes requested from this network. Please try again later.' }),
  /** Admin password attempts per IP; failures only. */
  adminLogin: limiter('admin-login', { windowMs: 15 * min, limit: 10, skipSuccessfulRequests: true, message: 'Too many failed admin sign-in attempts. Try again in 15 minutes.' }),
  /** Placing orders, per signed-in user. */
  orders: limiter('orders', { windowMs: 60 * min, limit: 30, keyGenerator: (req) => `u:${req.user?.id || ipKeyGenerator(req.ip, 56)}` }),
  /** Public forms (contact, bulk enquiry, newsletter, reviews), per IP. */
  forms: limiter('forms', { windowMs: 60 * min, limit: 15, message: 'Too many submissions. Please try again later.' }),
  /** Admin write operations, per admin user. */
  adminWrite: limiter('admin-write', { windowMs: min, limit: 240, keyGenerator: (req) => `u:${req.user?.id || ipKeyGenerator(req.ip, 56)}` }),
  /** Media upload signatures / uploads, per admin user. */
  uploads: limiter('uploads', { windowMs: 60 * min, limit: 200, keyGenerator: (req) => `u:${req.user?.id || ipKeyGenerator(req.ip, 56)}` }),
};
