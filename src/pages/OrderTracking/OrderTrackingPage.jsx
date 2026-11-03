import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Search, PackageSearch, FastForward, MapPin, CreditCard, CalendarDays, XCircle } from 'lucide-react';
import Breadcrumbs from '@/components/common/Breadcrumbs';
import DemoNotice from '@/components/common/DemoBadge';
import OrderTimeline, { StatusBadge } from '@/components/order/OrderTimeline';
import OrderItems from '@/components/order/OrderItems';
import OrderSummary from '@/components/cart/OrderSummary';
import { useOrders } from '@/context/OrderContext';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate, formatDateTime } from '@/utils/format';

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { getOrder, orders, advanceStatus, cancelOrder, apiMode, fetchOrder, trackOrder } = useOrders();
  const { user } = useAuth();
  const [remote, setRemote] = useState(null); // API mode: order fetched from the server
  const [phone, setPhone] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [busy, setBusy] = useState(false);
  const { toast } = useUI();
  const { t, lang } = useLocalized();
  const [q, setQ] = useState(orderId || '');
  useDocumentTitle(t('track.title'));
  const local = orderId ? getOrder(orderId) : null;
  const order = local || (remote && remote.id === String(orderId || '').toUpperCase() ? remote : null);
  const limited = !!order && !order.totals?.subtotal && order.totals?.subtotal !== 0; // guest tracking view
  const demoIds = (user ? orders.filter((o) => o.customerId === user.id || (user.email && o.customer?.email === user.email)) : apiMode ? [] : orders).slice(0, 4).map((o) => o.id);

  // Signed-in customers: load the order from their account if it isn't in the list yet.
  useEffect(() => {
    if (!apiMode || !orderId || local || !user) return;
    setBusy(true); setLookupError('');
    fetchOrder(orderId.toUpperCase()).then(setRemote).catch(() => setLookupError(t('track.notFound'))).finally(() => setBusy(false));
  }, [apiMode, orderId, user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const guestLookup = async (e) => {
    e.preventDefault(); setLookupError('');
    if (!/^[6-9]\d{9}$/.test(phone)) { setLookupError(t('validation.phone')); return; }
    setBusy(true);
    try { setRemote(await trackOrder(orderId.toUpperCase(), phone)); } catch { setLookupError(t('track.notFoundPhone')); } finally { setBusy(false); }
  };
  const last = order?.history?.[order.history.length - 1];

  return (
    <div className="container-x max-w-5xl py-8">
      <Breadcrumbs items={[{ label: t('track.title') }]} />
      <div className="rounded-2xl border border-line bg-white p-6 sm:p-10">
        <h1 className="h-page">{t('track.title')}</h1>
        <p className="mt-2 text-white/70">{t('track.subtitle')}</p>
        <form className="mt-6 flex max-w-xl flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); if (q.trim()) navigate(`/track-order/${q.trim().toUpperCase()}`); }}>
          <label className="relative flex-1"><span className="sr-only">{t('order.orderId')}</span>
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('track.placeholder')} className="input rounded-full border-0 pl-11 uppercase" />
          </label>
          <button type="submit" className="btn-secondary px-8">{t('track.track')}</button>
        </form>
        <p className="mt-4 flex flex-wrap items-center gap-2 text-xs text-white/60">{t('track.tryDemo')}
          {demoIds.map((id) => <button key={id} type="button" onClick={() => { setQ(id); navigate(`/track-order/${id}`); }} className="rounded-full bg-white/10 px-2.5 py-1 font-mono text-white hover:bg-white/20">{id}</button>)}
        </p>
      </div>

      {apiMode && orderId && !order && !user && (
        <form onSubmit={guestLookup} className="mt-8 rounded-2xl border border-line bg-white p-6">
          <p className="font-semibold">{t('track.verifyTitle')}</p>
          <p className="mt-1 text-sm text-charcoal-500">{t('track.verifyText')}</p>
          <div className="mt-4 flex max-w-md gap-2">
            <span className="flex items-center rounded-l-xl border border-r-0 border-line bg-cream px-3 text-sm font-semibold">+91</span>
            <input className="input flex-1 rounded-l-none" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="98765 43210" aria-label={t('checkout.mobile')} />
            <button type="submit" className="btn-primary" disabled={busy}>{t('track.track')}</button>
          </div>
          <p className="mt-3 text-xs text-charcoal-500">{t('track.orSignIn')} <Link to={`/login?redirect=/track-order/${orderId}`} className="link">{t('auth.login')}</Link></p>
        </form>
      )}
      {lookupError && <p className="mt-4 flex items-center gap-2 rounded-2xl bg-chilli-50 p-5 font-medium text-chilli" role="alert"><PackageSearch size={20} />{lookupError}</p>}
      {!apiMode && orderId && !order && <p className="mt-8 flex items-center gap-2 rounded-2xl bg-chilli-50 p-5 font-medium text-chilli" role="alert"><PackageSearch size={20} />{t('track.notFound')}</p>}

      {order && (
        <div className="mt-8 space-y-6 animate-fadeUp">
          <div className="rounded-xl border border-line bg-white p-5 sm:p-6">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-charcoal-400">{t('order.orderId')}</p>
                <p className="font-mono text-xl">{order.id}</p>
                <p className="mt-1 text-sm text-charcoal-500">{t('order.orderDate')}: {formatDateTime(order.placedAt, lang)}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={order.status} />
                {last && <p className="mt-2 text-xs text-charcoal-400">{t('track.lastUpdate')}: {formatDateTime(last.at, lang)}</p>}
              </div>
            </div>
            <h2 className="mb-5 font-display text-lg">{t('track.timeline')}</h2>
            <OrderTimeline order={order} />
            {order.status !== 'delivered' && order.status !== 'cancelled' && (
              <div className="mt-6 flex flex-wrap gap-2 border-t border-charcoal/5 pt-5">
                {advanceStatus && <button type="button" className="btn-outline btn-sm" onClick={() => { advanceStatus(order.id); toast(t('track.simulate')); }}><FastForward size={14} />{t('track.simulate')}</button>}
                {['placed', 'confirmed'].includes(order.status) && (!apiMode || (user && !limited)) && <button type="button" className="btn-ghost btn-sm text-chilli" onClick={async () => { try { const o = await cancelOrder(order.id); if (o) setRemote(o); toast(t('order.cancelled'), 'info'); } catch (e) { toast(e.message, 'error'); } }}><XCircle size={14} />{t('order.cancel')}</button>}
              </div>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Info icon={CalendarDays} title={t('order.eta')}>{order.status === 'cancelled' ? '—' : formatDate(order.delivery.eta, lang, { weekday: 'long', day: 'numeric', month: 'long' })}</Info>
            <Info icon={MapPin} title={t('order.deliveryTo')}>{[order.address.name, order.address.area, order.address.city].filter(Boolean).join(', ')} – {order.address.pin}</Info>
            <Info icon={CreditCard} title={t('order.paidVia')}>{t(`payment.${order.payment}`)}</Info>
          </div>
          <div className="grid gap-6 rounded-xl border border-line bg-white p-5 sm:p-6 md:grid-cols-[1.4fr_1fr]">
            <div><h2 className="mb-2 font-display text-lg">{t('order.items')}</h2><OrderItems items={order.items} /></div>
            <div className="md:border-l md:border-line md:pl-6">{limited ? <p className="flex justify-between text-base font-bold"><span>{t('cart.total')}</span><span>₹{order.totals.total}</span></p> : <OrderSummary totals={order.totals} />}</div>
          </div>
          <DemoNotice demoOnly text={t('order.demoNote')} />
          <div className="text-center"><Link to="/shop" className="btn-outline">{t('actions.continueShopping')}</Link></div>
        </div>
      )}
    </div>
  );
}

function Info({ icon: Icon, title, children }) {
  return <div className="rounded-2xl bg-white p-5 text-sm shadow-card"><p className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-charcoal-400"><Icon size={15} className="text-chilli" />{title}</p>{children}</div>;
}
