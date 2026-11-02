import { useMemo, useState } from 'react';
import { Search, Star } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import DemoNotice from '@/components/common/DemoBadge';
import { ChatBubble, ReviewSummary, WriteReviewModal, WriteReviewButton, useCustomerReviews } from '@/components/reviews/ReviewChat';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** All customer reviews as one WhatsApp group chat, with star / product filters and a composer. */
export default function ReviewsPage() {
  const { t, l } = useLocalized();
  const { activeProducts } = useStore();
  const { all, add, avg, count, hasSamples } = useCustomerReviews();
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [product, setProduct] = useState('');
  const [q, setQ] = useState('');
  useDocumentTitle(t('reviewsWall.pageTitle'), 'Customer reviews of Saanvi Masale spices and masalas.');

  const reviewed = useMemo(() => activeProducts.filter((p) => all.some((r) => r.product === p.slug)), [activeProducts, all]);
  const dist = [5, 4, 3, 2, 1].map((n) => ({ n, c: all.filter((r) => r.rating === n).length }));
  const list = all.filter((r) => (!stars || r.rating === stars) && (!product || r.product === product) && (!q || `${r.name} ${r.city} ${r.text}`.toLowerCase().includes(q.toLowerCase())));
  const chip = (active) => `shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${active ? 'border-[#008069] bg-[#008069] text-white' : 'border-line bg-white text-charcoal-600 hover:border-[#008069]/50'}`;

  return (
    <>
      <PageHero crumbs={[{ label: t('reviewsWall.pageTitle') }]} title={t('reviewsWall.title')} subtitle={t('reviewsWall.subtitle')}>
        <div className="flex flex-wrap items-center gap-4"><ReviewSummary avg={avg} count={count} /><WriteReviewButton onClick={() => setOpen(true)} /></div>
      </PageHero>

      <div className="container-x grid gap-8 py-10 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-line bg-white p-5">
            <p className="font-semibold">{t('reviewsWall.breakdown')}</p>
            <ul className="mt-4 space-y-2">
              {dist.map(({ n, c }) => (
                <li key={n}>
                  <button type="button" onClick={() => setStars(stars === n ? 0 : n)} className="flex w-full items-center gap-2 text-sm" aria-pressed={stars === n}>
                    <span className="flex w-8 items-center gap-0.5 font-semibold">{n}<Star size={12} className="fill-turmeric text-turmeric" /></span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-cream-200"><span className="block h-full rounded-full bg-gradient-to-r from-turmeric to-chilli" style={{ width: `${(c / (all.length || 1)) * 100}%` }} /></span>
                    <span className="w-7 text-right tabular-nums text-charcoal-500">{c}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {hasSamples && <DemoNotice text={t('reviewsWall.sampleNote')} />}
        </aside>

        <div className="wa-wall min-w-0 overflow-clip rounded-[28px] border border-black/5 shadow-lift">
          <div className="sticky top-0 z-10 flex items-center gap-3 bg-[#008069] px-4 py-3 text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 font-brand text-lg text-chilli">सा</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold leading-tight">{t('reviewsWall.groupName')}</p>
              <p className="truncate text-xs text-white/80">{t('reviewsWall.members', { count })}</p>
            </div>
          </div>
          <div className="space-y-3 border-b border-black/5 bg-white/70 px-3 py-3 backdrop-blur">
            <label className="relative block">
              <span className="sr-only">{t('reviewsWall.search')}</span>
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#667781]" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('reviewsWall.search')} className="h-10 w-full rounded-full bg-[#F0F2F5] pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#008069]/30" />
            </label>
            <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              <button type="button" className={chip(!stars)} onClick={() => setStars(0)}>{t('common.all')}</button>
              {[5, 4].map((n) => <button key={n} type="button" className={chip(stars === n)} onClick={() => setStars(stars === n ? 0 : n)}>{n} ★</button>)}
              <select value={product} onChange={(e) => setProduct(e.target.value)} aria-label={t('reviewsWall.product')} className="h-8 shrink-0 rounded-full border border-line bg-white px-3 text-xs font-semibold text-charcoal-600">
                <option value="">{t('reviewsWall.allProducts')}</option>
                {reviewed.map((p) => <option key={p.id} value={p.slug}>{l(p.name)}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3 px-3 py-5 sm:px-6" aria-live="polite">
            <p className="mx-auto w-fit rounded-lg bg-white/90 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-[#54656F] shadow-sm">{t('reviewsWall.showing', { count: list.length })}</p>
            {list.length ? list.map((r, i) => <ChatBubble key={r.id} review={r} animate={i < 12} className={`sm:max-w-[80%] ${r.mine ? 'ml-auto' : ''}`} />)
              : <p className="mx-auto w-fit rounded-lg bg-[#FFEECD] px-4 py-2 text-sm text-[#54656F]">{t('reviewsWall.none')}</p>}
          </div>

          <button type="button" onClick={() => setOpen(true)} className="flex w-full items-center gap-2 bg-[#F0F2F5] px-3 py-2.5 text-left">
            <span className="flex-1 rounded-full bg-white px-4 py-2.5 text-sm text-[#667781]">{t('reviewsWall.placeholder')}</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00A884] text-white"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M1.1 21.8 23 12 1.1 2.2 1 9.8l15.7 2.2L1 14.2z" /></svg></span>
            <span className="sr-only">{t('reviewsWall.write')}</span>
          </button>
        </div>
      </div>
      <WriteReviewModal open={open} onClose={() => setOpen(false)} onSubmit={add} />
    </>
  );
}
