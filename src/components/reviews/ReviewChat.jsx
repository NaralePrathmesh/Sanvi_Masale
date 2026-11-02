import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, CheckCheck, ShoppingBag, PenLine, Send } from 'lucide-react';
import Modal from '@/components/common/Modal';
import FormField from '@/components/common/FormField';
import { RatingInput } from '@/components/common/Rating';
import { useStore } from '@/context/StoreContext';
import { useUI } from '@/context/UIContext';
import { useLocalized } from '@/hooks/useLocalized';
import { usePersistentState } from '@/hooks/usePersistentState';

/* WhatsApp group-chat name colours (readable on white). */
const NAME_COLORS = ['#D2161E', '#1F7AEC', '#0A8754', '#B4562B', '#8E44AD', '#C2185B', '#00838F', '#6D4C41', '#5E9C2C', '#E67E22'];
const AVATAR_BG = ['#FDEEEF', '#E8F1FD', '#E6F5EE', '#FBEFE6', '#F3EAF8', '#FCE7EF', '#E0F4F5', '#F1ECE9', '#F1F8EA', '#FDF1E3'];
const hash = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const initials = (n) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

/**
 * Reviews come from the store (admin → Reviews can hide, pin or add them). The visitor's
 * own submissions are remembered by id so they show as "You". Order: visitor's own,
 * then pinned, then the rest.
 */
export function useCustomerReviews() {
  const { reviews, setReviews } = useStore();
  const [mineIds, setMineIds] = usePersistentState('myReviewIds', []);
  const all = useMemo(() => {
    const visible = reviews.filter((r) => !r.hidden).map((r) => (mineIds.includes(r.id) ? { ...r, mine: true } : r));
    const rank = (r) => (r.mine ? 0 : r.pinned ? 1 : 2);
    return visible.map((r, i) => [r, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map(([r]) => r);
  }, [reviews, mineIds]);
  const add = (r) => {
    const id = `u${Date.now()}`;
    setReviews((list) => [{ ...r, id, source: 'customer', createdAt: new Date().toISOString() }, ...list]);
    setMineIds((m) => [id, ...m].slice(0, 20));
  };
  const avg = all.reduce((s, r) => s + r.rating, 0) / (all.length || 1);
  const hasSamples = all.some((r) => /^r\d+$/.test(r.id) && !r.source);
  return { all, add, avg, count: all.length, hasSamples };
}

/** One WhatsApp-style message bubble. */
export function ChatBubble({ review, className = '', animate = false }) {
  const { t, l } = useLocalized();
  const { activeProducts } = useStore();
  const product = activeProducts.find((p) => p.slug === review.product);
  const h = hash(review.name);
  const mine = review.mine;
  return (
    <figure className={`flex items-start gap-2 ${mine ? 'flex-row-reverse' : ''} ${animate ? 'animate-bubbleIn' : ''} ${className}`}>
      <span aria-hidden="true" className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ring-2 ring-white"
        style={{ background: AVATAR_BG[h % AVATAR_BG.length], color: NAME_COLORS[h % NAME_COLORS.length] }}>{initials(review.name)}</span>
      <div className={`wa-tail relative min-w-0 max-w-[92%] rounded-lg px-3 pb-1.5 pt-2 shadow-[0_1px_0.5px_rgba(11,20,26,.13)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_-10px_rgba(11,20,26,.35)] ${mine ? 'wa-tail-out rounded-tr-none bg-[#D9FDD3]' : 'wa-tail-in rounded-tl-none bg-white'}`}>
        <figcaption className="flex flex-wrap items-baseline gap-x-1.5 text-[13px] font-semibold leading-tight">
          <span style={{ color: mine ? '#0A8754' : NAME_COLORS[h % NAME_COLORS.length] }}>{mine ? `${review.name} · ${t('reviewsWall.you')}` : review.name}</span>
          {review.city && <span className="text-[11px] font-normal text-[#667781]">~ {review.city}</span>}
        </figcaption>
        <p className="mt-1 flex gap-0.5" aria-label={t('reviewsWall.starsLabel', { n: review.rating })}>
          {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={12} className={i <= review.rating ? 'fill-[#F0A830] text-[#F0A830]' : 'text-[#D1D7DB]'} />)}
        </p>
        <blockquote className="mt-1 whitespace-pre-line break-words text-[14px] leading-snug text-[#111B21]">{review.text}</blockquote>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          {product ? (
            <Link to={`/product/${product.slug}`} className="inline-flex min-w-0 items-center gap-1 rounded-full bg-black/[.045] px-2 py-0.5 text-[11px] font-medium text-[#3B4A54] transition hover:bg-chilli-50 hover:text-chilli">
              <ShoppingBag size={11} className="shrink-0" /><span className="truncate">{l(product.name)}</span>
            </Link>
          ) : <span />}
          <span className="flex shrink-0 items-center gap-1 text-[11px] text-[#667781]">{review.time}<CheckCheck size={15} className="text-[#53BDEB]" aria-hidden="true" /></span>
        </div>
      </div>
    </figure>
  );
}

/** Small summary pill: 4.9 ★★★★★ · 50 reviews */
export function ReviewSummary({ avg, count, className = '' }) {
  const { t } = useLocalized();
  return (
    <div className={`inline-flex items-center gap-3 rounded-full border border-line bg-white px-4 py-2 shadow-soft ${className}`}>
      <span className="font-display text-2xl leading-none text-charcoal">{avg.toFixed(1)}</span>
      <span className="flex">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={15} className={i <= Math.round(avg) ? 'fill-turmeric text-turmeric' : 'text-charcoal/20'} />)}</span>
      <span className="text-sm text-charcoal-500">{t('reviewsWall.count', { count })}</span>
    </div>
  );
}

