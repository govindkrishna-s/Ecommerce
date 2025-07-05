import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import api from '../api/axiosConfig';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const query = useQuery();
  const searchQuery = query.get('search');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
      
        const url = searchQuery 
          ? `/products/?search=${searchQuery}`
          : '/products/';
        
        const response = await api.get(url);
        setProducts(response.data);
      } catch (err) {
        setError('Failed to fetch products. The server might be down.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchQuery]);

  const handleScrollToProducts = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="container mx-auto p-6">
      {!searchQuery && (
        <div className="relative w-full h-[38rem] mb-20 grid">
          <img src="/images/banner.jpg" alt="Shopping banner" className="w-full h-full object-cover col-start-1 row-start-1" />
          <div className="col-start-1 row-start-1 bg-gradient-to-r from-black via-black/70 to-transparent flex flex-col justify-center items-start text-left p-8 md:p-16 lg:p-24">
            <div className="max-w-md">
              <h1 className="text-white text-4xl md:text-6xl font-bold drop-shadow-lg">Great Monsoon Deals are Here!</h1>
              <p className="text-slate-200 text-lg md:text-xl mt-4 drop-shadow-lg">Stay in and shop everything from home essentials to the latest gadgets. Fast delivery, rain or shine.</p>
              <button onClick={handleScrollToProducts} className="mt-8 bg-cyan-600 text-white font-bold py-3 px-8 rounded-md hover:bg-cyan-700 transition-transform duration-300 hover:scale-105">Shop the Sale</button>
            </div>
          </div>
        </div>
      )}
      
      <h1 className="text-5xl font-bold text-center my-10 text-black" id='products-section'>
        {searchQuery ? `Showing results for "${searchQuery}"` : 'Featured Products'}
      </h1>
      
      {loading ? (
        <div className="text-center p-10">Loading products...</div>
      ) : error ? (
        <div className="text-center text-red-500 p-10">{error}</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-xl text-slate-400">No products found.</p>
      )}
    </div>
  );
}