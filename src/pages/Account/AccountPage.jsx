import { useState } from 'react';
import { Link, Navigate, NavLink, useNavigate, useParams } from 'react-router-dom';
import { User, Package, History, MapPin, Heart, Settings, LogOut, Pencil, Trash2, Plus, ChevronRight } from 'lucide-react';
import FormField from '@/components/common/FormField';
import EmptyState from '@/components/common/EmptyState';
import Modal from '@/components/common/Modal';
import DemoNotice from '@/components/common/DemoBadge';
import LanguageSelector from '@/components/layout/LanguageSelector';
import { StatusBadge } from '@/components/order/OrderTimeline';
import { WishlistItems } from '@/pages/Wishlist/WishlistPage';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from '@/hooks/useLocalized';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { validate, validators } from '@/utils/validation';
import { formatDate, formatINR } from '@/utils/format';
import { indianStates } from '@/config/site';
import { resetDemoAndGoHome } from '@/utils/reset';

const TABS = [['profile', User], ['orders', Package], ['history', History], ['addresses', MapPin], ['wishlist', Heart], ['settings', Settings]];

export default function AccountPage() {
  const { tab = 'profile' } = useParams();
  const { user, logout } = useAuth();
  const { t, lang } = useLocalized();
  const { toast } = useUI();
  const navigate = useNavigate();
  useDocumentTitle(t('account.title'));
  if (!user) return <Navigate to={`/login?redirect=/account${tab !== 'profile' ? `/${tab}` : ''}`} replace />;
  const active = TABS.some(([k]) => k === tab) ? tab : 'profile';

  return (
    <div className="container-x py-8">
      <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl border border-line bg-white p-6">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-chilli font-display text-2xl text-white">{user.name[0]}</span>
        <div className="flex-1"><h1 className="text-2xl">{t('header.hello', { name: user.name })}</h1><p className="text-sm text-charcoal-500">{user.email} · {t('account.memberSince', { date: formatDate(user.joinedAt, lang, { month: 'long', year: 'numeric' }) })}</p></div>
        <button type="button" className="btn-outline" onClick={() => { logout(); toast(t('auth.loggedOut'), 'info'); navigate('/'); }}><LogOut size={16} />{t('header.logout')}</button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:gap-1 lg:px-0" aria-label={t('account.title')}>
          {TABS.map(([k, Icon]) => (
            <NavLink key={k} to={`/account/${k}`} className={() => `flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${active === k ? 'bg-chilli text-white' : 'text-charcoal hover:bg-white'}`}><Icon size={17} />{t(`account.${k}`)}</NavLink>
          ))}
        </nav>
        <div className="min-w-0 animate-fadeUp" key={active}>
          {active === 'profile' && <ProfileTab />}
          {(active === 'orders' || active === 'history') && <OrdersTab mode={active} />}
          {active === 'addresses' && <AddressesTab />}
          {active === 'wishlist' && <WishlistItems />}
          {active === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab() {
  const { user, updateProfile } = useAuth();
  const { orders } = useOrders();
  const { toast } = useUI();
  const { t } = useLocalized();
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone || '' });
  const [errors, setErrors] = useState({});
  const mine = orders.filter((o) => o.customer.email === user.email && o.status !== 'cancelled');
  const submit = (e) => {
    e.preventDefault();
    const errs = validate(form, { name: validators.name, email: validators.email, phone: validators.phone });
    setErrors(errs); if (Object.keys(errs).length) return;
    updateProfile(form); toast(t('account.profileSaved'));
  };
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label={t('account.totalOrders')} value={mine.length} />
        <Stat label={t('account.totalSpent')} value={formatINR(mine.reduce((s, o) => s + o.totals.total, 0))} />
        <Stat label={t('account.addresses')} value={(user.addresses || []).length} />
      </div>
      <form onSubmit={submit} className="rounded-xl border border-line bg-white p-6" noValidate>
        <h2 className="mb-5 font-display text-xl">{t('account.profile')}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField className="sm:col-span-2" label={t('checkout.fullName')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
          <FormField label={t('checkout.email')} type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} error={errors.email} />
          <FormField label={t('checkout.mobile')} type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })} error={errors.phone} />
        </div>
        <button type="submit" className="btn-primary mt-5">{t('actions.save')}</button>
      </form>
      <DemoNotice text={t('account.demoAccount')} />
    </div>
  );
}

