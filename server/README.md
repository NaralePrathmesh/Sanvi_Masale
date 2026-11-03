# Saanvi Masale API (Phase 2 backend)

Node.js 22 · Express 4 · PostgreSQL 16 (Prisma 5) · Redis · Zod · Argon2 · JWT.
It powers the storefront and the admin panel in `../src` when the shop is built with `VITE_API_URL`.

## Quick start (local)

You need Node.js 22+, PostgreSQL 16 and Redis 7. With Docker you can start both with `docker compose up -d db redis` from the repo root.

```bash
cd server
cp .env.example .env          # then edit DATABASE_URL / REDIS_URL if needed
npm install
npx prisma migrate deploy     # create tables
npm run db:seed               # load the launch catalogue from ../src/data
npm run admin:create -- --email you@yourdomain.com --name "Your Name" --role SUPER_ADMIN
npm run dev                   # API on http://localhost:4000
```

Then run the shop against it from the repo root:

```bash
VITE_API_URL=http://localhost:4000 npm run dev
```

In development, OTP codes are printed in the API log, and also shown on screen (`OTP_DEV_ECHO=true`). They are never shown or returned when `NODE_ENV=production`.

## What it does

| Area | Endpoints (prefix `/api/v1`) |
|---|---|
| Customer sign-in (OTP) | `POST /auth/otp/request` · `POST /auth/otp/verify` · `POST /auth/refresh` · `POST /auth/logout` · `POST /auth/logout-all` · `GET /auth/me` · `POST /auth/contact/request` · `POST /auth/contact/verify` |
| Admin sign-in (password + OTP) | `POST /auth/admin/login` · `POST /auth/admin/verify` |
| Public store | `GET /catalog` · `GET /products/:slug` · `GET /pincode/:pin` · `POST /cart/quote` · `GET /reviews` · `POST /reviews` (signed-in) · `POST /newsletter` · `POST /enquiries` · `POST /orders/track` |
| Customer account | `PATCH /account/profile` · `DELETE /account` · `/account/addresses` (CRUD) · `/account/wishlist` · `POST /account/orders` · `GET /account/orders[/:id]` · `POST /account/orders/:id/cancel` |
| Admin | `/admin/dashboard` · `/admin/products` (+ `/bulk`) · `/admin/categories` · `/admin/inventory` (+ `/restock-low`) · `/admin/orders` (+ `/status`, `/payment`) · `/admin/customers` · `/admin/coupons` · `/admin/content/:key` · `/admin/recipes` · `/admin/reviews` · `/admin/settings` · `/admin/media` (+ `/sign`, `/upload`) · `/admin/enquiries` · `/admin/staff` · `/admin/audit` |
| Health | `GET /healthz` (liveness) · `GET /readyz` (DB + Redis; returns 503 while draining) |

## Security

**Customers sign in without passwords.** They choose email or an Indian mobile number and get a 6-digit code:

- Codes come from a cryptographically secure random generator. Only an HMAC of each code (with a server-side secret) is stored.
- A code expires after 5 minutes, allows 5 attempts, and works once. Asking for a new code cancels the old one.
- Sending is limited per email or number: one code every 45 seconds, 5 per hour and 15 per day. Each network can request 20 codes per hour.
- Responses are identical whether or not an account exists. Staff and blocked accounts get no code.

**Staff and admins sign in with a password plus an emailed code.**

- Passwords are hashed with Argon2id and must be at least 12 characters, with upper-case, lower-case and a number.
- An account locks for 15 minutes after 5 wrong passwords, and each network gets 10 failed attempts per 15 minutes.
- Responses take the same time whether or not the email exists, so accounts can't be discovered by timing.
- There's no public admin sign-up. Accounts are created with `npm run admin:create` or by a SUPER_ADMIN.

**Sessions**

- The access token is a 15-minute JWT (HS256, with algorithm, issuer and audience pinned). The browser keeps it in memory only.
- The refresh token is a random value in an `httpOnly`, `Secure`, `SameSite=Strict` cookie that only the `/api/v1/auth` paths can read.
- Refresh tokens rotate on every use. Reusing an old one is treated as theft and signs out every device in that session.
- "Sign out everywhere" and blocking an account cancel all existing access tokens immediately.
- Cookie-based endpoints also check the request's origin, as extra protection against cross-site request forgery.

**Authorization**

- Everything is denied unless a role grants it:

