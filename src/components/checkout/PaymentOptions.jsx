import { Smartphone, CreditCard, Landmark, Banknote } from 'lucide-react';
import FormField from '@/components/common/FormField';
import { useLocalized } from '@/hooks/useLocalized';

export const PAYMENT_METHODS = [
  { id: 'upi', icon: Smartphone }, { id: 'card', icon: CreditCard }, { id: 'netbanking', icon: Landmark }, { id: 'cod', icon: Banknote },
];
export const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra Bank', 'Bank of Maharashtra', 'Punjab National Bank', 'Bank of Baroda'];

/** Validate DEMO payment fields. Returns { field: i18nKey }. */
export function validatePayment(p) {
  const e = {};
  if (!p.method) e.method = 'validation.selectPayment';
  if (p.method === 'upi' && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(p.upi || '')) e.upi = 'validation.upi';
  if (p.method === 'card') {
    if (!/^\d{16}$/.test((p.cardNumber || '').replace(/\s/g, ''))) e.cardNumber = 'validation.card';
    if ((p.cardName || '').trim().length < 2) e.cardName = 'validation.name';
    const m = /^(0[1-9]|1[0-2])\/(\d{2})$/.exec(p.expiry || '');
    if (!m) e.expiry = 'validation.expiry';
    else { const now = new Date(); const y = 2000 + +m[2]; if (y < now.getFullYear() || (y === now.getFullYear() && +m[1] < now.getMonth() + 1)) e.expiry = 'validation.expiry'; }
    if (!/^\d{3}$/.test(p.cvv || '')) e.cvv = 'validation.cvv';
  }
  if (p.method === 'netbanking' && !p.bank) e.bank = 'validation.bank';
  return e;
}

export default function PaymentOptions({ value, onChange, errors, codAvailable }) {
  const { t } = useLocalized();
  const set = (patch) => onChange({ ...value, ...patch });
  return (
    <div className="space-y-3" role="radiogroup" aria-label={t('checkout.paymentMethod')}>
      {PAYMENT_METHODS.map(({ id, icon: Icon }) => {
        const active = value.method === id; const disabled = id === 'cod' && !codAvailable;
        return (
          <div key={id} className={`rounded-2xl border-2 transition ${active ? 'border-chilli bg-chilli-50/40' : 'border-line bg-white'} ${disabled ? 'opacity-50' : ''}`}>
            <label className={`flex items-center gap-3 p-4 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
              <input type="radio" name="payment" className="h-4 w-4 accent-chilli" checked={active} disabled={disabled} onChange={() => set({ method: id })} />
              <span className={`flex h-10 w-10 items-center justify-center rounded-full ${active ? 'bg-chilli text-white' : 'bg-cream text-charcoal'}`}><Icon size={18} /></span>
              <span className="flex-1"><span className="block font-semibold">{t(`payment.${id}`)}</span><span className="block text-xs text-charcoal-500">{disabled ? t('checkout.codUnavailable') : t(`payment.${id}Desc`)}</span></span>
            </label>
            {active && id !== 'cod' && (
              <div className="grid gap-3 border-t border-line p-4 sm:grid-cols-2 animate-fadeUp">
                {id === 'upi' && <FormField className="sm:col-span-2" label={t('payment.upiId')} placeholder={t('payment.upiPlaceholder')} value={value.upi || ''} onChange={(e) => set({ upi: e.target.value.trim() })} error={errors.upi} autoComplete="off" />}
                {id === 'card' && (
                  <>
                    <FormField className="sm:col-span-2" label={t('payment.cardNumber')} inputMode="numeric" placeholder="4111 1111 1111 1111" value={value.cardNumber || ''} onChange={(e) => set({ cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ') })} error={errors.cardNumber} autoComplete="off" />
                    <FormField className="sm:col-span-2" label={t('payment.cardName')} value={value.cardName || ''} onChange={(e) => set({ cardName: e.target.value })} error={errors.cardName} autoComplete="off" />
                    <FormField label={t('payment.expiry')} placeholder="MM/YY" inputMode="numeric" value={value.expiry || ''} onChange={(e) => { const d = e.target.value.replace(/\D/g, '').slice(0, 4); set({ expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }); }} error={errors.expiry} autoComplete="off" />
                    <FormField label={t('payment.cvv')} type="password" inputMode="numeric" placeholder="•••" value={value.cvv || ''} onChange={(e) => set({ cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })} error={errors.cvv} autoComplete="off" />
                  </>
                )}
                {id === 'netbanking' && (
                  <FormField as="select" className="sm:col-span-2" label={t('payment.bank')} value={value.bank || ''} onChange={(e) => set({ bank: e.target.value })} error={errors.bank}>
                    <option value="">{t('payment.bank')}</option>{BANKS.map((b) => <option key={b}>{b}</option>)}
                  </FormField>
                )}
                <p className="text-xs text-turmeric-700 sm:col-span-2">⚠ {t('payment.demoNote')}</p>
              </div>
            )}
          </div>
        );
      })}
      {errors.method && <p className="field-error" role="alert">{t(errors.method)}</p>}
    </div>
  );
}
