import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MessageCircle, Shuffle, Hand, Star, CheckCheck } from 'lucide-react';
import DemoNotice from '@/components/common/DemoBadge';
import { ReviewSummary, WriteReviewModal, WriteReviewButton, useCustomerReviews } from '@/components/reviews/ReviewChat';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useInView, prefersReducedMotion } from '@/hooks/useMotion';

/**
 * Homepage review pile: every review is its own WhatsApp-style green message box,
 * scattered and tilted across a chat-wallpaper board and overlapping like a heap of
 * messages. Visitors drag (mouse or touch) any box to pull it on top and read it;
 * arrow keys move a focused box. "Shuffle" re-scatters the pile.
 *
 * Positions are deterministic (seeded) so the layout is stable between renders.
 * Drag offsets live in refs and are written straight to the DOM for smooth moves.
 */

const NAME_COLORS = ['#0A7C4E', '#1F6FD1', '#C2185B', '#B4562B', '#7B3FA0', '#00838F', '#D2161E', '#6D4C41'];
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const initials = (n) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/** Jittered grid → every part of the board gets covered, but nothing looks aligned. */
function scatter(n, seed) {
  const rnd = rng(seed);
  const cols = Math.max(2, Math.ceil(Math.sqrt(n * 1.7)));
  const rows = Math.ceil(n / cols);
  const cells = Array.from({ length: cols * rows }, (_, i) => i);
  for (let i = cells.length - 1; i > 0; i -= 1) { const j = Math.floor(rnd() * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
  return cells.slice(0, n).map((c) => ({
    x: Math.min(1, ((c % cols) + rnd()) / cols),
    y: Math.min(1, (Math.floor(c / cols) + rnd()) / rows),
    r: (rnd() - 0.5) * 26,
  }));
}

export default function ReviewWall() {
  const { t, l } = useLocalized();
  const { activeProducts } = useStore();
  const { all, add, avg, count, hasSamples } = useCustomerReviews();
  const [open, setOpen] = useState(false);
  const [seed, setSeed] = useState(7);
  const [hint, setHint] = useState(true);
  const [boardRef, inView] = useInView({ rootMargin: '0px 0px -20% 0px' });

  const pos = useMemo(() => scatter(all.length, seed), [all.length, seed]);
  const cards = useRef([]);         // DOM nodes
  const st = useRef([]);            // per card: { dx, dy, r, lift }
  const z = useRef(1000);
  const drag = useRef(null);
  const revealed = useRef(false);

  const paint = (i) => {
    const el = cards.current[i]; const s = st.current[i];
    if (!el || !s) return;
    el.style.transform = `translate(${s.dx}px, ${s.dy}px) rotate(${s.lift ? 0 : s.r}deg) scale(${s.lift ? 1.07 : 1})`;
    el.style.boxShadow = s.lift ? '0 28px 50px -18px rgba(11,20,26,.45)' : '';
  };

  // (Re)initialise transforms whenever the layout changes.
  useLayoutEffect(() => {
    const board = boardRef.current;
    pos.forEach((p, i) => {
      st.current[i] = { dx: 0, dy: 0, r: p.r, lift: false };
      const el = cards.current[i];
      if (!el) return;
      if (!revealed.current && board && !prefersReducedMotion()) {
        // start stacked in the middle of the board, invisible
        const cx = board.clientWidth / 2 - (el.offsetLeft + el.offsetWidth / 2);
        const cy = board.clientHeight / 2 - (el.offsetTop + el.offsetHeight / 2);
        el.style.transform = `translate(${cx}px, ${cy}px) rotate(${p.r * 2}deg) scale(.6)`;
        el.style.opacity = '0';
      } else paint(i);
    });
  }, [pos]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fly the boxes out from the centre the first time the board scrolls into view.
  useEffect(() => {
    if (!inView || revealed.current) return undefined;
    revealed.current = true;
    cards.current.forEach((el, i) => {
      if (!el) return;
      el.style.transition = `transform .9s cubic-bezier(.2,.75,.25,1) ${i * 22}ms, opacity .5s ease ${i * 22}ms`;
      el.style.opacity = '1';
      paint(i);
    });
    const tm = setTimeout(() => cards.current.forEach((el) => { if (el) el.style.transition = ''; }), 900 + all.length * 22);
    return () => clearTimeout(tm);
  }, [inView]); // eslint-disable-line react-hooks/exhaustive-deps

  const bounds = (el) => {
    const b = boardRef.current;
    return {
      minX: -el.offsetLeft - el.offsetWidth * 0.45, maxX: b.clientWidth - el.offsetLeft - el.offsetWidth * 0.55,
      minY: -el.offsetTop - el.offsetHeight * 0.3, maxY: b.clientHeight - el.offsetTop - el.offsetHeight * 0.5,
    };
  };
  const toFront = (i) => { z.current += 1; cards.current[i].style.zIndex = z.current; };

  const onDown = (e, i) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    const el = cards.current[i];
    el.setPointerCapture?.(e.pointerId);
    toFront(i);
    el.style.opacity = '1';
    el.style.transition = 'transform .12s ease-out, box-shadow .2s ease';
    st.current[i].lift = true; paint(i);
    drag.current = { i, x: e.clientX, y: e.clientY, dx: st.current[i].dx, dy: st.current[i].dy, b: bounds(el) };
  };
  const onMove = (e) => {
    const d = drag.current; if (!d) return;
    const s = st.current[d.i];
    s.dx = clamp(d.dx + e.clientX - d.x, d.b.minX, d.b.maxX);
    s.dy = clamp(d.dy + e.clientY - d.y, d.b.minY, d.b.maxY);
    paint(d.i);
  };
  const onUp = () => {
    const d = drag.current; if (!d) return;
    drag.current = null;
    const s = st.current[d.i];
    s.lift = false; s.r = (Math.random() - 0.5) * 14;
    cards.current[d.i].style.transition = 'transform .35s cubic-bezier(.2,.75,.25,1.3), box-shadow .3s ease';
    paint(d.i);
    if (hint) setHint(false);
  };
  const onKey = (e, i) => {
    const step = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] }[e.key];
    if (!step) return;
    e.preventDefault();
    const el = cards.current[i]; const s = st.current[i]; const b = bounds(el);
    s.dx = clamp(s.dx + step[0], b.minX, b.maxX); s.dy = clamp(s.dy + step[1], b.minY, b.maxY);
    el.style.transition = 'transform .15s ease-out'; paint(i);
  };

  const shuffle = useCallback(() => {
    const ease = 'cubic-bezier(.2,.75,.25,1)';
    cards.current.forEach((el) => { if (el) { el.style.opacity = '1'; el.style.transition = `left .8s ${ease}, top .8s ${ease}, transform .8s ${ease}`; } });
    revealed.current = true;
    setSeed((s) => s + 1);
  }, []);

  return (
    <section className="relative overflow-hidden border-t border-line bg-white">
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-[#25D366]/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-turmeric-100/70 blur-3xl" />
      <div className="container-x section relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow inline-flex items-center gap-2"><MessageCircle size={14} className="text-[#25D366]" />{t('reviewsWall.eyebrow')}</p>
          <h2 className="h-section mt-3">{t('reviewsWall.title')}</h2>
          <p className="mx-auto mt-4 max-w-xl leading-relaxed text-charcoal-500">{t('reviewsWall.subtitle')}</p>
          <ReviewSummary avg={avg} count={count} className="mt-6" />
        </div>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <WriteReviewButton onClick={() => setOpen(true)} />
          <button type="button" onClick={shuffle} className="btn-outline"><Shuffle size={15} />{t('reviewsWall.shuffle')}</button>
          <Link to="/reviews" className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-chilli hover:underline">{t('reviewsWall.seeAll')}<ArrowRight size={15} /></Link>
        </div>

        {/* The pile */}
        <div ref={boardRef} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
          role="region" aria-label={t('reviewsWall.boardLabel')}
          className="wa-wall relative mt-8 h-[460px] overflow-hidden rounded-[32px] border border-black/5 shadow-[inset_0_2px_30px_rgba(11,20,26,.06)] [--ch:200px] [--cw:200px] sm:h-[580px] sm:[--ch:180px] sm:[--cw:240px] lg:h-[660px] lg:[--ch:165px] lg:[--cw:250px]">
          {all.map((r, i) => {
            const p = pos[i]; if (!p) return null;
            const color = NAME_COLORS[hash(r.name) % NAME_COLORS.length];
            const product = activeProducts.find((x) => x.slug === r.product);
            return (
              <figure key={r.id} ref={(el) => { cards.current[i] = el; }}
                tabIndex={0} onPointerDown={(e) => onDown(e, i)} onKeyDown={(e) => onKey(e, i)} onFocus={() => toFront(i)}
                className="wa-tail wa-tail-out absolute m-0 w-[var(--cw)] cursor-grab touch-none select-none rounded-xl rounded-tr-none bg-[#D9FDD3] px-3 pb-1.5 pt-2.5 shadow-[0_2px_4px_rgba(11,20,26,.12),0_8px_22px_-12px_rgba(11,20,26,.35)] outline-none will-change-transform focus-visible:ring-4 focus-visible:ring-[#25D366]/40 active:cursor-grabbing"
                style={{ left: `calc((100% - var(--cw)) * ${p.x})`, top: `calc((100% - var(--ch)) * ${p.y})`, zIndex: i + 1 }}>
                <figcaption className="flex items-center gap-2">
                  <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-bold" style={{ color }}>{initials(r.name)}</span>
                  <span className="min-w-0 leading-tight">
                    <span className="block truncate text-[13px] font-semibold" style={{ color }}>{r.mine ? `${r.name} · ${t('reviewsWall.you')}` : r.name}</span>
                    {r.city && <span className="block truncate text-[10.5px] text-[#54656F]">~ {r.city}</span>}
                  </span>
                </figcaption>
                <p className="mt-1.5 flex gap-0.5" aria-label={t('reviewsWall.starsLabel', { n: r.rating })}>
                  {[1, 2, 3, 4, 5].map((s) => <Star key={s} size={11} className={s <= r.rating ? 'fill-[#F0A830] text-[#F0A830]' : 'text-[#B9C4BC]'} />)}
                </p>
                <blockquote className="mt-1 break-words text-[13.5px] leading-snug text-[#111B21]">{r.text}</blockquote>
                <div className="mt-1.5 flex items-center justify-between gap-2 text-[10.5px] text-[#54656F]">
                  <span className="min-w-0 truncate">{product ? `🛒 ${l(product.name)}` : ''}</span>
                  <span className="flex shrink-0 items-center gap-1">{r.time}<CheckCheck size={14} className="text-[#53BDEB]" aria-hidden="true" /></span>
                </div>
              </figure>
            );
          })}

          {hint && (
            <div aria-hidden="true" className="pointer-events-none absolute bottom-5 left-1/2 z-[5000] -translate-x-1/2">
              <span className="flex items-center gap-2 whitespace-nowrap rounded-full bg-charcoal/85 px-4 py-2 text-xs font-semibold text-white shadow-lift backdrop-blur">
                <Hand size={15} className="animate-wiggle" />{t('reviewsWall.dragHint')}
              </span>
            </div>
          )}
        </div>
        {hasSamples && <DemoNotice text={t('reviewsWall.sampleNote')} className="mx-auto mt-5 max-w-2xl" />}
      </div>
      <WriteReviewModal open={open} onClose={() => setOpen(false)} onSubmit={add} />
    </section>
  );
}
