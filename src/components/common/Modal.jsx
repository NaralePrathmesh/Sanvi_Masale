import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Modal({ open, onClose, title, children, size = 'md', hideHeader = false }) {
  const { t } = useTranslation();
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    setTimeout(() => ref.current?.focus(), 0);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);
  if (!open) return null;
  const width = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' }[size];
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-charcoal/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={`relative max-h-[92vh] w-full ${width} overflow-y-auto rounded-t-3xl bg-white shadow-lift outline-none animate-fadeUp sm:rounded-2xl`}>
        {!hideHeader && (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-5 py-4">
            <h2 className="font-display text-lg">{title}</h2>
            <button type="button" className="icon-btn" onClick={onClose} aria-label={t('actions.close')}><X size={20} /></button>
          </div>
        )}
        {hideHeader && <button type="button" className="icon-btn absolute right-3 top-3 z-10 bg-white/90" onClick={onClose} aria-label={t('actions.close')}><X size={20} /></button>}
        {children}
      </div>
    </div>,
    document.body,
  );
}
