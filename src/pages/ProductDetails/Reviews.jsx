import { useState } from 'react';
import { Star, BadgeCheck } from 'lucide-react';
import Rating, { RatingInput } from '@/components/common/Rating';
import FormField from '@/components/common/FormField';
import { useLocalized } from '@/hooks/useLocalized';
import { usePersistentState } from '@/hooks/usePersistentState';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import { demoReviewPool } from '@/data/reviews';
import { formatDate } from '@/utils/format';

/** DEMO reviews: seeded snippets + user reviews stored in localStorage. */
export default function Reviews({ product, embedded = false }) {
  const { t, l, lang } = useLocalized();
  const { user } = useAuth();
  const { toast } = useUI();
  const [all, setAll] = usePersistentState('reviews', {});
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', rating: 0, text: '' });
  const [errors, setErrors] = useState({});
  const seed = parseInt(product.id.slice(1), 10);
  const seeded = [0, 1, 2].map((i) => {
    const r = demoReviewPool[(seed + i * 2) % demoReviewPool.length];
    const d = new Date(); d.setDate(d.getDate() - (seed % 9) - i * 11);
    return { ...r, text: l(r.text), date: d.toISOString(), verified: true };
  });
  const mine = all[product.id] || [];
  const list = [...mine, ...seeded];
  const dist = [5, 4, 3, 2, 1].map((s) => ({ s, pct: s === 5 ? 68 : s === 4 ? 22 : s === 3 ? 6 : s === 2 ? 3 : 1 }));

  const submit = (e) => {
    e.preventDefault();
    const errs = {};
    if (form.name.trim().length < 2) errs.name = 'validation.name';
    if (!form.rating) errs.rating = 'validation.rating';
    if (form.text.trim().length < 5) errs.text = 'validation.minLength';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setAll({ ...all, [product.id]: [{ name: form.name.trim(), rating: form.rating, text: form.text.trim(), date: new Date().toISOString() }, ...mine] });
    setForm({ name: user?.name || '', rating: 0, text: '' }); setOpen(false); toast(t('pdp.reviewThanks'));
  };

  return (
    <section id="reviews" className={embedded ? '' : 'mt-14 scroll-mt-24'}>
      {!embedded && <h2 className="h-section">{t('pdp.reviews')}</h2>}
      <div className={`${embedded ? '' : 'mt-6'} grid gap-8 lg:grid-cols-[260px_1fr]`}>
        <div className="self-start rounded-xl border border-line bg-white p-6">
          <p className="font-display text-5xl">{product.rating.toFixed(1)}</p>
          <Rating value={product.rating} showValue={false} size={18} className="mt-2" />
          <p className="mt-1 text-sm text-charcoal-500">{t('pdp.basedOn', { count: (product.reviews + mine.length).toLocaleString('en-IN') })}</p>
          <div className="mt-5 space-y-1.5">
            {dist.map(({ s, pct }) => (
              <div key={s} className="flex items-center gap-2 text-xs">
                <span className="flex w-7 items-center gap-0.5">{s}<Star size={11} className="fill-turmeric text-turmeric" /></span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-charcoal/10"><div className="h-full rounded-full bg-turmeric" style={{ width: `${pct}%` }} /></div>
                <span className="w-8 text-right text-charcoal-400">{pct}%</span>
              </div>
            ))}
          </div>
          <button type="button" className="btn-outline mt-6 w-full" onClick={() => setOpen((o) => !o)}>{t('pdp.writeReview')}</button>
        </div>
        <div>
          {open && (
            <form onSubmit={submit} className="mb-6 space-y-4 rounded-xl border border-line bg-white p-5 animate-fadeUp" noValidate>
              <div><p className="label">{t('pdp.ratingLabel')}</p><RatingInput value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} label={t('pdp.ratingLabel')} />{errors.rating && <p className="field-error">{t(errors.rating)}</p>}</div>
              <FormField label={t('pdp.yourName')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} error={errors.name} />
              <FormField as="textarea" label={t('pdp.yourReview')} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} error={errors.text} />
              <div className="flex gap-2"><button type="submit" className="btn-primary">{t('actions.submit')}</button><button type="button" className="btn-ghost" onClick={() => setOpen(false)}>{t('actions.cancel')}</button></div>
            </form>
          )}
          <ul className="space-y-5">
            {list.map((r, i) => (
              <li key={i} className="border-b border-line pb-5 last:border-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-200 text-sm font-bold">{r.name[0]}</span>
                  <span className="font-semibold">{r.name}</span>
                  {r.verified && <span className="flex items-center gap-1 text-xs text-leaf"><BadgeCheck size={14} />{t('pdp.verified')}</span>}
                  <span className="ml-auto text-xs text-charcoal-400">{formatDate(r.date, lang)}</span>
                </div>
                <Rating value={r.rating} showValue={false} size={13} className="mt-2" />
                <p className="mt-2 text-sm text-charcoal-600">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
