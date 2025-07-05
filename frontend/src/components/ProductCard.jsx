import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product, onWishlistUpdate }) {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  
  const isProductInWishlist = isInWishlist(product.id);

  const handleWishlistToggle = (e) => {
    e.stopPropagation(); e.preventDefault();
    if (isProductInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
    if (onWishlistUpdate) onWishlistUpdate();
  };
  
  const handleAddToCart = (e) => {
    e.stopPropagation(); e.preventDefault();
    addToCart(product);
  };

  return (

    <div className="relative border border-slate-700 rounded-lg shadow-lg hover:shadow-cyan-500/20 hover:-translate-y-1 transition-all duration-300 bg-black group flex flex-col">
      
      <button 
        onClick={handleWishlistToggle} 
        className="absolute top-3 right-3 z-10 p-2 bg-slate-700/50 rounded-full hover:bg-slate-600 transition-colors" 
        aria-label="Toggle Wishlist"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill={isProductInWishlist ? 'rgb(239 68 68)' : 'none'} viewBox="0 0 24 24" stroke={isProductInWishlist ? 'rgb(239 68 68)' : 'currentColor'} strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 015.13-1.354L12 6l2.552-1.036a4.5 4.5 0 015.13 1.354l.001.001a4.5 4.5 0 01-1.354 6.363L12 21l-7.318-7.318a4.5 4.5 0 01-1.354-6.363z" />
        </svg>
      </button>

      <img 
        src={product.image || 'https://placehold.co/600x400/2D3748/718096?text=No+Image'} 
        alt={product.name} 
        className="w-full h-48 object-cover rounded-t-lg" 
      />
      
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-white mb-2 truncate flex-grow">{product.name}</h3>
        <p className="text-lg font-semibold text-gray-300 mb-4">Rs {parseFloat(product.price).toFixed(2)}</p>
        <button onClick={handleAddToCart} className="w-full bg-zinc-800 text-white font-bold p-3 rounded-md hover:bg-cyan-700 transition mt-auto">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
