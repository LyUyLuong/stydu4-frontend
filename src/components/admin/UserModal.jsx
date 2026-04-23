import { useState, useEffect } from 'react';
import { X, User, Mail, Key } from 'lucide-react';

const UserModal = ({ user, allRoles = [], onClose, onSave }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    roles: ['USER'] // Mặc định là USER khi tạo mới
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isEdit = Boolean(user);

  useEffect(() => {
    if (isEdit) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '', // Luôn trống khi edit, chỉ điền nếu muốn thay đổi
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        
        // === SỬA LỖI TẠI ĐÂY ===
        // Thêm .toUpperCase() để khớp với mảng allRoles ['USER', 'ADMIN']
        roles: user.roles ? user.roles.map(r => r.name.toUpperCase()) : []
      });
    } else {
      // Reset về trạng thái tạo mới
      setFormData({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        roles: ['USER']
      });
    }
  }, [user, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const currentRoles = prev.roles;
      if (checked) {
        // Thêm role nếu chưa có
        return { ...prev, roles: [...currentRoles, value] };
      } else {
        // Bỏ role
        return { ...prev, roles: currentRoles.filter(role => role !== value) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.username.trim()) return setError('Username is required');
    if (!formData.email.trim()) return setError('Email is required');
    if (!isEdit && !formData.password.trim()) return setError('Password is required for new user');
    if (formData.roles.length === 0) return setError('At least one role is required');

    try {
      setLoading(true);
      
      // Chuẩn bị dữ liệu gửi đi
      const dataToSend = { ...formData };
      
      // Nếu là edit và password để trống, xóa nó khỏi request
      if (isEdit && dataToSend.password === '') {
        delete dataToSend.password;
      }
      
      await onSave(dataToSend);
      onClose(); // Đóng modal sau khi save thành công
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'Edit User' : 'Create User'}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                placeholder="Enter username"
                required
                disabled={isEdit} // Không cho sửa username
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                placeholder="Enter email"
                required
                disabled={isEdit} // Không cho sửa email
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter last name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {isEdit ? '(Optional)' : '*'}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder={isEdit ? 'Leave blank to keep unchanged' : 'Enter password'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roles *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 border border-gray-300 rounded-lg">
              {allRoles.map(role => (
                <label key={role} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={role}
                    checked={formData.roles.includes(role)}
                    onChange={handleRoleChange}
                    className="rounded text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">{role}</span>
                </label>
              ))}
            </div>
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

export default UserModal;