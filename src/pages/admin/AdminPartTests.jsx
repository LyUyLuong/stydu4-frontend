import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';
import partTestService from '../../services/partTestService';
import testService from '../../services/testService';
import PartTestModal from '../../components/admin/PartTestModal';

const AdminPartTests = () => {
  const [partTests, setPartTests] = useState([]);
  const [tests, setTests] = useState([]);
  const [partTestTypes, setPartTestTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingPartTest, setEditingPartTest] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✅ Filter states
  const [selectedTestId, setSelectedTestId] = useState('');
  const [selectedPartType, setSelectedPartType] = useState('');

  // ✅ Fetch initial data once on mount
  useEffect(() => {
    fetchTests();
    fetchPartTestTypes();
  }, []);

  // ✅ Fetch Part Tests when filters change (including search term)
  useEffect(() => {
    fetchPartTests();
  }, [currentPage, selectedTestId, selectedPartType, searchTerm]);

  const fetchPartTests = async () => {
    try {
      setLoading(true);
      
      // ✅ Build search params with filters
      const searchParams = {
        page: currentPage,
        size: 10
      };
      
      if (selectedTestId) {
        searchParams.testId = selectedTestId;
      }
      
      if (selectedPartType) {
        searchParams.type = selectedPartType;
      }
      
      if (searchTerm) {
        searchParams.name = searchTerm;
      }

      console.log('Part Tests search params:', searchParams); // ✅ Debug log

      // ✅ Use search endpoint if filters are applied
      const response = (selectedTestId || selectedPartType || searchTerm)
        ? await partTestService.searchPartTests(searchParams)
        : await partTestService.getAllPartTests(currentPage, 10);
      
      console.log('Part Tests API response:', response); // ✅ Debug log
        
      if (response.result) {
        setPartTests(response.result.data || []);
        setTotalPages(response.result.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching part tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTests = async () => {
    try {
      const response = await testService.getAllTests(1, 100);
      if (response.result) {
        setTests(response.result.data || []);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    }
  };

  const fetchPartTestTypes = async () => {
    try {
      const response = await partTestService.getPartTestTypes();
      // Giả sử API trả về mảng trong { result: [...] }
      if (response.result) {
        setPartTestTypes(response.result || []);
      } else {
        // Fallback nếu API trả về mảng trực tiếp
        setPartTestTypes(response || []);
      }
    } catch (error) {
      console.error('Error fetching part test types:', error);
    }
  };

  const handleCreate = () => {
    setEditingPartTest(null);
    setShowModal(true);
  };

  const handleEdit = (partTest) => {
    setEditingPartTest(partTest);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this part test?')) {
      try {
        await partTestService.deletePartTest(id);
        fetchPartTests();
      } catch (error) {
        console.error('Error deleting part test:', error);
        alert('Failed to delete part test');
      }
    }
  };

  const handleSave = async (data) => {
    try {
      if (editingPartTest) {
        await partTestService.updatePartTest(editingPartTest.id, data);
      } else {
        await partTestService.createPartTest(data);
      }
      setShowModal(false);
      fetchPartTests();
    } catch (error) {
      console.error('Error saving part test:', error);
      throw error;
    }
  };

  // ✅ Remove local filtering - we filter on backend now
  const displayedPartTests = partTests;

  const getTestName = (testId) => {
    const test = tests.find(t => t.id === testId);
    return test ? test.name : 'N/A';
  };

  if (loading && partTests.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Part Tests Management</h1>
          <p className="text-gray-600 mt-1">Manage test parts and their configurations</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus size={20} />
          <span>Add Part Test</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          {/* ✅ Search and Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search part tests..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* ✅ Filter by Test */}
            <div>
              <select
                value={selectedTestId}
                onChange={(e) => {
                  setSelectedTestId(e.target.value);
                  setCurrentPage(1); // Reset to first page
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Tests</option>
                {tests.map(test => (
                  <option key={test.id} value={test.id}>
                    {test.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ Filter by Part Type */}
            <div>
              <select
                value={selectedPartType}
                onChange={(e) => {
                  setSelectedPartType(e.target.value);
                  setCurrentPage(1); // Reset to first page
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Part Types</option>
                {partTestTypes.map(type => {
                  // ✅ Handle both string array and object array
                  const typeValue = typeof type === 'string' ? type : type.value || type;
                  const typeLabel = typeof type === 'string' ? type : type.label || type.value || type;
                  return (
                    <option key={typeValue} value={typeValue}>
                      {typeLabel}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedPartTests.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No part tests found
                  </td>
                </tr>
              ) : (
                displayedPartTests.map((partTest) => (
                  <tr key={partTest.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{partTest.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {partTest.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getTestName(partTest.testId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">
                        {partTest.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(partTest)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(partTest.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <PartTestModal
          partTest={editingPartTest}
          tests={tests}
          partTestTypes={partTestTypes}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminPartTests;
