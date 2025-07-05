import { createContext, useState, useContext, useCallback } from 'react';
import api from '../api/axiosConfig';

const WishlistContext = createContext();

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = useCallback(async () => {
    if (!localStorage.getItem('accessToken')) {
        setWishlist([]);
        return;
    }
    try {
      const { data } = await api.get('/wishlist/');
      setWishlist(data || []);
    } catch (error) {
      console.error("Failed to fetch wishlist", error);
      setWishlist([]); // Clear wishlist on error
    }
  }, []);

  const addToWishlist = useCallback(async (product) => {
    try {
      await api.post('/wishlist/add/', { product_id: product.id });
      await fetchWishlist(); // Refetch to sync state
    } catch (error) {
      console.error("Failed to add to wishlist", error);
    }
  }, [fetchWishlist]);

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      await api.post('/wishlist/remove/', { product_id: productId });
      await fetchWishlist(); // Refetch to sync state
    } catch (error) {
      console.error("Failed to remove from wishlist", error);
    }
  }, [fetchWishlist]);

  const isInWishlist = useCallback((productId) => {
    // Check against the product object nested in the wishlist item
    return wishlist.some((item) => item.product.id === productId);
  }, [wishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  const value = {
    wishlist,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}