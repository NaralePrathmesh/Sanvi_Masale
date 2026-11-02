import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, MapPin, CreditCard, CalendarDays, Copy, PackageSearch } from 'lucide-react';
import OrderItems from '@/components/order/OrderItems';
import OrderSummary from '@/components/cart/OrderSummary';
import EmptyState from '@/components/common/EmptyState';
import DemoNotice from '@/components/common/DemoBadge';
import { useOrders } from '@/context/OrderContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate, formatDateTime } from '@/utils/format';

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const { getOrder } = useOrders();
  const { toast } = useUI();
  const { t, lang } = useLocalized();
  const order = getOrder(orderId);
  useDocumentTitle(t('order.confirmed'));
  if (!order) return <div className="container-x py-16"><EmptyState icon={PackageSearch} title={t('order.notFound')}><Link to="/track-order" className="btn-primary">{t('nav.trackOrder')}</Link></EmptyState></div>;
  const a = order.address;
  const copy = async () => { try { await navigator.clipboard.writeText(order.id); toast(t('actions.copied')); } catch { /* ignore */ } };
  return (
    <div className="container-x max-w-4xl py-10">
      <div className="text-center animate-fadeUp">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-leaf-50 text-leaf"><CheckCircle2 size={44} /></span>
        <h1 className="mt-5 text-3xl font-bold sm:text-4xl">{t('order.confirmed')}</h1>
        <p className="mt-2 text-charcoal-500">{t('order.thanks', { name: order.customer.name.split(' ')[0] })}</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-card">
          <span className="text-sm text-charcoal-500">{t('order.orderId')}:</span><span className="font-mono font-bold text-chilli">{order.id}</span>
          <button type="button" onClick={copy} className="text-charcoal-400 hover:text-chilli" aria-label={t('actions.copy')}><Copy size={15} /></button>
        </div>
        <p className="mt-3 text-xs text-charcoal-400">{t('order.emailNote', { email: order.customer.email })}</p>
      </div>
      <DemoNotice text={t('order.demoNote')} className="mx-auto mt-6 max-w-xl" />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <InfoCard icon={MapPin} title={t('order.deliveryTo')}>{a.name}<br />{a.house}, {a.street}, {a.area}, {a.city}, {a.state} – {a.pin}<br />{a.phone}</InfoCard>
        <InfoCard icon={CreditCard} title={t('order.paidVia')}>{t(`payment.${order.payment}`)}{order.paymentInfo ? <><br /><span className="text-charcoal-500">{order.paymentInfo}</span></> : null}</InfoCard>
        <InfoCard icon={CalendarDays} title={t('order.eta')}><strong>{formatDate(order.delivery.eta, lang, { weekday: 'long', day: 'numeric', month: 'long' })}</strong><br /><span className="text-charcoal-500">{t(`checkout.${order.delivery.method}`)} · {t('order.orderDate')}: {formatDateTime(order.placedAt, lang)}</span></InfoCard>
      </div>

      <div className="mt-6 grid gap-6 rounded-xl border border-line bg-white p-5 sm:p-6 md:grid-cols-[1.4fr_1fr]">
        <div><h2 className="mb-2 font-display text-lg">{t('order.summary')}</h2><OrderItems items={order.items} /></div>
        <div className="md:border-l md:border-line md:pl-6"><OrderSummary totals={order.totals} /></div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to={`/track-order/${order.id}`} className="btn-primary px-8">{t('actions.viewOrder')}</Link>
        <Link to="/shop" className="btn-outline px-8">{t('actions.continueShopping')}</Link>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl bg-white p-5 text-sm leading-relaxed shadow-card">
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-charcoal-400"><Icon size={15} className="text-chilli" />{title}</p>
      {children}
    </div>
  );
}