const Stat = ({ label, value }) => <div className="rounded-xl border border-line bg-white p-5"><p className="text-xs uppercase tracking-wide text-charcoal-400">{label}</p><p className="mt-1 text-2xl">{value}</p></div>;

function OrdersTab({ mode }) {
  const { user } = useAuth();
  const { orders } = useOrders();
  const { t, lang } = useLocalized();
  const mine = orders.filter((o) => o.customer.email === user.email);
  const activeOrders = mine.filter((o) => !['delivered', 'cancelled'].includes(o.status));
  const past = mine.filter((o) => ['delivered', 'cancelled'].includes(o.status));
  const list = mode === 'orders' ? activeOrders : past;
  if (!mine.length) return <EmptyState icon={Package} title={t('account.noOrders')}><Link to="/shop" className="btn-primary">{t('actions.shopNow')}</Link></EmptyState>;
  return (
    <div>
      <h2 className="mb-4 font-display text-xl">{mode === 'orders' ? t('account.activeOrders') : t('account.pastOrders')}</h2>
      {!list.length ? <p className="rounded-2xl bg-white p-6 text-sm text-charcoal-500 shadow-card">{t('account.noOrders')}</p> : (
        <ul className="space-y-3">
          {list.map((o) => (
            <li key={o.id}>
              <Link to={`/track-order/${o.id}`} className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-white p-5 transition hover:shadow-lift">
                <div className="min-w-[140px] flex-1"><p className="font-mono font-bold">{o.id}</p><p className="text-xs text-charcoal-500">{formatDate(o.placedAt, lang)} · {t('cart.items', { count: o.items.reduce((s, i) => s + i.qty, 0) })}</p></div>
                <StatusBadge status={o.status} />
                <span className="font-bold">{formatINR(o.totals.total)}</span>
                <ChevronRight size={18} className="text-charcoal-400" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const blank = { label: 'Home', name: '', phone: '', house: '', street: '', area: '', city: '', state: '', pin: '', landmark: '', isDefault: false };
function AddressesTab() {
  const { user, saveAddress, deleteAddress } = useAuth();
  const { toast } = useUI();
  const { t } = useLocalized();
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const list = user.addresses || [];
  const save = (e) => {
    e.preventDefault();
    const errs = validate(editing, { name: validators.name, phone: validators.phone, house: validators.required, street: validators.required, area: validators.required, city: validators.required, state: validators.required, pin: validators.pin });
    setErrors(errs); if (Object.keys(errs).length) return;
    saveAddress(editing); setEditing(null); toast(t('account.addressSaved'));
  };
  const f = (k, extra = {}) => ({ value: editing[k], onChange: (e) => setEditing({ ...editing, [k]: e.target.value }), error: errors[k], ...extra });
  return (
    <div>
      <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-xl">{t('account.addresses')}</h2><button type="button" className="btn-primary btn-sm" onClick={() => { setErrors({}); setEditing({ ...blank, name: user.name, phone: user.phone || '' }); }}><Plus size={14} />{t('account.addAddress')}</button></div>
      {!list.length ? <p className="rounded-2xl bg-white p-6 text-sm text-charcoal-500 shadow-card">{t('account.noAddresses')}</p> : (
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((a) => (
            <div key={a.id} className={`rounded-xl border border-line bg-white p-5 ${a.isDefault ? 'ring-2 ring-leaf' : ''}`}>
              <p className="flex items-center gap-2 font-semibold"><MapPin size={16} className="text-chilli" />{a.label}{a.isDefault && <span className="badge bg-leaf-50 text-leaf">{t('account.default')}</span>}</p>
              <p className="mt-2 text-sm leading-relaxed text-charcoal-600">{a.name} · {a.phone}<br />{a.house}, {a.street}, {a.area}<br />{a.city}, {a.state} – {a.pin}{a.landmark ? <><br />{a.landmark}</> : null}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" className="btn-outline btn-sm" onClick={() => { setErrors({}); setEditing(a); }}><Pencil size={13} />{t('actions.edit')}</button>
                {!a.isDefault && <button type="button" className="btn-ghost btn-sm" onClick={() => saveAddress({ ...a, isDefault: true })}>{t('account.makeDefault')}</button>}
                <button type="button" className="btn-ghost btn-sm text-chilli" onClick={() => { deleteAddress(a.id); toast(t('account.addressDeleted'), 'info'); }}><Trash2 size={13} />{t('actions.delete')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? t('actions.edit') : t('account.addAddress')}>
        {editing && (
          <form onSubmit={save} className="grid gap-4 p-5 sm:grid-cols-2" noValidate>
            <FormField label={t('account.label')} {...f('label')} />
            <FormField label={t('checkout.fullName')} {...f('name')} />
            <FormField label={t('checkout.mobile')} {...f('phone')} />
            <FormField label={t('checkout.house')} {...f('house')} />
            <FormField label={t('checkout.street')} {...f('street')} />
            <FormField label={t('checkout.area')} {...f('area')} />
            <FormField label={t('checkout.city')} {...f('city')} />
            <FormField as="select" label={t('checkout.state')} {...f('state')}><option value="">{t('checkout.selectState')}</option>{indianStates.map((s) => <option key={s}>{s}</option>)}</FormField>
            <FormField label={t('checkout.pin')} inputMode="numeric" {...f('pin')} onChange={(e) => setEditing({ ...editing, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })} />
            <FormField label={t('checkout.landmark')} {...f('landmark')} />
            <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" className="h-4 w-4 accent-chilli" checked={!!editing.isDefault} onChange={(e) => setEditing({ ...editing, isDefault: e.target.checked })} />{t('account.makeDefault')}</label>
            <div className="flex gap-2 sm:col-span-2"><button type="submit" className="btn-primary">{t('actions.save')}</button><button type="button" className="btn-ghost" onClick={() => setEditing(null)}>{t('actions.cancel')}</button></div>
          </form>
        )}
      </Modal>
    </div>
  );
}

function SettingsTab() {
  const { t } = useLocalized();
  const { toast } = useUI();
  const [prefs, setPrefs] = usePersistentState('accountPrefs', { email: true, sms: true });
  const [armed, setArmed] = useState(false);
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-line bg-white p-6">
        <h2 className="mb-4 font-display text-xl">{t('account.settings')}</h2>
        <p className="label">{t('account.preferredLanguage')}</p>
        <LanguageSelector variant="inline" />
        <div className="mt-6 space-y-3">
          {[['email', 'account.notifications'], ['sms', 'account.smsUpdates']].map(([k, key]) => (
            <label key={k} className="flex items-center justify-between gap-4 rounded-xl border border-line p-4 text-sm">
              <span>{t(key)}</span>
              <input type="checkbox" role="switch" className="h-5 w-5 accent-leaf" checked={prefs[k]} onChange={(e) => { setPrefs({ ...prefs, [k]: e.target.checked }); toast(t('account.settingsSaved')); }} />
            </label>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-chilli/20 bg-white p-6 shadow-card">
        <p className="text-sm text-charcoal-600">{t('account.resetConfirm')}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={armed ? 'btn-primary' : 'btn-outline border-chilli/40 text-chilli'} onClick={() => (armed ? resetDemoAndGoHome() : setArmed(true))}>{armed ? `${t('common.yes')} — ${t('account.resetDemo')}` : t('account.resetDemo')}</button>
          {armed && <button type="button" className="btn-ghost" onClick={() => setArmed(false)}>{t('actions.cancel')}</button>}
        </div>
      </div>
    </div>
  );
}
