import { useEffect, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { gsap } from 'gsap';
import { X } from 'lucide-react';

/**
 * Admin motion toolkit.
 *  - GSAP: number count-ups, staggered entrances, sparkline drawing (timeline-style effects).
 *  - Framer Motion: page transitions, drawers, layout/list animations, shared-layout pills.
 * Everything respects the visitor's "reduce motion" setting.
 */
export const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
export const spring = { type: 'spring', stiffness: 420, damping: 34 };
export const ease = [0.2, 0.75, 0.25, 1];

/** GSAP count-up that re-animates from the previous value whenever `value` changes. */
export function AnimatedNumber({ value, format = (n) => Math.round(n).toLocaleString('en-IN'), duration = 1.1, className = '' }) {
  const ref = useRef(null);
  const prev = useRef(0);
  useEffect(() => {
    const el = ref.current; if (!el) return undefined;
    const target = Number(value) || 0;
    if (reduced()) { el.textContent = format(target); prev.current = target; return undefined; }
    const obj = { n: prev.current };
    const tw = gsap.to(obj, { n: target, duration, ease: 'power3.out', onUpdate: () => { el.textContent = format(obj.n); } });
    prev.current = target;
    return () => tw.kill();
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  return <span ref={ref} className={`tabular-nums ${className}`}>{format(0)}</span>;
}

/** GSAP staggered entrance for every `[data-anim]` child of the returned ref (runs once). */
export function useStagger(deps = []) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (!ref.current || reduced()) return undefined;
    const ctx = gsap.context(() => {
      gsap.from('[data-anim]', { y: 22, opacity: 0, scale: 0.985, duration: 0.7, ease: 'power3.out', stagger: 0.06, clearProps: 'transform,opacity' });
    }, ref);
    return () => ctx.revert();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps
  return ref;
}

/** Tiny SVG sparkline whose stroke is drawn in with GSAP. */
export function Sparkline({ data = [], className = '', stroke = 'rgb(var(--chilli))' }) {
  const path = useRef(null);
  const w = 120; const h = 36;
  const max = Math.max(...data, 1); const min = Math.min(...data, 0);
  const pts = data.map((v, i) => [(i / Math.max(1, data.length - 1)) * w, h - 3 - ((v - min) / (max - min || 1)) * (h - 6)]);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  useEffect(() => {
    const el = path.current; if (!el || reduced()) return undefined;
    const len = el.getTotalLength();
    const tw = gsap.fromTo(el, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.out', delay: 0.2 });
    return () => tw.kill();
  }, [d]);
  if (data.length < 2) return null;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none" aria-hidden="true">
      <defs><linearGradient id="spk" x1="0" x2="0" y1="0" y2="1"><stop offset="0" style={{ stopColor: stroke, stopOpacity: 0.18 }} /><stop offset="1" style={{ stopColor: stroke, stopOpacity: 0 }} /></linearGradient></defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill="url(#spk)" />
      <path ref={path} d={d} fill="none" style={{ stroke }} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** Framer Motion slide-over panel (right side on desktop, bottom sheet on phones). */
export function Drawer({ open, onClose, title, subtitle, children, footer, width = 'max-w-2xl' }) {
  const panel = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const prevOverflow = document.body.style.overflow; document.body.style.overflow = 'hidden';
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const t = setTimeout(() => panel.current?.focus(), 50);
    return () => { document.body.style.overflow = prevOverflow; window.removeEventListener('keydown', onKey); clearTimeout(t); };
  }, [open, onClose]);
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="adm-scope fixed inset-0 z-[80] text-charcoal">
          <motion.div className="absolute inset-0 bg-[#0F0D0C]/45 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.aside ref={panel} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
            className={`absolute inset-x-0 bottom-0 flex max-h-[94vh] w-full flex-col rounded-t-[28px] bg-white shadow-2xl outline-none sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:rounded-none sm:rounded-l-[28px] ${width}`}
            initial={{ x: '100%', opacity: 0.6 }} animate={{ x: 0, opacity: 1 }} exit={{ x: '100%', opacity: 0.6 }} transition={{ type: 'spring', stiffness: 320, damping: 36 }}>
            <header className="flex items-start gap-3 border-b border-black/[.06] px-6 py-5">
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-sans text-lg font-bold tracking-tight">{title}</h2>
                {subtitle && <p className="mt-0.5 truncate text-sm text-charcoal-500">{subtitle}</p>}
              </div>
              <button type="button" onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-black/[.04] transition hover:rotate-90 hover:bg-black/[.08]" aria-label="Close"><X size={18} /></button>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer && <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-black/[.06] bg-[#FAFAF8] px-6 py-4">{footer}</footer>}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

/** Mouse-follow spotlight on cards (pure CSS variable; no re-render). */
export const spotlight = {
  onMouseMove: (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  },
};

/** Resolve a theme colour token (e.g. 'chilli') to `rgb(r g b)` for SVG attributes (charts). */
export function themeColor(token, fallback = '#D2161E') {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim();
  return v ? `rgb(${v.split(/\s+/).join(',')})` : fallback;
}
