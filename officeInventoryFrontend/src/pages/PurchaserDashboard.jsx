/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

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

  const handleComplete = async (orderId) => {
    const ref = prompt('Enter transaction reference (e.g., PO-2026-001):');
    if (!ref) return;
    
    try {
      await api.post(`/orders/${orderId}/complete`, { transactionReference: ref });
      toast.success('Order completed successfully');
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
      const response = await api.get('/orders/submitted');
      setOrders(response.data);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject order');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submitted Orders</h1>
        <p className="text-gray-500 mt-1">Review and process purchase requests</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-700">No Pending Orders</h3>
          <p className="text-gray-400 mt-2">All submitted orders have been processed</p>
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
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-sm mb-3">
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium w-24">Created By:</span>
                      <span className="text-blue-600 font-medium">{order.createdByUsername}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium w-24">Expires:</span>
                      <span>{new Date(order.expiryDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium w-24">Created:</span>
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span className="font-medium w-24">Items:</span>
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

                  {/* Rejection note if rejected */}
                  {order.rejectionNote && (
                    <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                      <p className="text-sm text-red-700">
                        <span className="font-semibold">Rejection Reason:</span> {order.rejectionNote}
                      </p>
                    </div>
                  )}
                </div>
                
                {/* Right side - Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/order/${order.id}`)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-gray-700 font-medium text-sm"
                  >
                    View
                  </button>
                  {order.status === 'SUBMITTED' && (
                    <>
                      <button
                        onClick={() => handleComplete(order.id)}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-white font-medium text-sm"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => handleReject(order.id)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-white font-medium text-sm"
                      >
                        Reject
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

export default PurchaserDashboard;