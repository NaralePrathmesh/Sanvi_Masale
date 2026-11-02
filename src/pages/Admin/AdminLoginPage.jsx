import { useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { Lock, Info } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { useAuth } from '@/context/AuthContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { DEMO_ADMIN } from '@/services/mock/seed';

export default function AdminLoginPage() {
  const { admin, adminLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  useDocumentTitle('Admin login');
  if (admin) return <Navigate to="/admin" replace />;
  const submit = (e) => { e.preventDefault(); if (adminLogin(email, password)) navigate('/admin'); else setError('Invalid admin email or password.'); };
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-lift">
        <Logo size="sm" />
        <h1 className="mt-6 text-2xl font-bold">Admin dashboard</h1>
        <p className="mt-1 text-sm text-charcoal-500">Sign in to manage the demo store.</p>
        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          <label className="block"><span className="label">Email</span><input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></label>
          <label className="block"><span className="label">Password</span><input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label>
          {error && <p className="rounded-xl bg-chilli-50 px-3 py-2 text-sm text-chilli" role="alert">{error}</p>}
          <button type="submit" className="btn-primary w-full py-3"><Lock size={16} />Sign in</button>
          <button type="button" className="btn-outline w-full" onClick={() => { setEmail(DEMO_ADMIN.email); setPassword(DEMO_ADMIN.password); }}>Fill demo credentials</button>
        </form>
        <p className="mt-5 flex gap-2 rounded-xl bg-turmeric-50 p-3 text-xs text-charcoal-600"><Info size={15} className="mt-0.5 shrink-0 text-turmeric-700" /><span>Demo login: <strong>{DEMO_ADMIN.email}</strong> / <strong>{DEMO_ADMIN.password}</strong>. Mock authentication only — not secure.</span></p>
        <Link to="/" className="mt-4 block text-center text-sm text-charcoal-500 hover:text-chilli">← Back to store</Link>
      </div>
    </div>
  );
}
