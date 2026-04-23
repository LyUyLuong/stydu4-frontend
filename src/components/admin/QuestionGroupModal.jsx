import { useState, useEffect } from 'react';
import { X, Upload, FileAudio, Image as ImageIcon, XCircle } from 'lucide-react';

// <-- NHẬN PROP MỚI: questionGroupTypes -->
const QuestionGroupModal = ({ questionGroup, partTests, questionGroupTypes = [], onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    content: '',
    type: '',
    imageId: '',
    audioId: '',
    partId: ''
  });
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [removeAudio, setRemoveAudio] = useState(false);
  const [removeImage, setRemoveImage] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (questionGroup) {
      console.log('questionGroup:', questionGroup);
      setFormData({
        name: questionGroup.name || '',
        content: questionGroup.content || '',
        
        // === THÊM .toUpperCase() ĐỂ FIX LỖI CASE-SENSITIVE ===
        type: questionGroup.type ? questionGroup.type.toUpperCase() : '', 
        
        imageId: questionGroup.imageId || '',
        audioId: questionGroup.audioId || '',
        partId: questionGroup.partTestId || ''
      });
    }
  }, [questionGroup]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAudioChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      setRemoveAudio(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setRemoveImage(false);
    }
  };

  const handleRemoveAudio = () => {
    setRemoveAudio(true);
    setAudioFile(null);
    setFormData(prev => ({ ...prev, audioId: '' }));
  };

  const handleRemoveImage = () => {
    setRemoveImage(true);
    setImageFile(null);
    setFormData(prev => ({ ...prev, imageId: '' }));
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

    if (!formData.partId) {
      setError('Part is required');
      return;
    }

    try {
      setLoading(true);
      // Truyền cả file đi, onSave (ở component cha) sẽ xử lý logic
      await onSave(formData, audioFile, imageFile);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save question group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {questionGroup ? 'Edit Question Group' : 'Create Question Group'}
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
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter group name"
                required
              />
            </div>

            {/* === THAY THẾ INPUT BẰNG SELECT === */}
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
                {questionGroupTypes.map((type) => (
                  <option key={type.value || type} value={type.value || type}>
                    {type.label || type}
                  </option>
                ))}
              </select>
            </div>
            {/* === KẾT THÚC THAY ĐỔI === */}
            
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Part *
            </label>
            <select
              name="partId"
              value={formData.partId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            >
              <option value="">Select a part</option>
              {partTests.map(part => (
                <option key={part.id} value={part.id}>
                  {part.name} ({part.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content
            </label>
            <textarea
              name="content"
              value={formData.content}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter group content (optional)"
            />
          </div>

          {/* ... (Phần JSX cho Audio/Image giữ nguyên) ... */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audio File
              </label>
              {questionGroup?.audioUrl && !audioFile && !removeAudio && (
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
                  <audio controls className="w-full" src={questionGroup.audioUrl}>
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
                    {audioFile ? audioFile.name : (questionGroup?.audioUrl ? 'Replace audio file' : 'Choose audio file')}
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image File
              </label>
              {questionGroup?.imageUrl && !imageFile && !removeImage && (
                <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <ImageIcon size={16} className="text-green-600" />
                      <span className="text-sm text-green-800 font-medium">Current image</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={questionGroup.imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-green-600 hover:text-green-800 underline"
                      >
                        View Full
                      </a>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-red-600 hover:text-red-800"
                        title="Remove image"
                      >
                        <XCircle size={18} />
                      </button>
                    </div>
                  </div>
                  <img 
                    src={questionGroup.imageUrl} 
                    alt="Question Group" 
                    className="w-full h-40 object-contain rounded bg-white"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<p class="text-sm text-red-600">Failed to load image</p>';
                    }}
                  />
                </div>
              )}
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <ImageIcon size={20} className="mr-2 text-gray-500" />
                  <span className="text-sm text-gray-700 truncate">
                    {imageFile ? imageFile.name : (questionGroup?.imageUrl ? 'Replace image file' : 'Choose image file')}
                  </span>
                </label>
              </div>
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

export default QuestionGroupModal;