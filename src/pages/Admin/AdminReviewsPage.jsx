import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, Search, Pin, PinOff, Eye, EyeOff, Pencil, Trash2, Plus, Check, MessageSquareHeart, ThumbsUp, ExternalLink, Eraser } from 'lucide-react';
import { StatCard, PageHeader, Segmented, Badge, Empty } from '@/components/admin/ui';
import { Drawer, useStagger, spring } from '@/components/admin/motion';
import { RatingInput } from '@/components/common/Rating';
import { useStore } from '@/context/StoreContext';
import { useUI } from '@/context/UIContext';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const blank = () => ({ name: '', city: '', product: '', rating: 5, text: '', time: new Date().toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase(), _new: true });

/** Review moderation: hide/show, pin to the top of the homepage pile, edit, delete, add real reviews. */
export default function AdminReviewsPage() {
  const { reviews, products, patchReview, deleteReview, adminAddReview, removeSampleReviews, markReviewsSeen, isSampleReview } = useStore();
  const fail = (e) => toast(e.message || 'Something went wrong', 'error');
  const { toast } = useUI();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState(params.get('filter') || 'all');
  const [stars, setStars] = useState(0); const [q, setQ] = useState('');
  const [edit, setEdit] = useState(null); const [errors, setErrors] = useState({});
  const [armed, setArmed] = useState(false);
  useDocumentTitle('Admin · Reviews');
  const ref = useStagger();

  useEffect(() => {
    if (params.get('new')) setEdit(blank());
    if (params.toString()) setParams({}, { replace: true });
    // Opening this page marks customer submissions as seen (clears the sidebar badge).
    if (reviews.some((r) => r.source === 'customer' && !r.seen)) markReviewsSeen();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = reviews.filter((r) => !r.hidden);
  const avg = visible.reduce((s, r) => s + r.rating, 0) / (visible.length || 1);
  const isSample = isSampleReview;
  const counts = { all: reviews.length, live: visible.length, hidden: reviews.length - visible.length, pinned: reviews.filter((r) => r.pinned).length, customer: reviews.filter((r) => r.source === 'customer').length, sample: reviews.filter(isSample).length };
  const list = useMemo(() => reviews.filter((r) => (filter === 'all' || (filter === 'live' && !r.hidden) || (filter === 'hidden' && r.hidden) || (filter === 'pinned' && r.pinned) || (filter === 'customer' && r.source === 'customer') || (filter === 'sample' && isSample(r)))
    && (!stars || r.rating === stars) && (!q || `${r.name} ${r.city} ${r.text}`.toLowerCase().includes(q.toLowerCase()))), [reviews, filter, stars, q]);
  const patch = (id, p, msg) => patchReview(id, p).then(() => msg && toast(msg, 'info')).catch(fail);
  const remove = (r) => deleteReview(r.id).then(() => toast(`Deleted review by ${r.name}`, 'info')).catch(fail);
  const productName = (slug) => products.find((p) => p.slug === slug)?.name.en;

  const save = () => {
    const er = {};
    if (edit.name.trim().length < 2) er.name = 'Enter the customer’s name';
    if (edit.text.trim().length < 5) er.text = 'Write the review text';
    setErrors(er); if (Object.keys(er).length) return;
    const { _new, ...r } = edit;
    const done = (msg) => { toast(msg); setEdit(null); };
    if (_new) adminAddReview(r).then(() => done('Review added — it now shows on the website')).catch(fail);
    else patchReview(r.id, { name: r.name, city: r.city, product: r.product, rating: r.rating, text: r.text, time: r.time }).then(() => done('Review updated')).catch(fail);
  };

  return (
    <div ref={ref} className="space-y-6">
      <PageHeader title="Reviews" subtitle="Everything shown in the homepage review pile and on /reviews."
        actions={<>
          <Link to="/reviews" target="_blank" className="adm-btn-ghost"><ExternalLink size={15} />View on site</Link>
          <button type="button" className="adm-btn-accent" onClick={() => { setErrors({}); setEdit(blank()); }}><Plus size={16} />Add review</button>
        </>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Star} label="Average rating" value={avg} format={(n) => n.toFixed(2)} tone="turmeric" hint="of visible reviews" />
        <StatCard icon={MessageSquareHeart} label="Live on site" value={counts.live} tone="leaf" />
        <StatCard icon={ThumbsUp} label="From customers" value={counts.customer} hint="Sent via “Write a review”" tone="charcoal" />
        <StatCard icon={Eraser} label="Sample reviews" value={counts.sample} hint="Replace before launch" />
      </div>

      {counts.sample > 0 && (
        <div data-anim className="flex flex-wrap items-center gap-3 rounded-[22px] border border-turmeric/40 bg-turmeric-50 p-4 text-sm">
          <span className="min-w-0 flex-1"><strong>{counts.sample} sample reviews</strong> are still on the site. Add your real customer reviews, then remove the samples in one click.</span>
          <button type="button" className={armed ? 'adm-btn-accent' : 'adm-btn-ghost'} onClick={() => { if (!armed) { setArmed(true); return; } removeSampleReviews().then(() => { setArmed(false); toast('All sample reviews removed', 'info'); }).catch(fail); }}>
            <Eraser size={15} />{armed ? 'Click again to confirm' : 'Remove all samples'}
          </button>
          {armed && <button type="button" className="text-xs font-semibold text-charcoal-500 hover:underline" onClick={() => setArmed(false)}>Cancel</button>}
        </div>
      )}

      <div data-anim className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <Segmented id="rf" value={filter} onChange={setFilter} options={[['all', 'All', counts.all], ['live', 'Live', counts.live], ['hidden', 'Hidden', counts.hidden], ['pinned', 'Pinned', counts.pinned], ['customer', 'Customer', counts.customer], ['sample', 'Samples', counts.sample]]} />
        <div className="flex flex-1 gap-2">
          <label className="relative flex-1"><Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-400" /><input className="adm-input pl-10" placeholder="Search name, city or text" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search reviews" /></label>
          <select className="adm-input w-28" value={stars} onChange={(e) => setStars(Number(e.target.value))} aria-label="Filter by rating"><option value={0}>All ★</option>{[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}</select>
        </div>
      </div>

      {!list.length ? <div className="adm-card"><Empty icon={MessageSquareHeart} title="No reviews here" /></div> : (
        <motion.div layout className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((r) => (
              <motion.article layout key={r.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={spring}
                className={`adm-card flex flex-col p-4 ${r.hidden ? 'opacity-60' : ''}`}>
                <div className="relative rounded-2xl rounded-tr-sm bg-[#D9FDD3] p-3.5">
                  <div className="flex items-center gap-2"><span className="truncate text-sm font-semibold text-[#0A7C4E]">{r.name}</span>{r.city && <span className="truncate text-[11px] text-[#54656F]">~ {r.city}</span>}<span className="ml-auto flex shrink-0 gap-0.5">{[1, 2, 3, 4, 5].map((s) => <Star key={s} size={11} className={s <= r.rating ? 'fill-[#F0A830] text-[#F0A830]' : 'text-[#B9C4BC]'} />)}</span></div>
                  <p className="mt-1.5 text-[13.5px] leading-snug text-[#111B21]">{r.text}</p>
                  <p className="mt-1.5 text-right text-[10.5px] text-[#54656F]">{productName(r.product) ? `🛒 ${productName(r.product)} · ` : ''}{r.time}</p>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {r.pinned && <Badge tone="dark"><Pin size={10} />Pinned</Badge>}
                  {r.hidden ? <Badge tone="neutral">Hidden</Badge> : <Badge tone="green">Live</Badge>}
                  {r.source === 'customer' && <Badge tone="blue">Customer</Badge>}
                  {r.source === 'admin' && <Badge tone="violet">Added by admin</Badge>}
                  {isSample(r) && <Badge tone="amber">Sample</Badge>}
                  <div className="ml-auto flex gap-0.5">
                    <button type="button" className="adm-icon" onClick={() => patch(r.id, { pinned: !r.pinned }, r.pinned ? 'Unpinned' : 'Pinned to the top of the pile')} aria-label={r.pinned ? 'Unpin' : 'Pin'} title={r.pinned ? 'Unpin' : 'Pin to top'}>{r.pinned ? <PinOff size={15} /> : <Pin size={15} />}</button>
                    <button type="button" className="adm-icon" onClick={() => patch(r.id, { hidden: !r.hidden }, r.hidden ? 'Review is live again' : 'Review hidden from the site')} aria-label={r.hidden ? 'Show' : 'Hide'} title={r.hidden ? 'Show on site' : 'Hide from site'}>{r.hidden ? <Eye size={15} /> : <EyeOff size={15} />}</button>
                    <button type="button" className="adm-icon" onClick={() => { setErrors({}); setEdit({ ...r }); }} aria-label="Edit" title="Edit"><Pencil size={15} /></button>
                    <button type="button" className="adm-icon hover:text-chilli" onClick={() => remove(r)} aria-label="Delete" title="Delete"><Trash2 size={15} /></button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <Drawer open={!!edit} onClose={() => setEdit(null)} title={edit?._new ? 'Add a review' : 'Edit review'} subtitle="Shown as a WhatsApp-style message on the website" width="max-w-xl"
        footer={<><button type="button" className="adm-btn-ghost" onClick={() => setEdit(null)}>Cancel</button><button type="button" className="adm-btn-accent" onClick={save}><Check size={16} />{edit?._new ? 'Publish review' : 'Save'}</button></>}>
        {edit && (
          <div className="space-y-4 p-6">
            <div><p className="label">Rating</p><RatingInput value={edit.rating} onChange={(v) => setEdit({ ...edit, rating: v })} label="Rating" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label><span className="label">Customer name</span><input className="adm-input" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} />{errors.name && <p className="field-error">{errors.name}</p>}</label>
              <label><span className="label">City</span><input className="adm-input" value={edit.city} onChange={(e) => setEdit({ ...edit, city: e.target.value })} /></label>
            </div>
            <label className="block"><span className="label">Product</span><select className="adm-input" value={edit.product} onChange={(e) => setEdit({ ...edit, product: e.target.value })}><option value="">— none —</option>{products.map((p) => <option key={p.id} value={p.slug}>{p.name.en}</option>)}</select></label>
            <label className="block"><span className="label">Review (any language — English, हिंदी, मराठी)</span><textarea className="adm-input min-h-[120px] py-3" value={edit.text} onChange={(e) => setEdit({ ...edit, text: e.target.value })} maxLength={400} />{errors.text && <p className="field-error">{errors.text}</p>}</label>
            <label className="block"><span className="label">Time shown on the bubble</span><input className="adm-input w-40" value={edit.time} onChange={(e) => setEdit({ ...edit, time: e.target.value })} /></label>
            <div className="rounded-2xl bg-[#EFEAE2] p-4">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-charcoal-500">Live preview</p>
              <div className="rounded-2xl rounded-tr-sm bg-[#D9FDD3] p-3.5 shadow-sm"><p className="text-sm font-semibold text-[#0A7C4E]">{edit.name || 'Customer name'}{edit.city && <span className="ml-1.5 text-[11px] font-normal text-[#54656F]">~ {edit.city}</span>}</p><p className="mt-0.5 text-xs text-[#F0A830]">{'★'.repeat(edit.rating)}</p><p className="mt-1 text-[13.5px] text-[#111B21]">{edit.text || 'Review text…'}</p><p className="mt-1 text-right text-[10.5px] text-[#54656F]">{edit.time} ✓✓</p></div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
