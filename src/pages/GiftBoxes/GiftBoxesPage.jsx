import { Link } from 'react-router-dom';
import { Gift, PenLine, Building2, PackagePlus } from 'lucide-react';
import PageHero from '@/components/common/PageHero';
import Reveal from '@/components/common/Reveal';
import SectionHeading from '@/components/common/SectionHeading';
import ProductGrid from '@/components/product/ProductGrid';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { pageImages } from '@/assets/images';

export default function GiftBoxesPage() {
  const { activeProducts } = useStore();
  const { t } = useLocalized();
  useDocumentTitle(t('gift.title'), t('gift.subtitle'));
  const combos = activeProducts.filter((p) => p.category === 'combo-packs').sort((a, b) => (b.festivals?.length || 0) - (a.festivals?.length || 0) || b.popularity - a.popularity);
  return (
    <>
      <PageHero image={pageImages.giftBoxes} eyebrow={t('nav.giftBoxes')} title={t('gift.title')} subtitle={t('gift.subtitle')} crumbs={[{ label: t('nav.giftBoxes') }]}>
        <div className="flex flex-wrap gap-3"><Link to="/combo-builder" className="btn-primary"><PackagePlus size={16} />{t('gift.buildOwn')}</Link><Link to="/bulk-orders" className="btn-outline"><Building2 size={16} />{t('gift.corporate')}</Link></div>
      </PageHero>
      <div className="container-x py-12">
        <div className="mb-14 grid gap-4 md:grid-cols-3">
          {[[Gift, 'p1'], [PenLine, 'p2'], [Building2, 'p3']].map(([Icon, k], i) => (
            <Reveal key={k} delay={i * 90} className="card p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-chilli-50 text-chilli"><Icon size={22} /></span>
              <h2 className="mt-4 text-xl font-semibold">{t(`gift.${k}`)}</h2>
              <p className="mt-1 text-sm text-charcoal-500">{t(`gift.${k}d`)}</p>
            </Reveal>
          ))}
        </div>
        <SectionHeading title={t('home.combosTitle')} subtitle={t('home.combosSub')} />
        <ProductGrid products={combos} />
      </div>
    </>
  );
}
