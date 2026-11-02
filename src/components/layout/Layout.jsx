import { Outlet, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from '@/components/cart/CartDrawer';
import QuickViewModal from '@/components/product/QuickViewModal';
import CompareBar from '@/components/product/CompareBar';
import PageLoader from '@/components/common/PageLoader';
import ScrollFX from '@/components/common/ScrollFX';

export default function Layout() {
  const { pathname } = useLocation();
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[90] focus:rounded-full focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
      <AnnouncementBar />
      <Header />
      <main id="main" className="flex-1">
        <Suspense fallback={<PageLoader />}><div key={pathname} className="animate-pageIn"><Outlet /></div></Suspense>
      </main>
      <Footer />
      <CartDrawer />
      <QuickViewModal />
      <CompareBar />
      <ScrollFX />
    </div>
  );
}
