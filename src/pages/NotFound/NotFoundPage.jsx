import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import EmptyState from '@/components/common/EmptyState';
import { useLocalized } from '@/hooks/useLocalized';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
export default function NotFoundPage() {
  const { t } = useLocalized();
  useDocumentTitle(t('notFound.title'));
  return <div className="container-x py-20"><EmptyState icon={Compass} title={`404 · ${t('notFound.title')}`} text={t('notFound.text')}><Link to="/" className="btn-primary">{t('notFound.home')}</Link><Link to="/shop" className="btn-outline">{t('nav.shop')}</Link></EmptyState></div>;
}
