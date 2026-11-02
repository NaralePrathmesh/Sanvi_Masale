import { useEffect, useRef, useState } from 'react';

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Adds `is-visible` once the element scrolls into view. Elements already on screen show immediately. */
export function useInView({ once = true, rootMargin = '0px 0px -8% 0px' } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') { setInView(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setInView(true); if (once) io.disconnect(); } else if (!once) setInView(false); }, { rootMargin });
    io.observe(el);
    // Safety net: never leave content hidden if the observer does not fire (e.g. thumbnails, print)
    const t = setTimeout(() => setInView(true), 2500);
    return () => { io.disconnect(); clearTimeout(t); };
  }, [once, rootMargin]);
  return [ref, inView];
}

/** Animated number that counts up when visible. */
export function useCountUp(target, duration = 1400) {
  const [ref, inView] = useInView();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return undefined;
    if (prefersReducedMotion()) { setValue(target); return undefined; }
    let raf; const start = performance.now();
    const tick = (now) => { const p = Math.min(1, (now - start) / duration); setValue(Math.round(target * (1 - (1 - p) ** 3))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);
  return [ref, value];
}

/** Subtle parallax: returns a ref whose element is translated by scroll offset × speed. */
export function useParallax(speed = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.parentElement.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      el.style.transform = `translate3d(0, ${(r.top * -speed).toFixed(1)}px, 0) scale(1.12)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf); };
  }, [speed]);
  return ref;
}

/**
 * Gentle 3D tilt toward the pointer (fine pointers only, off for reduced motion).
 * Sets --gx/--gy on the element for a soft glare highlight.
 */
export function useTilt(max = 6) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia('(pointer:fine)').matches) return undefined;
    let raf = 0;
    const move = (e) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width; const y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(900px) rotateX(${((0.5 - y) * max).toFixed(2)}deg) rotateY(${((x - 0.5) * max).toFixed(2)}deg) translateY(-4px)`;
        el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`); el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`);
      });
    };
    const leave = () => { cancelAnimationFrame(raf); el.style.transform = ''; };
    el.style.transition = 'transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .3s, border-color .3s';
    el.addEventListener('pointermove', move); el.addEventListener('pointerleave', leave);
    return () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerleave', leave); cancelAnimationFrame(raf); };
  }, [max]);
  return ref;
}
