import { useState, useEffect } from 'react';
import { X, Upload, File as FileIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import fileService from '../../services/fileService';

const LectureModal = ({ isOpen, onClose, onSuccess, lecture }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'VIDEO',
    content: '',
    duration: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load lecture data when editing
  useEffect(() => {
    if (lecture) {
      setFormData({
        title: lecture.title || '',
        description: lecture.description || '',
        type: lecture.type || 'VIDEO',
        content: lecture.content || '',
        duration: lecture.duration?.toString() || ''
      });
      setFilePreview(lecture.content || null);
    } else {
      // Reset form for new lecture
      setFormData({
        title: '',
        description: '',
        type: 'VIDEO',
        content: '',
        duration: ''
      });
      setFilePreview(null);
    }
    setSelectedFile(null);
  }, [lecture, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file based on type
    if (formData.type === 'VIDEO') {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }
      // Max 100MB for videos
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Video file must be less than 100MB');
        return;
      }
    } else if (formData.type === 'FILE') {
      // Max 50MB for files
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File must be less than 50MB');
        return;
      }
    }

    setSelectedFile(file);
    setFilePreview(file.name);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(lecture?.content || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!formData.type) {
      toast.error('Please select a lecture type');
      return;
    }

    // Check if content is provided
    if (formData.type !== 'TEXT' && !selectedFile && !formData.content) {
      toast.error('Please upload a file or the content will be empty');
    }

    setLoading(true);

    try {
      let contentUrl = formData.content;

      // Upload file if selected
      if (selectedFile) {
        setUploading(true);

        let uploadResponse;
        if (formData.type === 'VIDEO') {
          uploadResponse = await fileService.uploadVideo(selectedFile, 'lectures/videos');
        } else {
          uploadResponse = await fileService.uploadDocument(selectedFile, 'lectures/files');
        }

        contentUrl = uploadResponse.result.fileUrl;
        setUploading(false);
      }

      const lectureData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        content: formData.type === 'TEXT' ? formData.content : contentUrl,
        duration: formData.duration ? parseInt(formData.duration) : null
      };

      await onSuccess(lectureData);
      onClose();
    } catch (error) {
      console.error('Error saving lecture:', error);
      toast.error('Failed to save lecture');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {lecture ? 'Edit Lecture' : 'Create New Lecture'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter lecture title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Enter lecture description"
            />
          </div>

          {/* Lecture Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lecture Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            >
              <option value="VIDEO">Video</option>
              <option value="TEXT">Text Content</option>
              <option value="FILE">Downloadable File</option>
            </select>
          </div>

          {/* Content - File Upload or Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.type === 'VIDEO' ? 'Upload Video' :
               formData.type === 'FILE' ? 'Upload File' : 'Content'}
            </label>

            {formData.type === 'TEXT' ? (
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows="6"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                placeholder="Enter text content (supports markdown)"
              />
            ) : (
              <div>
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileSelect}
                    accept={formData.type === 'VIDEO' ? 'video/*' : '*'}
                    className="hidden"
                  />

                  {filePreview ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <FileIcon size={24} />
                        <span className="text-sm font-medium">
                          {selectedFile ? selectedFile.name : 'File uploaded'}
                        </span>
                      </div>
                      {selectedFile && (
                        <p className="text-xs text-gray-500">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={removeFile}
                        className="text-sm text-red-600 hover:text-red-700"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Click to upload {formData.type === 'VIDEO' ? 'video' : 'file'}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {formData.type === 'VIDEO' ? 'MP4, WebM, or other video formats (max 100MB)' : 'PDF, DOC, ZIP, or other files (max 50MB)'}
                      </p>
                    </label>
                  )}
                </div>
              </div>
            )}

            <p className="mt-1 text-xs text-gray-500">
              {formData.type === 'TEXT' && 'Enter text content or markdown'}
            </p>
          </div>

          {/* Duration (only for VIDEO) */}
          {formData.type === 'VIDEO' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g., 15"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || uploading}
            >
              {uploading ? 'Uploading...' : loading ? 'Saving...' : lecture ? 'Update Lecture' : 'Create Lecture'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LectureModal;
