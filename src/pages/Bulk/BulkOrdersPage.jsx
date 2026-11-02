import { useState } from 'react';
import { CheckCircle2, Loader2, Send, Factory, Package, Tags, UserRound } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import FormField from '@/components/common/FormField';
import Reveal from '@/components/common/Reveal';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePersistentState } from '@/hooks/usePersistentState';
import { validate, validators } from '@/utils/validation';
import { pageImages } from '@/assets/images';
import { brand } from '@/config/brand';

const empty = { company: '', name: '', email: '', phone: '', city: '', type: '', volume: '', message: '' };

export default function BulkOrdersPage() {
  const { t } = useLocalized();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle');
  const [, setLeads] = usePersistentState('bulkEnquiries', []);
  useDocumentTitle(t('bulk.title'), t('bulk.subtitle'));
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); if (state === 'sent') setState('idle'); };
  const submit = (e) => {
    e.preventDefault();
    const errs = validate(form, { company: validators.name, name: validators.name, email: validators.email, phone: validators.phone, city: validators.required, type: validators.required, volume: validators.required });
    setErrors(errs); if (Object.keys(errs).length) return;
    setState('sending');
    setTimeout(() => { setLeads((l) => [{ ...form, at: new Date().toISOString() }, ...l]); setForm(empty); setState('sent'); }, 900);
  };
  return (
    <>
      <PageHero image={pageImages.bulk} eyebrow={t('nav.bulk')} title={t('bulk.title')} subtitle={t('bulk.subtitle')} crumbs={[{ label: t('nav.bulk') }]} />
      <div className="container-x grid gap-8 py-12 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-4">
          {[[Factory, 'b1'], [Package, 'b2'], [Tags, 'b3'], [UserRound, 'b4']].map(([Icon, k], i) => (
            <Reveal key={k} delay={i * 80} className="flex items-center gap-4 rounded-xl border border-line bg-white p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-leaf-50 text-leaf"><Icon size={20} /></span>
              <span className="font-semibold">{t(`bulk.${k}`)}</span>
            </Reveal>
          ))}
          <p className="pt-2 text-sm text-charcoal-500">{t('contact.businessText')}<br /><span className="select-all font-semibold text-chilli">{brand.contact.businessEmail}</span></p>
        </div>
        <form onSubmit={submit} className="rounded-xl border border-line bg-white p-6 sm:p-8" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t('bulk.company')} value={form.company} onChange={set('company')} error={errors.company} autoComplete="organization" />
            <FormField label={t('bulk.contactName')} value={form.name} onChange={set('name')} error={errors.name} autoComplete="name" />
            <FormField label={t('contact.email')} type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
            <FormField label={t('contact.mobile')} type="tel" inputMode="numeric" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} error={errors.phone} />
            <FormField label={t('bulk.city')} value={form.city} onChange={set('city')} error={errors.city} />
            <FormField as="select" label={t('bulk.type')} value={form.type} onChange={set('type')} error={errors.type}>
              <option value="">—</option>{['retailer', 'distributor', 'horeca', 'export', 'corporate'].map((k) => <option key={k} value={k}>{t(`bulk.types.${k}`)}</option>)}
            </FormField>
            <FormField as="select" className="sm:col-span-2" label={t('bulk.volume')} value={form.volume} onChange={set('volume')} error={errors.volume}>
              <option value="">—</option>{['v1', 'v2', 'v3', 'v4'].map((k) => <option key={k} value={k}>{t(`bulk.volumes.${k}`)}</option>)}
            </FormField>
            <FormField as="textarea" className="sm:col-span-2" label={`${t('bulk.message')} (${t('common.optional')})`} value={form.message} onChange={set('message')} />
          </div>
          <button type="submit" className="btn-primary mt-5 px-8" disabled={state === 'sending'}>{state === 'sending' ? <><Loader2 size={16} className="animate-spin" />{t('contact.sending')}</> : <><Send size={16} />{t('bulk.submit')}</>}</button>
          {state === 'sent' && <p className="mt-4 flex items-start gap-2 rounded-xl bg-leaf-50 p-4 text-sm font-medium text-leaf" role="status"><CheckCircle2 size={18} className="shrink-0" />{t('bulk.success')}</p>}
        </form>
      </div>
    </>
  );
}
