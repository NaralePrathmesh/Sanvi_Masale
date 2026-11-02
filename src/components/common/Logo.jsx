import { Link } from 'react-router-dom';
import { brand } from '@/config/brand';

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
export const brandAsset = (path) => (path ? (/^(https?:|data:|\/)/.test(path) ? path : BASE + path) : null);

/** Round emblem (favicon-style). Falls back to a simple mark if the file is missing. */
export function BrandMark({ className = 'h-10 w-10' }) {
  return brand.logo.mark
    ? <img src={brandAsset(brand.logo.mark)} alt="" aria-hidden="true" className={`shrink-0 object-contain ${className}`} />
    : <span aria-hidden="true" className={`shrink-0 rounded-full bg-chilli ${className}`} />;
}

/** Saanvi Masale wordmark from /public/brand (set in config/brand.js). `size` = sm | md | lg. */
export default function Logo({ to = '/', size = 'md' }) {
  const h = { sm: 'h-10', md: 'h-11 sm:h-14', lg: 'h-16' }[size];
  return (
    <Link to={to} className="flex shrink-0 items-center" aria-label={`${brand.name} (${brand.nameLatin}) — home`}>
      {brand.logo.src
        ? <img src={brandAsset(brand.logo.src)} alt={brand.logo.alt} width="640" height="295" className={`${h} w-auto transition-transform duration-300 hover:scale-[1.03]`} />
        : <span className="font-brand text-2xl text-chilli">{brand.name}</span>}
    </Link>
  );
}
