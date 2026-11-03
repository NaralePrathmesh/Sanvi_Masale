import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck, Zap, MapPin, Pencil, Loader2, ShieldCheck, CheckCircle2, XCircle } from 'lucide-react';
import Stepper from '@/components/checkout/Stepper';
import PaymentOptions, { validatePayment, PAYMENT_METHODS } from '@/components/checkout/PaymentOptions';
import OtpLogin from '@/components/auth/OtpLogin';
import FormField from '@/components/common/FormField';
import EmptyState from '@/components/common/EmptyState';
import DemoNotice from '@/components/common/DemoBadge';
import Modal from '@/components/common/Modal';
import OrderSummary from '@/components/cart/OrderSummary';
import CouponBox from '@/components/cart/CouponBox';
import ProductImage from '@/components/product/ProductImage';
import { useCart } from '@/context/CartContext';
import { useStore } from '@/context/StoreContext';
import { useAuth } from '@/context/AuthContext';
import { useOrders } from '@/context/OrderContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from '@/hooks/useLocalized';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { validate, validators } from '@/utils/validation';
import { checkPincode } from '@/utils/pincode';
import { computeTotals } from '@/utils/pricing';
import { formatDate, formatINR, addDays } from '@/utils/format';
import { indianStates } from '@/config/site';

const STEP_KEYS = ['customer', 'address', 'payment', 'review'];
const LAST = STEP_KEYS.length - 1;
const emptyAddress = { house: '', street: '', area: '', city: '', state: '', pin: '', landmark: '' };