/** "Write a review" dialog. Saves into this browser only (demo). */
export function WriteReviewModal({ open, onClose, onSubmit, initialText = '' }) {
  const { t, l } = useLocalized();
  const { activeProducts } = useStore();
  const { toast } = useUI();
  const [f, setF] = useState({ name: '', city: '', product: '', rating: 0, text: initialText });
  const [err, setErr] = useState({});
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target ? e.target.value : e }));

  const submit = (e) => {
    e.preventDefault();
    const er = {};
    if (f.name.trim().length < 2) er.name = 'validation.name';
    if (!f.rating) er.rating = 'validation.rating';
    if (f.text.trim().length < 10) er.text = 'validation.minLength';
    setErr(er);
    if (Object.keys(er).length) return;
    const now = new Date();
    const time = now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
    onSubmit({ name: f.name.trim(), city: f.city.trim(), product: f.product, rating: f.rating, text: f.text.trim(), time });
    toast(t('reviewsWall.thanks'), 'success');
    setF({ name: '', city: '', product: '', rating: 0, text: '' });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={t('reviewsWall.write')} size="sm">
      <form onSubmit={submit} noValidate className="space-y-4 p-5">
        <div>
          <p className="label">{t('reviewsWall.yourRating')}</p>
          <RatingInput value={f.rating} onChange={(v) => setF((x) => ({ ...x, rating: v }))} label={t('reviewsWall.yourRating')} />
          {err.rating && <p className="field-error" role="alert">{t(err.rating)}</p>}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label={t('reviewsWall.name')} value={f.name} onChange={set('name')} error={err.name} autoComplete="name" maxLength={40} />
          <FormField label={`${t('reviewsWall.city')} (${t('common.optional')})`} value={f.city} onChange={set('city')} maxLength={30} />
        </div>
        <FormField as="select" label={`${t('reviewsWall.product')} (${t('common.optional')})`} value={f.product} onChange={set('product')}>
          <option value="">—</option>
          {activeProducts.map((p) => <option key={p.id} value={p.slug}>{l(p.name)}</option>)}
        </FormField>
        <FormField as="textarea" label={t('reviewsWall.message')} value={f.text} onChange={set('text')} error={err.text} maxLength={400} placeholder={t('reviewsWall.placeholder')} />
        <p className="text-xs text-charcoal-400">{t('reviewsWall.savedNote')}</p>
        <button type="submit" className="btn-primary w-full"><Send size={15} />{t('reviewsWall.send')}</button>
      </form>
    </Modal>
  );
}

export function WriteReviewButton({ onClick, className = '' }) {
  const { t } = useLocalized();
  return <button type="button" onClick={onClick} className={`btn-primary ${className}`}><PenLine size={15} />{t('reviewsWall.write')}</button>;
}
