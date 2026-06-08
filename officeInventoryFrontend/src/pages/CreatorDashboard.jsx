/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { getStatusColor } from '../utils/statusColors';

const CreatorDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/my-orders');
        setOrders(response.data);
      } catch (error) {
        toast.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []); // Empty dependency array - runs only once on mount

  const handleSubmit = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/submit`);
      toast.success('Order submitted successfully');
      
      // Refetch orders after submit
      const response = await api.get('/orders/my-orders');
      setOrders(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit order');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found. Create your first order!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Order ID</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Expiry Date</th>
                <th className="px-6 py-3 text-left">Created At</th>
                <th className="px-6 py-3 text-left">Items</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3">{order.id}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">{new Date(order.expiryDate).toLocaleDateString()}</td>
                  <td className="px-6 py-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-3">
                    {order.items.map((item, idx) => (
                      <div key={idx}>{item.itemName}: {item.quantity}</div>
                    ))}
                  </td>
                  <td className="px-6 py-3">
                    <button
                      onClick={() => navigate(`/order/${order.id}`)}
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                    >
                      View
                    </button>
                    {order.status === 'DRAFT' && (
                      <>
                        <button
                          onClick={() => navigate(`/edit-order/${order.id}`)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleSubmit(order.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        >
                          Submit
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
           </table>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard;