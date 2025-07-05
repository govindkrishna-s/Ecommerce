import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { wishlist } = useWishlist();
  const { cartCount, logout } = useCart();
  const token = localStorage.getItem('accessToken');
  

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
 
    logout();
    navigate('/signin');
  };

  const NavLinks = () => (
    <>
      <Link to="/" className="hover:text-cyan-300 transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
      <Link to="/wishlist" className="relative hover:text-cyan-300 transition-colors" onClick={() => setIsMenuOpen(false)}>
        Wishlist
        {wishlist.length > 0 && <span className="absolute -top-2 -left-4 bg-red-600 text-xs text-white rounded-full h-5 w-5 flex items-center justify-center">{wishlist.length}</span>}
      </Link>
      {token ? (
        <>
          <Link to="/orders" className="hover:text-cyan-300 transition-colors" onClick={() => setIsMenuOpen(false)}>Orders</Link>
          <button onClick={handleLogout} className="hover:text-red-600 transition-colors">Logout</button>
        </>
      ) : (
        <>
          <Link to="/signin" className="hover:text-cyan-300 transition-colors" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
          <Link to="/signup" className="hover:text-cyan-300 transition-colors" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
        </>
      )}
    </>
  );

  return (
    <nav className="bg-black text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">

        <Link to="/" className="text-2xl font-bold text-white hover:text-cyan-300 transition-colors">
          E-Commerce
        </Link>


        <div className="hidden md:flex items-center space-x-6 text-lg">
          <NavLinks />
        </div>

        <div className="flex items-center">
  
            <Link to="/cart" className="relative hover:text-cyan-300 transition-colors mr-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                {cartCount > 0 && <span className="absolute -top-2 -right-3 bg-red-600 text-xs text-white rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>}
            </Link>

 
            <div className="md:hidden hover:text-cyan-300">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? (

                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (

                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                )}
            </button>
            </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden mt-4">
          <div className="flex flex-col items-center space-y-4 text-lg">
            <NavLinks />
          </div>
        </div>
      )}
    </nav>
  );
}
