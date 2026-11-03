import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { API_MODE, api } from '@/services/api/client';
import { useLocalized } from '@/hooks/useLocalized';
import { usePersistentState } from '@/hooks/usePersistentState';
import { validators } from '@/utils/validation';

/** Minimal newsletter sign-up (demo — stored only in this browser). */
export default function Newsletter() {
  const { t } = useLocalized();
  const [subs, setSubs] = usePersistentState('newsletter', []);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const err = validators.email(email);
    if (err) { setError(err); setMsg(''); return; }
    setError('');
    if (subs.includes(email.toLowerCase())) { setMsg(t('newsletter.already')); return; }
    const done = () => { setSubs([...subs, email.toLowerCase()]); setMsg(t('newsletter.success')); setEmail(''); };
    if (!API_MODE) { done(); return; }
    api('/newsletter', { method: 'POST', auth: false, body: { email: email.trim() } }).then(done).catch((ex) => setError(ex.message));
  };
  return (
    <section className="container-x pb-4 pt-16 sm:pt-20">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="h-section">{t('newsletter.title')}</h2>
        <p className="mt-2 text-charcoal-500">{t('newsletter.sub')}</p>
        <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-2 sm:flex-row">
          <label className="flex-1"><span className="sr-only">{t('newsletter.placeholder')}</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('newsletter.placeholder')} className={`input ${error ? 'input-error' : ''}`} aria-invalid={!!error} />
          </label>
          <button type="submit" className="btn-primary px-6">{t('actions.subscribe')}</button>
        </form>
        {error && <p className="field-error mt-2" role="alert">{t(error)}</p>}
        {msg && <p className="mt-3 flex items-center justify-center gap-2 text-sm text-leaf" role="status"><CheckCircle2 size={16} />{msg}</p>}
      </div>
    </section>
  );
}