| Role | Can do |
|---|---|
| CUSTOMER | Their own profile, addresses, wishlist, orders and reviews |
| STAFF | Orders, inventory and review moderation; read-only products and customers |
| ADMIN | Everything a store manager needs |
| SUPER_ADMIN | Everything, plus staff accounts and the audit log |

- Customer data is always looked up by the signed-in user's ID. Asking for someone else's order returns 404, the same as an order that doesn't exist.
- Every input is checked with Zod, and unknown fields are dropped, so nobody can sneak in a field such as `role`.
- Every admin change is written to the audit log.

**Money and stock**

- The server recalculates every price, combo discount, coupon and delivery charge from the database. Prices sent by the browser are ignored.
- Stock is reduced with a conditional update inside a transaction, so it can never go below zero, even when many people buy at once.
- Coupon usage limits are enforced the same way.
- Orders require an `Idempotency-Key` header, so a retry or double click can't create two orders.
- Full card numbers are rejected.

**Rate limits** are stored in Redis and shared by every API instance:

| What | Limit |
|---|---|
| Any API request | 600 per minute per network |
| Code verification | 60 per 15 minutes |
| Session refresh | 600 per 15 minutes |
| Sending codes | 20 per hour |
| Failed admin sign-ins | 10 per 15 minutes |
| Placing orders | 30 per hour per user |
| Public forms | 15 per hour |
| Admin changes | 240 per minute per admin |

The API sets `RateLimit` headers and returns `Retry-After` when a limit is hit. Set `TRUST_PROXY` correctly so limits apply to the real client IP behind your load balancer.

**Hardening**

- Helmet security headers: a `deny all` content security policy, HSTS in production, `nosniff`, and no `x-powered-by`.
- CORS only accepts origins listed in `CORS_ORIGINS`.
- Request bodies are limited to 200 KB.
- Logs are structured and redact tokens, codes, passwords and cookies.
- Error messages never reveal internal details.
- Uploaded images are checked by their actual content, not their file extension.
- The production checks refuse to start with weak or example secrets, without Redis, or with local disk storage.

## Images: Cloudinary (recommended) or Supabase Storage

**Cloudinary**

1. The admin's browser asks `/admin/media/sign` for a signature. The server checks the file type (JPG, PNG, WebP or AVIF) and size.
2. The browser uploads the file directly to Cloudinary.
3. The server checks Cloudinary's response signature, folder and account before saving the image URL.

Large files never pass through this API, and Cloudinary serves resized WebP/AVIF images from its CDN.

**Supabase Storage**

The server creates a signed upload URL for a public bucket (`SUPABASE_BUCKET`). Use this if you'd rather keep everything on Supabase.

**Local disk** (`STORAGE_PROVIDER=local`) is for development only.

## Scale and zero downtime

- **Stateless API.** Any number of instances or processes can run behind a load balancer. `CLUSTER=true` runs one worker per CPU core, and a crashed worker is replaced automatically.
- **Catalogue cache.** The catalogue is built once and cached in Redis and in memory. ETags mean unchanged pages return 304. The cache rebuilds only when an admin or a stock change updates it.
- **Database connections.** Each process holds a small Prisma connection pool (`connection_limit`). On Supabase, use the pooler URL in `DATABASE_URL`.
- **Graceful shutdown.** On SIGTERM, `/readyz` returns 503 so the load balancer stops sending traffic. In-flight requests finish, then connections close. Rolling deploys therefore drop no requests.
- **Load test.** `npm run loadtest` simulates 500 concurrent shoppers. Results from the dev container (4 shared vCPUs; the API, PostgreSQL, Redis and the load generator all on one machine):

| Scenario (500 concurrent connections) | Throughput | Median | p99 | Errors |
|---|---|---|---|---|
| Browsing + cart pricing | 2,662 req/s | 169 ms | 448 ms | 0 |
| Placing orders (all 500 at once) | 521 orders/s | 970 ms | 1.75 s | 0 |

## Tests

```bash
TEST_DATABASE_URL=postgresql://postgres:devpass@localhost:5432/saanvi_test npm test
```

There are 36 integration tests. They cover:

- OTP rules, token forging (including `alg=none`), refresh-token reuse, cross-origin refresh, logout everywhere, and blocking accounts;
- role escalation, ownership checks, staff permissions and admin lockout;
- price tampering, overselling under concurrency, coupon limits under concurrency, idempotent retries and restocking on cancel;
- disguised file uploads, Cloudinary signature checks, rate limits, and malformed or oversized requests.

The tests always use a separate database and Redis DB 15.
