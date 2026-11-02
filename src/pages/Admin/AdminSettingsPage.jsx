import { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { Panel } from '@/components/admin/ui';
import { useStore } from '@/context/StoreContext';
import { useUI } from '@/context/UIContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { languages } from '@/config/site';
import { storage } from '@/services/mock/storage';
import i18n from '@/i18n';

export default function AdminSettingsPage() {
  const { settings, setSettings, resetStore } = useStore();
  const { toast } = useUI();
  const [s, setS] = useState(settings);
  const [errors, setErrors] = useState({});
  const [armed, setArmed] = useState(false);
  useDocumentTitle('Admin · Settings');
  const num = (k) => ({ type: 'number', min: 0, className: `input ${errors[k] ? 'input-error' : ''}`, value: s[k], onChange: (e) => setS({ ...s, [k]: e.target.value }) });
  const save = (e) => {
    e.preventDefault();
    const n = { ...s };
    const errs = {};
    ['deliveryCharge', 'expressDeliveryCharge', 'freeShippingThreshold', 'codCharge', 'standardDeliveryDays', 'expressDeliveryDays'].forEach((k) => { n[k] = Number(s[k]); if (!(n[k] >= 0) || s[k] === '') errs[k] = 'Enter 0 or more'; });
    if (!n.storeName?.trim()) errs.storeName = 'Required';
    setErrors(errs); if (Object.keys(errs).length) return;
    setSettings(n);
    if (!storage.get('lang', null)) i18n.changeLanguage(n.defaultLanguage);
    toast('Settings saved');
  };
  const Err = ({ k }) => (errors[k] ? <p className="field-error">{errors[k]}</p> : null);
  return (
    <form onSubmit={save} className="space-y-6" noValidate>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Store information">
          <div className="space-y-4">
            <label className="block"><span className="label">Store name</span><input className="input" value={s.storeName} onChange={(e) => setS({ ...s, storeName: e.target.value })} /><Err k="storeName" /></label>
            <label className="block"><span className="label">Support email</span><input className="input" type="email" value={s.supportEmail} onChange={(e) => setS({ ...s, supportEmail: e.target.value })} /></label>
            <label className="block"><span className="label">Support phone</span><input className="input" value={s.supportPhone} onChange={(e) => setS({ ...s, supportPhone: e.target.value })} /></label>
            <label className="block"><span className="label">GSTIN</span><input className="input" value={s.gstin} onChange={(e) => setS({ ...s, gstin: e.target.value })} /></label>
            <p className="text-xs text-charcoal-400">Brand name, logo and footer contact details are set in src/config/brand.js.</p>
          </div>
        </Panel>
        <Panel title="Language preferences">
          <label className="block"><span className="label">Default storefront language</span>
            <select className="input" value={s.defaultLanguage} onChange={(e) => setS({ ...s, defaultLanguage: e.target.value })}>{languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</select></label>
          <p className="mt-2 text-xs text-charcoal-400">Applies to visitors who haven’t chosen a language yet. All three languages (English, हिंदी, मराठी) are always available in the header.</p>
        </Panel>
      </div>
      <Panel title="Delivery & charges">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label><span className="label">Standard delivery charge (₹)</span><input {...num('deliveryCharge')} /><Err k="deliveryCharge" /></label>
          <label><span className="label">Free shipping threshold (₹)</span><input {...num('freeShippingThreshold')} /><Err k="freeShippingThreshold" /></label>
          <label><span className="label">Express delivery charge (₹)</span><input {...num('expressDeliveryCharge')} /><Err k="expressDeliveryCharge" /></label>
          <label><span className="label">Standard delivery days</span><input {...num('standardDeliveryDays')} /><Err k="standardDeliveryDays" /></label>
          <label><span className="label">Express delivery days</span><input {...num('expressDeliveryDays')} /><Err k="expressDeliveryDays" /></label>
          <label><span className="label">COD handling charge (₹)</span><input {...num('codCharge')} /><Err k="codCharge" /></label>
        </div>
        <p className="mt-3 text-xs text-charcoal-400">Serviceable PIN codes (demo list) are configured in src/config/site.js → serviceablePins.</p>
      </Panel>
      <div className="flex flex-wrap justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className={armed ? 'btn-primary' : 'btn-outline'} onClick={() => { if (!armed) { setArmed(true); return; } resetStore(); toast('Store data reset', 'info'); setTimeout(() => window.location.reload(), 400); }}><RotateCcw size={16} />{armed ? 'Click again to confirm reset' : 'Reset store demo data'}</button>
          {armed && <button type="button" className="btn-ghost" onClick={() => setArmed(false)}>Cancel</button>}
        </div>
        <button type="submit" className="btn-primary px-8"><Save size={16} />Save settings</button>
      </div>
    </form>
  );
}
