import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const navigate = useNavigate();
  const { wishlist, clearWishlist } = useWishlist();
  const { cartCount, logout } = useCart();
  const token = localStorage.getItem('accessToken');
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchContainerRef = useRef(null);

  const handleLogout = () => {
    logout();
    clearWishlist();
    navigate('/signin');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsMenuOpen(false);
      setIsSearchExpanded(false); 
      navigate(`/?search=${searchQuery}`);
      setSearchQuery(''); 
    }
  };

    useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

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
      <div className="container mx-auto flex justify-between items-center gap-2">
        <Link to="/" className="text-2xl font-bold text-white hover:text-cyan-300 transition-colors">
          E-Commerce
        </Link>

 
        <div className="hidden md:flex items-center space-x-6 text-lg">
          <NavLinks />
        </div>

        <div className="flex items-center gap-4">
 
          <form onSubmit={handleSearch} ref={searchContainerRef} className="hidden md:flex items-center bg-zinc-800 rounded-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."

              className={`bg-transparent text-white outline-none transition-all duration-300 ease-in-out ${isSearchExpanded ? 'w-48 px-4 py-1' : 'w-0 p-0'}`}
            />
            <button
              type={searchQuery ? 'submit' : 'button'}
              onClick={() => setIsSearchExpanded(true)}
              className="p-2 text-white hover:text-cyan-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </form>


          <Link to="/cart" className="relative hover:text-cyan-300 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {cartCount > 0 && <span className="absolute -top-2 -right-3 bg-red-600 text-xs text-white rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>}
          </Link>
          

          <div className="md:hidden hover:text-cyan-300">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden mt-4">
          <form onSubmit={handleSearch} className="flex mb-4">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search..." className="w-full p-2 bg-zinc-800 text-white rounded-l-md focus:outline-none" />
            <button type="submit" className="bg-zinc-600 p-2 rounded-r-md hover:bg-cyan-700"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></button>
          </form>
          <div className="flex flex-col items-center space-y-4 text-lg">
            <NavLinks />
          </div>
        </div>
      )}
    </nav>
  );
}