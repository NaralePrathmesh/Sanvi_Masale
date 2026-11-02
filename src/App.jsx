import { BrowserRouter, HashRouter } from 'react-router-dom';

// Hash routing is used for the static preview build (VITE_HASH_ROUTER=1); normal builds use clean URLs.
const Router = import.meta.env.VITE_HASH_ROUTER === '1' ? HashRouter : BrowserRouter;
import { StoreProvider } from '@/context/StoreContext';
import { UIProvider } from '@/context/UIContext';
import { AuthProvider } from '@/context/AuthContext';
import { OrderProvider } from '@/context/OrderContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CompareProvider } from '@/context/CompareContext';
import AppRoutes from '@/routes/AppRoutes';
import Toaster from '@/components/common/Toaster';
import ScrollToTop from '@/components/common/ScrollToTop';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { ThemeProvider } from '@/context/ThemeContext';

export default function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <StoreProvider>
        <ThemeProvider>
          <UIProvider>
            <AuthProvider>
              <OrderProvider>
                <CartProvider>
                  <WishlistProvider>
                    <CompareProvider>
                      <ScrollToTop />
                      <AppRoutes />
                      <Toaster />
                    </CompareProvider>
                  </WishlistProvider>
                </CartProvider>
              </OrderProvider>
            </AuthProvider>
          </UIProvider>
        </ThemeProvider>
        </StoreProvider>
      </ErrorBoundary>
    </Router>
  );
}
