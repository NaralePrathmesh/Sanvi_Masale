import { z } from 'zod';
import { errors } from './core.js';

/**
 * Validate req.body / req.query / req.params with zod schemas. Unknown keys are stripped
 * (prevents mass-assignment), and the parsed values replace the raw input.
 */
export const validate = (schemas) => (req, _res, next) => {
  for (const part of ['params', 'query', 'body']) {
    if (!schemas[part]) continue;
    const r = schemas[part].safeParse(req[part] ?? {});
    if (!r.success) {
      return next(errors.badRequest('Please check the highlighted fields', r.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message }))));
    }
    if (part === 'query') Object.defineProperty(req, 'query', { value: r.data, writable: true, configurable: true });
    else req[part] = r.data;
  }
  next();
};

/* Shared field schemas */
export const zEmail = z.string().trim().toLowerCase().max(254).pipe(z.email('Enter a valid email address'));
/** Indian mobile → E.164 (+91XXXXXXXXXX). Accepts "98765 43210", "+91-98765-43210", "09876543210". */
export const zPhoneIN = z.string().trim().max(20).transform((v, ctx) => {
  let d = v.replace(/[^\d+]/g, '');
  if (d.startsWith('+91')) d = d.slice(3); else if (d.startsWith('91') && d.length === 12) d = d.slice(2); else if (d.startsWith('0') && d.length === 11) d = d.slice(1);
  if (!/^[6-9]\d{9}$/.test(d)) { ctx.addIssue({ code: 'custom', message: 'Enter a valid 10-digit Indian mobile number' }); return z.NEVER; }
  return `+91${d}`;
});
export const zText = (max = 200) => z.string().trim().max(max);
export const zI18n = (max = 300) => z.object({ en: zText(max), hi: zText(max).optional().default(''), mr: zText(max).optional().default('') });
export const zId = z.string().trim().min(1).max(64).regex(/^[\w-]+$/, 'Invalid id');
export const zSlug = z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes');
export const zPin = z.string().trim().regex(/^[1-9]\d{5}$/, 'Enter a valid 6-digit PIN code');
export const zPage = z.object({
  page: z.coerce.number().int().min(1).max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
