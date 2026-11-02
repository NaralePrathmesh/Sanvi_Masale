import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Check, Ticket, Copy, Percent, IndianRupee, CalendarClock } from 'lucide-react';
import { Toggle, I18nInput, PageHeader, Segmented, Badge, Empty } from '@/components/admin/ui';
import { Drawer, useStagger, spring } from '@/components/admin/motion';
import { useStore } from '@/context/StoreContext';
import { useUI } from '@/context/UIContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatINR, formatDate } from '@/utils/format';

const blank = () => ({ code: '', type: 'percent', value: 10, minOrder: 0, maxDiscount: 0, validFrom: new Date().toISOString().slice(0, 10), validTo: '', active: true, description: { en: '', hi: '', mr: '' }, _new: true });

export default function AdminCouponsPage() {
  const { coupons, setCoupons } = useStore();
  const { toast } = useUI();
  const [params, setParams] = useSearchParams();
  const [edit, setEdit] = useState(null); const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState('all');
  useDocumentTitle('Admin · Coupons');
  const ref = useStagger();
  const today = new Date().toISOString().slice(0, 10);
  useEffect(() => { if (params.get('new')) { setEdit(blank()); setParams({}, { replace: true }); } }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const state = (c) => (!c.active ? 'off' : c.validTo && today > c.validTo ? 'expired' : c.validFrom && today < c.validFrom ? 'scheduled' : 'live');
  const list = coupons.filter((c) => filter === 'all' || state(c) === filter);

  const save = () => {
    const c = { ...edit, code: edit.code.trim().toUpperCase(), value: Number(edit.value), minOrder: Number(edit.minOrder) || 0, maxDiscount: Number(edit.maxDiscount) || 0 };
    const errs = {};
    if (!/^[A-Z0-9]{3,15}$/.test(c.code)) errs.code = '3–15 letters/numbers';
    else if (edit._new && coupons.some((x) => x.code === c.code)) errs.code = 'Code already exists';
    if (!(c.value > 0) || (c.type === 'percent' && c.value > 90)) errs.value = c.type === 'percent' ? 'Between 1 and 90' : 'Must be above 0';
    if (!c.validTo) errs.validTo = 'Required'; else if (c.validFrom && c.validTo < c.validFrom) errs.validTo = 'Must be after start date';
    setErrors(errs); if (Object.keys(errs).length) return;
    const { _new, ...clean } = c;
    const label = c.type === 'percent' ? `${c.value}%` : `₹${c.value}`;
    if (!clean.description.en) clean.description = { en: `${label} off`, hi: `${label} की छूट`, mr: `${label} सूट` };
    setCoupons(_new ? [...coupons, clean] : coupons.map((x) => (x.code === clean.code ? clean : x)));
    setEdit(null); toast(`Coupon ${clean.code} saved`);
  };
  const f = (k, type = 'text') => ({ type, className: `adm-input ${errors[k] ? 'border-chilli' : ''}`, value: edit[k], onChange: (e) => setEdit({ ...edit, [k]: e.target.value }) });
  const copy = (code) => { navigator.clipboard?.writeText(code); toast(`Copied ${code}`); };
  const tone = { live: 'green', scheduled: 'blue', expired: 'red', off: 'neutral' };

  return (
    <div ref={ref} className="space-y-6">
      <PageHeader title="Coupons & offers" subtitle="Codes customers can apply at cart and checkout."
        actions={<button type="button" className="adm-btn-accent" onClick={() => { setErrors({}); setEdit(blank()); }}><Plus size={16} />Create coupon</button>} />
      <div data-anim><Segmented id="cf" value={filter} onChange={setFilter} options={[['all', 'All', coupons.length], ['live', 'Live'], ['scheduled', 'Scheduled'], ['expired', 'Expired'], ['off', 'Off']]} /></div>

      {!list.length ? <div className="adm-card"><Empty icon={Ticket} title="No coupons here" action={<button type="button" className="adm-btn-accent" onClick={() => setEdit(blank())}><Plus size={16} />Create coupon</button>} /></div> : (
        <motion.div layout className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((c) => {
              const s = state(c);
              return (
                <motion.article layout key={c.code} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} transition={spring} whileHover={{ y: -4 }}
                  className={`relative flex overflow-hidden rounded-[22px] bg-white shadow-[0_1px_2px_rgba(0,0,0,.05),0_16px_36px_-22px_rgba(0,0,0,.35)] ${s === 'off' || s === 'expired' ? 'opacity-70' : ''}`}>
                  {/* stub */}
                  <div className="relative flex w-28 shrink-0 flex-col items-center justify-center bg-gradient-to-br from-chilli to-chilli-deep p-4 text-white">
                    <span className="text-3xl font-extrabold leading-none">{c.type === 'percent' ? `${c.value}%` : `₹${c.value}`}</span>
                    <span className="mt-1 text-[10px] font-bold uppercase tracking-[.2em] text-white/75">off</span>
                    <span aria-hidden="true" className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#F6F5F2]" />
                    <span aria-hidden="true" className="absolute inset-y-3 right-0 border-r-2 border-dashed border-white/40" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col p-4 pl-6">
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => copy(c.code)} className="group inline-flex items-center gap-1.5 font-mono text-lg font-bold tracking-wide hover:text-chilli" title="Copy code">{c.code}<Copy size={13} className="opacity-0 transition group-hover:opacity-100" /></button>
                      <Badge tone={tone[s]} className="ml-auto capitalize">{s}</Badge>
                    </div>
                    <p className="mt-0.5 truncate text-sm text-charcoal-500">{c.description?.en}</p>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal-500">
                      <span>Min order <strong className="text-charcoal">{formatINR(c.minOrder)}</strong></span>
                      {c.type === 'percent' && c.maxDiscount ? <span>Max <strong className="text-charcoal">{formatINR(c.maxDiscount)}</strong></span> : null}
                      <span className="inline-flex items-center gap-1"><CalendarClock size={12} />{formatDate(c.validFrom)} – {formatDate(c.validTo)}</span>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <Toggle size="sm" checked={c.active} onChange={(v) => { setCoupons(coupons.map((x) => (x.code === c.code ? { ...x, active: v } : x))); toast(`${c.code} ${v ? 'activated' : 'switched off'}`, 'info'); }} label={c.active ? 'On' : 'Off'} />
                      <div className="flex gap-0.5">
                        <button type="button" className="adm-icon" onClick={() => { setErrors({}); setEdit({ ...c }); }} aria-label={`Edit ${c.code}`}><Pencil size={15} /></button>
                        <button type="button" className="adm-icon hover:text-chilli" onClick={() => { setCoupons(coupons.filter((x) => x.code !== c.code)); toast('Coupon deleted', 'info'); }} aria-label={`Delete ${c.code}`}><Trash2 size={15} /></button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <Drawer open={!!edit} onClose={() => setEdit(null)} title={edit?._new ? 'Create coupon' : `Edit ${edit?.code}`} width="max-w-xl"
        footer={<><button type="button" className="adm-btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button type="button" className="adm-btn-accent" onClick={save}><Check size={16} />Save coupon</button></>}>
        {edit && (
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <label className="sm:col-span-2"><span className="label">Code</span><input {...f('code')} disabled={!edit._new} onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase() })} className={`adm-input font-mono text-lg font-bold tracking-wide ${errors.code ? 'border-chilli' : ''}`} placeholder="DIWALI20" />{errors.code && <p className="field-error">{errors.code}</p>}</label>
            <div className="sm:col-span-2"><span className="label">Discount type</span>
              <div className="grid grid-cols-2 gap-2">{[['percent', 'Percentage', Percent], ['flat', 'Flat amount', IndianRupee]].map(([v, l, Icon]) => (
                <button key={v} type="button" onClick={() => setEdit({ ...edit, type: v })} className={`flex items-center gap-2 rounded-2xl border p-3 text-sm font-semibold transition ${edit.type === v ? 'border-chilli bg-chilli/[.05] text-chilli' : 'border-black/10 hover:border-black/20'}`}><Icon size={16} />{l}</button>
              ))}</div>
            </div>
            <label><span className="label">Value {edit.type === 'percent' ? '(%)' : '(₹)'}</span><input {...f('value', 'number')} min="0" />{errors.value && <p className="field-error">{errors.value}</p>}</label>
            <label><span className="label">Max discount ₹ (0 = no cap)</span><input {...f('maxDiscount', 'number')} min="0" /></label>
            <label><span className="label">Minimum order ₹</span><input {...f('minOrder', 'number')} min="0" /></label>
            <div className="flex items-end pb-2"><Toggle checked={edit.active} onChange={(v) => setEdit({ ...edit, active: v })} label="Active" /></div>
            <label><span className="label">Valid from</span><input {...f('validFrom', 'date')} /></label>
            <label><span className="label">Valid to</span><input {...f('validTo', 'date')} />{errors.validTo && <p className="field-error">{errors.validTo}</p>}</label>
            <div className="sm:col-span-2"><I18nInput label="Description shown to customers" value={edit.description} onChange={(description) => setEdit({ ...edit, description })} /></div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
