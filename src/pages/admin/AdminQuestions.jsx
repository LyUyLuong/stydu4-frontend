import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, FileAudio, Image as ImageIcon, CheckCircle } from 'lucide-react';
import questionTestService from '../../services/questionTestService';
import partTestService from '../../services/partTestService';
import questionGroupService from '../../services/questionGroupService';
import QuestionTestModal from '../../components/admin/QuestionTestModal';

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [partTests, setPartTests] = useState([]);
  const [questionGroups, setQuestionGroups] = useState([]);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✅ Filter states
  const [selectedPartId, setSelectedPartId] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedQuestionType, setSelectedQuestionType] = useState('');

  // ✅ Fetch initial data on mount
  useEffect(() => {
    fetchPartTests();
    fetchQuestionTypes();
  }, []);

  // ✅ Fetch Question Groups when Part changes
  useEffect(() => {
    fetchQuestionGroups();
    // Reset Question Group selection when Part changes
    if (selectedPartId) {
      setSelectedGroupId('');
    }
  }, [selectedPartId]);

  // ✅ Fetch Questions when filters change (including search term)
  useEffect(() => {
    fetchQuestions();
  }, [currentPage, selectedPartId, selectedGroupId, selectedQuestionType, searchTerm]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      
      // ✅ Build search params with filters
      const searchParams = {
        page: currentPage,
        size: 10
      };
      
      if (selectedPartId) {
        searchParams.partId = selectedPartId;
      }
      
      if (selectedGroupId) {
        searchParams.questionGroupId = selectedGroupId;
      }
      
      if (selectedQuestionType) {
        searchParams.type = selectedQuestionType;
      }
      
      if (searchTerm) {
        searchParams.name = searchTerm;
      }

      console.log('Questions search params:', searchParams); // ✅ Debug log

      // ✅ Use search endpoint if filters are applied
      const response = (selectedPartId || selectedGroupId || selectedQuestionType || searchTerm)
        ? await questionTestService.searchQuestionTests(searchParams)
        : await questionTestService.getAllQuestionTests(currentPage, 10);
        
      console.log('Questions API response:', response); // ✅ Debug log
      if (response.result) {
        setQuestions(response.result.data || []);
        setTotalPages(response.result.totalPages || 1);
        setTotalElements(response.result.totalElements || 0);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPartTests = async () => {
    try {
      const response = await partTestService.getAllPartTests(1, 100);
      if (response.result) {
        setPartTests(response.result.data || []);
      }
    } catch (error) {
      console.error('Error fetching part tests:', error);
    }
  };

  const fetchQuestionGroups = async () => {
    try {
      // ✅ If a Part is selected, fetch only groups for that Part
      const response = selectedPartId
        ? await questionGroupService.getQuestionGroupsByPartId(selectedPartId, 1, 100)
        : await questionGroupService.getAllQuestionGroups(1, 100);
      
      if (response.result) {
        setQuestionGroups(response.result.data || []);
      }
    } catch (error) {
      console.error('Error fetching question groups:', error);
    }
  };

  const fetchQuestionTypes = async () => {
    try {
      const response = await questionTestService.getQuestionTypes();
      if (response.result) {
        setQuestionTypes(response.result || []);
      }
    } catch (error) {
      console.error('Error fetching question types:', error);
    }
  };

  const handleCreate = () => {
    setEditingQuestion(null);
    setShowModal(true);
  };

  const handleEdit = async (question) => {
    try {
      // Fetch full question details with answers
      const response = await questionTestService.getQuestionTestById(question.id);
      if (response.result) {
        console.log('Question detail with answers:', response.result);
        setEditingQuestion(response.result);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching question details:', error);
      alert('Failed to load question details');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await questionTestService.deleteQuestionTest(id);
        fetchQuestions();
      } catch (error) {
        console.error('Error deleting question:', error);
        alert('Failed to delete question');
      }
    }
  };

  const handleSave = async (data, audioFile, imageFile) => {
    try {
      console.log('handleSave called with:', { data, audioFile, imageFile });
      
      if (audioFile || imageFile) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));
        if (audioFile) formData.append('audio', audioFile);
        if (imageFile) formData.append('image', imageFile);

        console.log('FormData entries:');
        for (let [key, value] of formData.entries()) {
          console.log(key, value);
        }

        if (editingQuestion) {
          await questionTestService.updateQuestionTest(editingQuestion.id, data);
          if (audioFile) {
            await questionTestService.updateQuestionTestAudio(editingQuestion.id, audioFile);
          }
          if (imageFile) {
            await questionTestService.updateQuestionTestImage(editingQuestion.id, imageFile);
          }
        } else {
          console.log('Creating question with files...');
          const response = await questionTestService.createQuestionTestWithFiles(formData);
          console.log('Create response:', response);
        }
      } else {
        if (editingQuestion) {
          console.log('Updating question WITHOUT files. Data:', JSON.stringify(data, null, 2));
          await questionTestService.updateQuestionTest(editingQuestion.id, data);
        } else {
          await questionTestService.createQuestionTest(data);
        }
      }
      setShowModal(false);
      fetchQuestions();
    } catch (error) {
      console.error('Error saving question:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      throw error;
    }
  };

  // ✅ Remove local filtering - we filter on backend now
  const displayedQuestions = questions;

  const getPartName = (partTestId) => {
    const part = partTests.find(p => p.id === partTestId);
    return part ? part.name : '-';
  };

  const getGroupName = (groupId) => {
    const group = questionGroups.find(g => g.id === groupId);
    return group ? group.name : '-';
  };

  if (loading && questions.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Questions Management</h1>
          <p className="text-gray-600 mt-1">Manage test questions with answers</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus size={20} />
          <span>Add Question</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          {/* ✅ Search and Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* ✅ Filter by Part */}
            <div>
              <select
                value={selectedPartId}
                onChange={(e) => {
                  setSelectedPartId(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Parts</option>
                {partTests.map(part => (
                  <option key={part.id} value={part.id}>
                    {part.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ Filter by Question Group */}
            <div>
              <select
                value={selectedGroupId}
                onChange={(e) => {
                  setSelectedGroupId(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Question Groups</option>
                {questionGroups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ Filter by Question Type */}
            <div>
              <select
                value={selectedQuestionType}
                onChange={(e) => {
                  setSelectedQuestionType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Question Types</option>
                {questionTypes.map(type => {
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

        <table className="w-full min-w-max">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                Name
              </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Part/Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Content
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Answers
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Media
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {displayedQuestions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No questions found
                  </td>
                </tr>
              ) : (
                displayedQuestions.map((question) => (
                  <tr key={question.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{question.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                        {question.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="text-xs">
                        <div>Part: {getPartName(question.partTestId)}</div>
                        <div>Group: {getGroupName(question.questionGroupId)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">
                        {question.content || 'No content'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className="text-sm text-gray-900">
                        {question.answersCount || question.answers?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {question.audioId && (
                          <FileAudio size={16} className="text-blue-500" title="Has audio" />
                        )}
                        {question.imageId && (
                          <ImageIcon size={16} className="text-green-500" title="Has image" />
                        )}
                        {!question.audioId && !question.imageId && (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(question)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(question.id)}
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

          {/* Always show pagination info and controls */}
          <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {questions.length > 0 ? ((currentPage - 1) * 10 + 1) : 0} to {Math.min(currentPage * 10, totalElements)} of {totalElements} questions
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                <div className="flex space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = idx + 1;
                    } else if (currentPage <= 3) {
                      pageNum = idx + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + idx;
                    } else {
                      pageNum = currentPage - 2 + idx;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-2 border rounded-md text-sm font-medium ${
                          currentPage === pageNum
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <QuestionTestModal
          question={editingQuestion}
          partTests={partTests}
          questionGroups={questionGroups}
          questionTypes={questionTypes}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminQuestions;
