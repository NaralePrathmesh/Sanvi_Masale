import { useEffect, useState } from 'react';
import { ArrowUp, Phone } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useLocalized } from '@/hooks/useLocalized';
import { useCompare } from '@/context/CompareContext';
import { useContact } from '@/hooks/useContact';


const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M16.04 3C8.86 3 3.03 8.82 3.03 16c0 2.3.6 4.53 1.74 6.5L3 29l6.68-1.75A12.95 12.95 0 0 0 16.04 29C23.2 29 29 23.18 29 16S23.2 3 16.04 3Zm0 23.62c-2 0-3.95-.54-5.65-1.55l-.4-.24-3.96 1.04 1.06-3.86-.26-.4A10.6 10.6 0 0 1 5.4 16c0-5.86 4.77-10.63 10.64-10.63 5.86 0 10.62 4.77 10.62 10.63 0 5.87-4.76 10.62-10.62 10.62Zm5.83-7.96c-.32-.16-1.89-.93-2.18-1.04-.3-.1-.5-.16-.72.16-.21.32-.82 1.04-1.01 1.25-.18.21-.37.24-.69.08-.32-.16-1.35-.5-2.57-1.59a9.64 9.64 0 0 1-1.78-2.2c-.18-.33-.02-.5.14-.66.15-.14.32-.37.48-.56.16-.18.21-.32.32-.53.1-.21.05-.4-.03-.56-.08-.16-.72-1.73-.98-2.37-.26-.62-.52-.54-.72-.55h-.61c-.21 0-.56.08-.85.4-.3.32-1.12 1.09-1.12 2.66 0 1.57 1.14 3.08 1.3 3.3.16.2 2.25 3.43 5.44 4.81.76.33 1.35.52 1.81.67.76.24 1.46.2 2 .12.62-.09 1.89-.77 2.15-1.52.27-.74.27-1.38.19-1.51-.08-.14-.29-.22-.6-.38Z" />
  </svg>
);

/** Reading-progress line + back-to-top button with a progress ring. */
export default function ScrollFX() {
  const { t } = useLocalized();
  const { pathname } = useLocation();
  const { ids: compareIds } = useCompare();
  const contact = useContact();
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setP(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    update(); window.addEventListener('scroll', on, { passive: true }); window.addEventListener('resize', on);
    return () => { window.removeEventListener('scroll', on); window.removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, [pathname]);
  const R = 20; const C = 2 * Math.PI * R;
  // Sit above the mobile sticky bars (product + cart) and the compare tray.
  const compareOpen = compareIds.length > 0 && !/^\/(compare|checkout)/.test(pathname);
  const mobileBar = pathname.startsWith('/product/') || pathname === '/cart';
  const lift = compareOpen ? 'bottom-28' : mobileBar ? 'bottom-24 lg:bottom-6' : 'bottom-5 sm:bottom-6';
  if (pathname.startsWith('/checkout')) return <ProgressLine p={p} />;
  const wa = `https://wa.me/${contact.waDigits}?text=${encodeURIComponent(t('common.whatsappMsg'))}`;
  const fab = 'relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lift transition duration-300 hover:-translate-y-1 hover:scale-105 focus-visible:outline-none focus-visible:ring-4';
  return (
    <>
      <ProgressLine p={p} />
      {/* Floating contact buttons (WhatsApp + call) — above back-to-top, bottom-right */}
      <div className={`fixed right-4 z-40 flex flex-col items-center gap-3 transition-[bottom] duration-300 sm:right-6 ${lift}`}>
        <a href={wa} target="_blank" rel="noopener noreferrer" aria-label={t('common.whatsapp')} title={t('common.whatsapp')}
          className={`${fab} group bg-[#25D366] ring-[#25D366]/30`}>
          <span aria-hidden="true" className="absolute inset-0 animate-ping rounded-full bg-[#25D366]/40 [animation-duration:2.4s] motion-reduce:hidden" />
          <WhatsAppIcon className="relative h-6 w-6" />
        </a>
        <a href={`tel:${contact.tel}`} aria-label={`${t('common.callUs')} ${contact.phone}`} title={`${t('common.callUs')} · ${contact.phone}`}
          className={`${fab} bg-gradient-to-br from-chilli to-chilli-deep ring-chilli/30`}>
          <Phone size={20} className="fill-current" />
        </a>
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label={t('common.backToTop')} title={t('common.backToTop')}
        tabIndex={p > 0.08 ? 0 : -1}
        className={`group relative flex h-12 w-12 items-center justify-center rounded-full bg-white/90 shadow-lift backdrop-blur transition duration-300 hover:-translate-y-1 ${p > 0.08 ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'}`}>
        <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90" aria-hidden="true">
          <circle cx="24" cy="24" r={R} fill="none" style={{ stroke: 'rgb(var(--line))' }} strokeWidth="3" />
          <circle cx="24" cy="24" r={R} fill="none" stroke="url(#sfxg)" strokeWidth="3" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - p)} />
          <defs><linearGradient id="sfxg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style={{ stopColor: 'rgb(var(--turmeric))' }} /><stop offset="1" style={{ stopColor: 'rgb(var(--chilli))' }} /></linearGradient></defs>
        </svg>
        <ArrowUp size={18} className="relative text-chilli transition-transform group-hover:-translate-y-0.5" />
      </button>
      </div>
    </>
  );
}

function ProgressLine({ p }) {
  return (
    <div aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div className="h-full origin-left bg-gradient-to-r from-turmeric via-chilli-deep to-chilli" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}
