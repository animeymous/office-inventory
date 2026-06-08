/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const PurchaserDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ submitted: 0, completed: 0, rejected: 0 });
  const navigate = useNavigate();

  // Helper function for expiry check
  const isExpiringSoon = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(now.getDate() + 3);
    
    return expiry < threeDaysFromNow && expiry > now;
  };

  // Function to fetch orders and update stats
  const fetchOrders = async () => {
    try {
      // Change this line:
      const response = await api.get('/orders/all-for-purchaser');
      setOrders(response.data);
      
      const newStats = { submitted: 0, completed: 0, rejected: 0 };
      response.data.forEach(order => {
        if (order.status === 'SUBMITTED') newStats.submitted++;
        else if (order.status === 'COMPLETED') newStats.completed++;
        else if (order.status === 'REJECTED') newStats.rejected++;
      });
      setStats(newStats);
    } catch (error) {
      toast.error('Failed to fetch orders');
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadOrders = async () => {
      await fetchOrders();
      if (isMounted) {
        setLoading(false);
      }
    };
    loadOrders();
    return () => { isMounted = false; };
  }, []);

  const handleComplete = async (orderId) => {
    const ref = prompt('Enter transaction reference (e.g., PO-2026-001):');
    if (!ref) return;
    
    try {
      await api.post(`/orders/${orderId}/complete`, { transactionReference: ref });
      toast.success('Order completed successfully');
      // Refresh orders and stats after completion
      await fetchOrders();
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
      // Refresh orders and stats after rejection
      await fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to reject order');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      SUBMITTED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
      COMPLETED: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  const getStatusIcon = (status) => {
    const icons = {
      SUBMITTED: '📤',
      COMPLETED: '✅',
      REJECTED: '❌'
    };
    return icons[status] || '📋';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  // Separate orders by status for better organization
  const pendingOrders = orders.filter(o => o.status === 'SUBMITTED');
  const completedOrders = orders.filter(o => o.status === 'COMPLETED');
  const rejectedOrders = orders.filter(o => o.status === 'REJECTED');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Purchase Requests</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Review and process pending orders</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border-l-4 border-blue-500 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Pending Approval</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.submitted}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                <span className="text-2xl">📤</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border-l-4 border-green-500 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Completed</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-5 border-l-4 border-red-500 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Rejected</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center">
                <span className="text-2xl">❌</span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center transition-colors duration-200">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">No Orders Found</h3>
            <p className="text-gray-400 dark:text-gray-500 mt-2">No purchase requests available</p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Pending Orders Section */}
            {pendingOrders.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pending Approval ({pendingOrders.length})
                </h2>
                
                {pendingOrders.map((order) => (
                  <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="p-6">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <span className="text-xl font-bold text-gray-800 dark:text-white">#{order.id}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>
                              {getStatusIcon(order.status)} {order.status}
                            </span>
                            {order.expiryDate && new Date(order.expiryDate) < new Date() && (
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full text-xs font-medium">
                                ⚠️ Expired
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm mb-3">
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span>By: <span className="font-semibold text-blue-600 dark:text-blue-400">{order.createdByUsername}</span></span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span>Expires: {new Date(order.expiryDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center text-gray-600 dark:text-gray-400">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                              </svg>
                              <span>{order.items.length} item(s)</span>
                            </div>
                          </div>
                          
                          {/* Items tags */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {order.items.map((item, idx) => (
                              <span key={idx} className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm text-gray-700 dark:text-gray-300">
                                {item.itemName} <span className="font-semibold">({item.quantity})</span>
                              </span>
                            ))}
                          </div>

                          {/* Urgency indicator */}
                          {order.expiryDate && isExpiringSoon(order.expiryDate) && (
                            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Expiring soon! Please process urgently.</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/order/${order.id}`)}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition text-gray-700 dark:text-gray-300 font-medium text-sm flex items-center gap-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </button>
                          <>
                            <button
                              onClick={() => handleComplete(order.id)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-white font-medium text-sm flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(order.id)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition text-white font-medium text-sm flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Reject
                            </button>
                          </>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Completed Orders Section */}
            {completedOrders.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mt-8 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Completed ({completedOrders.length})
                </h2>
                
                {completedOrders.map((order) => (
                  <div key={order.id} className="bg-green-50 dark:bg-green-900/20 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                    <div className="p-5">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="text-lg font-bold text-gray-700 dark:text-gray-300">#{order.id}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>
                              {getStatusIcon(order.status)} {order.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>By: {order.createdByUsername}</span>
                            <span>Items: {order.items.length}</span>
                            {order.transactionReference && <span>Ref: {order.transactionReference}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/order/${order.id}`)}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition text-gray-700 dark:text-gray-300 font-medium text-sm"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Rejected Orders Section */}
            {rejectedOrders.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mt-8 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Rejected ({rejectedOrders.length})
                </h2>
                
                {rejectedOrders.map((order) => (
                  <div key={order.id} className="bg-red-50 dark:bg-red-900/20 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                    <div className="p-5">
                      <div className="flex flex-wrap justify-between items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="text-lg font-bold text-gray-700 dark:text-gray-300">#{order.id}</span>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(order.status)}`}>
                              {getStatusIcon(order.status)} {order.status}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span>By: {order.createdByUsername}</span>
                            <span>Items: {order.items.length}</span>
                            {order.rejectionNote && <span className="text-red-500">Reason: {order.rejectionNote}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/order/${order.id}`)}
                          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition text-gray-700 dark:text-gray-300 font-medium text-sm"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PurchaserDashboard;