import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SignInPage() {

  const [formData, setFormData] = useState({
    username: '',
    password: '',

  });
  const navigate = useNavigate()
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    setLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/token/', {
        username: formData.username,
        password: formData.password,
      });

      if (response.data.access && response.data.refresh) {
        localStorage.setItem('accessToken', response.data.access);
        localStorage.setItem('refreshToken', response.data.refresh);
        

        navigate('/')

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
            <p className="text-black text-center mt-5">Don't have an account? <a href="/signup" className='text-blue-500 hover:text-blue-800'>SignUp</a></p>

        </form>
      </div>
    </div>
  );
}

export default SignInPage;