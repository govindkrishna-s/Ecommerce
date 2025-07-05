import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function SignUpPage() {

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    password2: '', 
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
    setSuccess(null);

    if (formData.password !== formData.password2) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {

      const response = await axios.post('http://127.0.0.1:8000/api/register/', {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      
      setSuccess('Registration successful! You can now log in.');

      setFormData({ username: '', email: '', phone: '', password: '', password2: '' });
      navigate('/signin')

    } catch (err) {
      if (err.response && err.response.data) {

        const apiErrors = err.response.data;
        const errorMessage = Object.values(apiErrors).flat().join(' ');
        setError(errorMessage || 'Registration failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center shadow-xl">
      <div className="bg-white p-8 rounded-t-lg shadow-xl/30 w-full max-w-lg">
        <h2 className="text-3xl font-bold text-black text-center mb-6">Create an Account</h2>
        
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
            <label className="block text-black mb-2" htmlFor="email">Email</label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 bg-white text-black rounded-md outline-1 focus:ring-2 focus:ring-black"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-black mb-2" htmlFor="phone">Phone</label>
            <input
              type="text"
              name="phone"
              id="phone"
              value={formData.phone}
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


          <div className="mb-6">
            <label className="block text-black mb-2" htmlFor="password2">Confirm Password</label>
            <input
              type="password"
              name="password2"
              id="password2"
              value={formData.password2}
              onChange={handleChange}
              className="w-full p-3 bg-white text-black rounded-md outline-1 focus:ring-2 focus:ring-black"
              required
            />
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && <p className="text-green-500 text-center mb-4">{success}</p>}


          <button
            type="submit"
            className="w-full bg-gray-950 text-white font-bold p-3 rounded-md hover:bg-gray-800 transition duration-300 disabled:bg-slate-500"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
          <p className="text-black text-center mt-5">Already a user? <a href="/signin" className='text-blue-500 hover:text-blue-800'>Signin</a></p>
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;