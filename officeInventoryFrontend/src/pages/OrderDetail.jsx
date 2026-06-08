/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { getStatusColor } from '../utils/statusColors';

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data);
      } catch (error) {
        toast.error('Failed to fetch order details');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrder();
  }, [id, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Order Details #{order.id}</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-gray-600 font-semibold">Status:</label>
            <p>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </p>
          </div>
          <div>
            <label className="text-gray-600 font-semibold">Created By:</label>
            <p>{order.createdByUsername}</p>
          </div>
          <div>
            <label className="text-gray-600 font-semibold">Expiry Date:</label>
            <p>{new Date(order.expiryDate).toLocaleDateString()}</p>
          </div>
          <div>
            <label className="text-gray-600 font-semibold">Created At:</label>
            <p>{new Date(order.createdAt).toLocaleString()}</p>
          </div>
          {order.transactionReference && (
            <div>
              <label className="text-gray-600 font-semibold">Transaction Reference:</label>
              <p>{order.transactionReference}</p>
            </div>
          )}
          {order.rejectionNote && (
            <div className="col-span-2">
              <label className="text-gray-600 font-semibold">Rejection Note:</label>
              <p className="text-red-600">{order.rejectionNote}</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Items</h2>
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left">Item Name</th>
                <th className="px-6 py-3 text-left">Quantity</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="px-6 py-3">{item.itemName}</td>
                  <td className="px-6 py-3">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;