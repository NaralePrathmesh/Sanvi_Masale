import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { demoCustomer, DEMO_ADMIN, DEMO_CUSTOMER_LOGIN } from '@/services/mock/seed';
import { API_MODE, api, setAccessToken, refreshSession, onSessionLost } from '@/services/api/client';

/**
 * Authentication.
 *  • API mode (VITE_API_URL set): passwordless OTP for customers (email or Indian mobile),
 *    password + emailed OTP for staff/admins, short-lived access token in memory, httpOnly
 *    refresh cookie, session restored on page load. All checks are enforced by the server.
 *  • DEMO mode: the original localStorage simulation (not secure; for the preview only).
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  return API_MODE ? <ApiAuthProvider>{children}</ApiAuthProvider> : <DemoAuthProvider>{children}</DemoAuthProvider>;
}
export const useAuth = () => useContext(AuthContext);

/* ═══════════════════════════ API mode ═══════════════════════════ */
function ApiAuthProvider({ children }) {
  const [account, setAccount] = useState(null); // { ...publicUser, addresses }
  const [ready, setReady] = useState(false);

  const loadAddresses = useCallback(async () => {
    try { const { addresses } = await api('/account/addresses'); setAccount((u) => (u ? { ...u, addresses } : u)); } catch { /* ignore */ }
  }, []);
  const applySession = useCallback(async (data) => {
    if (!data) { setAccessToken(null); setAccount(null); return; }
    setAccessToken(data.accessToken);
    setAccount({ ...data.user, addresses: [] });
    if (data.user.role === 'CUSTOMER') await loadAddresses();
  }, [loadAddresses]);

  // Restore the session from the httpOnly refresh cookie on page load.
  useEffect(() => { refreshSession().then(applySession).finally(() => setReady(true)); }, [applySession]);
  useEffect(() => onSessionLost(() => { setAccessToken(null); setAccount(null); }), []);

  const requestOtp = useCallback((channel, identifier) => api('/auth/otp/request', { method: 'POST', auth: false, body: { channel, identifier } }), []);
  const verifyOtp = useCallback(async (challengeId, code, name) => {
    const data = await api('/auth/otp/verify', { method: 'POST', auth: false, body: { challengeId, code, ...(name ? { name } : {}) } });
    await applySession(data);
    return data;
  }, [applySession]);

  const logout = useCallback(async () => {
    try { await api('/auth/logout', { method: 'POST', auth: false }); } catch { /* already signed out */ }
    setAccessToken(null); setAccount(null);
  }, []);
  const logoutEverywhere = useCallback(async () => {
    try { await api('/auth/logout-all', { method: 'POST' }); } finally { setAccessToken(null); setAccount(null); }
  }, []);

  const updateProfile = useCallback(async ({ name }) => {
    const { user } = await api('/account/profile', { method: 'PATCH', body: { name } });
    setAccount((u) => ({ ...u, ...user }));
    return user;
  }, []);
  const requestContactOtp = useCallback((channel, identifier) => api('/auth/contact/request', { method: 'POST', body: { channel, identifier } }), []);
  const verifyContactOtp = useCallback(async (challengeId, code) => {
    const { user } = await api('/auth/contact/verify', { method: 'POST', body: { challengeId, code } });
    setAccount((u) => ({ ...u, ...user }));
    return user;
  }, []);
  const deleteAccount = useCallback(async () => { await api('/account', { method: 'DELETE' }); setAccessToken(null); setAccount(null); }, []);

  const saveAddress = useCallback(async (address) => {
    const body = { label: address.label || '', name: address.name, phone: address.phone, house: address.house, street: address.street, area: address.area, landmark: address.landmark || '', city: address.city, state: address.state, pin: address.pin, isDefault: !!address.isDefault };
    if (address.id && !String(address.id).startsWith('a-')) await api(`/account/addresses/${address.id}`, { method: 'PUT', body });
    else await api('/account/addresses', { method: 'POST', body });
    await loadAddresses();
  }, [loadAddresses]);
  const deleteAddress = useCallback(async (id) => { await api(`/account/addresses/${id}`, { method: 'DELETE' }); await loadAddresses(); }, [loadAddresses]);

  /** Step 1 of admin sign-in: password. Returns { twoFactor, challengeId, sentTo, devCode? }. */
  const adminLogin = useCallback((email, password) => api('/auth/admin/login', { method: 'POST', auth: false, body: { email, password } }), []);
  /** Step 2: the code emailed to the admin. */
  const adminVerify = useCallback(async (challengeId, code) => {
    const data = await api('/auth/admin/verify', { method: 'POST', auth: false, body: { challengeId, code } });
    await applySession(data);
    return data;
  }, [applySession]);

  const isStaff = account && account.role !== 'CUSTOMER';
  const user = account && !isStaff ? { ...account, name: account.name || account.email?.split('@')[0] || account.phone || '' } : null;
  const admin = isStaff ? { ...account, name: account.name || 'Admin' } : null;

  const value = useMemo(() => ({
    mode: 'api', ready, user, admin,
    requestOtp, verifyOtp, logout, logoutEverywhere, updateProfile, requestContactOtp, verifyContactOtp, deleteAccount,
    saveAddress, deleteAddress, adminLogin, adminVerify, adminLogout: logout,
  }), [ready, user, admin, requestOtp, verifyOtp, logout, logoutEverywhere, updateProfile, requestContactOtp, verifyContactOtp, deleteAccount, saveAddress, deleteAddress, adminLogin, adminVerify]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ═══════════════════════════ DEMO mode ═══════════════════════════ */
function DemoAuthProvider({ children }) {
  const [user, setUser] = usePersistentState('user', null);
  const [admin, setAdmin] = usePersistentState('admin', null);

  const login = useCallback((email, password) => {
    const e = String(email).trim().toLowerCase();
    if (e === DEMO_CUSTOMER_LOGIN.email && password === DEMO_CUSTOMER_LOGIN.password) { setUser({ ...demoCustomer }); return { ok: true }; }
    if (e && password && password.length >= 6) {
      setUser({ id: `c-${Date.now()}`, name: e.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()), email: e, phone: '', joinedAt: new Date().toISOString(), addresses: [] });
      return { ok: true };
    }
    return { ok: false, error: 'auth.invalid' };
  }, [setUser]);

  const register = useCallback(({ name, email, phone }) => {
    setUser({ id: `c-${Date.now()}`, name, email: email.toLowerCase(), phone, joinedAt: new Date().toISOString(), addresses: [] });
    return { ok: true };
  }, [setUser]);

  const logout = useCallback(() => setUser(null), [setUser]);
  const updateProfile = useCallback((patch) => setUser((u) => (u ? { ...u, ...patch } : u)), [setUser]);

  const saveAddress = useCallback((address) => setUser((u) => {
    if (!u) return u;
    const list = u.addresses || [];
    const withId = address.id ? address : { ...address, id: `a-${Date.now()}` };
    let next = list.some((a) => a.id === withId.id) ? list.map((a) => (a.id === withId.id ? withId : a)) : [...list, withId];
    if (withId.isDefault || next.length === 1) next = next.map((a) => ({ ...a, isDefault: a.id === withId.id }));
    return { ...u, addresses: next };
  }), [setUser]);
  const deleteAddress = useCallback((id) => setUser((u) => (u ? { ...u, addresses: (u.addresses || []).filter((a) => a.id !== id) } : u)), [setUser]);

  const adminLogin = useCallback((email, password) => {
    if (String(email).trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password) { setAdmin({ email: DEMO_ADMIN.email, name: 'Store Admin', role: 'SUPER_ADMIN' }); return true; }
    return false;
  }, [setAdmin]);
  const adminLogout = useCallback(() => setAdmin(null), [setAdmin]);

  const value = useMemo(() => ({ mode: 'demo', ready: true, user, login, register, logout, updateProfile, saveAddress, deleteAddress, admin, adminLogin, adminLogout }),
    [user, login, register, logout, updateProfile, saveAddress, deleteAddress, admin, adminLogin, adminLogout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
