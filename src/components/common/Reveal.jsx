import { useInView, useCountUp } from '@/hooks/useMotion';

/**
 * Fades/slides children in when scrolled into view. `variant="image"` unveils with a
 * clip-path wipe and a slow zoom-out instead. Disabled for reduced motion.
 */
export default function Reveal({ as: Tag = 'div', delay = 0, variant = 'fade', className = '', children, ...rest }) {
  const [ref, inView] = useInView();
  const base = variant === 'image' ? 'reveal-img' : 'reveal';
  return <Tag ref={ref} className={`${base} ${inView ? 'is-visible' : ''} ${className}`} style={{ '--reveal-delay': `${delay}ms` }} {...rest}>{children}</Tag>;
}

export function CountUp({ value, suffix = '', prefix = '', className = '' }) {
  const [ref, n] = useCountUp(value);
  return <span ref={ref} className={`tabular-nums ${className}`}>{prefix}{n.toLocaleString('en-IN')}{suffix}</span>;
}
