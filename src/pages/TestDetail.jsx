import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import testService from '../services/testService';
import partTestService from '../services/partTestService';
import useAuthStore from '../store/authStore';

function TestDetail() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  
  const [test, setTest] = useState(null);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('full-test'); // 'full-test' or 'practice'
  const [selectedParts, setSelectedParts] = useState([]);
  const [practiceTime, setPracticeTime] = useState(30); // Default 30 minutes for practice

  useEffect(() => {
    loadTestDetails();
  }, [testId]);

  const loadTestDetails = async () => {
    try {
      setLoading(true);
      const [testResponse, partsResponse] = await Promise.all([
        testService.getTestById(testId),
        partTestService.searchPartTests({ testId, page: 1, size: 10 })
      ]);

      setTest(testResponse.result);
      // Sort parts by part number (e.g. "Part 1", "Part 2", ...)
      const rawParts = partsResponse.result?.data || [];
      rawParts.sort((a, b) => {
        const getNum = (name) => {
          if (!name) return 999;
          const m = name.match(/part\s*(\d+)/i);
          return m ? parseInt(m[1]) : 999;
        };
        return getNum(a.name) - getNum(b.name);
      });
      setParts(rawParts);
    } catch (error) {
      toast.error('Failed to load test details');
      console.error('Error loading test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePartToggle = (partId) => {
    setSelectedParts(prev => 
      prev.includes(partId)
        ? prev.filter(id => id !== partId)
        : [...prev, partId]
    );
  };

  const handleStartFullTest = async () => {
    // Check if user is authenticated before starting test
    if (!isAuthenticated) {
      toast.error('Please login to start the test');
      // Redirect to login with return URL
      navigate('/login', { 
        state: { 
          returnUrl: `/tests/${testId}`,
          message: 'Please login to start the test'
        } 
      });
      return;
    }

    try {
      navigate(`/exam/${testId}/full`);
    } catch (error) {
      toast.error('Failed to start test');
    }
  };

  const handleStartPractice = async () => {
    // Check if user is authenticated before starting practice
    if (!isAuthenticated) {
      toast.error('Please login to start practice');
      // Redirect to login with return URL
      navigate('/login', { 
        state: { 
          returnUrl: `/tests/${testId}`,
          message: 'Please login to start practice mode'
        } 
      });
      return;
    }

    if (selectedParts.length === 0) {
      toast.error('Please select at least one part');
      return;
    }
    
    try {
      navigate(`/exam/${testId}/practice`, { 
        state: { 
          selectedParts,
          practiceTime: practiceTime * 60 // Convert minutes to seconds
        } 
      });
    } catch (error) {
      toast.error('Failed to start practice');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Test not found</h2>
          <button
            onClick={() => navigate('/tests')}
            className="text-primary-600 hover:text-primary-700"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Test Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <button
          onClick={() => navigate('/tests')}
          className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tests
        </button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{test.name}</h1>
            <p className="text-gray-600 mb-4">{test.description}</p>
            
            <div className="flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {test.type}
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                {test.numberOfParticipants || 0} participants
              </span>
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {parts.length} parts
              </span>
            </div>
          </div>

          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            test.status === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {test.status === 1 ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('full-test')}
              className={`py-4 px-8 border-b-2 font-medium text-sm ${
                activeTab === 'full-test'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Full Test
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`py-4 px-8 border-b-2 font-medium text-sm ${
                activeTab === 'practice'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Practice Mode
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'full-test' ? (
            <div className="text-center py-8">
              <div className="mb-6">
                <svg className="w-24 h-24 mx-auto text-primary-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Full Test Mode</h3>
                <p className="text-gray-600 mb-2">Complete all {parts.length} parts in one session</p>
                <p className="text-sm text-gray-500">Recommended for exam simulation</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 mb-6 max-w-2xl mx-auto">
                <h4 className="font-semibold text-gray-900 mb-4">Test Structure:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parts.map((part, index) => (
                    <div key={part.id} className="flex items-center text-left">
                      <span className="w-8 h-8 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-semibold mr-3">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{part.name}</p>
                        <p className="text-sm text-gray-500">{part.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleStartFullTest}
                className="bg-primary-600 text-white px-8 py-3 rounded-lg hover:bg-primary-700 transition-colors text-lg font-medium"
              >
                Start Full Test
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Practice Mode</h3>
                <p className="text-gray-600 mb-4">
                  Select specific parts you want to practice
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {parts.map((part) => (
                  <div
                    key={part.id}
                    onClick={() => handlePartToggle(part.id)}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedParts.includes(part.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{part.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{part.description}</p>
                        <p className="text-xs text-gray-500">{part.type}</p>
                      </div>
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        selectedParts.includes(part.id)
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedParts.includes(part.id) && (
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Selection for Practice Mode */}
              <div className="mb-6 bg-gray-50 rounded-lg p-6">
                <h4 className="font-semibold text-gray-900 mb-4">Time Limit</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-700">Practice Time:</span>
                    <span className="text-2xl font-bold text-primary-600">{practiceTime} minutes</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="120"
                    step="5"
                    value={practiceTime}
                    onChange={(e) => setPracticeTime(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10 min</span>
                    <span>30 min</span>
                    <span>60 min</span>
                    <span>90 min</span>
                    <span>120 min</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <p className="text-gray-600">
                  Selected: <span className="font-semibold">{selectedParts.length}</span> / {parts.length} parts
                </p>
                <button
                  onClick={handleStartPractice}
                  disabled={selectedParts.length === 0}
                  className={`px-8 py-3 rounded-lg text-white font-medium transition-colors ${
                    selectedParts.length === 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  Start Practice
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TestDetail;
