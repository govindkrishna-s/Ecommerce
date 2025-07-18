import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WishlistProvider, useWishlist } from './context/WishlistContext';
import { CartProvider, useCart } from './context/CartContext';
import SignInPage from './pages/SignInPage';
import SignupPage from './pages/SignupPage';
import OrderPage from './pages/OrderPage';
import HomePage from './pages/HomePage';
import Layout from './components/Layout';
import WishlistPage from './pages/WishlistPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/signin" />;
}

function InitialDataFetcher() {
    const { fetchCart } = useCart();
    const { fetchWishlist } = useWishlist();
    const token = localStorage.getItem('accessToken');
    useEffect(() => {

        if (token) {
            fetchCart();
            fetchWishlist();
        }
    }, [token, fetchCart, fetchWishlist]); 

    return null; 
}

export default function App() {
  return (
    <WishlistProvider>
      <CartProvider>
        <BrowserRouter>
          <InitialDataFetcher />
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/wishlist" element={<WishlistPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrderPage /></ProtectedRoute>} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </CartProvider>
    </WishlistProvider>
  );
}
