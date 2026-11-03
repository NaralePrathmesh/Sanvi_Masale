import { errors } from '../lib/core.js';
import { verifyAccess, loadAuthUser } from './tokens.js';

/**
 * Authorization model (deny by default)
 *  CUSTOMER    — own profile, addresses, wishlist, orders, reviews
 *  STAFF       — + orders, inventory, review moderation, read customers/products
 *  ADMIN       — + products, categories, coupons, content, settings, media, customers
 *  SUPER_ADMIN — + manage staff/admin accounts and roles, audit log
 */
export const PERMISSIONS = {
  STAFF: ['dashboard:read', 'orders:read', 'orders:write', 'inventory:write', 'products:read', 'customers:read', 'reviews:moderate', 'enquiries:read'],
  ADMIN: ['dashboard:read', 'orders:read', 'orders:write', 'inventory:write', 'products:read', 'products:write', 'customers:read', 'customers:write',
    'reviews:moderate', 'coupons:write', 'content:write', 'settings:write', 'media:write', 'enquiries:read'],
  SUPER_ADMIN: ['*'],
  CUSTOMER: [],
};
export const can = (role, perm) => {
  const p = PERMISSIONS[role] || [];
  return p.includes('*') || p.includes(perm);
};

/** Verifies the Bearer token and checks the account is still active and the token not revoked. */
async function resolveUser(req) {
  const h = req.get('authorization') || '';
  if (!h.startsWith('Bearer ')) return null;
  const claims = verifyAccess(h.slice(7).trim());
  const user = await loadAuthUser(claims.sub);
  if (!user) throw errors.unauthorized();
  if (user.status !== 'ACTIVE') throw errors.forbidden('This account is disabled.');
  if (user.tokenVersion !== claims.tv || user.role !== claims.role) throw errors.unauthorized('Your session has changed. Please sign in again.');
  return user;
}

export const requireAuth = async (req, _res, next) => {
  try {
    const user = await resolveUser(req);
    if (!user) throw errors.unauthorized();
    req.user = user; next();
  } catch (e) { next(e); }
};

/** Attaches req.user when a valid token is present, but never fails (for public endpoints). */
export const optionalAuth = async (req, _res, next) => {
  try { req.user = (await resolveUser(req)) || null; } catch { req.user = null; }
  next();
};

export const requireCustomer = (req, _res, next) => (req.user?.role === 'CUSTOMER' ? next() : next(errors.forbidden('Customer accounts only.')));
export const requireStaff = (req, _res, next) => (req.user && req.user.role !== 'CUSTOMER' ? next() : next(errors.forbidden()));
export const requirePermission = (perm) => (req, _res, next) => (req.user && can(req.user.role, perm) ? next() : next(errors.forbidden()));
