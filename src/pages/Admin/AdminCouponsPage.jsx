import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { Panel, Toggle, I18nInput } from '@/components/admin/ui';
import { useStore } from '@/context/StoreContext';
import { useUI } from '@/context/UIContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatINR, formatDate } from '@/utils/format';

const blank = () => ({ code: '', type: 'percent', value: 10, minOrder: 0, maxDiscount: 0, validFrom: new Date().toISOString().slice(0, 10), validTo: '', active: true, description: { en: '', hi: '', mr: '' }, _new: true });

export default function AdminCouponsPage() {
  const { coupons, setCoupons } = useStore();
  const { toast } = useUI();
  const [edit, setEdit] = useState(null); const [errors, setErrors] = useState({});
  useDocumentTitle('Admin · Coupons');
  const today = new Date().toISOString().slice(0, 10);

  const save = (e) => {
    e.preventDefault();
    const c = { ...edit, code: edit.code.trim().toUpperCase(), value: Number(edit.value), minOrder: Number(edit.minOrder) || 0, maxDiscount: Number(edit.maxDiscount) || 0 };
    const errs = {};
    if (!/^[A-Z0-9]{3,15}$/.test(c.code)) errs.code = '3–15 letters/numbers';
    else if (edit._new && coupons.some((x) => x.code === c.code)) errs.code = 'Code already exists';
    if (!(c.value > 0) || (c.type === 'percent' && c.value > 90)) errs.value = c.type === 'percent' ? 'Between 1 and 90' : 'Must be above 0';
    if (!c.validTo) errs.validTo = 'Required'; else if (c.validFrom && c.validTo < c.validFrom) errs.validTo = 'Must be after start date';
    setErrors(errs); if (Object.keys(errs).length) return;
    const { _new, ...clean } = c;
    if (!clean.description.en) clean.description = { en: `${c.type === 'percent' ? `${c.value}%` : `₹${c.value}`} off`, hi: `${c.type === 'percent' ? `${c.value}%` : `₹${c.value}`} की छूट`, mr: `${c.type === 'percent' ? `${c.value}%` : `₹${c.value}`} सूट` };
    setCoupons(_new ? [...coupons, clean] : coupons.map((x) => (x.code === clean.code ? clean : x)));
    setEdit(null); toast(`Coupon ${clean.code} saved`);
  };
  const f = (k, type = 'text') => ({ type, className: `input ${errors[k] ? 'input-error' : ''}`, value: edit[k], onChange: (e) => setEdit({ ...edit, [k]: e.target.value }) });

  return (
    <Panel title={`Coupons & offers (${coupons.length})`} action={<button type="button" className="btn-primary btn-sm" onClick={() => { setErrors({}); setEdit(blank()); }}><Plus size={14} />Create coupon</button>}>
      <div className="table-wrap"><table className="table">
        <thead><tr><th>Code</th><th>Discount</th><th>Min order</th><th>Validity</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
        <tbody>{coupons.map((c) => {
          const expired = c.validTo && today > c.validTo;
          return (
            <tr key={c.code}>
              <td><span className="font-mono font-bold text-chilli">{c.code}</span><span className="block text-xs text-charcoal-400">{c.description?.en}</span></td>
              <td>{c.type === 'percent' ? `${c.value}%` : formatINR(c.value)}{c.type === 'percent' && c.maxDiscount ? <span className="block text-xs text-charcoal-400">max {formatINR(c.maxDiscount)}</span> : null}</td>
              <td>{formatINR(c.minOrder)}</td>
              <td className="text-xs">{formatDate(c.validFrom)} – {formatDate(c.validTo)}{expired && <span className="badge ml-1 bg-chilli-50 text-chilli">Expired</span>}</td>
              <td><Toggle checked={c.active} onChange={(v) => { setCoupons(coupons.map((x) => (x.code === c.code ? { ...x, active: v } : x))); toast(`${c.code} ${v ? 'activated' : 'deactivated'}`, 'info'); }} label={c.active ? 'Active' : 'Inactive'} /></td>
              <td className="text-right"><button type="button" className="icon-btn h-9 w-9" onClick={() => { setErrors({}); setEdit({ ...c }); }} aria-label={`Edit ${c.code}`}><Pencil size={15} /></button><button type="button" className="icon-btn h-9 w-9 hover:text-chilli" onClick={() => { setCoupons(coupons.filter((x) => x.code !== c.code)); toast('Coupon deleted', 'info'); }} aria-label={`Delete ${c.code}`}><Trash2 size={15} /></button></td>
            </tr>
          );
        })}</tbody>
      </table></div>
      <Modal open={!!edit} onClose={() => setEdit(null)} title={edit?._new ? 'Create coupon' : `Edit ${edit?.code}`}>
        {edit && (
          <form onSubmit={save} className="grid gap-4 p-5 sm:grid-cols-2" noValidate>
            <label><span className="label">Code</span><input {...f('code')} disabled={!edit._new} onChange={(e) => setEdit({ ...edit, code: e.target.value.toUpperCase() })} />{errors.code && <p className="field-error">{errors.code}</p>}</label>
            <label><span className="label">Discount type</span><select className="input" value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value })}><option value="percent">Percentage (%)</option><option value="flat">Flat amount (₹)</option></select></label>
            <label><span className="label">Value</span><input {...f('value', 'number')} min="0" />{errors.value && <p className="field-error">{errors.value}</p>}</label>
            <label><span className="label">Max discount ₹ (0 = no cap)</span><input {...f('maxDiscount', 'number')} min="0" /></label>
            <label><span className="label">Minimum order ₹</span><input {...f('minOrder', 'number')} min="0" /></label>
            <div className="flex items-end pb-2"><Toggle checked={edit.active} onChange={(v) => setEdit({ ...edit, active: v })} label="Active" /></div>
            <label><span className="label">Valid from</span><input {...f('validFrom', 'date')} /></label>
            <label><span className="label">Valid to</span><input {...f('validTo', 'date')} />{errors.validTo && <p className="field-error">{errors.validTo}</p>}</label>
            <div className="sm:col-span-2"><I18nInput label="Description shown to customers" value={edit.description} onChange={(description) => setEdit({ ...edit, description })} /></div>
            <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" className="btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button type="submit" className="btn-primary">Save coupon</button></div>
          </form>
        )}
      </Modal>
    </Panel>
  );
}
