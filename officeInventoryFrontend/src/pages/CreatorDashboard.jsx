/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

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
  }, []);

  const handleSubmit = async (orderId) => {
    try {
      await api.post(`/orders/${orderId}/submit`);
      toast.success('Order submitted successfully');
      const response = await api.get('/orders/my-orders');
      setOrders(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to submit order');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      DRAFT: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      SUBMITTED: 'bg-blue-100 text-blue-800 border border-blue-200',
      COMPLETED: 'bg-green-100 text-green-800 border border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border border-red-200'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-500 mt-1">Manage your purchase requests</p>
        </div>
        <button
          onClick={() => navigate('/create-order')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
        >
          + Create New Order
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-gray-700">No Orders Yet</h3>
          <p className="text-gray-400 mt-2">Create your first order to get started</p>
          <button
            onClick={() => navigate('/create-order')}
            className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Create Order
          </button>
        </div>
      ) : (
        <div className="grid gap-5">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 p-6">
              <div className="flex flex-wrap justify-between items-start gap-4">
                {/* Left side - Order Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <span className="text-xl font-bold text-gray-800">#{order.id}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                    {order.expiryDate && new Date(order.expiryDate) < new Date() && order.status === 'DRAFT' && (
                      <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                        Expired
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-3">
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium w-20">Expires:</span>
                      <span>{new Date(order.expiryDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium w-20">Created:</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium w-20">Items:</span>
                      <span>{order.items.length} item(s)</span>
                    </div>
                  </div>
                  
                  {/* Items tags */}
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700">
                        {item.itemName} <span className="font-semibold">({item.quantity})</span>
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Right side - Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/order/${order.id}`)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-700 font-medium text-sm"
                  >
                    View
                  </button>
                  {order.status === 'DRAFT' && (
                    <>
                      <button
                        onClick={() => navigate(`/edit-order/${order.id}`)}
                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition text-white font-medium text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleSubmit(order.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-white font-medium text-sm"
                      >
                        Submit
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard;