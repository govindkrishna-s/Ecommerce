import { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function CartPage() {
  const { cartItems, fetchCart, cartTotal, loading, addToCart, decreaseQuantity, clearItemFromCart } = useCart();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  if (loading && cartItems.length === 0) {
    return <div className="text-center p-10 text-white">Loading Cart...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-5xl font-bold text-center my-10">Shopping Cart</h1>
      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center bg-black p-4 rounded-lg shadow-md">
                <img src={item.product.image || 'https://placehold.co/100x100'} alt={item.product.name} className="w-24 h-24 object-cover rounded-md mr-4" />
                <div className="flex-grow">
                  <h3 className="text-white text-xl font-semibold">{item.product.name}</h3>
                  <p className="text-gray-300">Rs {parseFloat(item.product.price).toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-zinc-900 flex items-center rounded-lg ">
                    <button onClick={() => decreaseQuantity(item.product.id)} className="rounded-lg text-white px-3 py-1  hover:bg-zinc-700">-</button>
                    <span className="text-white px-4 py-1">{item.quantity}</span>
                    <button onClick={() => addToCart(item.product)} className="text-white  px-3 py-1 hover:bg-zinc-700 rounded-lg">+</button>
                  </div>
                  <button onClick={() => clearItemFromCart(item.product.id, item.quantity)} className="text-red-500 hover:text-red-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="lg:col-span-1 bg-zinc-900 p-6 rounded-lg shadow-md h-fit">
            <h2 className="text-white text-2xl font-bold mb-6">Order Summary</h2>
            <div className="text-white flex justify-between mb-4 text-lg">
              <span>Subtotal</span>
              <span>Rs {cartTotal.toFixed(2)}</span>
            </div>
            <div className="text-white flex justify-between mb-4 text-lg">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <hr className="border-slate-600 my-4" />
            <div className="text-white flex justify-between mb-6 text-xl font-bold">
              <span>Total</span>
              <span>Rs {cartTotal.toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="block text-center w-full bg-cyan-600 text-white font-bold p-4 rounded-md hover:bg-cyan-700 transition">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xl text-slate-400">Your cart is empty.</p>
          <Link to="/" className="mt-4 inline-block bg-cyan-600 text-white font-bold py-3 px-6 rounded-md hover:bg-cyan-700 transition">
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
}