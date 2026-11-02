import { Link } from 'react-router-dom';
import { Instagram, Facebook, Youtube, Twitter } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { brand } from '@/config/brand';
import { useContact } from '@/hooks/useContact';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';

function Col({ title, links }) {
  return (
    <div>
      <h3 className="mb-4 font-sans text-[12px] font-semibold uppercase tracking-[.14em] text-charcoal-400">{title}</h3>
      <ul className="space-y-2.5 text-sm">
        {links.map(([to, label]) => <li key={to + label}><Link to={to} className="text-charcoal-600 transition-colors hover:text-chilli">{label}</Link></li>)}
      </ul>
    </div>
  );
}

export default function Footer() {
  const contact = useContact();
  const { t, l } = useLocalized();
  const { categories } = useStore();
  return (
    <footer className="mt-16 border-t border-line bg-cream-200 text-charcoal">
      <div className="container-x grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.3fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-charcoal-500">{t('footer.about')}</p>
          <div className="mt-6 flex gap-2">
            {[[Instagram, brand.social.instagram, 'Instagram'], [Facebook, brand.social.facebook, 'Facebook'], [Youtube, brand.social.youtube, 'YouTube'], [Twitter, brand.social.twitter, 'X']].map(([Icon, href, label]) => (
              <a key={label} href={href} target="_blank" rel="noreferrer noopener" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white text-charcoal-600 transition-colors hover:border-chilli hover:text-chilli"><Icon size={16} /></a>
            ))}
          </div>
        </div>
        <Col title={t('footer.shop')} links={[['/shop', t('nav.shop')], ...categories.slice(0, 4).map((c) => [`/category/${c.id}`, l(c.name)]), ['/gift-boxes', t('nav.giftBoxes')]]} />
        <Col title={t('footer.help')} links={[['/track-order', t('nav.trackOrder')], ['/faq', t('footer.faq')], ['/contact', t('footer.contactUs')], ['/store-locator', t('nav.stores')], ['/bulk-orders', t('nav.bulk')]]} />
        <Col title={t('footer.policies')} links={[['/shipping', t('footer.shipping')], ['/returns', t('footer.returns')], ['/privacy', t('footer.privacy')], ['/terms', t('footer.terms')]]} />
        <div>
          <h3 className="mb-4 font-sans text-[12px] font-semibold uppercase tracking-[.14em] text-charcoal-400">{t('footer.contactUs')}</h3>
          <ul className="space-y-2.5 text-sm text-charcoal-600">
            <li className="select-all">{contact.phone}</li>
            <li className="select-all break-all">{contact.email}</li>
            <li className="text-charcoal-500">{brand.contact.hours}</li>
            <li className="text-charcoal-500">{contact.address}</li>
          </ul>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link to="/about" className="text-charcoal-600 hover:text-chilli">{t('nav.about')}</Link></li>
            <li><Link to="/journal" className="text-charcoal-600 hover:text-chilli">{t('nav.journal')}</Link></li>
            <li><Link to="/reviews" className="text-charcoal-600 hover:text-chilli">{t('reviewsWall.pageTitle')}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col gap-3 py-6 text-xs text-charcoal-400 md:flex-row md:items-center md:justify-between">
          <p>{t('footer.rights', { year: new Date().getFullYear(), name: brand.legalName })} · {t('footer.demo')}</p>
          <div className="flex flex-wrap items-center gap-3">
            <span>{t('footer.weAccept')}:</span>
            {['UPI', 'Visa', 'Mastercard', 'RuPay', 'COD'].map((m) => <span key={m} className="rounded border border-line px-1.5 py-0.5 text-[10px] font-semibold text-charcoal-600">{m}</span>)}
            <Link to="/admin" className="ml-2 hover:text-chilli">{t('footer.admin')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
