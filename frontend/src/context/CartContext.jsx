import { createContext, useState, useContext, useCallback } from 'react';
import api from '../api/axiosConfig';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}
export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateGuestCart = (newCartItems) => {
    localStorage.setItem('cart', JSON.stringify(newCartItems));
    setCartItems(newCartItems);
    const total = newCartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    setCartTotal(total);
  };

  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    setLoading(true);
    setError(null);

    if (token) { 
      try {
        const response = await api.get('/cart/');
        setCartItems(response.data.orderitems || []);
        setCartTotal(response.data.get_cart_total || 0);
      } catch (err) {
        if (err.response?.status === 404) {
          setCartItems([]);
          setCartTotal(0);
        } else {
          console.error("Failed to fetch user cart", err);
          setError("Could not load your cart.");
        }
      }
    } else { 
      try {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        updateGuestCart(storedCart);
      } catch (e) {
        console.error("Failed to parse guest cart", e);
        updateGuestCart([]);
      }
    }
    setLoading(false);
  }, []);

  const addToCart = async (product) => {
    const token = localStorage.getItem('accessToken');
    if (token) { 
      try {
        await api.post('/cart/update/', { productId: product.id, action: 'add' });
        await fetchCart();
      } catch (err) {
        console.error("Failed to add to cart", err);
      }
    } else { 
      const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
      const existingItem = currentCart.find(item => item.product.id === product.id);
      let newCart;
      if (existingItem) {
        newCart = currentCart.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newCart = [...currentCart, { product: product, quantity: 1, id: `guest_${product.id}` }];
      }
      updateGuestCart(newCart);
    }
  };

  const decreaseQuantity = async (productId) => {
    const token = localStorage.getItem('accessToken');
    if (token) { 
      try {
        await api.post('/cart/update/', { productId, action: 'remove' });
        await fetchCart();
      } catch (err) {
        console.error("Failed to decrease quantity", err);
      }
    } else { 
      const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
      const newCart = currentCart.map(item =>
        item.product.id === productId ? { ...item, quantity: Math.max(0, item.quantity - 1) } : item
      ).filter(item => item.quantity > 0); 
      updateGuestCart(newCart);
    }
  };

  const clearItemFromCart = async (productId) => {
    const token = localStorage.getItem('accessToken');
    if (token) { 
      const itemToClear = cartItems.find(item => item.product.id === productId);
      if (!itemToClear) return;
      try {
        for (let i = 0; i < itemToClear.quantity; i++) {
          await api.post('/cart/update/', { productId, action: 'remove' });
        }
        await fetchCart();
      } catch (err) {
        console.error("Failed to clear item", err);
      }
    } else { 
      const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
      const newCart = currentCart.filter(item => item.product.id !== productId);
      updateGuestCart(newCart);
    }
  };

  const clearCart = () => {

    setCartItems([]);
    setCartTotal(0);
    if (!localStorage.getItem('accessToken')) {
        localStorage.removeItem('cart');
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setCartItems([]);
    setCartTotal(0);
  };

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cartItems, loading, error, fetchCart, addToCart, decreaseQuantity,
    clearItemFromCart, clearCart, cartCount, cartTotal, logout
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}