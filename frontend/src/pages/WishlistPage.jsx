import { useWishlist } from '../context/WishlistContext'; 
import ProductCard from '../components/ProductCard';

export default function WishlistPage() {
  const { wishlist } = useWishlist(); 

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-5xl text-center my-10">MY WISHLIST</h1>
      {wishlist.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {wishlist.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="text-center text-xl text-slate-400 mt-10">Your wishlist is empty.</p>
      )}
    </div>
  );
}