import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const CreateOrder = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([{ itemName: '', quantity: 1 }]);
  const [expiryDate, setExpiryDate] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const addItem = () => {
    setItems([...items, { itemName: '', quantity: 1 }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      toast.error('At least one item is required');
      return;
    }
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = async (status) => {
    if (!expiryDate) {
      toast.error('Please select expiry date');
      return;
    }

    const invalidItems = items.filter(item => !item.itemName.trim() || item.quantity < 1);
    if (invalidItems.length > 0) {
      toast.error('Please fill all items with valid quantity');
      return;
    }

    const uniqueItems = new Set(items.map(i => i.itemName.toLowerCase().trim()));
    if (uniqueItems.size !== items.length) {
      toast.error('Duplicate items not allowed in the same order');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        items: items.map(i => ({ itemName: i.itemName.trim(), quantity: parseInt(i.quantity) })),
        expiryDate: new Date(expiryDate).toISOString(),
        status: status
      };

      const response = await api.post('/orders/create', orderData);
      toast.success(`Order ${response.data.status === 'DRAFT' ? 'saved as draft' : 'submitted successfully'}`);
      navigate('/creator');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
        <p className="text-gray-500 mt-1">Fill in the details below to create a purchase request</p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        {/* Expiry Date */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Expiry Date *</label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-xs text-gray-400 mt-1">Order must be submitted before this date</p>
        </div>

        {/* Items Section */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="text-gray-700 font-medium">Items *</label>
            <button
              onClick={addItem}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              + Add Item
            </button>
          </div>
          
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex gap-3 items-center">
                <input
                  type="text"
                  placeholder="Item name"
                  value={item.itemName}
                  onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                  min="1"
                />
                <button
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-500 hover:text-red-700 transition"
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={() => handleSubmit('DRAFT')}
            disabled={submitting}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition font-medium disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSubmit('SUBMITTED')}
            disabled={submitting}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition font-medium disabled:opacity-50"
          >
            Submit Order
          </button>
          <button
            onClick={() => navigate('/creator')}
            className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;