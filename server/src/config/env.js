import 'dotenv/config';
import { z } from 'zod';

/**
 * Validated configuration. The process refuses to start with a missing or weak secret,
 * and production-only rules (real OTP providers, no OTP echo, Redis required) are enforced here.
 */
const bool = z.union([z.boolean(), z.string()]).transform((v) => v === true || v === 'true' || v === '1');
const csv = z.string().default('').transform((s) => s.split(',').map((x) => x.trim()).filter(Boolean));

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGINS: csv,
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),
  CLUSTER: bool.default(false),
  WEB_CONCURRENCY: z.coerce.number().int().min(0).default(0),

  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().optional().default(''),

  JWT_ACCESS_SECRET: z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 characters'),
  OTP_PEPPER: z.string().min(32, 'OTP_PEPPER must be at least 32 characters'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  CUSTOMER_SESSION_DAYS: z.coerce.number().int().positive().default(30),
  ADMIN_SESSION_HOURS: z.coerce.number().int().positive().default(12),
  COOKIE_SAMESITE: z.enum(['strict', 'lax', 'none']).default('strict'),
  COOKIE_DOMAIN: z.string().optional().default(''),

  OTP_TTL_SECONDS: z.coerce.number().int().min(60).max(900).default(300),
  OTP_MAX_ATTEMPTS: z.coerce.number().int().min(3).max(10).default(5),
  OTP_RESEND_SECONDS: z.coerce.number().int().min(15).max(300).default(45),
  OTP_DEV_ECHO: bool.default(false),

  EMAIL_PROVIDER: z.enum(['smtp', 'console']).default('console'),
  SMTP_HOST: z.string().optional().default(''),
  SMTP_PORT: z.coerce.number().int().default(465),
  SMTP_SECURE: bool.default(true),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('Saanvi Masale <no-reply@saanvimasale.com>'),

  SMS_PROVIDER: z.enum(['msg91', 'twilio', 'console']).default('console'),
  MSG91_AUTH_KEY: z.string().optional().default(''),
  MSG91_TEMPLATE_ID: z.string().optional().default(''),
  TWILIO_ACCOUNT_SID: z.string().optional().default(''),
  TWILIO_AUTH_TOKEN: z.string().optional().default(''),
  TWILIO_FROM: z.string().optional().default(''),

  STORAGE_PROVIDER: z.enum(['cloudinary', 'supabase', 'local']).default('local'),
  MAX_UPLOAD_MB: z.coerce.number().positive().max(20).default(5),
  CLOUDINARY_CLOUD_NAME: z.string().optional().default(''),
  CLOUDINARY_API_KEY: z.string().optional().default(''),
  CLOUDINARY_API_SECRET: z.string().optional().default(''),
  CLOUDINARY_FOLDER: z.string().default('saanvi-masale'),
  SUPABASE_URL: z.string().optional().default(''),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(''),
  SUPABASE_BUCKET: z.string().default('media'),
  PUBLIC_API_URL: z.string().default('http://localhost:4000'),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('❌ Invalid environment configuration:\n' + parsed.error.issues.map((i) => `  • ${i.path.join('.')}: ${i.message}`).join('\n'));
  process.exit(1);
}
const env = parsed.data;
const isProd = env.NODE_ENV === 'production';

if (isProd) {
  const problems = [];
  if (!env.CORS_ORIGINS.length) problems.push('CORS_ORIGINS must list your shop domain(s)');
  if (!env.REDIS_URL) problems.push('REDIS_URL is required (shared rate limits/OTP state across instances)');
  if (env.EMAIL_PROVIDER === 'console' && env.SMS_PROVIDER === 'console') problems.push('Configure EMAIL_PROVIDER=smtp and/or SMS_PROVIDER=msg91|twilio');
  if (/change-me/.test(env.JWT_ACCESS_SECRET) || /change-me/.test(env.OTP_PEPPER)) problems.push('Replace the example JWT_ACCESS_SECRET / OTP_PEPPER with random secrets');
  if (env.STORAGE_PROVIDER === 'local') problems.push('Use STORAGE_PROVIDER=cloudinary or supabase in production (local disk is not shared between instances)');
  if (problems.length) {
    // eslint-disable-next-line no-console
    console.error('❌ Production configuration problems:\n' + problems.map((p) => `  • ${p}`).join('\n'));
    process.exit(1);
  }
}

export const config = {
  ...env,
  isProd,
  isTest: env.NODE_ENV === 'test',
  // The OTP is only ever echoed back outside production.
  otpEcho: !isProd && env.OTP_DEV_ECHO,
};
