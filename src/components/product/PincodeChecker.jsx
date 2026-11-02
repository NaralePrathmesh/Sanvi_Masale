import { useState } from 'react';
import { MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { useLocalized } from '@/hooks/useLocalized';
import { useStore } from '@/context/StoreContext';
import { checkPincode } from '@/utils/pincode';
import { formatDate } from '@/utils/format';
import { usePersistentState } from '@/hooks/usePersistentState';

/** DEMO delivery PIN checker (configurable list in config/site.js). */
export default function PincodeChecker({ compact = false }) {
  const { t, lang } = useLocalized();
  const { settings } = useStore();
  const [savedPin, setSavedPin] = usePersistentState('lastPin', '');
  const [pin, setPin] = useState(savedPin);
  const [result, setResult] = useState(null);

  const onCheck = (e) => {
    e.preventDefault();
    const r = checkPincode(pin.trim(), settings);
    setResult(r);
    if (r.valid) setSavedPin(pin.trim());
  };

  return (
    <div className={compact ? '' : 'rounded-2xl border border-line bg-white p-4'}>
      <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><MapPin size={16} className="text-chilli" />{t('pin.title')} <span className="demo-pill">{t('demo.label')}</span></p>
      <form onSubmit={onCheck} className="flex gap-2">
        <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder={t('pin.placeholder')} aria-label={t('pin.placeholder')} className="input flex-1" />
        <button type="submit" className="btn-outline">{t('actions.check')}</button>
      </form>
      {result && (
        <div className="mt-3 space-y-1 text-sm" role="status">
          {!result.valid && <p className="flex items-center gap-1.5 text-chilli"><XCircle size={15} />{t('pin.invalid')}</p>}
          {result.valid && !result.serviceable && <p className="flex items-center gap-1.5 text-chilli"><XCircle size={15} />{t('pin.notServiceable')}</p>}
          {result.serviceable && (
            <>
              <p className="flex items-center gap-1.5 font-medium text-leaf"><CheckCircle2 size={15} />{t('pin.serviceable', { date: formatDate(result.eta, lang, { weekday: 'short', day: 'numeric', month: 'short' }) })}</p>
              <p className="text-charcoal-500">• {result.cod ? t('pin.cod') : t('pin.noCod')}{result.express ? ` • ${t('pin.express')}` : ''}</p>
            </>
          )}
        </div>
      )}
      {!compact && <p className="mt-2 text-[11px] text-charcoal-400">{t('pin.demo')}</p>}
    </div>
  );
}
