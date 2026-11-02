import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Breadcrumbs({ items }) {
  const { t } = useTranslation();
  const all = [{ label: t('common.home'), to: '/' }, ...items];
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-sm text-charcoal-500">
      <ol className="flex flex-wrap items-center gap-1">
        {all.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight size={14} className="text-charcoal-400" />}
            {it.to && i < all.length - 1 ? <Link to={it.to} className="hover:text-chilli">{it.label}</Link> : <span className="font-medium text-charcoal" aria-current="page">{it.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
