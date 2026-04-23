import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Search, X as XIcon } from 'lucide-react';
import testService from '../../services/testService';
import toast from 'react-hot-toast';
import TestModal from '../../components/admin/TestModal';

// Kích thước trang
const PAGE_SIZE = 10;

function AdminTests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testTypes, setTestTypes] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // --- THÊM 2 TRƯỜNG DATE VÀO STATE FILTERS ---
  const [filters, setFilters] = useState({
    name: '',
    type: '',
    status: '', // '' nghĩa là "All"
    createdFrom: '',
    createdTo: '',
  });

  useEffect(() => {
    loadTests(currentPage);
  }, [currentPage]);

  useEffect(() => {
    fetchTestTypes();
  }, []);

  const loadTests = async (page, resetFilters = false) => {
    try {
      setLoading(true);
      let response;
      // Nếu reset, dùng filter rỗng, nếu không thì dùng filter hiện tại
      const currentFilters = resetFilters 
        ? { name: '', type: '', status: '', createdFrom: '', createdTo: '' } 
        : filters;
      
      const searchParams = {
        ...currentFilters,
        page: page,
        size: PAGE_SIZE,
      };

      // --- CẬP NHẬT LOGIC KIỂM TRA FILTER ---
      const hasFilters = currentFilters.name.trim() || 
                         currentFilters.type || 
                         currentFilters.status !== '' ||
                         currentFilters.createdFrom ||
                         currentFilters.createdTo;

      if (hasFilters) {
        // Xóa các key rỗng trước khi gửi đi
        Object.keys(searchParams).forEach(key => {
          if (searchParams[key] === '') delete searchParams[key];
        });
        
        response = await testService.searchTestsAdmin(searchParams);
      } else {
        response = await testService.getAllTests(page, PAGE_SIZE);
      }
      
      if (response.result && response.result.data) {
        setTests(response.result.data);
        setTotalPages(response.result.totalPages || 1);
        setCurrentPage(response.result.currentPage || page);
      } else {
        setTests([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error loading tests:', error);
      toast.error('Failed to load tests');
      setTests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTestTypes = async () => {
    try {
      const response = await testService.getTestTypes();
      if (response.result) {
        setTestTypes(response.result || []);
      }
    } catch (error) {
      setTestTypes([]);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    if (currentPage === 1) {
      loadTests(1);
    } else {
      setCurrentPage(1); 
    }
  };

  // --- CẬP NHẬT HÀM RESET ---
  const handleReset = () => {
    setFilters({ 
      name: '', 
      type: '', 
      status: '', 
      createdFrom: '', 
      createdTo: '' 
    });
    if (currentPage === 1) {
      loadTests(1, true); 
    } else {
      setCurrentPage(1); 
    }
  };

  const handleCreate = () => {
    setSelectedTest(null);
    setShowModal(true);
  };

  const handleEdit = (test) => {
    setSelectedTest(test);
    setShowModal(true);
  };

  const handleDelete = async (testId) => {
    if (!window.confirm('Are you sure you want to delete this test?')) return;

    try {
      await testService.deleteTest(testId);
      toast.success('Test deleted successfully');
      loadTests(currentPage);
    } catch (error) {
      toast.error('Failed to delete test');
    }
  };

  const handleModalClose = (reload) => {
    setShowModal(false);
    setSelectedTest(null);
    if (reload) loadTests(currentPage);
  };

  if (loading && tests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Manage Tests</h1>
        <button
          onClick={handleCreate}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Create Test</span>
        </button>
      </div>

      {/* --- CẬP NHẬT KHUNG TÌM KIẾM (BỐ CỤC 3 CỘT) --- */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        {/* Đổi sang grid-cols-3 */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Hàng 1, Cột 1 */}
          <div>
            <label htmlFor="filter-name" className="block text-sm font-medium text-gray-700 mb-1">
              Test Name
            </label>
            <input
              type="text"
              id="filter-name"
              name="name"
              value={filters.name}
              onChange={handleFilterChange}
              placeholder="Search by name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Hàng 1, Cột 2 */}
          <div>
            <label htmlFor="filter-type" className="block text-sm font-medium text-gray-700 mb-1">
              Test Type
            </label>
            <select
              id="filter-type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Types</option>
              {testTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Hàng 1, Cột 3 */}
          <div>
            <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="filter-status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Statuses</option>
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>

          {/* Hàng 2, Cột 1: THÊM CREATED FROM */}
          <div>
            <label htmlFor="filter-created-from" className="block text-sm font-medium text-gray-700 mb-1">
              Created From
            </label>
            <input
              type="date"
              id="filter-created-from"
              name="createdFrom"
              value={filters.createdFrom}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Hàng 2, Cột 2: THÊM CREATED TO */}
          <div>
            <label htmlFor="filter-created-to" className="block text-sm font-medium text-gray-700 mb-1">
              Created To
            </label>
            <input
              type="date"
              id="filter-created-to"
              name="createdTo"
              value={filters.createdTo}
              onChange={handleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Hàng 2, Cột 3: Buttons */}
          <div className="flex items-end space-x-2"> 
            {/* Dùng items-end để đẩy buttons xuống dưới */}
            <button
              onClick={handleSearch}
              className="btn-primary w-1/2 flex items-center justify-center space-x-2"
            >
              <Search size={18} />
              <span>Search</span>
            </button>
            <button
              onClick={handleReset}
              className="btn-secondary w-1/2 flex items-center justify-center space-x-2"
            >
              <XIcon size={18} />
              <span>Reset</span>
            </button>
          </div>

        </div>
      </div>
      {/* --- KẾT THÚC KHUNG TÌM KIẾM --- */}


      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Participants
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan="5" className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </td>
              </tr>
            )}
            
            {!loading && tests.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-12">
                  <p className="text-gray-500">No tests found</p>
                </td>
              </tr>
            )}
            
            {!loading && tests.length > 0 && tests.map((test) => (
              <tr key={test.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{test.name}</div>
                  <div className="text-sm text-gray-500">{test.slug}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{test.type || 'N/A'}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-900">{test.numberOfParticipants || 0}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    test.status === 1 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {test.status === 1 ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(test)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(test.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* --- PHÂN TRANG --- */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {/* --- KẾT THÚC PHÂN TRANG --- */}

      </div>

      {showModal && (
        <TestModal
          test={selectedTest}
          onClose={handleModalClose}
          testTypes={testTypes}
        />
      )}
    </div>
  );
}

export default AdminTests;