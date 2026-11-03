/**
 * Create (or reset) a staff/admin account from the command line. There is deliberately no public
 * admin sign-up endpoint.
 *
 *   npm run admin:create -- --email you@example.com --name "Your Name" --role SUPER_ADMIN
 *
 * The password is asked for interactively (never put it in shell history), or read from
 * ADMIN_PASSWORD for automated setups. Admin sign-in also requires an emailed OTP every time.
 */
import readline from 'node:readline';
import argon2 from 'argon2';
import { PrismaClient } from '@prisma/client';

const args = Object.fromEntries(process.argv.slice(2).join(' ').split('--').filter(Boolean).map((s) => {
  const [k, ...v] = s.trim().split(' '); return [k, v.join(' ').replace(/^"|"$/g, '')];
}));
const email = String(args.email || '').trim().toLowerCase();
const name = args.name || 'Store Admin';
const role = (args.role || 'SUPER_ADMIN').toUpperCase();

if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { console.error('Usage: npm run admin:create -- --email you@example.com [--name "Name"] [--role SUPER_ADMIN|ADMIN|STAFF]'); process.exit(1); }
if (!['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(role)) { console.error('Role must be STAFF, ADMIN or SUPER_ADMIN'); process.exit(1); }

const ask = (q) => new Promise((resolve) => {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.stdoutMuted = true;
  rl._writeToOutput = (s) => { if (!rl.stdoutMuted || s.includes(q)) rl.output.write(s); };
  rl.question(q, (a) => { rl.close(); process.stdout.write('\n'); resolve(a); });
});

const password = process.env.ADMIN_PASSWORD || await ask('Password (min 12 chars, upper+lower+number): ');
if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
  console.error('Password must be at least 12 characters and include upper-case, lower-case and a number.'); process.exit(1);
}

const prisma = new PrismaClient();
const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
const existing = await prisma.user.findUnique({ where: { email } });
if (existing && existing.role === 'CUSTOMER') { console.error('That email belongs to a customer account. Use a separate email for admin access.'); process.exit(1); }
const user = existing
  ? await prisma.user.update({ where: { email }, data: { name, role, passwordHash, status: 'ACTIVE', emailVerified: true, tokenVersion: { increment: 1 } } })
  : await prisma.user.create({ data: { email, name, role, passwordHash, emailVerified: true } });
console.log(`${existing ? 'Updated' : 'Created'} ${user.role} account for ${user.email}. Sign in at /admin/login (password + emailed code).`);
await prisma.$disconnect();
