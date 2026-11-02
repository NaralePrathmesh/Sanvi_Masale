import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { LogIn, UserPlus, Info } from 'lucide-react';
import FormField from '@/components/common/FormField';
import SmartImage from '@/components/common/SmartImage';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { validate, validators } from '@/utils/validation';
import { pageImages } from '@/assets/images';
import { DEMO_CUSTOMER_LOGIN } from '@/services/mock/seed';
import { brand } from '@/config/brand';

export default function LoginPage() {
  const { t, l } = useLocalized();
  const { user, login, register } = useAuth();
  const { toast } = useUI();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/account';
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState('');
  useDocumentTitle(mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle'));
  if (user) return <Navigate to={redirect} replace />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault(); setAuthError('');
    const schema = mode === 'login'
      ? { email: validators.email, password: validators.required }
      : { name: validators.name, email: validators.email, phone: validators.phone, password: validators.minLen(6) };
    const errs = validate(form, schema);
    if (errs.password === 'validation.minLength') errs.password = 'validation.password';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    const res = mode === 'login' ? login(form.email, form.password) : register(form);
    if (!res.ok) { setAuthError(t(res.error)); return; }
    toast(t('auth.welcome', { name: (form.name || form.email.split('@')[0]).split(' ')[0] }));
    navigate(redirect, { replace: true });
  };

  return (
    <div className="container-x py-10">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl bg-white shadow-lift lg:grid-cols-2">
        <div className="relative hidden lg:block">
          <SmartImage image={pageImages.login} alt="" className="h-full w-full" />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-charcoal/90 to-transparent p-10 text-white">
            <p className="font-brand text-4xl">{brand.name}</p><p className="mt-1 text-white/80">{l(brand.tagline)}</p>
          </div>
        </div>
        <div className="p-6 sm:p-10">
          <div className="mb-6 grid grid-cols-2 rounded-full bg-cream p-1" role="tablist">
            {['login', 'register'].map((m) => <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => { setMode(m); setErrors({}); setAuthError(''); }} className={`rounded-full py-2.5 text-sm font-semibold transition ${mode === m ? 'bg-white text-chilli shadow-card' : 'text-charcoal-500'}`}>{m === 'login' ? t('auth.login') : t('auth.register')}</button>)}
          </div>
          <h1 className="text-2xl">{mode === 'login' ? t('auth.loginTitle') : t('auth.registerTitle')}</h1>
          <p className="mt-1 text-sm text-charcoal-500">{mode === 'login' ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}</p>
          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            {mode === 'register' && <FormField label={t('checkout.fullName')} value={form.name} onChange={set('name')} error={errors.name} autoComplete="name" />}
            <FormField label={t('auth.email')} type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
            {mode === 'register' && <FormField label={t('checkout.mobile')} type="tel" inputMode="numeric" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/[^\d]/g, '').slice(0, 10) })} error={errors.phone} />}
            <FormField label={t('auth.password')} type="password" value={form.password} onChange={set('password')} error={errors.password} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
            {authError && <p className="rounded-xl bg-chilli-50 px-4 py-3 text-sm font-medium text-chilli" role="alert">{authError}</p>}
            <button type="submit" className="btn-primary w-full py-3">{mode === 'login' ? <LogIn size={17} /> : <UserPlus size={17} />}{mode === 'login' ? t('auth.login') : t('auth.register')}</button>
          </form>
          {mode === 'login' && <button type="button" className="btn-outline mt-3 w-full" onClick={() => { login(DEMO_CUSTOMER_LOGIN.email, DEMO_CUSTOMER_LOGIN.password); toast(t('auth.welcome', { name: 'Priya' })); navigate(redirect, { replace: true }); }}>{t('auth.useDemo')}</button>}
          <p className="mt-5 flex gap-2 rounded-xl bg-turmeric-50 p-3 text-xs text-charcoal-600"><Info size={15} className="mt-0.5 shrink-0 text-turmeric-700" /><span>{t('auth.demoHint')}<br /><strong>{t('auth.demoOnly')}</strong></span></p>
          <p className="mt-5 text-center text-sm text-charcoal-500">{mode === 'login' ? t('auth.noAccount') : t('auth.haveAccount')} <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? t('auth.register') : t('auth.login')}</button></p>
          <p className="mt-2 text-center"><Link to="/track-order" className="text-xs text-charcoal-400 hover:text-chilli">{t('nav.trackOrder')} →</Link></p>
        </div>
      </div>
    </div>
  );
}
