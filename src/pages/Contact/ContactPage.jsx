import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Clock, MapPin, Briefcase, Send, Loader2, CheckCircle2, MessageCircle, HelpCircle } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import FormField from '@/components/common/FormField';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { usePersistentState } from '@/hooks/usePersistentState';
import { validate, validators } from '@/utils/validation';
import { brand } from '@/config/brand';
import { useContact } from '@/hooks/useContact';
import { API_MODE, api } from '@/services/api/client';

const empty = { name: '', email: '', mobile: '', subject: '', message: '' };

/** Contact: details on the left, compact form on the right. FAQs live on /faq. */
export default function ContactPage() {
  const contact = useContact();
  const { t } = useLocalized();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [state, setState] = useState('idle');
  const [, setMessages] = usePersistentState('contactMessages', []);
  useDocumentTitle(t('contact.title'), 'Customer support, business enquiries and contact details.');

  const submit = (e) => {
    e.preventDefault();
    const errs = validate(form, { name: validators.name, email: validators.email, mobile: validators.phone, subject: validators.required, message: validators.minLen(10) });
    setErrors(errs); if (Object.keys(errs).length) return;
    setState('sending');
    if (API_MODE) {
      api('/enquiries', { method: 'POST', auth: false, body: { type: 'contact', name: form.name, email: form.email, phone: form.mobile, subject: form.subject, message: form.message } })
        .then(() => { setState('sent'); setForm(empty); }).catch((ex) => { setState('idle'); setErrors({ message: ex.message }); });
      return;
    }
    setTimeout(() => { setMessages((m) => [{ ...form, at: new Date().toISOString() }, ...m]); setState('sent'); setForm(empty); }, 900);
  };
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); if (state === 'sent') setState('idle'); };
  const Row = ({ icon: Icon, children }) => <li className="flex gap-3"><Icon size={18} strokeWidth={1.75} className="mt-0.5 shrink-0 text-chilli" /><span>{children}</span></li>;

  return (
    <div className="container-x py-8 sm:py-10">
      <Breadcrumbs items={[{ label: t('contact.title') }]} />
      <div className="mb-10 max-w-2xl"><h1 className="h-page">{t('contact.title')}</h1><p className="mt-2 text-charcoal-500">{t('contact.subtitle')}</p></div>
      <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <aside className="space-y-8">
          <div>
            <h2 className="text-lg">{t('contact.supportTitle')}</h2>
            <ul className="mt-4 space-y-3.5 text-sm text-charcoal-600">
              <Row icon={Phone}><span className="select-all">{contact.phone}</span></Row>
              <Row icon={MessageCircle}>WhatsApp <span className="select-all">{contact.whatsapp}</span></Row>
              <Row icon={Mail}><span className="select-all break-all">{contact.email}</span></Row>
              <Row icon={Clock}>{t('contact.hours')}: {brand.contact.hours}</Row>
              <Row icon={MapPin}>{contact.address}</Row>
            </ul>
          </div>
          <div className="border-t border-line pt-8">
            <h2 className="flex items-center gap-2 text-lg"><Briefcase size={18} strokeWidth={1.75} className="text-chilli" />{t('contact.businessTitle')}</h2>
            <p className="mt-2 text-sm text-charcoal-500">{t('contact.businessText')}</p>
            <p className="mt-2 select-all text-sm font-medium text-chilli">{brand.contact.businessEmail}</p>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-8 text-sm">
            <Link to="/faq" className="btn-link"><HelpCircle size={15} />{t('nav.faq')}</Link>
            <Link to="/store-locator" className="btn-link"><MapPin size={15} />{t('nav.stores')}</Link>
            <Link to="/track-order" className="btn-link">{t('nav.trackOrder')}</Link>
          </div>
        </aside>
        <form onSubmit={submit} className="rounded-xl border border-line bg-white p-6 sm:p-8" noValidate>
          <h2 className="mb-6 text-xl">{t('contact.formTitle')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label={t('contact.name')} value={form.name} onChange={set('name')} error={errors.name} autoComplete="name" />
            <FormField label={t('contact.email')} type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" />
            <FormField label={t('contact.mobile')} type="tel" inputMode="numeric" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} error={errors.mobile} />
            <FormField as="select" label={t('contact.subject')} value={form.subject} onChange={set('subject')} error={errors.subject}>
              <option value="">—</option>{['order', 'product', 'feedback', 'business', 'other'].map((s) => <option key={s} value={s}>{t(`contact.subjects.${s}`)}</option>)}
            </FormField>
            <FormField as="textarea" className="sm:col-span-2" label={t('contact.message')} value={form.message} onChange={set('message')} error={errors.message} />
          </div>
          <button type="submit" className="btn-primary mt-6 w-full sm:w-auto sm:px-8" disabled={state === 'sending'}>{state === 'sending' ? <><Loader2 size={16} className="animate-spin" />{t('contact.sending')}</> : <><Send size={16} />{t('contact.send')}</>}</button>
          {state === 'sent' && <p className="mt-4 flex items-start gap-2 rounded-lg bg-leaf-50 p-4 text-sm text-leaf" role="status"><CheckCircle2 size={18} className="shrink-0" />{t('contact.success')}</p>}
        </form>
      </div>
    </div>
  );
}
