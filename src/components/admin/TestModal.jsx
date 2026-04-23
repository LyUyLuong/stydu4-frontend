import { useState, useEffect } from 'react';
import { X, FileAudio, XCircle } from 'lucide-react';
import testService from '../../services/testService';
import toast from 'react-hot-toast';

function TestModal({ test, onClose, testTypes = [] }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slug: '',
    status: 1,
    numberOfParticipants: 0,
    audioId: '',
    type: '', // Sửa từ testType thành type
  });
  const [audioFile, setAudioFile] = useState(null);
  const [removeAudio, setRemoveAudio] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (test) {
      console.log('DỮ LIỆU TEST TRUYỀN VÀO MODAL:', test);
      setFormData({
        name: test.name || '',
        description: test.description || '',
        slug: test.slug || '',
        status: test.status !== undefined && test.status !== null ? Number(test.status) : 1,
        numberOfParticipants: test.numberOfParticipants || 0,
        audioId: test.audioId || '',
        type: test.type ? test.type.toUpperCase() : '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        slug: '',
        status: 1,
        numberOfParticipants: 0,
        audioId: '',
        type: '', // Sửa từ testType thành type
      });
    }
  }, [test]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;
    if (type === 'number' || name === 'status') {
      processedValue = value === '' ? 0 : Number(value);
    }
    setFormData({
      ...formData,
      [name]: processedValue,
    });
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      setRemoveAudio(false);
    }
  };

  const handleRemoveAudio = () => {
    setRemoveAudio(true);
    setAudioFile(null);
    setFormData(prev => ({ ...prev, audioId: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        slug: formData.slug,
        status: formData.status,
        numberOfParticipants: formData.numberOfParticipants,
        type: formData.type, // Sửa từ testType thành type
      };
      // Sửa log
      console.log('[TestModal] Submit test, type:', formData.type, 'dataToSend:', dataToSend);
      if (test?.id) {
        if (audioFile) {
          const formDataObj = new FormData();
          formDataObj.append('data', JSON.stringify(dataToSend));
          formDataObj.append('audio', audioFile);
          console.log('[TestModal] updateTestWithFiles payload:', formDataObj.get('data'), formDataObj.get('audio'));
          await testService.updateTestWithFiles(test.id, formDataObj);
        } else {
          console.log('[TestModal] updateTest payload:', dataToSend);
          await testService.updateTest(test.id, dataToSend);
        }
        toast.success('Test updated successfully');
      } else {
        if (audioFile) {
          const formDataObj = new FormData();
          formDataObj.append('data', JSON.stringify(dataToSend));
          formDataObj.append('audio', audioFile);
          console.log('[TestModal] createTestWithFiles payload:', formDataObj.get('data'), formDataObj.get('audio'));
          await testService.createTestWithFiles(formDataObj);
        } else {
          console.log('[TestModal] createTest payload:', dataToSend);
          await testService.createTest(dataToSend);
        }
        toast.success('Test created successfully');
      }
      onClose(true); // Reload tests
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            {test ? 'Edit Test' : 'Create Test'}
          </h2>
          <button
            onClick={() => onClose(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter test name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter test description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slug (Optional)
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Leave empty to auto-generate from name"
              />
              <p className="text-xs text-gray-500 mt-1">
                If left empty, slug will be automatically generated from the test name
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Participants
                </label>
                <input
                  type="number"
                  name="numberOfParticipants"
                  value={formData.numberOfParticipants}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audio File
              </label>
              {/* Show existing audio if available */}
              {test?.audioUrl && !audioFile && !removeAudio && (
                <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <FileAudio size={16} className="text-blue-600" />
                      <span className="text-sm text-blue-800 font-medium">Current audio file</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveAudio}
                      className="text-red-600 hover:text-red-800"
                      title="Remove audio"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                  <audio controls className="w-full" src={test.audioUrl}>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              <div className="relative">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioChange}
                  className="hidden"
                  id="audio-upload"
                />
                <label
                  htmlFor="audio-upload"
                  className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <FileAudio size={20} className="mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700 truncate">
                    {audioFile ? audioFile.name : (test?.audioUrl ? 'Replace audio file' : 'Choose audio file')}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Type *
              </label>
              <select
                name="type" // Sửa từ testType thành type
                value={formData.type} // Sửa từ formData.testType thành formData.type
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select test type</option>
                {testTypes.map((type) => (
                  <option key={type.value || type} value={type.value || type}>
                    {type.label || type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : test ? 'Update Test' : 'Create Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TestModal;