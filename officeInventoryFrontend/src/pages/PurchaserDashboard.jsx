/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { getStatusColor } from '../utils/statusColors';

const PurchaserDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get('/orders/submitted');
        setOrders(response.data);
      } catch (error) {
        toast.error('Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);

  const handleComplete = async (orderId, transactionRef) => {
    const ref = prompt('Enter transaction reference:', `PO-${Date.now()}`);
    if (!ref) return;
    
    try {
      await api.post(`/orders/${orderId}/complete`, { transactionReference: ref });
      toast.success('Order completed successfully');
      
      // Refresh orders
      const response = await api.get('/orders/submitted');
      setOrders(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to complete order');
    }
  };

  const handleReject = async (orderId) => {
    const note = prompt('Enter rejection reason:');
    if (!note) return;
    
    try {
      await api.post(`/orders/${orderId}/reject`, { note });
      toast.success('Order rejected successfully');
      
      // Refresh orders
      const response = await api.get('/orders/submitted');
      setOrders(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject order');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Submitted Orders</h1>
      
      {orders.length === 0 ? (
        <p className="text-gray-500">No submitted orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Order ID</th>
                <th className="px-6 py-3 text-left">Created By</th>
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
                  <td className="px-6 py-3">{order.createdByUsername}</td>
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
                    {order.status === 'SUBMITTED' && (
                      <>
                        <button
                          onClick={() => handleComplete(order.id)}
                          className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleReject(order.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        >
                          Reject
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

export default PurchaserDashboard;