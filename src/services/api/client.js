/**
 * Saanvi Masale API client.
 *
 * API mode is on when VITE_API_URL is set at build time (e.g. https://api.saanvimasale.com).
 * Without it the site runs in DEMO mode on localStorage, exactly as before (used by the preview).
 *
 * Security model on the client:
 *  • The access token lives only in memory (never localStorage) → not readable after a reload,
 *    not exposed to other tabs or browser extensions reading storage.
 *  • The refresh token is an httpOnly cookie the browser sends only to /api/v1/auth on our API.
 *  • On a 401 the client refreshes once (single-flight, shared by all concurrent calls) and retries.
 */
export const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
export const API_MODE = Boolean(API_URL);
const BASE = `${API_URL}/api/v1`;

let accessToken = null;
let refreshing = null;
const listeners = new Set();
export const setAccessToken = (t) => { accessToken = t || null; };
/** Called when the session can't be refreshed (signed out elsewhere, expired, blocked). */
export const onSessionLost = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error?.message || `Request failed (${status})`);
    this.status = status; this.code = body?.error?.code || 'ERROR'; this.details = body?.error?.details; this.requestId = body?.error?.requestId;
  }
}

async function raw(path, { method = 'GET', body, headers = {}, auth = true, signal, form } = {}) {
  const h = { Accept: 'application/json', ...headers };
  if (body !== undefined && !form) h['Content-Type'] = 'application/json';
  if (auth && accessToken) h.Authorization = `Bearer ${accessToken}`;
  const res = await fetch(`${BASE}${path}`, {
    method, headers: h, signal,
    body: form || (body !== undefined ? JSON.stringify(body) : undefined),
    credentials: path.startsWith('/auth/') ? 'include' : 'omit', // cookie only for auth endpoints
  });
  if (res.status === 204) return { res, data: null };
  const data = await res.json().catch(() => null);
  return { res, data };
}

/** Exchange the refresh cookie for a new access token. Returns { accessToken, user } or null. */
export function refreshSession() {
  if (!refreshing) {
    refreshing = raw('/auth/refresh', { method: 'POST', auth: false })
      .then(({ res, data }) => {
        if (!res.ok || res.status === 204 || !data) { setAccessToken(null); return null; }
        setAccessToken(data.accessToken); return data;
      })
      .catch(() => null)
      .finally(() => { setTimeout(() => { refreshing = null; }, 0); });
  }
  return refreshing;
}

/** Main request helper: JSON in/out, throws ApiError, transparently refreshes an expired token once. */
export async function api(path, opts = {}) {
  let { res, data } = await raw(path, opts);
  if (res.status === 401 && opts.auth !== false && !path.startsWith('/auth/')) {
    const r = await refreshSession();
    if (r) ({ res, data } = await raw(path, opts));
    else listeners.forEach((fn) => fn());
  }
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}

export const idempotencyKey = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

/**
 * Upload an image through the configured provider (Cloudinary / Supabase direct upload, or the API
 * for local storage). Returns the public URL.
 */
export async function uploadImage(file, folder = 'misc') {
  const ticket = await api('/admin/media/sign', { method: 'POST', body: { folder, contentType: file.type, bytes: file.size } });
  if (ticket.provider === 'cloudinary') {
    const fd = new FormData();
    Object.entries(ticket.fields).forEach(([k, v]) => fd.append(k, v));
    fd.append('file', file);
    const up = await fetch(ticket.uploadUrl, { method: 'POST', body: fd });
    const result = await up.json();
    if (!up.ok) throw new Error(result?.error?.message || 'Upload to Cloudinary failed');
    return (await api('/admin/media', { method: 'POST', body: result })).asset.url;
  }
  if (ticket.provider === 'supabase') {
    const up = await fetch(ticket.uploadUrl, { method: 'PUT', headers: ticket.headers, body: file });
    if (!up.ok) throw new Error('Upload to Supabase Storage failed');
    return (await api('/admin/media', { method: 'POST', body: { key: ticket.key } })).asset.url;
  }
  const fd = new FormData();
  fd.append('folder', folder); fd.append('file', file);
  return (await api('/admin/media/upload', { method: 'POST', form: fd })).asset.url;
}
