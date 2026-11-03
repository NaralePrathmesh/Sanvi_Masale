/**
 * Mirror of the server's role permissions (server/src/auth/middleware.js). Used only to hide menu
 * items and buttons — the API enforces every rule independently, so editing this file cannot grant access.
 */
export const PERMISSIONS = {
  STAFF: ['dashboard:read', 'orders:read', 'orders:write', 'inventory:write', 'products:read', 'customers:read', 'reviews:moderate', 'enquiries:read'],
  ADMIN: ['dashboard:read', 'orders:read', 'orders:write', 'inventory:write', 'products:read', 'products:write', 'customers:read', 'customers:write',
    'reviews:moderate', 'coupons:write', 'content:write', 'settings:write', 'media:write', 'enquiries:read'],
  SUPER_ADMIN: ['*'],
};
export const can = (role, perm) => { const p = PERMISSIONS[role] || []; return p.includes('*') || p.includes(perm); };
export const ROLE_LABEL = { STAFF: 'Staff', ADMIN: 'Admin', SUPER_ADMIN: 'Owner' };
