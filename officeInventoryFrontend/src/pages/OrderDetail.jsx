/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        if (isMounted) {
          setOrder(response.data);
        }
      } catch (error) {
        toast.error('Failed to fetch order details');
        navigate(-1);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchOrder();
    return () => { isMounted = false; };
  }, [id, navigate]);

  const getStatusConfig = (status) => {
    const configs = {
      DRAFT: { bg: 'bg-amber-100 dark:bg-amber-900/50', text: 'text-amber-800 dark:text-amber-300', icon: '✏️', label: 'Draft' },
      SUBMITTED: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-800 dark:text-blue-300', icon: '📤', label: 'Submitted' },
      COMPLETED: { bg: 'bg-green-100 dark:bg-green-900/50', text: 'text-green-800 dark:text-green-300', icon: '✅', label: 'Completed' },
      REJECTED: { bg: 'bg-red-100 dark:bg-red-900/50', text: 'text-red-800 dark:text-red-300', icon: '❌', label: 'Rejected' }
    };
    return configs[status] || configs.DRAFT;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!order) return null;

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>

        {/* Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-200 mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 px-6 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <p className="text-blue-100 dark:text-blue-300 text-sm">Order Details</p>
                <h1 className="text-2xl font-bold text-white">Order #{order.id}</h1>
              </div>
              <div className={`px-4 py-2 rounded-full ${statusConfig.bg} ${statusConfig.text} font-semibold flex items-center gap-2 shadow-sm`}>
                <span>{statusConfig.icon}</span>
                <span>{statusConfig.label}</span>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center transition-colors duration-200">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Created By</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{order.createdByUsername}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center transition-colors duration-200">
                    <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Created At</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center transition-colors duration-200">
                    <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Expiry Date</p>
                    <p className={`font-semibold ${new Date(order.expiryDate) < new Date() ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-white'}`}>
                      {new Date(order.expiryDate).toLocaleDateString()}
                      {new Date(order.expiryDate) < new Date() && <span className="ml-2 text-xs text-red-500 dark:text-red-400">(Expired)</span>}
                    </p>
                  </div>
                </div>

                {order.transactionReference && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center transition-colors duration-200">
                      <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Transaction Reference</p>
                      <p className="font-mono font-semibold text-gray-800 dark:text-white">{order.transactionReference}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rejection Note */}
            {order.rejectionNote && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl transition-colors duration-200">
                <div className="flex gap-3">
                  <div className="text-red-600 dark:text-red-400 text-xl">⚠️</div>
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-300">Rejection Reason</p>
                    <p className="text-red-700 dark:text-red-400 mt-1">{order.rejectionNote}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Items Section */}
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                Order Items
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl overflow-hidden transition-colors duration-200">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">#</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Item Name</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                        <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">{idx + 1}</td>
                        <td className="px-6 py-3 font-medium text-gray-800 dark:text-white">{item.itemName}</td>
                        <td className="px-6 py-3 text-right">
                          <span className="inline-flex items-center justify-center bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                            {item.quantity}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <td colSpan="2" className="px-6 py-3 text-right font-semibold text-gray-700 dark:text-gray-300">Total Items:</td>
                      <td className="px-6 py-3 text-right font-bold text-gray-900 dark:text-white">{order.items.length}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Additional Info for Completed Orders */}
            {order.status === 'COMPLETED' && order.transactionReference && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800">
                <div className="flex gap-3">
                  <div className="text-green-600 dark:text-green-400 text-xl">✅</div>
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-300">Order Completed</p>
                    <p className="text-green-700 dark:text-green-400 text-sm mt-1">
                      This order has been processed with reference number: <span className="font-mono">{order.transactionReference}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Info for Rejected Orders */}
            {order.status === 'REJECTED' && order.rejectionNote && (
              <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/30 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex gap-3">
                  <div className="text-red-600 dark:text-red-400 text-xl">❌</div>
                  <div>
                    <p className="font-semibold text-red-800 dark:text-red-300">Order Rejected</p>
                    <p className="text-red-700 dark:text-red-400 text-sm mt-1">
                      Reason: {order.rejectionNote}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;