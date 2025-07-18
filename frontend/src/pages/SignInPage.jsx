import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useCart } from '../context/CartContext';

function SignInPage() {
  const { fetchCart } = useCart();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const mergeCarts = async () => {
    const guestCart = JSON.parse(localStorage.getItem('cart')) || [];
    if (guestCart.length > 0) {
      console.log("Merging guest cart with backend...");
      const mergePromises = guestCart.map(item => {
        const itemPromises = [];
        for (let i = 0; i < item.quantity; i++) {
          itemPromises.push(api.post('/cart/update/', { productId: item.product.id, action: 'add' }));
        }
        return Promise.all(itemPromises);
      });
      await Promise.all(mergePromises);
      localStorage.removeItem('cart');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await api.post('/token/', {
        username: formData.username,
        password: formData.password,
      });
      if (response.data.access) {
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access}`;
        
        await mergeCarts();
        await fetchCart();
        
        navigate('/');
      }
    } catch (err) {
      setError('Invalid username or password. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center shadow-xl">
      <div className="bg-white p-8 rounded-t-lg shadow-xl/30 w-full max-w-md">
        <h2 className="text-3xl font-bold text-black text-center mb-6">Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-black mb-2" htmlFor="username">Username</label>
            <input
              type="text"
              name="username"
              id="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-3 bg-white text-black rounded-md outline-1 focus:ring-2 focus:ring-black"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-black mb-2" htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 bg-white text-black rounded-md outline-1 focus:ring-2 focus:ring-black"
              required
            />
          </div>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gray-950 text-white font-bold p-3 rounded-md hover:bg-gray-800 transition duration-300 disabled:bg-slate-500"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          <p className="text-black text-center mt-5">
            Don't have an account? <Link to="/signup" className='text-blue-500 hover:text-blue-800'>SignUp</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
export default SignInPage;