import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { AnimatedNumber, Sparkline, spotlight, spring } from './motion';

/** Shared premium admin UI pieces. */

/** KPI card: GSAP count-up value, change vs previous period and a drawn sparkline. */
export function StatCard({ icon: Icon, label, value, format, hint, delta, trend, tone = 'chilli' }) {
  const tones = {
    chilli: 'from-chilli/15 to-chilli/5 text-chilli', leaf: 'from-leaf/15 to-leaf/5 text-leaf-700',
    turmeric: 'from-turmeric/25 to-turmeric/5 text-turmeric-700', charcoal: 'from-charcoal/10 to-charcoal/5 text-charcoal',
  };
  const up = delta >= 0;
  return (
    <div data-anim {...spotlight} className="adm-card adm-spot group relative overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[.12em] text-charcoal-400">{label}</p>
          <p className="mt-2 truncate text-[28px] font-bold leading-none tracking-tight text-charcoal">
            {typeof value === 'number' ? <AnimatedNumber value={value} format={format} /> : value}
          </p>
        </div>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${tones[tone]} transition-transform duration-500 group-hover:rotate-[8deg] group-hover:scale-110`}><Icon size={20} /></span>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0 text-xs text-charcoal-500">
          {delta !== undefined && (
            <span className={`mr-1.5 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-semibold ${up ? 'bg-leaf-50 text-leaf-700' : 'bg-chilli-50 text-chilli'}`}>
              {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}{Math.abs(delta).toFixed(1)}%
            </span>
          )}
          {hint}
        </div>
        {trend && <Sparkline data={trend} className="h-9 w-24 shrink-0" />}
      </div>
    </div>
  );
}

export function Panel({ title, subtitle, action, children, className = '', pad = true }) {
  return (
    <section data-anim className={`adm-card ${pad ? 'p-5 sm:p-6' : ''} ${className}`}>
      {(title || action) && (
        <div className={`flex flex-wrap items-center justify-between gap-3 ${pad ? 'mb-5' : 'px-5 pb-4 pt-5 sm:px-6'}`}>
          <div className="min-w-0"><h2 className="font-sans text-base font-bold tracking-tight">{title}</h2>{subtitle && <p className="mt-0.5 text-xs text-charcoal-500">{subtitle}</p>}</div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Page heading row used at the top of each admin page. */
export function PageHeader({ title, subtitle, actions }) {
  return (
    <div data-anim className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-sans text-2xl font-bold tracking-tight sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-charcoal-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Animated switch (Framer spring knob). */
export function Toggle({ checked, onChange, label, size = 'md' }) {
  const s = size === 'sm' ? { w: 'w-9', h: 'h-5', k: 'h-4 w-4', on: 16 } : { w: 'w-11', h: 'h-6', k: 'h-5 w-5', on: 20 };
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm">
      <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={(e) => { e.stopPropagation(); onChange(!checked); }}
        className={`relative ${s.h} ${s.w} shrink-0 rounded-full p-0.5 transition-colors duration-300 ${checked ? 'bg-leaf' : 'bg-charcoal/20'}`}>
        <motion.span layout transition={spring} className={`block ${s.k} rounded-full bg-white shadow-md`} style={{ marginLeft: checked ? s.on : 0 }} />
      </button>
      {label && <span className="select-none">{label}</span>}
    </label>
  );
}

/** Segmented control with a sliding Framer "pill" (shared layoutId). */
export function Segmented({ id, value, onChange, options, className = '' }) {
  return (
    <div role="tablist" className={`inline-flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-black/[.045] p-1 [scrollbar-width:none] ${className}`}>
      {options.map(([v, label, count]) => {
        const active = v === value;
        return (
          <button key={v} type="button" role="tab" aria-selected={active} onClick={() => onChange(v)}
            className={`relative shrink-0 whitespace-nowrap rounded-xl px-3.5 py-2 text-[13px] font-semibold transition-colors ${active ? 'text-charcoal' : 'text-charcoal-500 hover:text-charcoal'}`}>
            {active && <motion.span layoutId={`seg-${id}`} transition={spring} className="absolute inset-0 rounded-xl bg-white shadow-[0_1px_3px_rgba(0,0,0,.08),0_6px_16px_-8px_rgba(0,0,0,.18)]" />}
            <span className="relative">{label}{count !== undefined && <span className={`ml-1.5 rounded-full px-1.5 text-[11px] ${active ? 'bg-chilli text-white' : 'bg-black/[.06]'}`}>{count}</span>}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Badge({ tone = 'neutral', children, className = '' }) {
  const tones = {
    neutral: 'bg-black/[.05] text-charcoal-600', green: 'bg-leaf-50 text-leaf-700', red: 'bg-chilli-50 text-chilli',
    amber: 'bg-turmeric-100 text-turmeric-700', blue: 'bg-blue-50 text-blue-700', violet: 'bg-violet-50 text-violet-700', dark: 'bg-charcoal text-white',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${tones[tone]} ${className}`}>{children}</span>;
}

export function Empty({ icon: Icon, title, text, action }) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      {Icon && <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-black/[.04] text-charcoal-400"><Icon size={24} /></span>}
      <p className="mt-4 font-semibold">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-charcoal-500">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
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

/** Status meta shared by orders pages. */
export const ORDER_LABEL = { placed: 'Placed', confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', out_for_delivery: 'Out for delivery', delivered: 'Delivered', cancelled: 'Cancelled' };
export const ORDER_TONE = { placed: 'amber', confirmed: 'blue', processing: 'violet', shipped: 'blue', out_for_delivery: 'violet', delivered: 'green', cancelled: 'red' };
export const ORDER_DOT = { placed: '#E3A008', confirmed: '#3B82F6', processing: '#8B5CF6', shipped: '#0EA5E9', out_for_delivery: '#A855F7', delivered: '#22A06B', cancelled: '#E5484D' };
export const PAY_LABEL = { upi: 'UPI', card: 'Card', netbanking: 'Net banking', cod: 'Cash on Delivery' };
export function OrderBadge({ status }) {
  return <Badge tone={ORDER_TONE[status]}><span className="h-1.5 w-1.5 rounded-full" style={{ background: ORDER_DOT[status] }} />{ORDER_LABEL[status]}</Badge>;
}
