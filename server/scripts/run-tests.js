/**
 * Test runner: points the API at a separate test database + Redis DB 15, resets and seeds them,
 * then runs the node:test suites. Never touches your development or production data.
 *   TEST_DATABASE_URL=postgresql://…/saanvi_test npm test
 */
import { execSync, spawnSync } from 'node:child_process';
import Redis from 'ioredis';

const base = process.env.TEST_DATABASE_URL || 'postgresql://postgres:devpass@localhost:5432/saanvi_test?schema=public';
if (!/test/.test(base)) { console.error('Refusing to run: TEST_DATABASE_URL must point at a database whose name contains "test".'); process.exit(1); }
const env = {
  ...process.env,
  NODE_ENV: 'test',
  DATABASE_URL: `${base}${base.includes('?') ? '&' : '?'}connection_limit=20`,
  DIRECT_URL: base,
  REDIS_URL: process.env.TEST_REDIS_URL || 'redis://localhost:6379/15',
  OTP_DEV_ECHO: 'true',
  EMAIL_PROVIDER: 'console', SMS_PROVIDER: 'console', STORAGE_PROVIDER: 'local',
  CORS_ORIGINS: 'http://localhost:5173',
  JWT_ACCESS_SECRET: 'test-access-secret-that-is-long-enough-123456',
  OTP_PEPPER: 'test-otp-pepper-that-is-also-long-enough-123456',
  LOG_LEVEL: 'silent',
};

execSync('npx prisma migrate reset --force --skip-generate', { env, stdio: 'inherit' });
const r = new Redis(env.REDIS_URL); await r.flushdb(); await r.quit();
const res = spawnSync(process.execPath, ['--test', '--test-concurrency=1', ...(process.argv.slice(2).length ? process.argv.slice(2) : ['tests/*.test.js'])], { env, stdio: 'inherit' });
process.exit(res.status ?? 1);
