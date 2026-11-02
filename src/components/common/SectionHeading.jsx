import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Reveal from './Reveal';

/** Section title (28–34px), optional one-line subtitle and a single text link. */
export default function SectionHeading({ eyebrow, title, subtitle, action, align = 'left' }) {
  const center = align === 'center';
  return (
    <Reveal className={`mb-8 flex flex-col gap-2 sm:mb-10 ${center ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between sm:gap-6'}`}>
      <div className="max-w-2xl">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="h-section">{title}</h2>
        {subtitle && <p className="mt-2 text-charcoal-500">{subtitle}</p>}
      </div>
      {action && <Link to={action.to} className="btn-link shrink-0">{action.label}<ArrowRight size={15} /></Link>}
    </Reveal>
  );
}
