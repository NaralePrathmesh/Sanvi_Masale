import { useEffect, useRef, useState } from 'react';
import { Mail, Smartphone, ArrowRight, ShieldCheck, RotateCcw, Pencil } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLocalized } from '@/hooks/useLocalized';

/**
 * Passwordless sign-in / sign-up with a one-time code sent by email or SMS.
 * Step 1: choose email or mobile and request a code. Step 2: enter the 6-digit code.
 * New customers are created automatically on first successful verification.
 */
export default function OtpLogin({ onDone }) {
  const { t } = useLocalized();
  const { requestOtp, verifyOtp } = useAuth();
  const [channel, setChannel] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState(1);
  const [challenge, setChallenge] = useState(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [wait, setWait] = useState(0);
  const codeRef = useRef(null);

  useEffect(() => { if (wait <= 0) return undefined; const id = setTimeout(() => setWait((w) => w - 1), 1000); return () => clearTimeout(id); }, [wait]);
  useEffect(() => { if (step === 2) setTimeout(() => codeRef.current?.focus(), 50); }, [step]);

  const msg = (e) => {
    if (e?.code === 'RATE_LIMITED') return e.message || t('otp.tooMany');
    if (e?.status === 400 && e?.details?.[0]?.field === 'identifier') return channel === 'email' ? t('validation.email') : t('validation.phone');
    return e?.message || t('common.error');
  };

  const send = async (e) => {
    e?.preventDefault(); setError('');
    const id = identifier.trim();
    if (channel === 'email' ? !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id) : !/^[6-9]\d{9}$/.test(id.replace(/\D/g, '').slice(-10))) {
      setError(channel === 'email' ? t('validation.email') : t('validation.phone')); return;
    }
    setBusy(true);
    try {
      const r = await requestOtp(channel, channel === 'sms' ? id.replace(/\D/g, '').slice(-10) : id);
      setChallenge(r); setStep(2); setCode(''); setWait(r.resendIn || 45);
    } catch (err) {
      setError(msg(err));
      const retry = Number(err?.message?.match(/(\d+) seconds/)?.[1]);
      if (retry) setWait(retry);
    } finally { setBusy(false); }
  };

  const verify = async (e) => {
    e?.preventDefault(); setError('');
    if (!/^\d{6}$/.test(code)) { setError(t('otp.enterCode')); return; }
    setBusy(true);
    try {
      const r = await verifyOtp(challenge.challengeId, code, name.trim() || undefined);
      onDone?.(r);
    } catch (err) { setError(msg(err)); setCode(''); codeRef.current?.focus(); } finally { setBusy(false); }
  };

  if (step === 2) {
    return (
      <form onSubmit={verify} className="space-y-4" noValidate>
        <div className="rounded-2xl bg-leaf-50 p-4 text-sm text-charcoal-600">
          <p className="flex items-center gap-2 font-semibold text-leaf-700"><ShieldCheck size={16} />{t('otp.sentTitle')}</p>
          <p className="mt-1">{t('otp.sentTo', { to: challenge?.sentTo })}</p>
          <button type="button" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-chilli hover:underline" onClick={() => { setStep(1); setError(''); }}><Pencil size={12} />{channel === 'email' ? t('otp.changeEmail') : t('otp.changeMobile')}</button>
        </div>
        <label className="block">
          <span className="label">{t('otp.codeLabel')}</span>
          <input ref={codeRef} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="\d{6}" maxLength={6}
            className="input h-14 text-center font-mono text-2xl tracking-[0.6em]" placeholder="••••••" aria-describedby="otp-help" />
        </label>
        <label className="block"><span className="label">{t('otp.nameLabel')} <span className="font-normal text-charcoal-400">({t('common.optional')})</span></span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" maxLength={80} placeholder={t('otp.namePlaceholder')} /></label>
        {challenge?.devCode && <p className="rounded-xl bg-turmeric-50 px-3 py-2 text-xs text-turmeric-700">{t('otp.devCode')} <strong className="font-mono">{challenge.devCode}</strong></p>}
        {error && <p className="rounded-xl bg-chilli-50 px-4 py-3 text-sm font-medium text-chilli" role="alert">{error}</p>}
        <button type="submit" className="btn-primary w-full py-3" disabled={busy || code.length !== 6}>{busy ? t('common.loading') : t('otp.verify')}<ArrowRight size={16} /></button>
        <p id="otp-help" className="text-center text-sm text-charcoal-500">
          {wait > 0 ? t('otp.resendIn', { s: wait }) : <button type="button" onClick={send} className="inline-flex items-center gap-1 font-semibold text-chilli hover:underline" disabled={busy}><RotateCcw size={13} />{t('otp.resend')}</button>}
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={send} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 rounded-full bg-cream p-1" role="tablist" aria-label={t('otp.method')}>
        {[['email', Mail, t('otp.useEmail')], ['sms', Smartphone, t('otp.useMobile')]].map(([c, Icon, label]) => (
          <button key={c} type="button" role="tab" aria-selected={channel === c} onClick={() => { setChannel(c); setIdentifier(''); setError(''); }}
            className={`inline-flex items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition ${channel === c ? 'bg-white text-chilli shadow-card' : 'text-charcoal-500'}`}><Icon size={15} />{label}</button>
        ))}
      </div>
      {channel === 'email' ? (
        <label className="block"><span className="label">{t('auth.email')}</span><input className="input" type="email" value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="email" placeholder="you@example.com" /></label>
      ) : (
        <label className="block"><span className="label">{t('checkout.mobile')}</span>
          <span className="flex"><span className="flex items-center rounded-l-xl border border-r-0 border-line bg-cream px-3 text-sm font-semibold text-charcoal-600">+91</span>
            <input className="input rounded-l-none" type="tel" inputMode="numeric" value={identifier} onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, '').slice(0, 10))} autoComplete="tel-national" placeholder="98765 43210" /></span></label>
      )}
      {error && <p className="rounded-xl bg-chilli-50 px-4 py-3 text-sm font-medium text-chilli" role="alert">{error}</p>}
      <button type="submit" className="btn-primary w-full py-3" disabled={busy || wait > 0}>{busy ? t('common.loading') : wait > 0 ? t('otp.resendIn', { s: wait }) : t('otp.sendCode')}<ArrowRight size={16} /></button>
      <p className="flex items-start gap-2 text-xs text-charcoal-500"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-leaf" />{t('otp.privacy')}</p>
    </form>
  );
}
