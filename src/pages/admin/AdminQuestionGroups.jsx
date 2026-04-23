import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, FileAudio, Image as ImageIcon } from 'lucide-react';
import questionGroupService from '../../services/questionGroupService';
import partTestService from '../../services/partTestService';
import QuestionGroupModal from '../../components/admin/QuestionGroupModal';

const AdminQuestionGroups = () => {
  const [questionGroups, setQuestionGroups] = useState([]);
  const [partTests, setPartTests] = useState([]);
  const [questionGroupTypes, setQuestionGroupTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // ✅ Filter states
  const [selectedPartId, setSelectedPartId] = useState('');
  const [selectedGroupType, setSelectedGroupType] = useState('');

  // ✅ Fetch initial data once on mount
  useEffect(() => {
    fetchPartTests();
    fetchQuestionGroupTypes();
  }, []);

  // ✅ Fetch Question Groups when filters change (including search term)
  useEffect(() => {
    fetchQuestionGroups();
  }, [currentPage, selectedPartId, selectedGroupType, searchTerm]);

  const fetchQuestionGroups = async () => {
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
      
      if (selectedGroupType) {
        searchParams.type = selectedGroupType;
      }
      
      if (searchTerm) {
        searchParams.name = searchTerm;
      }

      console.log('Question Groups search params:', searchParams); // ✅ Debug log

      // ✅ Use search endpoint if filters are applied
      const response = (selectedPartId || selectedGroupType || searchTerm)
        ? await questionGroupService.searchQuestionGroups(searchParams)
        : await questionGroupService.getAllQuestionGroups(currentPage, 10);
      
      console.log('Question Groups API response:', response); // ✅ Debug log
        
      if (response.result) {
        setQuestionGroups(response.result.data || []);
        setTotalPages(response.result.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching question groups:', error);
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

  const fetchQuestionGroupTypes = async () => {
    try {
      const response = await questionGroupService.getQuestionGroupTypes();
      setQuestionGroupTypes(response.result || response || []);
    } catch (error) {
      console.error('Error fetching question group types:', error);
    }
  };

  const handleCreate = () => {
    setEditingGroup(null);
    setShowModal(true);
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question group?')) {
      try {
        await questionGroupService.deleteQuestionGroup(id);
        fetchQuestionGroups();
      } catch (error) {
        console.error('Error deleting question group:', error);
        alert('Failed to delete question group');
      }
    }
  };

  const handleSave = async (data, audioFile, imageFile) => {
    try {
      if (audioFile || imageFile) {
        const formData = new FormData();
        formData.append('data', JSON.stringify(data));
        if (audioFile) formData.append('audio', audioFile);
        if (imageFile) formData.append('image', imageFile);

        if (editingGroup) {
          await questionGroupService.updateQuestionGroup(editingGroup.id, data);
          if (audioFile) {
            await questionGroupService.updateQuestionGroupAudio(editingGroup.id, audioFile);
          }
          if (imageFile) {
            await questionGroupService.updateQuestionGroupImage(editingGroup.id, imageFile);
          }
        } else {
          await questionGroupService.createQuestionGroupWithFiles(formData);
        }
      } else {
        if (editingGroup) {
          await questionGroupService.updateQuestionGroup(editingGroup.id, data);
        } else {
          await questionGroupService.createQuestionGroup(data);
        }
      }
      setShowModal(false);
      fetchQuestionGroups();
    } catch (error) {
      console.error('Error saving question group:', error);
      throw error;
    }
  };

  const filteredGroups = questionGroups.filter(qg =>
    qg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    qg.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPartName = (partId) => {
    const part = partTests.find(p => p.id === partId);
    return part ? part.name : 'N/A';
  };

  if (loading && questionGroups.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Question Groups Management</h1>
          <p className="text-gray-600 mt-1">Manage question groups with audio and image support</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus size={20} />
          <span>Add Question Group</span>
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
                placeholder="Search question groups..."
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

            {/* ✅ Filter by Group Type */}
            <div>
              <select
                value={selectedGroupType}
                onChange={(e) => {
                  setSelectedGroupType(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Group Types</option>
                {questionGroupTypes.map(type => {
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
                  Part
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Content
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Media
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGroups.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No question groups found
                  </td>
                </tr>
              ) : (
                filteredGroups.map((group) => (
                  <tr key={group.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{group.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {group.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getPartName(group.partTestId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="max-w-xs truncate">
                        {group.content || 'No content'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {group.audioId && (
                          <FileAudio size={16} className="text-blue-500" title="Has audio" />
                        )}
                        {group.imageId && (
                          <ImageIcon size={16} className="text-green-500" title="Has image" />
                        )}
                        {!group.audioId && !group.imageId && (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(group)}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(group.id)}
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
        <QuestionGroupModal
          questionGroup={editingGroup}
          partTests={partTests}
          questionGroupTypes={questionGroupTypes}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminQuestionGroups;
