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
    if (items.length >= 10) {
      toast.warning('Maximum 10 items per order');
      return;
    }
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
      
      if (response.data.status === 'DRAFT') {
        toast.success('Order saved as draft successfully!');
      } else {
        toast.success('Order submitted for approval!');
      }
      
      navigate('/creator');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4 transition-colors duration-200">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/creator')}
            className="mb-4 flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Create New Order</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Fill in the details to create a purchase request</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden transition-colors duration-200">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
            <h2 className="text-white font-semibold text-lg">Order Information</h2>
          </div>
          
          <div className="p-6">
            {/* Expiry Date */}
            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 font-semibold mb-2">
                Expiry Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={expiryDate}
                  min={today}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full sm:w-auto min-w-[280px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                  required
                />
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Order must be submitted before this date
              </p>
            </div>

            {/* Items Section */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <label className="text-gray-700 dark:text-gray-300 font-semibold">
                  Order Items <span className="text-red-500">*</span>
                </label>
                <button
                  onClick={addItem}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Another Item
                </button>
              </div>
              
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600 transition-colors duration-200">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 sm:hidden">Item Name</label>
                        <input
                          type="text"
                          placeholder="e.g., Notebook, Pen, Keyboard"
                          value={item.itemName}
                          onChange={(e) => updateItem(index, 'itemName', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                        />
                      </div>
                      <div className="w-full sm:w-32">
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1 sm:hidden">Quantity</label>
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-200"
                          min="1"
                        />
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="px-4 py-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {items.length >= 10 && (
                <p className="text-amber-600 dark:text-amber-400 text-sm mt-2 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Maximum 10 items per order reached
                </p>
              )}
            </div>

            {/* Tips Section */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 transition-colors duration-200">
              <div className="flex gap-3">
                <div className="text-blue-600 dark:text-blue-400 text-xl">💡</div>
                <div>
                  <p className="font-semibold text-blue-800 dark:text-blue-300 text-sm">Pro Tip</p>
                  <p className="text-blue-700 dark:text-blue-400 text-xs mt-1">
                    Save as draft if you need to edit later. Submit immediately for purchaser approval.
                    Duplicate items across different submitted orders are not allowed.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleSubmit('DRAFT')}
                disabled={submitting}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save as Draft
              </button>
              <button
                onClick={() => handleSubmit('SUBMITTED')}
                disabled={submitting}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Submit Order
              </button>
              <button
                onClick={() => navigate('/creator')}
                className="px-6 py-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-xl transition font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateOrder;