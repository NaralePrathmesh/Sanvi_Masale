import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import crypto from 'node:crypto';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { config } from './config/env.js';
import { logger, prisma, redis, AppError, ah, errors } from './lib/core.js';
import { validate, zPhoneIN, zId } from './lib/validate.js';
import { limits } from './middleware/rateLimit.js';
import { authRouter } from './auth/routes.js';
import { publicRouter } from './routes/public.js';
import { accountRouter } from './routes/account.js';
import { adminRouter } from './routes/admin.js';
import { serializeOrder, orderInclude } from './services/orders.js';
import { UPLOAD_DIR } from './services/storage.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', config.TRUST_PROXY); // correct client IPs behind a load balancer (rate limits!)
  app.set('etag', 'strong');

  app.use(pinoHttp({
    logger,
    genReqId: (req, res) => { const id = req.get('x-request-id')?.slice(0, 64) || crypto.randomUUID(); res.set('X-Request-Id', id); return id; },
    customLogLevel: (_req, res, err) => (err || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info'),
    autoLogging: { ignore: (req) => req.url.startsWith('/healthz') || req.url.startsWith('/readyz') },
    serializers: { req: (r) => ({ id: r.id, method: r.method, url: r.url }), res: (r) => ({ statusCode: r.statusCode }) },
  }));

  // Security headers. This is a JSON API, so the CSP denies everything.
  app.use(helmet({
    contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // uploaded images are embedded by the shop
    hsts: config.isProd ? { maxAge: 63_072_000, includeSubDomains: true, preload: true } : false,
  }));
  app.use(cors({
    origin: (origin, cb) => cb(null, !origin || config.CORS_ORIGINS.includes(origin)),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id', 'X-Catalog-Version', 'RateLimit', 'RateLimit-Policy', 'Retry-After'],
    maxAge: 600,
  }));
  app.use(compression({ threshold: 1024 }));
  app.use(express.json({ limit: '200kb', strict: true }));
  app.use(express.urlencoded({ extended: false, limit: '50kb' }));
  app.use(cookieParser());

  /* Health: liveness never touches dependencies; readiness checks DB + Redis (load balancers use it). */
  app.get('/healthz', (_req, res) => res.json({ ok: true }));
  app.get('/readyz', ah(async (_req, res) => {
    const checks = { db: false, redis: !redis };
    try { await prisma.$queryRaw`SELECT 1`; checks.db = true; } catch { /* reported below */ }
    if (redis) { try { checks.redis = (await redis.ping()) === 'PONG'; } catch { /* reported below */ } }
    const ok = checks.db && checks.redis && !app.locals.shuttingDown;
    res.status(ok ? 200 : 503).json({ ok, ...checks, draining: !!app.locals.shuttingDown });
  }));

  if (!config.isProd || config.STORAGE_PROVIDER === 'local') {
    app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', immutable: true, index: false, dotfiles: 'deny', setHeaders: (res) => res.set('X-Content-Type-Options', 'nosniff') }));
  }

  const api = express.Router();
  api.use(limits.global);
  api.use('/auth', authRouter); // each auth route applies its own limiter
  api.use('/', publicRouter);
  api.use('/account', accountRouter);
  api.use('/admin', adminRouter);

  /** Guest-friendly order tracking: order id + the phone number used at checkout. */
  api.post('/orders/track', limits.forms, validate({ body: z.object({ orderId: zId, phone: zPhoneIN }) }), ah(async (req, res) => {
    const o = await prisma.order.findUnique({ where: { id: req.body.orderId.toUpperCase() }, include: orderInclude });
    if (!o || o.customer?.phone?.replace(/\D/g, '').slice(-10) !== req.body.phone.slice(-10)) throw errors.notFound('No order found with this ID and phone number.');
    const s = serializeOrder(o);
    res.json({ order: { id: s.id, status: s.status, placedAt: s.placedAt, history: s.history, delivery: s.delivery, items: s.items, totals: { total: s.totals.total }, payment: s.payment, address: { city: s.address.city, pin: s.address.pin } } });
  }));
  app.use('/api/v1', api);

  app.use((req, _res, next) => next(errors.notFound(`No route for ${req.method} ${req.path}`)));

  // Central error handler — never leaks stack traces or internals to clients.
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, _next) => {
    let e = err;
    if (err?.type === 'entity.parse.failed') e = errors.badRequest('Malformed JSON body');
    else if (err?.type === 'entity.too.large') e = new AppError(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large');
    else if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') e = errors.notFound();
    else if (!(err instanceof AppError)) {
      req.log.error({ err }, 'unhandled error');
      e = new AppError(500, 'INTERNAL', 'Something went wrong on our side. Please try again.');
    }
    if (e.retryAfter) res.set('Retry-After', String(e.retryAfter));
    res.status(e.status).json({ error: { code: e.code, message: e.message, ...(e.details ? { details: e.details } : {}), requestId: req.id } });
  });

  return app;
}
