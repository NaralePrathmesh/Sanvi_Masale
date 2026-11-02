import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SmartImage from '@/components/common/SmartImage';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import { categoryImage, regionImages } from '@/assets/images';
import { useTilt } from '@/hooks/useMotion';

function Tile({ c, t }) {
  const tilt = useTilt(7);
  return (
    <Link to={c.to} className="group block">
      <div ref={tilt} className="tilt relative rounded-2xl">
        <span className="tilt-glare" aria-hidden="true" />
        <SmartImage src={c.src} image={c.image} alt={c.name} zoom sizes="(min-width:1024px) 16vw, 50vw" className="aspect-[4/5] w-full rounded-2xl ring-1 ring-line transition-shadow duration-300 group-hover:shadow-lift" />
      </div>
      <h3 className="mt-3 font-sans text-[15px] font-semibold leading-snug text-charcoal group-hover:text-chilli">{c.name}</h3>
      <span className="mt-0.5 inline-flex items-center gap-1 text-[13px] text-charcoal-500 group-hover:text-chilli">{t('nav.explore')}<ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></span>
    </Link>
  );
}

/** Six homepage tiles: five categories + Regional Specialities. Pass `all` to list every category. */
const HOME = ['pure-spices', 'blended-masalas', 'maharashtrian', 'regional', 'instant-mixes', 'combo-packs'];

export default function CategoryGrid({ all = false }) {
  const { categories } = useStore();
  const { l, t } = useLocalized();
  const items = all
    ? categories.map((c) => ({ id: c.id, name: l(c.name), to: `/category/${c.id}`, image: categoryImage(c.id), src: c.image }))
    : HOME.map((id) => {
      if (id === 'regional') return { id, name: t('home.regionalTitle'), to: '/regional', image: regionImages.north };
      const c = categories.find((x) => x.id === id);
      return c ? { id, name: l(c.name), to: `/category/${c.id}`, image: categoryImage(c.id), src: c.image } : null;
    }).filter(Boolean);
  return (
    <div className={`grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 ${all ? 'lg:grid-cols-4' : 'lg:grid-cols-6'}`}>
      {items.map((c) => <Tile key={c.id} c={c} t={t} />)}
    </div>
  );
}
