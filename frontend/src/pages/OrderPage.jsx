import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function OrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/');
        setOrders(response.data);
      } catch (err) {
        setError('Failed to fetch orders.');
        console.error("Error fetching orders:", err.response || err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);
  
  if (loading) return <div className="text-center p-10 text-white">Loading your orders...</div>;
  if (error) return <div className="text-center text-red-500 p-10">{error}</div>;

  return (
    <div className="container mx-auto p-6 text-white">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-black text-5xl ">MY ORDERS</h1>
      </div>
      
      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-zinc-900 p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold">Order #{order.id}</h2>
                  <p className="text-sm text-slate-400">
                    Transaction ID: {order.transaction_id || 'N/A'}
                  </p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold">${parseFloat(order.get_cart_total).toFixed(2)}</p>
                    <span className="text-sm px-2 py-1 bg-green-800 text-green-300 rounded-full">
                        {order.completed ? 'Completed' : 'Processing'}
                    </span>
                </div>
              </div>
              <hr className="border-slate-700 my-4" />
              <div>
                <h3 className="font-semibold mb-2">Items ({order.get_cart_items}):</h3>
                {order.orderitems.map(item => (
                    <div key={item.product.id} className="flex justify-between text-slate-300 py-1">
                        <span>{item.product.name} (x{item.quantity})</span>
                        <span>${parseFloat(item.get_total).toFixed(2)}</span>
                    </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-xl text-slate-400">You have no past orders.</p>
      )}
    </div>
  );
}