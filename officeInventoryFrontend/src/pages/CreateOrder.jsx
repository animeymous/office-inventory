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

    const invalidItems = items.filter(item => !item.itemName || item.quantity < 1);
    if (invalidItems.length > 0) {
      toast.error('Please fill all items with valid quantity');
      return;
    }

    const uniqueItems = new Set(items.map(i => i.itemName.toLowerCase()));
    if (uniqueItems.size !== items.length) {
      toast.error('Duplicate items not allowed in the same order');
      return;
    }

    setSubmitting(true);
    try {
      const orderData = {
        items: items.map(i => ({ itemName: i.itemName, quantity: parseInt(i.quantity) })),
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create New Order</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Expiry Date</label>
          <input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Items</h2>
          {items.map((item, index) => (
            <div key={index} className="flex gap-4 mb-3">
              <input
                type="text"
                placeholder="Item name"
                value={item.itemName}
                onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                className="w-32 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
              <button
                onClick={() => removeItem(index)}
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addItem}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Add Item
          </button>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => handleSubmit('DRAFT')}
            disabled={submitting}
            className="bg-yellow-500 text-white px-6 py-2 rounded hover:bg-yellow-600 disabled:bg-gray-400"
          >
            Save as Draft
          </button>
          <button
            onClick={() => handleSubmit('SUBMITTED')}
            disabled={submitting}
            className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            Submit Order
          </button>
          <button
            onClick={() => navigate('/creator')}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;