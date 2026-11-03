import { useLayoutEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { Lock, Info, Eye, EyeOff, ArrowRight, ShieldCheck, LayoutDashboard, Package, ShoppingCart, MessageSquareHeart } from 'lucide-react';
import { BrandMark } from '@/components/common/Logo';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { DEMO_ADMIN } from '@/services/mock/seed';
import { reduced } from '@/components/admin/motion';

/** Admin sign-in with a GSAP-animated spice-particle backdrop (DEMO auth only). */
export default function AdminLoginPage() {
  const { admin, adminLogin, adminVerify, mode: authMode } = useAuth();
  const [twoFa, setTwoFa] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('');
  const [show, setShow] = useState(false); const [error, setError] = useState(''); const [shake, setShake] = useState(0);
  const stage = useRef(null);
  useDocumentTitle('Admin login');

  useLayoutEffect(() => {
    if (!stage.current || reduced()) return undefined;
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.spice').forEach((el) => {
        gsap.set(el, { x: gsap.utils.random(-40, 40), y: gsap.utils.random(-40, 40) });
        gsap.to(el, { x: `+=${gsap.utils.random(-120, 120)}`, y: `+=${gsap.utils.random(-160, 160)}`, rotation: gsap.utils.random(-180, 180), duration: gsap.utils.random(6, 12), ease: 'sine.inOut', repeat: -1, yoyo: true });
      });
      gsap.from('.feat', { y: 20, opacity: 0, stagger: 0.08, duration: 0.8, ease: 'power3.out', delay: 0.3 });
      gsap.from('.brand-in', { y: 30, opacity: 0, duration: 1, ease: 'power4.out' });
    }, stage);
    return () => ctx.revert();
  }, []);

  if (admin) return <Navigate to="/admin" replace />;
  const fail = (m) => { setError(m); setShake((n) => n + 1); };
  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (authMode !== 'api') { if (adminLogin(email, password)) navigate('/admin'); else fail('Invalid admin email or password.'); return; }
    setBusy(true);
    try { const r = await adminLogin(email.trim(), password); setPassword(''); setTwoFa(r); setCode(''); } catch (err) { fail(err.message); } finally { setBusy(false); }
  };
  const verify = async (e) => {
    e.preventDefault(); setError('');
    if (!/^\d{6}$/.test(code)) { fail('Enter the 6-digit code from your email.'); return; }
    setBusy(true);
    try { await adminVerify(twoFa.challengeId, code); navigate('/admin'); } catch (err) { fail(err.message); setCode(''); } finally { setBusy(false); }
  };
  const dots = Array.from({ length: 22 }, (_, i) => ({ i, size: 6 + ((i * 37) % 22), left: (i * 47) % 100, top: (i * 61) % 100, color: ['#D2161E', '#F0A830', '#5E9C2C', '#E0362F', '#FDEDCB'][i % 5] }));

  return (
    <div ref={stage} className="adm-scope relative grid min-h-screen overflow-hidden bg-[#0E0C0B] font-sans text-white lg:grid-cols-[1.1fr_1fr]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-chilli/35 blur-[120px]" />
        <div className="absolute -bottom-40 right-0 h-[480px] w-[480px] rounded-full bg-turmeric/20 blur-[120px]" />
        {dots.map((d) => <span key={d.i} className="spice absolute rounded-full opacity-60" style={{ width: d.size, height: d.size, left: `${d.left}%`, top: `${d.top}%`, background: d.color, filter: d.size > 20 ? 'blur(2px)' : 'none' }} />)}
      </div>

      <section className="relative hidden flex-col justify-between p-12 lg:flex">
        <div className="brand-in flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white"><BrandMark className="h-10 w-10" /></span><span><span className="block font-brand text-2xl">सान्वी मसाले</span><span className="text-xs font-semibold uppercase tracking-[.24em] text-white/50">Admin studio</span></span></div>
        <div>
          <h1 className="brand-in max-w-lg text-5xl font-bold leading-[1.05] tracking-tight">Run your whole masala store from one place.</h1>
          <ul className="mt-10 grid max-w-lg grid-cols-2 gap-3">
            {[[LayoutDashboard, 'Live sales dashboard'], [Package, 'Products, prices & stock'], [ShoppingCart, 'Order board & invoices'], [MessageSquareHeart, 'Reviews, banners & theme']].map(([Icon, l]) => (
              <li key={l} className="feat flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[.04] p-4 text-sm backdrop-blur"><Icon size={18} className="text-turmeric" />{l}</li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-white/40">{authMode === 'api' ? 'Secure admin · password + one-time code' : 'Demo admin · data stays in this browser'}</p>
      </section>

      <section className="relative flex items-center justify-center p-4 sm:p-8">
        <motion.div key={shake} initial={shake ? { x: 0 } : { opacity: 0, y: 30, scale: 0.97 }} animate={shake ? { x: [0, -12, 12, -8, 8, 0] } : { opacity: 1, y: 0, scale: 1 }} transition={shake ? { duration: 0.45 } : { type: 'spring', stiffness: 260, damping: 26, delay: 0.15 }}
          className="w-full max-w-md rounded-[32px] border border-white/10 bg-white p-8 text-charcoal shadow-[0_40px_100px_-30px_rgba(0,0,0,.8)] sm:p-10">
          <div className="flex items-center gap-3 lg:hidden"><BrandMark className="h-10 w-10" /><span className="font-brand text-xl">सान्वी मसाले</span></div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight lg:mt-0">Welcome back</h2>
          <p className="mt-1 text-sm text-charcoal-500">Sign in to the admin dashboard.</p>
          {twoFa ? (
            <form onSubmit={verify} className="mt-7 space-y-4" noValidate>
              <p className="flex gap-2 rounded-2xl bg-leaf-50 p-3 text-sm text-charcoal-600"><ShieldCheck size={16} className="mt-0.5 shrink-0 text-leaf-700" /><span>Step 2 of 2 — we emailed a 6-digit code to <strong>{twoFa.sentTo}</strong>. It expires in 5 minutes.</span></p>
              <label className="block"><span className="label">Verification code</span>
                <input className="adm-input h-14 text-center font-mono text-2xl tracking-[0.5em]" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" autoFocus placeholder="••••••" /></label>
              {twoFa.devCode && <p className="rounded-xl bg-turmeric-50 px-3 py-2 text-xs text-turmeric-700">Development mode code: <strong className="font-mono">{twoFa.devCode}</strong></p>}
              <AnimatePresence>{error && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="rounded-xl bg-chilli-50 px-3 py-2 text-sm text-chilli" role="alert">{error}</motion.p>}</AnimatePresence>
              <motion.button type="submit" disabled={busy} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="adm-btn-primary h-12 w-full text-[15px]"><ShieldCheck size={16} />{busy ? 'Verifying…' : 'Verify & sign in'}</motion.button>
              <button type="button" className="adm-btn-ghost w-full" onClick={() => { setTwoFa(null); setError(''); }}>Start again</button>
            </form>
          ) : (
          <form onSubmit={submit} className="mt-7 space-y-4" noValidate>
            <label className="block"><span className="label">Email</span><input className="adm-input h-12" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label>
            <label className="block"><span className="label">Password</span>
              <span className="relative block"><input className="adm-input h-12 pr-12" type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
                <button type="button" onClick={() => setShow((v) => !v)} className="adm-icon absolute right-1.5 top-1.5" aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button></span>
            </label>
            <AnimatePresence>{error && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="rounded-xl bg-chilli-50 px-3 py-2 text-sm text-chilli" role="alert">{error}</motion.p>}</AnimatePresence>
            <motion.button type="submit" disabled={busy} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="adm-btn-primary h-12 w-full text-[15px]"><Lock size={16} />{busy ? 'Checking…' : 'Sign in'}<ArrowRight size={16} /></motion.button>
            {authMode !== 'api' && <button type="button" className="adm-btn-ghost w-full" onClick={() => { setEmail(DEMO_ADMIN.email); setPassword(DEMO_ADMIN.password); }}>Fill demo credentials</button>}
          </form>
          )}
          {authMode === 'api'
            ? <p className="mt-6 flex gap-2 rounded-2xl bg-black/[.03] p-3 text-xs text-charcoal-600"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-leaf-700" /><span>Protected sign-in: password + a one-time code emailed to you. Accounts lock for 15 minutes after 5 wrong passwords. Admin accounts are created by the store owner only.</span></p>
            : <p className="mt-6 flex gap-2 rounded-2xl bg-turmeric-50 p-3 text-xs text-charcoal-600"><Info size={15} className="mt-0.5 shrink-0 text-turmeric-700" /><span>Demo login: <strong>{DEMO_ADMIN.email}</strong> / <strong>{DEMO_ADMIN.password}</strong>. Mock authentication only — not secure.</span></p>}
          <Link to="/" className="mt-5 block text-center text-sm text-charcoal-500 hover:text-chilli">← Back to store</Link>
        </motion.div>
      </section>
    </div>
  );
}
