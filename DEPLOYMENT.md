# Deploying Saanvi Masale (Phase 2)

> Nothing here has been deployed yet. Follow these steps when you're ready, and choose your own hosting accounts.

## Recommended setup (India-friendly, with free or low-cost tiers)

| Piece | Service | Notes |
|---|---|---|
| Storefront + admin (static) | Vercel, Netlify or Cloudflare Pages | Build with `npm run build` and set `VITE_API_URL=https://api.yourdomain.com` |
| API | Render, Railway, Fly.io or a VPS with Docker | Use the Mumbai/Singapore region. Run ≥ 2 instances for zero downtime |
| Database | **Supabase** PostgreSQL (or Neon, AWS RDS) | Turn on daily backups / point-in-time recovery |
| Redis | Upstash Redis, Redis Cloud | Required in production (shared rate limits and OTP state) |
| Images | **Cloudinary** (or Supabase Storage) | Set `STORAGE_PROVIDER` |
| Email OTP | Gmail SMTP with an App password (start), then Brevo, Amazon SES or Zoho | Gmail limits sending to about 500 emails a day |
| SMS OTP | MSG91 (India; needs a DLT-registered OTP template) or Twilio | |

**Domains:** put the API on a sub-domain of the shop, for example `saanvimasale.com` and `api.saanvimasale.com`. The sign-in cookie can then stay `SameSite=Strict`.

## 1. Database (Supabase)

1. Create a project in the Mumbai region (`ap-south-1`).
2. Go to **Project Settings → Database** and copy both connection strings:
   - the **pooler** connection (port 6543) → `DATABASE_URL`. Add `?pgbouncer=true&connection_limit=5`.
   - the **direct** connection (port 5432) → `DIRECT_URL`. Migrations use this one.
3. From your computer, inside `server/`, create the tables, load the catalogue and create your owner account:

```bash
DATABASE_URL="<direct url>" DIRECT_URL="<direct url>" npx prisma migrate deploy
```

```bash
DATABASE_URL="<direct url>" npm run db:seed
```

```bash
DATABASE_URL="<direct url>" npm run admin:create -- --email you@yourdomain.com --name "Your Name" --role SUPER_ADMIN
```

## 2. Images (Cloudinary)

Copy **Cloud name**, **API key** and **API secret** from the Cloudinary dashboard into `CLOUDINARY_*`, and set `STORAGE_PROVIDER=cloudinary`.

To use Supabase Storage instead, create a **public** bucket called `media`, then set `STORAGE_PROVIDER=supabase`, `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Keep the service role key on the server only.

## 3. OTP delivery

- **Email via Gmail:** turn on 2-step verification on the Google account. Create an App password under **Google Account → Security → App passwords**. Then set:
  - `EMAIL_PROVIDER=smtp`
  - `SMTP_HOST=smtp.gmail.com`
  - `SMTP_PORT=465`
  - `SMTP_SECURE=true`
  - `SMTP_USER=<gmail address>`
  - `SMTP_PASS=<app password>`
- **SMS via MSG91:** register your sender and an OTP template on the DLT portal, using `##OTP##` where the code goes. Then set `SMS_PROVIDER=msg91`, `MSG91_AUTH_KEY` and `MSG91_TEMPLATE_ID`.

## 4. API (Render example)

1. **New → Web Service**, from the repository. Set root directory to `server`, environment to **Docker** (it uses `server/Dockerfile`), and instances to **2 or more**.
2. Set the health check path to `/readyz`.
3. Add the environment variables from `server/.env.example`:
   - `NODE_ENV=production`
   - `CORS_ORIGINS=https://saanvimasale.com,https://www.saanvimasale.com`
   - `TRUST_PROXY=1`
   - `PUBLIC_API_URL=https://api.saanvimasale.com`
   - new random `JWT_ACCESS_SECRET` and `OTP_PEPPER` values (generate them with the command below)
   - the database, Redis, Cloudinary, SMTP and SMS settings from steps 1–3

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

The container runs `prisma migrate deploy` on start, then starts one API worker per CPU core. With two or more instances and the `/readyz` health check, deploys roll over without downtime.

The API refuses to start in production if a secret is weak, Redis is missing, no OTP sender is configured, or storage is set to local disk.

## 5. Storefront

```bash
VITE_API_URL=https://api.saanvimasale.com npm run build
```

Deploy `dist/` and add a single-page-app fallback (all routes → `/index.html`). `public/_redirects` or `vercel.json` can do this.

## Capacity

The load test handled **500 concurrent shoppers with no errors** on 4 shared vCPUs (see `server/README.md`). For 400–500 shoppers at the same time:

- 2 API instances with 1 vCPU and 1 GB each, with `CLUSTER=true`;
- Supabase Small (or better), using the pooler URL;
- Upstash Redis on the pay-as-you-go plan.

Watch `/readyz`, your platform's p95 latency, and the database CPU, then scale instances horizontally. The API keeps no state of its own.

## Still to do before taking real money

- **Payment gateway:** UPI, cards and net banking are switched off in API mode, and Cash on Delivery works. Razorpay (or another gateway) still needs to be connected, using webhooks to confirm payments on the server.
- **Placeholder content:** replace the policy texts, store locations, sample reviews (Admin → Reviews → Remove all samples), and the WhatsApp and phone numbers (Admin → Settings).
- **Real courier serviceability:** PIN-code checks currently use a fixed list of prefixes.
