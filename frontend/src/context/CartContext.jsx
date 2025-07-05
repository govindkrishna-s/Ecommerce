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

  const fetchCart = useCallback(async () => {
    if (!localStorage.getItem('accessToken')) {
        setCartItems([]);
        setCartTotal(0);
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/cart/');
      setCartItems(response.data.orderitems || []);
      setCartTotal(response.data.get_cart_total || 0);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setCartItems([]);
        setCartTotal(0);
      } else {
        console.error("Failed to fetch cart", err);
        setError("Could not load cart.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = async (product) => {
    if (!localStorage.getItem('accessToken')) {
        alert("Please log in to add items to your cart.");
        return;
    }
    try {
      await api.post('/cart/update/', {
        productId: product.id,
        action: 'add',
      });
      await fetchCart();
    } catch (err) {
      console.error("Failed to add to cart", err);
      alert("Failed to add item to cart. Please try again.");
    }
  };

  const decreaseQuantity = async (productId) => {
    try {
      await api.post('/cart/update/', { productId: productId, action: 'remove' });
      await fetchCart();
    } catch (err) {
      console.error("Failed to decrease quantity", err);
      alert("Failed to update cart.");
    }
  };
  
  const clearItemFromCart = async (productId, quantity) => {
    try {
        for (let i = 0; i < quantity; i++) {
            await api.post('/cart/update/', { productId: productId, action: 'remove' });
        }
        await fetchCart();
    } catch (err) {
        console.error("Failed to remove item from cart", err);
        alert("Failed to remove item.");
    }
  };


  const clearCart = async () => {
   
    try {
        for (const item of cartItems) {
            for (let i = 0; i < item.quantity; i++) {
                await api.post('/cart/update/', { productId: item.product.id, action: 'remove' });
            }
        }
        await fetchCart(); 
    } catch (err) {
        console.error("Failed to clear cart", err);
        alert("Could not clear the cart. Please try again.");
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
    cartItems,
    loading,
    error,
    fetchCart,
    addToCart,
    decreaseQuantity,
    clearItemFromCart,
    clearCart, 
    cartCount,
    cartTotal,
    logout,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
