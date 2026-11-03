import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { config } from '../config/env.js';
import { errors, randomToken } from '../lib/core.js';

/**
 * Image storage adapters (STORAGE_PROVIDER):
 *  • cloudinary (recommended) — the browser uploads straight to Cloudinary with a short-lived
 *    signature from this API, so large files never pass through our servers. Cloudinary then serves
 *    optimised WebP/AVIF via its CDN. The upload response signature is verified before we save it.
 *  • supabase — signed upload URL into a Supabase Storage bucket (public bucket for product images).
 *  • local — development only: multipart upload to ./uploads, served at /uploads.
 */
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
export const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };
const FOLDERS = ['products', 'banners', 'categories', 'recipes', 'brand', 'misc'];
export const UPLOAD_DIR = path.resolve('uploads');

export const provider = () => config.STORAGE_PROVIDER;
const safeFolder = (f) => (FOLDERS.includes(f) ? f : 'misc');

/** Cloudinary API signature: SHA-1 of the sorted params + API secret. */
const cloudinarySign = (params) => crypto.createHash('sha1')
  .update(Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&') + config.CLOUDINARY_API_SECRET).digest('hex');

/** Step 1 — admin asks for permission to upload one image. */
export async function createUploadTicket({ folder, contentType, bytes }) {
  if (!ALLOWED_TYPES.includes(contentType)) throw errors.badRequest('Only JPG, PNG, WebP or AVIF images are allowed.');
  if (!bytes || bytes > config.MAX_UPLOAD_MB * 1024 * 1024) throw errors.badRequest(`Images must be smaller than ${config.MAX_UPLOAD_MB} MB.`);
  const dir = safeFolder(folder);

  if (provider() === 'cloudinary') {
    if (!config.CLOUDINARY_CLOUD_NAME || !config.CLOUDINARY_API_KEY || !config.CLOUDINARY_API_SECRET) throw errors.badRequest('Cloudinary is not configured on the server.');
    const params = {
      folder: `${config.CLOUDINARY_FOLDER}/${dir}`,
      timestamp: Math.floor(Date.now() / 1000),
      allowed_formats: 'jpg,png,webp,avif',
      public_id: `${Date.now().toString(36)}-${randomToken(6)}`,
    };
    return {
      provider: 'cloudinary', method: 'POST',
      uploadUrl: `https://api.cloudinary.com/v1_1/${config.CLOUDINARY_CLOUD_NAME}/image/upload`,
      fields: { ...params, api_key: config.CLOUDINARY_API_KEY, signature: cloudinarySign(params) },
    };
  }

  if (provider() === 'supabase') {
    if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_ROLE_KEY) throw errors.badRequest('Supabase Storage is not configured on the server.');
    const objectPath = `${dir}/${Date.now().toString(36)}-${randomToken(6)}.${EXT[contentType]}`;
    const res = await fetch(`${config.SUPABASE_URL}/storage/v1/object/upload/sign/${config.SUPABASE_BUCKET}/${objectPath}`, {
      method: 'POST', headers: { authorization: `Bearer ${config.SUPABASE_SERVICE_ROLE_KEY}`, apikey: config.SUPABASE_SERVICE_ROLE_KEY, 'content-type': 'application/json' },
      body: JSON.stringify({ expiresIn: 600 }), signal: AbortSignal.timeout(10_000),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.url) throw errors.badRequest('Could not create an upload URL in Supabase Storage.');
    return {
      provider: 'supabase', method: 'PUT', headers: { 'content-type': contentType, 'x-upsert': 'false' },
      uploadUrl: `${config.SUPABASE_URL}/storage/v1${body.url}`, key: objectPath,
      publicUrl: `${config.SUPABASE_URL}/storage/v1/object/public/${config.SUPABASE_BUCKET}/${objectPath}`,
    };
  }

  return { provider: 'local', method: 'POST', uploadUrl: '/api/v1/admin/media/upload', field: 'file', folder: dir };
}

/**
 * Step 2 — register the uploaded image. For Cloudinary we verify the signature Cloudinary put on its
 * upload response, so nobody can register an arbitrary URL. Supabase paths must match our bucket.
 */
export function verifyUploaded(body) {
  if (provider() === 'cloudinary') {
    const { public_id: publicId, version, signature, secure_url: url } = body;
    if (!publicId || !version || !signature || !url) throw errors.badRequest('Incomplete Cloudinary upload response.');
    const expected = crypto.createHash('sha1').update(`public_id=${publicId}&version=${version}${config.CLOUDINARY_API_SECRET}`).digest('hex');
    const a = Buffer.from(expected); const b = Buffer.from(String(signature));
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw errors.forbidden('Upload signature mismatch.');
    if (!String(publicId).startsWith(`${config.CLOUDINARY_FOLDER}/`)) throw errors.forbidden('Unexpected upload folder.');
    if (!url.startsWith(`https://res.cloudinary.com/${config.CLOUDINARY_CLOUD_NAME}/`)) throw errors.forbidden('Unexpected upload URL.');
    return { provider: 'cloudinary', key: publicId, url, bytes: body.bytes, width: body.width, height: body.height, format: body.format };
  }
  if (provider() === 'supabase') {
    const key = String(body.key || '');
    if (!/^[a-z]+\/[a-z0-9]+-[\w-]+\.(jpg|png|webp|avif)$/.test(key)) throw errors.badRequest('Invalid storage path.');
    return { provider: 'supabase', key, url: `${config.SUPABASE_URL}/storage/v1/object/public/${config.SUPABASE_BUCKET}/${key}` };
  }
  throw errors.badRequest('Use the upload endpoint for local storage.');
}

/** Check the real file type from its first bytes (never trust the browser's MIME type). */
export function sniffImage(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'image/png';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (buf.toString('ascii', 4, 8) === 'ftyp' && /avi[fs]/.test(buf.toString('ascii', 8, 12))) return 'image/avif';
  return null;
}

export async function saveLocal(buffer, folder) {
  const type = sniffImage(buffer);
  if (!type) throw errors.badRequest('That file is not a supported image (JPG, PNG, WebP, AVIF).');
  const dir = safeFolder(folder);
  const name = `${Date.now().toString(36)}-${randomToken(6)}.${EXT[type]}`;
  await fs.mkdir(path.join(UPLOAD_DIR, dir), { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, dir, name), buffer, { flag: 'wx' });
  return { provider: 'local', key: `${dir}/${name}`, url: `${config.PUBLIC_API_URL}/uploads/${dir}/${name}`, bytes: buffer.length, format: EXT[type] };
}
