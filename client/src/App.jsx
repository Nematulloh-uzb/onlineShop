import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout/Layout.jsx';
import LoadingSpinner from './components/UI/LoadingSpinner.jsx';
import RequireAuth from './components/UI/RequireAuth.jsx';

// Lazy-load sahifalar
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const CatalogPage = lazy(() => import('./pages/CatalogPage.jsx'));
const ProductPage = lazy(() => import('./pages/ProductPage.jsx'));
const CartPage = lazy(() => import('./pages/CartPage.jsx'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage.jsx'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const WishlistPage = lazy(() => import('./pages/WishlistPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="katalog" element={<CatalogPage />} />
          <Route path="katalog/:categorySlug" element={<CatalogPage />} />
          <Route path="mahsulot/:slug" element={<ProductPage />} />
          <Route element={<RequireAuth />}>
            <Route path="savat" element={<CartPage />} />
            <Route path="tolov" element={<CheckoutPage />} />
            <Route path="buyurtma/:orderNumber" element={<OrderSuccessPage />} />
            <Route path="profil" element={<ProfilePage />} />
            <Route path="istaklar" element={<WishlistPage />} />
          </Route>
          <Route path="kirish" element={<LoginPage />} />
          <Route path="royxat" element={<RegisterPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
