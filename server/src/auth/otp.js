import crypto from 'node:crypto';
import { config } from '../config/env.js';
import { prisma, kv, hmac, safeEqual, otpCode, errors, AppError, logger } from '../lib/core.js';
import { sendEmailOtp, sendSmsOtp } from '../services/notify.js';

/**
 * One-time passcodes
 *  • 6 digits from a CSPRNG; only HMAC-SHA256(pepper, challengeId:code) is stored.
 *  • Expire after OTP_TTL_SECONDS (5 min), max OTP_MAX_ATTEMPTS (5) guesses, single use.
 *  • Requesting a new code invalidates the previous one.
 *  • Per-identifier cooldown (45 s), hourly cap (5) and daily cap (15) — on top of per-IP limits.
 */
const HOURLY = 5;
const DAILY = 15;
const hashCode = (id, code) => hmac(config.OTP_PEPPER, `${id}:${code}`);

export async function requestOtp({ channel, identifier, purpose, userId = null, req, deliver = true }) {
  const id = `otp_${crypto.randomUUID().replace(/-/g, '')}`;
  const cdKey = `otp:cd:${purpose}:${identifier}`;
  if (!(await kv.setNX(cdKey, '1', config.OTP_RESEND_SECONDS))) {
    const wait = Math.max(1, await kv.ttl(cdKey));
    throw errors.tooMany(`Please wait ${wait} seconds before requesting another code.`, wait);
  }
  const hour = await kv.incr(`otp:h:${identifier}`, 3600);
  const day = await kv.incr(`otp:d:${identifier}`, 86_400);
  if (hour > HOURLY || day > DAILY) {
    throw errors.tooMany('Too many codes requested for this email/number. Please try again later.', hour > HOURLY ? 3600 : 86_400);
  }

  const code = otpCode();
  const expiresAt = new Date(Date.now() + config.OTP_TTL_SECONDS * 1000);
  if (deliver) {
    await prisma.$transaction([
      prisma.otpChallenge.updateMany({ where: { identifier, purpose, consumedAt: null }, data: { consumedAt: new Date() } }),
      prisma.otpChallenge.create({
        data: { id, channel, identifier, purpose, userId, codeHash: hashCode(id, code), expiresAt, ip: req.ip, userAgent: String(req.get('user-agent') || '').slice(0, 300) },
      }),
    ]);
    try {
      if (channel === 'EMAIL') await sendEmailOtp(identifier, code, purpose);
      else await sendSmsOtp(identifier, code, purpose);
    } catch (e) {
      logger.error({ err: e.message, channel, purpose }, 'otp delivery failed');
      await prisma.otpChallenge.delete({ where: { id } }).catch(() => {});
      await kv.del(cdKey);
      throw new AppError(502, 'OTP_DELIVERY_FAILED', channel === 'EMAIL' ? 'We could not send the email right now. Please try again.' : 'We could not send the SMS right now. Please try again or use email.');
    }
  }
  return {
    challengeId: id,
    expiresIn: config.OTP_TTL_SECONDS,
    resendIn: config.OTP_RESEND_SECONDS,
    ...(config.otpEcho && deliver ? { devCode: code } : {}),
  };
}

/** Verify a code. Returns the consumed challenge. Throws generic errors (no oracle). */
export async function verifyOtp({ challengeId, code, purpose }) {
  const invalid = () => errors.badRequest('That code is incorrect or has expired. Please request a new one.');
  if (typeof challengeId !== 'string' || !/^otp_[a-f0-9]{32}$/.test(challengeId) || !/^\d{6}$/.test(String(code))) throw invalid();

  const ch = await prisma.otpChallenge.findUnique({ where: { id: challengeId } });
  if (!ch || ch.purpose !== purpose || ch.consumedAt || ch.expiresAt < new Date()) throw invalid();

  // Count the attempt atomically before comparing (prevents parallel brute force).
  const counted = await prisma.otpChallenge.updateMany({ where: { id: ch.id, consumedAt: null, attempts: { lt: config.OTP_MAX_ATTEMPTS } }, data: { attempts: { increment: 1 } } });
  if (counted.count !== 1) throw errors.badRequest('Too many incorrect attempts. Please request a new code.');

  if (!safeEqual(hashCode(ch.id, String(code)), ch.codeHash)) {
    const left = config.OTP_MAX_ATTEMPTS - (ch.attempts + 1);
    throw errors.badRequest(left > 0 ? `Incorrect code. ${left} attempt${left === 1 ? '' : 's'} left.` : 'Too many incorrect attempts. Please request a new code.', { attemptsLeft: Math.max(0, left) });
  }
  // Single use: only one concurrent verify can consume it.
  const used = await prisma.otpChallenge.updateMany({ where: { id: ch.id, consumedAt: null }, data: { consumedAt: new Date() } });
  if (used.count !== 1) throw invalid();
  await kv.del(`otp:cd:${purpose}:${ch.identifier}`);
  return ch;
}
