import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider, useCart } from './context/CartContext';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
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


function InitialCartFetcher() {
    const { fetchCart } = useCart();
    const token = localStorage.getItem('accessToken');

    useEffect(() => {
        
        if (token) {
            fetchCart();
        }
    }, [token, fetchCart]);

    return null; 
}


export default function App() {
  return (
    <WishlistProvider>
      <CartProvider>
        <BrowserRouter>
          <InitialCartFetcher />
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/signin" element={<SignInPage />} />
              <Route path="/signup" element={<SignUpPage />} />
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
