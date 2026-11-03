import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import PageLoader from '@/components/common/PageLoader';
import { useAuth } from '@/context/AuthContext';

const Home = lazy(() => import('@/pages/Home/HomePage'));
const Shop = lazy(() => import('@/pages/Shop/ShopPage'));
const Categories = lazy(() => import('@/pages/Shop/CategoriesPage'));
const ProductDetails = lazy(() => import('@/pages/ProductDetails/ProductDetailsPage'));
const Cart = lazy(() => import('@/pages/Cart/CartPage'));
const Wishlist = lazy(() => import('@/pages/Wishlist/WishlistPage'));
const Compare = lazy(() => import('@/pages/Compare/ComparePage'));
const Checkout = lazy(() => import('@/pages/Checkout/CheckoutPage'));
const OrderConfirmation = lazy(() => import('@/pages/OrderConfirmation/OrderConfirmationPage'));
const Account = lazy(() => import('@/pages/Account/AccountPage'));
const Login = lazy(() => import('@/pages/Account/LoginPage'));
const OrderTracking = lazy(() => import('@/pages/OrderTracking/OrderTrackingPage'));
const Recipes = lazy(() => import('@/pages/Recipes/RecipesPage'));
const RecipeDetail = lazy(() => import('@/pages/Recipes/RecipeDetailPage'));
const About = lazy(() => import('@/pages/About/AboutPage'));
const Reviews = lazy(() => import('@/pages/Reviews/ReviewsPage'));
const Contact = lazy(() => import('@/pages/Contact/ContactPage'));
const Offers = lazy(() => import('@/pages/Offers/OffersPage'));
const ComboBuilder = lazy(() => import('@/pages/ComboBuilder/ComboBuilderPage'));
const SpiceFinder = lazy(() => import('@/pages/SpiceFinder/SpiceFinderPage'));
const Regional = lazy(() => import('@/pages/Regional/RegionalPage'));
const CategoryPage = lazy(() => import('@/pages/Category/CategoryPage'));
const RegionPage = lazy(() => import('@/pages/Regional/RegionPage'));
const Festivals = lazy(() => import('@/pages/Festivals/FestivalsPage'));
const FestivalPage = lazy(() => import('@/pages/Festivals/FestivalPage'));
const GiftBoxes = lazy(() => import('@/pages/GiftBoxes/GiftBoxesPage'));
const BulkOrders = lazy(() => import('@/pages/Bulk/BulkOrdersPage'));
const StoreLocator = lazy(() => import('@/pages/Stores/StoreLocatorPage'));
const Journal = lazy(() => import('@/pages/Journal/JournalPage'));
const Article = lazy(() => import('@/pages/Journal/ArticlePage'));
const Faq = lazy(() => import('@/pages/Faq/FaqPage'));
const Policy = lazy(() => import('@/pages/Legal/PolicyPage'));
const NotFound = lazy(() => import('@/pages/NotFound/NotFoundPage'));

const AdminLayout = lazy(() => import('@/components/admin/AdminLayout'));
const AdminInventory = lazy(() => import('@/pages/Admin/AdminInventoryPage'));
const AdminReviews = lazy(() => import('@/pages/Admin/AdminReviewsPage'));
const AdminLogin = lazy(() => import('@/pages/Admin/AdminLoginPage'));
const AdminOverview = lazy(() => import('@/pages/Admin/AdminOverviewPage'));
const AdminProducts = lazy(() => import('@/pages/Admin/AdminProductsPage'));
const AdminOrders = lazy(() => import('@/pages/Admin/AdminOrdersPage'));
const AdminCustomers = lazy(() => import('@/pages/Admin/AdminCustomersPage'));
const AdminCoupons = lazy(() => import('@/pages/Admin/AdminCouponsPage'));
const AdminContent = lazy(() => import('@/pages/Admin/AdminContentPage'));
const AdminSettings = lazy(() => import('@/pages/Admin/AdminSettingsPage'));

function RequireAdmin({ children }) {
  const { admin, ready } = useAuth();
  if (!ready) return <PageLoader />; // wait for the session to be restored from the refresh cookie
  return admin ? children : <Navigate to="/admin/login" replace />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="shop" element={<Shop />} />
          <Route path="categories" element={<Categories />} />
          <Route path="product/:slug" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="compare" element={<Compare />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation/:orderId" element={<OrderConfirmation />} />
          <Route path="account" element={<Account />} />
          <Route path="account/:tab" element={<Account />} />
          <Route path="login" element={<Login />} />
          <Route path="track-order" element={<OrderTracking />} />
          <Route path="track-order/:orderId" element={<OrderTracking />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="recipes/category/:category" element={<Recipes />} />
          <Route path="recipes/:slug" element={<RecipeDetail />} />
          <Route path="category/:slug" element={<CategoryPage />} />
          <Route path="regional/:slug" element={<RegionPage />} />
          <Route path="festivals" element={<Festivals />} />
          <Route path="festivals/:slug" element={<FestivalPage />} />
          <Route path="gift-boxes" element={<GiftBoxes />} />
          <Route path="bulk-orders" element={<BulkOrders />} />
          <Route path="store-locator" element={<StoreLocator />} />
          <Route path="journal" element={<Journal />} />
          <Route path="journal/:slug" element={<Article />} />
          <Route path="faq" element={<Faq />} />
          <Route path="shipping" element={<Policy page="shipping" key="shipping" />} />
          <Route path="returns" element={<Policy page="returns" key="returns" />} />
          <Route path="privacy" element={<Policy page="privacy" key="privacy" />} />
          <Route path="terms" element={<Policy page="terms" key="terms" />} />
          <Route path="about" element={<About />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="contact" element={<Contact />} />
          <Route path="offers" element={<Offers />} />
          <Route path="combo-builder" element={<ComboBuilder />} />
          <Route path="spice-finder" element={<SpiceFinder />} />
          <Route path="regional" element={<Regional />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<AdminOverview />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="content" element={<AdminContent />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
