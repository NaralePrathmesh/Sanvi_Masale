import { Link, useParams } from 'react-router-dom';
import { PackageSearch } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import ShopPage from '@/pages/Shop/ShopPage';
import { useStore } from '@/context/StoreContext';
import { useLocalized } from '@/hooks/useLocalized';

/** Category page = shop layout with the category fixed (breadcrumb, title, description, filters, sort, grid). */
export default function CategoryPage() {
  const { slug } = useParams();
  const { categories } = useStore();
  const { t } = useLocalized();
  const cat = categories.find((c) => c.id === slug);
  if (!cat) return <div className="container-x py-16"><EmptyState icon={PackageSearch} title={t('category.notFound')}><Link to="/categories" className="btn-primary">{t('nav.allCategories')}</Link></EmptyState></div>;
  return <ShopPage key={cat.id} lockedCategory={cat} />;
}
