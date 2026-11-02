/** Small shared admin UI pieces. */
export function StatCard({ icon: Icon, label, value, hint, tone = 'chilli' }) {
  const tones = { chilli: 'bg-chilli-50 text-chilli', leaf: 'bg-chilli-50 text-chilli', turmeric: 'bg-chilli-50 text-chilli', charcoal: 'bg-chilli-50 text-chilli' };
  return (
    <div className="rounded-xl border border-line bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-wide text-charcoal-400">{label}</p><p className="mt-1.5 truncate text-2xl font-bold">{value}</p></div>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}><Icon size={19} /></span>
      </div>
      {hint && <p className="mt-2 text-xs text-charcoal-500">{hint}</p>}
    </div>
  );
}
export function Panel({ title, action, children, className = '' }) {
  return (
    <section className={`rounded-xl border border-line bg-white p-5 ${className}`}>
      {(title || action) && <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="text-lg">{title}</h2>{action}</div>}
      {children}
    </section>
  );
}
export function Toggle({ checked, onChange, label }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
      <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-leaf' : 'bg-charcoal/20'}`}>
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
      {label && <span>{label}</span>}
    </label>
  );
}
export const LANG_TABS = [['en', 'English'], ['hi', 'हिंदी'], ['mr', 'मराठी']];
/** Edit a { en, hi, mr } field. */
export function I18nInput({ label, value = {}, onChange, as = 'input', error }) {
  const Comp = as;
  return (
    <div>
      <p className="label">{label}</p>
      <div className="grid gap-2 sm:grid-cols-3">
        {LANG_TABS.map(([code, name]) => (
          <label key={code} className="block">
            <span className="mb-1 block text-[11px] font-semibold uppercase text-charcoal-400">{name}</span>
            <Comp className={`input ${as === 'textarea' ? 'min-h-[80px]' : ''} ${error && code === 'en' ? 'input-error' : ''}`} value={value[code] || ''} onChange={(e) => onChange({ ...value, [code]: e.target.value })} />
          </label>
        ))}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
/** Reads an image file as a data URL for preview (DEMO — stored in localStorage; real uploads go to storage in Phase 2). */
export function readImage(file, maxKB = 700) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file'));
    if (!file.type.startsWith('image/')) return reject(new Error('Please choose an image file'));
    if (file.size > maxKB * 1024) return reject(new Error(`Image must be under ${maxKB} KB in demo mode`));
    const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = () => reject(new Error('Could not read file')); r.readAsDataURL(file);
  });
}
