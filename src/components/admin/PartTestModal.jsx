import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

// <-- NHẬN PROP MỚI partTestTypes, gán giá trị mặc định là [] -->
const PartTestModal = ({ partTest, tests, partTestTypes = [], onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    testId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (partTest) {
      setFormData({
        name: partTest.name || '',
        description: partTest.description || '',
        type: partTest.type || '',
        testId: partTest.testId || ''
      });
    }
  }, [partTest]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    if (!formData.type.trim()) {
      setError('Type is required');
      return;
    }

    if (!formData.testId) {
      setError('Test is required');
      return;
    }

    try {
      setLoading(true);
      await onSave(formData);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save part test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {partTest ? 'Edit Part Test' : 'Create Part Test'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter part test name"
              required
            />
          </div>

          {/* === THAY ĐỔI TỪ INPUT SANG SELECT === */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select a type</option>
              {/* Logic map qua mảng types, 
                  hỗ trợ cả mảng string [LISTENING] hoặc mảng object [{value, label}] */}
              {partTestTypes.map((type) => (
                <option key={type.value || type} value={type.value || type}>
                  {type.label || type}
                </option>
              ))}
            </select>
          </div>
          {/* === KẾT THÚC THAY ĐỔI === */}


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test *
            </label>
            <select
              name="testId"
              value={formData.testId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select a test</option>
              {tests.map(test => (
                <option key={test.id} value={test.id}>
                  {test.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter description (optional)"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PartTestModal;