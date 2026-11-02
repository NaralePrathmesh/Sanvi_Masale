import { createContext, useCallback, useContext, useMemo } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';
import { demoCustomer, DEMO_ADMIN, DEMO_CUSTOMER_LOGIN } from '@/services/mock/seed';

/**
 * DEMO AUTHENTICATION ONLY — no passwords are verified server-side and nothing
 * here is secure. Replace with real auth (OTP / JWT / sessions) in Phase 2.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = usePersistentState('user', null);
  const [admin, setAdmin] = usePersistentState('admin', null);

  const login = useCallback((email, password) => {
    const e = String(email).trim().toLowerCase();
    if (e === DEMO_CUSTOMER_LOGIN.email && password === DEMO_CUSTOMER_LOGIN.password) { setUser({ ...demoCustomer }); return { ok: true }; }
    if (e && password && password.length >= 6) {
      // Any other email + 6-char password creates a local demo profile.
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
    if (String(email).trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password) { setAdmin({ email: DEMO_ADMIN.email, name: 'Store Admin' }); return true; }
    return false;
  }, [setAdmin]);
  const adminLogout = useCallback(() => setAdmin(null), [setAdmin]);

  const value = useMemo(() => ({ user, login, register, logout, updateProfile, saveAddress, deleteAddress, admin, adminLogin, adminLogout }),
    [user, login, register, logout, updateProfile, saveAddress, deleteAddress, admin, adminLogin, adminLogout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
