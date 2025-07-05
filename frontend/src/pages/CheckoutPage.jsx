import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axiosConfig';

export default function CheckoutPage() {
  const { cartItems, cartTotal, fetchCart } = useCart();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    zipcode: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsRazorpayReady(true);
    script.onerror = () => setError("Could not load payment gateway.");
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePayment = async () => {

    setLoading(true);
    setError(null);

    if (!isRazorpayReady) {
        setError("Payment gateway is not ready. Please wait a moment.");
        setLoading(false);
        return;
    }
    if (!formData.address || !formData.city || !formData.state || !formData.zipcode) {
        setError("Please fill out all shipping details.");
        setLoading(false);
        return;
    }

    try {
      console.log("Requesting new Razorpay order from backend...");
      const { data: orderData } = await api.post('/payment/start/', {});
      console.log("Received new Razorpay Order ID:", orderData.order_id);

      const options = {
        key: orderData.razorpay_key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: orderData.name,
        description: orderData.description,
        order_id: orderData.order_id,
        handler: async function (response) {
            try {
                await api.post('/payment/success/', {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature,
                    shipping_address: formData,
                });
                alert('Payment successful! Your order has been placed.');
                await fetchCart();
                navigate('/orders');
            } catch (verificationError) {
                console.error("Payment verification failed:", verificationError);
                setError("Payment verification failed. Please contact support.");
            }
        },
        prefill: orderData.prefill,
        theme: { color: "#0891b2" },
        modal: {
            ondismiss: function() {
                console.log('Checkout form closed');
                setLoading(false);
            }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();

    } catch (err) {
      console.error("Failed to start payment:", err);
      setError("Could not initiate payment. Please try again.");
      setLoading(false); 
    }
  };

  if (cartItems.length === 0) {
    return (
        <div className="text-center container mx-auto p-6">
            <h1 className="text-3xl font-bold my-10">Your cart is empty.</h1>
            <button onClick={() => navigate('/')} className="bg-cyan-600 text-white font-bold py-3 px-6 rounded-md hover:bg-cyan-700 transition">
                Continue Shopping
            </button>
        </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-5xl font-bold text-center my-10">Checkout</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 className="text-3xl font-bold mb-6">Shipping Information</h2>
          <div className="space-y-6 bg-black p-8 rounded-lg">
            <div><label htmlFor="address" className="block text-white mb-2">Address</label><input type="text" name="address" id="address" value={formData.address} onChange={handleChange} className="w-full p-3 text-white bg-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500" required /></div>
            <div className="flex space-x-4"><div className="flex-1"><label htmlFor="city" className="block text-white mb-2">City</label><input type="text" name="city" id="city" value={formData.city} onChange={handleChange} className="w-full p-3 text-white bg-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500" required /></div><div className="flex-1"><label htmlFor="state" className="block text-white mb-2">State</label><input type="text" name="state" id="state" value={formData.state} onChange={handleChange} className="w-full p-3 text-white bg-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500" required /></div></div>
            <div><label htmlFor="zipcode" className="block text-white mb-2">Zip Code</label><input type="text" name="zipcode" id="zipcode" value={formData.zipcode} onChange={handleChange} className="w-full p-3 text-white bg-zinc-800 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-500" required /></div>
          </div>
        </div>
        <div className="bg-black p-8 rounded-lg h-fit">
          <h2 className="text-white text-3xl font-bold mb-6">Your Order</h2>
          <div className="text-white space-y-4 mb-6">{cartItems.map(item => (<div key={item.id} className="flex justify-between items-center"><div className="flex items-center"><img src={item.product.image || 'https://placehold.co/50x50'} alt={item.product.name} className="w-16 h-16 object-cover rounded-md mr-4"/><div className="w-40"><p className="font-semibold truncate">{item.product.name}</p><p className="text-sm text-gray-300">Qty: {item.quantity}</p></div></div><p>Rs {(item.product.price * item.quantity).toFixed(2)}</p></div>))}</div>
          <hr className="border-gray-400 my-4" />
          <div className="text-white flex justify-between text-xl font-bold"><span>Total</span><span>Rs {cartTotal.toFixed(2)}</span></div>
          {error && <p className="text-red-500 text-center mt-4 text-sm">{error}</p>}
          <button onClick={handlePayment} className="w-full bg-cyan-600 text-white font-bold p-4 rounded-md hover:bg-cyan-700 transition mt-8 disabled:bg-slate-500 disabled:cursor-not-allowed" disabled={loading || !isRazorpayReady}>
            {loading ? 'Processing...' : (isRazorpayReady ? 'Proceed to Payment' : 'Loading Gateway...')}
          </button>
        </div>
      </div>
    </div>
  );
}