export default function CheckoutPage() {
  const { t, l, lang } = useLocalized();
  const navigate = useNavigate();
  const { lines, couponCode, clear } = useCart();
  const { coupons, settings, refreshCatalog } = useStore();
  const { user, saveAddress, mode: authMode, ready } = useAuth();
  const apiMode = authMode === 'api';
  const { placeOrder } = useOrders();
  const { toast } = useUI();
  useDocumentTitle(t('checkout.title'));

  const [draft, setDraft] = usePersistentState('checkoutDraft', {
    customer: { name: '', phone: '', email: '' }, address: emptyAddress, addressId: '', saveAddress: true, delivery: 'standard',
  });
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  // Payment details are deliberately NOT persisted (demo hygiene)
  const [payment, setPayment] = useState({ method: '' });
  const [payModal, setPayModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState('');
  // One idempotency key per checkout attempt: retries/double clicks can never create two orders.
  const [checkoutKey] = useState(() => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`));

  // Prefill from demo account
  useEffect(() => {
    if (!user) return;
    setDraft((d) => {
      const def = user.addresses?.find((a) => a.isDefault) || user.addresses?.[0];
      return {
        ...d,
        customer: { name: d.customer.name || user.name, phone: d.customer.phone || user.phone || '', email: d.customer.email || user.email },
        addressId: d.addressId || (def ? def.id : ''),
        address: d.addressId || !def ? d.address : { ...emptyAddress, ...def },
      };
    });
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const address = draft.address;
  const pinInfo = useMemo(() => checkPincode(address.pin, settings), [address.pin, settings]);
  const deliveryMethod = draft.delivery === 'express' && pinInfo.express ? 'express' : 'standard';
  const totals = useMemo(() => computeTotals({ lines, couponCode, coupons, settings, deliveryMethod, paymentMethod: payment.method }), [lines, couponCode, coupons, settings, deliveryMethod, payment.method]);
  const eta = addDays(new Date(), deliveryMethod === 'express' ? settings.expressDeliveryDays : settings.standardDeliveryDays).toISOString();

  if (!lines.length && !processing) {
    return <div className="container-x py-16"><EmptyState icon={ShoppingBag} title={t('cart.empty')} text={t('cart.emptyHint')}><Link to="/shop" className="btn-primary">{t('actions.shopNow')}</Link></EmptyState></div>;
  }

  const setCustomer = (patch) => setDraft((d) => ({ ...d, customer: { ...d.customer, ...patch } }));
  const setAddress = (patch) => setDraft((d) => ({ ...d, address: { ...d.address, ...patch }, addressId: '' }));

  const validateStep = (i) => {
    let errs = {};
    if (i === 0) errs = validate(draft.customer, { name: validators.name, phone: validators.phone, email: validators.email });
    if (i === 1) {
      errs = validate(address, { house: validators.required, street: validators.required, area: validators.required, city: validators.required, state: validators.required, pin: validators.pin });
      if (!errs.pin && !pinInfo.serviceable) errs.pin = 'checkout.pinNotServiceable';
    }
    if (i === 2) errs = validatePayment(payment);
    setErrors(errs);
    if (Object.keys(errs).length) { toast(t('validation.fixErrors'), 'error'); return false; }
    return true;
  };
  const next = () => {
    if (!validateStep(step)) return;
    if (!apiMode && step === 1 && user && draft.saveAddress && !draft.addressId) {
      const id = `a-${Date.now()}`;
      saveAddress({ ...address, id, name: draft.customer.name, phone: draft.customer.phone, label: 'Home', isDefault: !(user.addresses || []).length });
      setDraft((d) => ({ ...d, addressId: id }));
    }
    if (step === 2 && payment.method === 'cod' && !pinInfo.cod) { setErrors({ method: 'checkout.codUnavailable' }); return; }
    setStep((s) => Math.min(LAST, s + 1)); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const finalize = async () => {
    let order;
    try {
      order = await placeOrder({
      customerId: user?.id || `guest-${draft.customer.email}`,
      customer: { ...draft.customer },
      address: { ...address, name: draft.customer.name, phone: draft.customer.phone },
      items: lines.map((li) => ({ productId: li.productId, size: li.size, qty: li.qty, price: li.price, mrp: li.mrp, comboPct: li.comboPct || 0, comboId: li.comboId, name: li.product.name })),
      saveAddress: draft.saveAddress && !draft.addressId,
      payment: payment.method,
      paymentInfo: payment.method === 'upi' ? payment.upi : payment.method === 'card' ? `•••• ${payment.cardNumber.replace(/\s/g, '').slice(-4)}` : payment.method === 'netbanking' ? payment.bank : '',
      delivery: { method: deliveryMethod, charge: totals.delivery, eta },
      totals: { subtotal: totals.subtotal, mrpTotal: totals.mrpTotal, savings: totals.savings, comboDiscount: totals.comboDiscount, couponCode: totals.couponCode, couponDiscount: totals.couponDiscount, delivery: totals.delivery, codCharge: totals.codCharge, total: totals.total },
      lang,
    }, checkoutKey);
    } catch (e) {
      setProcessing(false); setPayModal(false);
      setPayError(e.message || t('common.error'));
      if (['CART_CHANGED', 'OUT_OF_STOCK', 'COUPON_INVALID'].includes(e.code)) refreshCatalog();
      return;
    }
    clear();
    setDraft((d) => ({ ...d, addressId: d.addressId }));
    navigate(`/order-confirmation/${order.id}`, { replace: true });
  };

  const onPlace = () => {
    if (!validateStep(2)) { setStep(2); return; }
    setPayError('');
    if (payment.method === 'cod') { setProcessing(true); setTimeout(finalize, 900); return; }
    setPayModal(true);
  };
  const simulate = (success) => {
    setProcessing(true);
    setTimeout(() => {
      if (success) { finalize(); return; }
      setProcessing(false); setPayModal(false); setPayError(t('checkout.paymentFailed'));
    }, 1200);
  };

  const card = 'rounded-xl border border-line bg-white p-5 sm:p-7';
  const Title = ({ children }) => <h2 className="mb-5 text-xl">{children}</h2>;

  if (apiMode && !ready) return <div className="container-x py-16"><p className="text-center text-charcoal-500">{t('common.loading')}</p></div>;
  if (apiMode && !user) {
    return (
      <div className="container-x py-10">
        <div className="mx-auto max-w-md rounded-2xl border border-line bg-white p-6 shadow-soft sm:p-8">
          <h1 className="text-2xl">{t('checkout.signInTitle')}</h1>
          <p className="mt-1 text-sm text-charcoal-500">{t('checkout.signInText')}</p>
          <div className="mt-6"><OtpLogin onDone={() => toast(t('auth.welcome', { name: '' }))} /></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="h-page">{t('checkout.title')}</h1>
        {!user && <p className="text-sm text-charcoal-500">{t('checkout.loginPrompt')} <Link to="/login?redirect=/checkout" className="link">{t('checkout.loginLink')}</Link></p>}
      </div>
      {!apiMode && <DemoNotice text={t('checkout.demoBanner')} className="mb-6" />}
      <div className="mb-8"><Stepper steps={STEP_KEYS.map((k) => t(`checkout.steps.${k}`))} current={step} onStep={(i) => { setErrors({}); setStep(i); }} /></div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 animate-fadeUp" key={step}>
          {step === 0 && (
            <section className={card}>
              <Title>{t('checkout.customerInfo')}</Title>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField className="sm:col-span-2" label={t('checkout.fullName')} value={draft.customer.name} onChange={(e) => setCustomer({ name: e.target.value })} error={errors.name} autoComplete="name" />
                <FormField label={t('checkout.mobile')} type="tel" inputMode="numeric" value={draft.customer.phone} onChange={(e) => setCustomer({ phone: e.target.value.replace(/[^\d+ ]/g, '').slice(0, 14) })} error={errors.phone} autoComplete="tel" placeholder="98765 43210" />
                <FormField label={t('checkout.email')} type="email" value={draft.customer.email} onChange={(e) => setCustomer({ email: e.target.value })} error={errors.email} autoComplete="email" />
              </div>
            </section>
          )}

          {step === 1 && (
            <section className={card}>
              <Title>{t('checkout.deliveryAddress')}</Title>
              {user?.addresses?.length > 0 && (
                <div className="mb-6">
                  <p className="label">{t('checkout.savedAddresses')}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {user.addresses.map((a) => (
                      <label key={a.id} className={`cursor-pointer rounded-2xl border-2 p-4 text-sm ${draft.addressId === a.id ? 'border-chilli bg-chilli-50/40' : 'border-line'}`}>
                        <input type="radio" name="savedAddr" className="sr-only" checked={draft.addressId === a.id} onChange={() => setDraft((d) => ({ ...d, addressId: a.id, address: { ...emptyAddress, ...a } }))} />
                        <span className="flex items-center gap-2 font-semibold"><MapPin size={15} className="text-chilli" />{a.label}{a.isDefault && <span className="badge bg-leaf-50 text-leaf">{t('account.default')}</span>}</span>
                        <span className="mt-1 block text-charcoal-500">{a.house}, {a.street}, {a.area}, {a.city}, {a.state} – {a.pin}</span>
                      </label>
                    ))}
                    <button type="button" onClick={() => setDraft((d) => ({ ...d, addressId: '', address: emptyAddress }))} className={`rounded-2xl border-2 border-dashed p-4 text-sm font-semibold ${!draft.addressId ? 'border-chilli text-chilli' : 'border-charcoal/15 text-charcoal-500'}`}>+ {t('checkout.useNewAddress')}</button>
                  </div>
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label={t('checkout.house')} value={address.house} onChange={(e) => setAddress({ house: e.target.value })} error={errors.house} autoComplete="address-line1" />
                <FormField label={t('checkout.street')} value={address.street} onChange={(e) => setAddress({ street: e.target.value })} error={errors.street} autoComplete="address-line2" />
                <FormField label={t('checkout.area')} value={address.area} onChange={(e) => setAddress({ area: e.target.value })} error={errors.area} />
                <FormField label={t('checkout.city')} value={address.city} onChange={(e) => setAddress({ city: e.target.value })} error={errors.city} autoComplete="address-level2" />
                <FormField as="select" label={t('checkout.state')} value={address.state} onChange={(e) => setAddress({ state: e.target.value })} error={errors.state}>
                  <option value="">{t('checkout.selectState')}</option>{indianStates.map((s) => <option key={s}>{s}</option>)}
                </FormField>
                <div>
                  <FormField label={t('checkout.pin')} inputMode="numeric" value={address.pin} onChange={(e) => setAddress({ pin: e.target.value.replace(/\D/g, '').slice(0, 6) })} error={errors.pin} autoComplete="postal-code" />
                  {address.pin.length === 6 && !errors.pin && (
                    <p className={`mt-1 flex items-center gap-1 text-xs font-medium ${pinInfo.serviceable ? 'text-leaf' : 'text-chilli'}`}>
                      {pinInfo.serviceable ? <><CheckCircle2 size={13} />{t('pin.serviceable', { date: formatDate(pinInfo.eta, lang, { day: 'numeric', month: 'short' }) })}</> : <><XCircle size={13} />{t('pin.notServiceable')}</>}
                    </p>
                  )}
                </div>
                <FormField className="sm:col-span-2" label={t('checkout.landmark')} value={address.landmark} onChange={(e) => setAddress({ landmark: e.target.value })} />
              </div>
              {user && !draft.addressId && (
                <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" className="h-4 w-4 accent-chilli" checked={draft.saveAddress} onChange={(e) => setDraft((d) => ({ ...d, saveAddress: e.target.checked }))} />{t('checkout.saveAddress')}</label>
              )}
              <p className="mt-4 text-xs text-charcoal-400">{t('pin.demo')}</p>
            </section>
          )}

          {step === 1 && (
            <section className={`${card} mt-5`}>
              <Title>{t('checkout.deliveryMethod')}</Title>
              <div className="space-y-3">
                {[{ id: 'standard', icon: Truck, days: settings.standardDeliveryDays, charge: totals.subtotal - totals.comboDiscount - totals.couponDiscount >= settings.freeShippingThreshold ? 0 : settings.deliveryCharge },
                  { id: 'express', icon: Zap, days: settings.expressDeliveryDays, charge: settings.expressDeliveryCharge, disabled: !pinInfo.express }].map((o) => (
                  <label key={o.id} className={`flex items-center gap-4 rounded-2xl border-2 p-4 ${o.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} ${deliveryMethod === o.id ? 'border-chilli bg-chilli-50/40' : 'border-line'}`}>
                    <input type="radio" name="delivery" className="h-4 w-4 accent-chilli" disabled={o.disabled} checked={deliveryMethod === o.id} onChange={() => setDraft((d) => ({ ...d, delivery: o.id }))} />
                    <span className={`flex h-10 w-10 items-center justify-center rounded-full ${deliveryMethod === o.id ? 'bg-chilli text-white' : 'bg-cream'}`}><o.icon size={18} /></span>
                    <span className="flex-1">
                      <span className="block font-semibold">{t(`checkout.${o.id}`)}</span>
                      <span className="block text-xs text-charcoal-500">{o.disabled ? t('checkout.expressUnavailable') : t(`checkout.${o.id}Desc`, { days: o.days })}</span>
                      {!o.disabled && <span className="mt-1 block text-xs font-medium text-leaf">{t('checkout.estimated', { date: formatDate(addDays(new Date(), o.days).toISOString(), lang, { weekday: 'short', day: 'numeric', month: 'short' }) })}</span>}
                    </span>
                    <span className={`font-semibold ${o.charge === 0 ? 'text-leaf' : ''}`}>{o.charge === 0 ? t('cart.free') : formatINR(o.charge)}</span>
                  </label>
                ))}
              </div>
            </section>
          )}

          {step === 2 && (
            <section className={card}>
              <Title>{t('checkout.paymentMethod')}</Title>
              <PaymentOptions value={payment} onChange={(p) => { setPayment(p); setErrors({}); }} errors={errors} codAvailable={pinInfo.cod !== false} onlineAvailable={!apiMode} />
            </section>
          )}

          {step === LAST && (
            <section className={`${card} space-y-6`}>
              <Title>{t('checkout.review')}</Title>
              {payError && <p className="rounded-xl bg-chilli-50 px-4 py-3 text-sm font-medium text-chilli" role="alert">{payError}</p>}
              <ReviewBlock title={t('checkout.customerInfo')} onEdit={() => setStep(0)}>{draft.customer.name} · {draft.customer.phone} · {draft.customer.email}</ReviewBlock>
              <ReviewBlock title={t('checkout.deliveryAddress')} onEdit={() => setStep(1)}>{address.house}, {address.street}, {address.area}, {address.city}, {address.state} – {address.pin}{address.landmark ? ` (${address.landmark})` : ''}</ReviewBlock>
              <ReviewBlock title={t('checkout.deliveryMethod')} onEdit={() => setStep(1)}>{t(`checkout.${deliveryMethod}`)} · {t('checkout.estimated', { date: formatDate(eta, lang, { weekday: 'short', day: 'numeric', month: 'short' }) })}</ReviewBlock>
              <ReviewBlock title={t('checkout.paymentLabel')} onEdit={() => setStep(2)}>{t(`payment.${payment.method}`)}{payment.method === 'upi' ? ` · ${payment.upi}` : payment.method === 'card' ? ` · •••• ${(payment.cardNumber || '').replace(/\s/g, '').slice(-4)}` : payment.method === 'netbanking' ? ` · ${payment.bank}` : ''}</ReviewBlock>
              <div>
                <p className="mb-2 text-sm font-semibold">{t('checkout.items')} ({lines.length})</p>
                <ul className="divide-y divide-line rounded-xl border border-line">
                  {lines.map((li) => (
                    <li key={li.key} className="flex items-center gap-3 p-3 text-sm">
                      <div className="w-12 shrink-0 overflow-hidden rounded-lg"><ProductImage product={li.product} size={li.size} compact /></div>
                      <div className="min-w-0 flex-1"><p className="truncate font-semibold">{l(li.product.name)}</p><p className="text-xs text-charcoal-500">{li.size} × {li.qty}{li.comboPct ? ` · ${t('cart.comboTag', { pct: li.comboPct })}` : ''}</p></div>
                      <span className="font-semibold">{formatINR(li.price * li.qty)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <div className="mt-6 flex flex-wrap justify-between gap-3">
            {step > 0 ? <button type="button" className="btn-outline" onClick={() => { setErrors({}); setStep((s) => s - 1); }}>{t('actions.back')}</button> : <Link to="/cart" className="btn-outline">{t('actions.back')}</Link>}
            {step < LAST ? <button type="button" className="btn-primary px-8" onClick={next}>{t('actions.next')}</button> : (
              <button type="button" className="btn-primary px-8" onClick={onPlace} disabled={processing}>
                {processing ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                {payment.method === 'cod' ? t('checkout.placeOrder') : t('checkout.payAndPlace', { amount: formatINR(totals.total) })}
              </button>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-line bg-white p-5">
            <p className="mb-4 text-lg font-display">{t('cart.summary')}</p>
            <ul className="mb-4 max-h-56 space-y-2 overflow-y-auto pr-1">
              {lines.map((li) => <li key={li.key} className="flex justify-between gap-3 text-sm"><span className="min-w-0 truncate text-charcoal-600">{l(li.product.name)} <span className="text-charcoal-400">({li.size} × {li.qty})</span></span><span>{formatINR(li.price * li.qty)}</span></li>)}
            </ul>
            <div className="border-t border-line pt-4"><OrderSummary totals={totals} showMrp={false} /></div>
          </div>
          {step < LAST && <div className="rounded-xl border border-line bg-white p-5"><CouponBox /></div>}
        </aside>
      </div>

      <Modal open={payModal} onClose={() => !processing && setPayModal(false)} title={t('checkout.mockPaymentTitle')} size="sm">
        <div className="p-6 text-center">
          {(() => { const M = PAYMENT_METHODS.find((m) => m.id === payment.method); return M ? <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-chilli-50 text-chilli"><M.icon size={26} /></span> : null; })()}
          <p className="mt-4 text-3xl font-bold">{formatINR(totals.total)}</p>
          <p className="mt-1 text-sm text-charcoal-500">{t(`payment.${payment.method || 'upi'}`)}</p>
          <DemoNotice demoOnly text={t('checkout.mockPaymentBody')} className="mt-5 text-left" />
          {processing ? (
            <p className="mt-6 flex items-center justify-center gap-2 text-sm font-medium" role="status"><Loader2 className="animate-spin text-chilli" size={18} />{t('checkout.processing')}</p>
          ) : (
            <div className="mt-6 grid gap-2">
              <button type="button" className="btn-green" onClick={() => simulate(true)}><CheckCircle2 size={16} />{t('checkout.mockPaySuccess')}</button>
              <button type="button" className="btn-outline" onClick={() => simulate(false)}><XCircle size={16} />{t('checkout.mockPayFail')}</button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function ReviewBlock({ title, children, onEdit }) {
  const { t } = useLocalized();
  return (
    <div className="flex items-start justify-between gap-4 border-b border-charcoal/5 pb-4">
      <div><p className="text-xs font-semibold uppercase tracking-wide text-charcoal-400">{title}</p><p className="mt-1 text-sm">{children}</p></div>
      <button type="button" onClick={onEdit} className="flex shrink-0 items-center gap-1 text-sm font-semibold text-chilli hover:underline"><Pencil size={13} />{t('checkout.editStep')}</button>
    </div>
  );
}
