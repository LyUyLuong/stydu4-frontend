import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import testService from '../services/testService';
import toast from 'react-hot-toast';

function Tests() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchName, setSearchName] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await testService.searchTests({
        name: searchName || undefined,
        type: filterType || undefined,
        ...filters
      });
      // Backend returns { code, result: { data: [], totalPages, ... } }
      const testsArray = response.result?.data || [];
      setTests(testsArray);
    } catch (error) {
      toast.error('Failed to load tests');
      console.error('Error loading tests:', error);
      setTests([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadTests();
  };

  const handleReset = () => {
    setSearchName('');
    setFilterType('');
    loadTests({ name: undefined, type: undefined });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tests</h1>
        <p className="mt-2 text-gray-600">Browse and take available tests</p>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search by Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search by Name
            </label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Enter test name..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* Filter by Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Types</option>
              <option value="Toeic">TOEIC</option>
              <option value="Ielts">IELTS</option>
              <option value="Practice">Practice</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleSearch}
              className="flex-1 bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Search
            </button>
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div
            key={test.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {test.name}
            </h3>
            <p className="text-gray-600 mb-4 line-clamp-2">
              {test.description || 'No description available'}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {test.numberOfParticipants || 0} participants
              </span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                test.status === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {test.status === 1 ? 'Active' : 'Inactive'}
              </span>
            </div>

            <Link
              to={`/tests/${test.id}`}
              className="block w-full text-center bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              View Test
            </Link>
          </div>
        ))}

        {tests.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">No tests available</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Tests;
