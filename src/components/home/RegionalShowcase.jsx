import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SmartImage from '@/components/common/SmartImage';
import Reveal from '@/components/common/Reveal';
import { regions, regionSlug } from '@/data/categories';
import { regionImages } from '@/assets/images';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';

export default function RegionalShowcase() {
  const { activeProducts } = useStore();
  const { t, l } = useLocalized();
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {regions.map((r, idx) => {
        const items = activeProducts.filter((p) => p.region === r.id && p.type !== 'combo').slice(0, 4);
        return (
          <Reveal key={r.id} delay={idx * 100} className="group overflow-hidden rounded-xl border border-line bg-white transition-shadow duration-300 hover:shadow-soft">
            <div className="relative">
              <SmartImage image={regionImages[r.id]} alt={l(r.name)} zoom className="aspect-[3/2] w-full" />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 to-transparent" />
              <h3 className="absolute bottom-4 left-5 text-2xl text-white">{l(r.name)}</h3>
            </div>
            <div className="p-5">
              <p className="text-sm leading-relaxed text-charcoal-600">{l(r.desc)}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {items.map((p) => <Link key={p.id} to={`/product/${p.slug}`} className="chip text-xs">{l(p.name)}</Link>)}
              </div>
              <Link to={`/regional/${regionSlug(r.id)}`} className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-chilli">{t('regional.shopRegion', { region: l(r.name) })}<ArrowRight size={15} className="transition group-hover:translate-x-0.5" /></Link>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
