import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Save, RotateCcw, Store, Phone, Truck, Palette, Database, Download, Upload, Check, MessageCircle, AlertTriangle } from 'lucide-react';
import { Panel, PageHeader, Toggle, Badge } from '@/components/admin/ui';
import { useStagger, spring } from '@/components/admin/motion';
import { useStore } from '@/context/StoreContext';
import { useUI } from '@/context/UIContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { languages } from '@/config/site';
import { themes } from '@/config/themes';
import { storage } from '@/services/mock/storage';
import i18n from '@/i18n';

const TABS = [['store', 'Store', Store], ['contact', 'Contact & WhatsApp', Phone], ['delivery', 'Delivery & charges', Truck], ['appearance', 'Appearance', Palette], ['data', 'Data & backup', Database]];
const THEME_NAMES = { classic: ['Saanvi Red', 'Brand red & green on warm cream'], noir: ['Minimal Noir', 'Clean black & white, modern'], fresh: ['Fresh Leaf', 'Natural green on soft white'] };
const NUMERIC = ['deliveryCharge', 'expressDeliveryCharge', 'freeShippingThreshold', 'codCharge', 'standardDeliveryDays', 'expressDeliveryDays', 'lowStockThreshold'];

export default function AdminSettingsPage() {
  const { settings, setSettings, resetStore } = useStore();
  const { toast } = useUI();
  const [params, setParams] = useSearchParams();
  const [tab, setTab] = useState(params.get('tab') || 'store');
  const [s, setS] = useState(settings);
  const [errors, setErrors] = useState({});
  const [armed, setArmed] = useState(false);
  const fileRef = useRef(null);
  useDocumentTitle('Admin · Settings');
  const ref = useStagger();
  useEffect(() => { if (params.get('tab')) setParams({}, { replace: true }); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setS(settings); }, [settings]);

  const dirty = JSON.stringify(s) !== JSON.stringify(settings);
  const field = (k, props = {}) => ({ className: `adm-input ${errors[k] ? 'border-chilli' : ''}`, value: s[k] ?? '', onChange: (e) => setS({ ...s, [k]: e.target.value }), ...props });
  const Err = ({ k }) => (errors[k] ? <p className="field-error">{errors[k]}</p> : null);

  const save = () => {
    const n = { ...s }; const errs = {};
    NUMERIC.forEach((k) => { n[k] = Number(s[k]); if (!(n[k] >= 0) || s[k] === '') errs[k] = 'Enter 0 or more'; });
    if (!n.storeName?.trim()) errs.storeName = 'Required';
    const digits = (v) => String(v || '').replace(/\D/g, '');
    if (digits(n.supportPhone).length < 10) errs.supportPhone = 'Enter a valid phone number with country code, e.g. +91 98765 43210';
    if (digits(n.whatsapp).length < 10) errs.whatsapp = 'Enter a valid WhatsApp number with country code';
    setErrors(errs);
    if (Object.keys(errs).length) { const first = Object.keys(errs)[0]; setTab(['supportPhone', 'whatsapp'].includes(first) ? 'contact' : first === 'storeName' ? 'store' : 'delivery'); return; }
    setSettings(n);
    if (!storage.get('lang', null)) i18n.changeLanguage(n.defaultLanguage);
    toast('Settings saved — the website is updated');
  };

  const exportData = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i += 1) { const k = localStorage.key(i); if (k.startsWith('sm:v3:')) data[k] = localStorage.getItem(k); }
    const blob = new Blob([JSON.stringify({ app: 'saanvi-masale', version: 'v3', exportedAt: new Date().toISOString(), data }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `saanvi-masale-backup-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Backup downloaded');
  };
  const importData = async (e) => {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    try {
      const json = JSON.parse(await file.text());
      if (json.app !== 'saanvi-masale' || typeof json.data !== 'object') throw new Error('This is not a Saanvi Masale backup file');
      Object.entries(json.data).forEach(([k, v]) => { if (k.startsWith('sm:v3:') && typeof v === 'string') localStorage.setItem(k, v); });
      toast('Backup restored — reloading…'); setTimeout(() => window.location.reload(), 600);
    } catch (err) { toast(err.message || 'Could not read that file', 'error'); }
  };

  return (
    <div ref={ref} className="space-y-6 pb-24">
      <PageHeader title="Settings" subtitle="Store details, contact numbers, delivery rules, website theme and backups." />
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav data-anim className="adm-card flex gap-1 overflow-x-auto p-2 lg:flex-col lg:self-start [scrollbar-width:none]" aria-label="Settings sections">
          {TABS.map(([k, l, Icon]) => (
            <button key={k} type="button" onClick={() => setTab(k)} aria-current={tab === k}
              className={`relative flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold transition-colors ${tab === k ? 'text-white' : 'text-charcoal-600 hover:bg-black/[.03]'}`}>
              {tab === k && <motion.span layoutId="settings-pill" transition={spring} className="absolute inset-0 rounded-xl bg-charcoal" />}
              <Icon size={16} className="relative" /><span className="relative">{l}</span>
            </button>
          ))}
        </nav>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22 }} className="min-w-0 space-y-6">
            {tab === 'store' && (
              <Panel title="Store information" subtitle="Shown in emails, invoices and the footer.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="sm:col-span-2"><span className="label">Store name</span><input {...field('storeName')} /><Err k="storeName" /></label>
                  <label><span className="label">Support email</span><input type="email" {...field('supportEmail')} /></label>
                  <label><span className="label">GSTIN</span><input {...field('gstin')} /></label>
                  <label className="sm:col-span-2"><span className="label">Business address</span><textarea {...field('address')} className="adm-input min-h-[80px] py-3" /></label>
                  <label><span className="label">Default storefront language</span><select {...field('defaultLanguage')}>{languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}</select></label>
                </div>
              </Panel>
            )}

            {tab === 'contact' && (
              <Panel title="Contact numbers" subtitle="Used by the floating WhatsApp & call buttons, the Contact page and the footer.">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label><span className="label">Calling number</span><input {...field('supportPhone')} placeholder="+91 98765 43210" inputMode="tel" /><Err k="supportPhone" /></label>
                  <label><span className="label">WhatsApp number</span><input {...field('whatsapp')} placeholder="+91 98765 43210" inputMode="tel" /><Err k="whatsapp" /></label>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a href={`tel:+${String(s.supportPhone || '').replace(/\D/g, '')}`} className="adm-btn-ghost"><Phone size={15} />Test call link</a>
                  <a href={`https://wa.me/${String(s.whatsapp || '').replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="adm-btn bg-[#25D366] text-white"><MessageCircle size={15} />Test WhatsApp link</a>
                </div>
                {String(settings.whatsapp).includes('98765 43210') && <p className="mt-4 flex items-start gap-2 rounded-2xl bg-turmeric-50 p-3 text-sm text-charcoal-600"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-turmeric-700" />These are still the placeholder numbers. Enter your real numbers and press Save.</p>}
              </Panel>
            )}

            {tab === 'delivery' && (
              <Panel title="Delivery & charges" subtitle="Applied at cart and checkout.">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {[['deliveryCharge', 'Standard delivery charge (₹)'], ['freeShippingThreshold', 'Free shipping above (₹)'], ['expressDeliveryCharge', 'Express delivery charge (₹)'], ['standardDeliveryDays', 'Standard delivery days'], ['expressDeliveryDays', 'Express delivery days'], ['codCharge', 'COD handling charge (₹)'], ['lowStockThreshold', 'Low-stock alert at (units)']].map(([k, l]) => (
                    <label key={k}><span className="label">{l}</span><input type="number" min="0" {...field(k)} /><Err k={k} /></label>
                  ))}
                </div>
              </Panel>
            )}

            {tab === 'appearance' && (
              <Panel title="Website theme" subtitle="The colour theme customers see by default.">
                <div className="grid gap-4 sm:grid-cols-3">
                  {themes.map((th) => {
                    const on = s.defaultTheme === th.id;
                    return (
                      <motion.button key={th.id} type="button" whileHover={{ y: -4 }} whileTap={{ scale: 0.98 }} onClick={() => setS({ ...s, defaultTheme: th.id })} aria-pressed={on}
                        className={`relative overflow-hidden rounded-[22px] border-2 p-3 text-left transition-colors ${on ? 'border-chilli' : 'border-black/[.06] hover:border-black/15'}`}>
                        {/* mini storefront preview */}
                        <div className="overflow-hidden rounded-2xl border border-black/[.06]" style={{ background: th.swatches[2] }}>
                          <div className="h-3" style={{ background: th.swatches[0] }} />
                          <div className="space-y-2 p-3">
                            <div className="h-2 w-2/3 rounded-full bg-black/15" /><div className="h-2 w-1/2 rounded-full bg-black/10" />
                            <div className="grid grid-cols-3 gap-1.5 pt-1">{[0, 1, 2].map((i) => <div key={i} className="aspect-[4/5] rounded-lg bg-white shadow-sm" />)}</div>
                            <div className="h-5 w-20 rounded-md" style={{ background: th.swatches[0] }} />
                          </div>
                        </div>
                        <p className="mt-3 font-bold">{THEME_NAMES[th.id][0]}</p>
                        <p className="text-xs text-charcoal-500">{THEME_NAMES[th.id][1]}</p>
                        {on && <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-chilli text-white shadow"><Check size={15} /></span>}
                      </motion.button>
                    );
                  })}
                </div>
                <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-black/[.06] p-4">
                  <span><span className="block font-semibold">Let visitors switch theme</span><span className="text-sm text-charcoal-500">Shows the palette button in the website header and mobile menu.</span></span>
                  <Toggle checked={s.allowThemePicker !== false} onChange={(v) => setS({ ...s, allowThemePicker: v })} label="Theme picker" />
                </div>
              </Panel>
            )}

            {tab === 'data' && (
              <>
                <Panel title="Backup & restore" subtitle="Download everything you changed in the admin (products, prices, orders, reviews, settings…) as one file.">
                  <div className="flex flex-wrap gap-2">
                    <button type="button" className="adm-btn-primary" onClick={exportData}><Download size={16} />Download backup</button>
                    <button type="button" className="adm-btn-ghost" onClick={() => fileRef.current?.click()}><Upload size={16} />Restore from file</button>
                    <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" onChange={importData} />
                  </div>
                  <p className="mt-4 text-sm text-charcoal-500">Demo mode keeps admin data in <em>this browser</em> only. Take a backup before clearing browser data or switching computers. With the Phase 2 backend this moves to a real database.</p>
                </Panel>
                <Panel title="Reset demo data" subtitle="Restore the original products, prices, banners, coupons, reviews and settings.">
                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" className={armed ? 'adm-btn-accent' : 'adm-btn-ghost'} onClick={() => { if (!armed) { setArmed(true); return; } resetStore(); toast('Store data reset', 'info'); setTimeout(() => window.location.reload(), 400); }}><RotateCcw size={16} />{armed ? 'Click again to confirm reset' : 'Reset store data'}</button>
                    {armed && <button type="button" className="adm-btn-ghost" onClick={() => setArmed(false)}>Cancel</button>}
                    <Badge tone="amber">Cannot be undone — download a backup first</Badge>
                  </div>
                </Panel>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Sticky save bar (appears when there are unsaved changes) */}
      <AnimatePresence>
        {dirty && tab !== 'data' && (
          <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }} transition={spring}
            className="fixed inset-x-3 bottom-4 z-40 mx-auto flex max-w-xl items-center gap-3 rounded-2xl bg-[#121010] p-2.5 pl-5 text-white shadow-2xl">
            <span className="mr-auto text-sm font-semibold">Unsaved changes</span>
            <button type="button" className="adm-btn h-9 bg-white/10 px-3 hover:bg-white/20" onClick={() => { setS(settings); setErrors({}); }}>Discard</button>
            <button type="button" className="adm-btn h-9 bg-chilli px-4 hover:bg-chilli-700" onClick={save}><Save size={15} />Save</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
