import { useState, useEffect, useCallback } from 'react';
import fileService from '../../services/fileService';
import AuthMedia from '../../components/AuthMedia';
import { useFileUrlCache } from '../../hooks/useFileUrl';

const AdminFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState('IMAGE');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 12,
    totalPages: 0,
    totalElements: 0
  });
  const [uploadData, setUploadData] = useState({
    file: null,
    subFolder: 'general',
    description: '',
    type: 'IMAGE'
  });
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false); // ✅ State để toggle form
  
  // Use custom hook for file URL caching
  const { revokeFileUrl, clearCache } = useFileUrlCache();

  // Cleanup cache on unmount
  useEffect(() => {
    return () => {
      clearCache();
    };
  }, [clearCache]);

  // Load files with better error handling
  const loadFiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fileService.getFilesByTypeWithPagination(
        fileType, 
        pagination.currentPage, 
        pagination.pageSize
      );
      setFiles(data.data || []);
      setPagination(prev => ({
        ...prev,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalElements: data.totalElements
      }));
    } catch (error) {
      console.error('Error loading files:', error);
      setError('Failed to load files. Please try again.');
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [fileType, pagination.currentPage, pagination.pageSize]);

  // Load files when dependencies change
  useEffect(() => {
    loadFiles();
  }, [fileType, pagination.currentPage]);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData(prev => ({ ...prev, file }));
    }
  }, []);

  const handleUpload = useCallback(async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      setError('Please select a file');
      return;
    }

    setUploading(true);
    setError(null);
    try {
      if (uploadData.type === 'IMAGE') {
        await fileService.uploadImage(
          uploadData.file,
          uploadData.subFolder,
          uploadData.description
        );
      } else {
        await fileService.uploadAudio(
          uploadData.file,
          uploadData.subFolder,
          uploadData.description
        );
      }

      // Reset form
      setUploadData(prev => ({
        file: null,
        subFolder: 'general',
        description: '',
        type: prev.type
      }));
      
      const fileInput = document.getElementById('fileInput');
      if (fileInput) fileInput.value = '';

      // Reload files
      await loadFiles();
      setError('File uploaded successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Error uploading file: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  }, [uploadData, loadFiles]);

  const handleDelete = useCallback(async (fileId) => {
    try {
      // Revoke blob URL before deleting
      revokeFileUrl(fileId);
      
      await fileService.deleteFile(fileId);
      
      // Reset to page 1 if current page becomes empty
      if (files.length === 1 && pagination.currentPage > 1) {
        setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
      } else {
        await loadFiles();
      }
      setDeleteConfirm(null);
      setError('File deleted successfully!');
    } catch (error) {
      console.error('Error deleting file:', error);
      setError('Error deleting file: ' + (error.response?.data?.message || error.message));
    }
  }, [files.length, pagination.currentPage, loadFiles]);

  const handlePageChange = useCallback((newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, currentPage: newPage }));
    }
  }, [pagination.totalPages]);

  const handlePreview = useCallback((file) => {
    setPreviewFile(file);
  }, []);

  const formatFileSize = useCallback((bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }, []);

  const formatDate = useCallback((dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  }, []);

  const handleTypeChange = useCallback((newType) => {
    setFileType(newType);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">File Management</h1>
        {/* ✅ Toggle button để show/hide upload form */}
        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          {showUploadForm ? (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Hide Upload Form
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload New File
            </>
          )}
        </button>
      </div>

      {/* Error/Success Message */}
      {error && (
        <div className={`mb-6 p-4 rounded-lg ${
          error.includes('success') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-gray-500 hover:text-gray-700">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ✅ Upload Form - Chỉ hiện khi showUploadForm = true */}
      {showUploadForm && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload New File</h2>
          <form onSubmit={handleUpload} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Type
              </label>
              <select
                value={uploadData.type}
                onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="IMAGE">Image</option>
                <option value="AUDIO">Audio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub Folder
              </label>
              <input
                type="text"
                value={uploadData.subFolder}
                onChange={(e) => setUploadData({ ...uploadData, subFolder: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="general"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <input
              type="text"
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select File
            </label>
            <input
              id="fileInput"
              type="file"
              onChange={handleFileSelect}
              accept={uploadData.type === 'IMAGE' ? 'image/*' : 'audio/*'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {uploadData.file && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {uploadData.file.name} ({formatFileSize(uploadData.file.size)})
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading || !uploadData.file}
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? 'Uploading...' : 'Upload File'}
          </button>
        </form>
      </div>
      )}

      {/* File Type Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <button
              onClick={() => handleTypeChange('IMAGE')}
              className={`px-4 py-2 rounded transition-colors ${
                fileType === 'IMAGE'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Images
            </button>
            <button
              onClick={() => handleTypeChange('AUDIO')}
              className={`px-4 py-2 rounded transition-colors ${
                fileType === 'AUDIO'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Audio Files
            </button>
          </div>
          <div className="text-sm text-gray-600">
            Total: {pagination.totalElements} files
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">
            {fileType === 'IMAGE' ? 'Images' : 'Audio Files'} 
            ({pagination.totalElements} total, Page {pagination.currentPage} of {pagination.totalPages})
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : files.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No files found</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {files.map((file) => (
              <div
                key={file.id}
                className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
              >
                {/* Preview */}
                <div className="mb-3">
                  {fileType === 'IMAGE' ? (
                    <AuthMedia
                      fileId={file.id}
                      type="IMAGE"
                      alt={file.fileName}
                      className="w-full h-48 object-cover rounded cursor-pointer"
                      onClick={() => handlePreview(file)}
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded flex items-center justify-center p-4">
                      <AuthMedia
                        fileId={file.id}
                        type="AUDIO"
                        className="w-full"
                      />
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm truncate" title={file.fileName}>
                    {file.fileName}
                  </h3>
                  {file.description && (
                    <p className="text-xs text-gray-600 truncate" title={file.description}>
                      {file.description}
                    </p>
                  )}
                  <div className="text-xs text-gray-500">
                    <p>Size: {formatFileSize(file.fileSize)}</p>
                    <p>Type: {file.contentType}</p>
                    <p>Folder: {file.filePath}</p>
                    <p>Uploaded: {formatDate(file.uploadDate)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <a
                      href={fileService.getFileUrl(file.id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-500 text-white text-xs px-3 py-2 rounded text-center hover:bg-blue-600"
                    >
                      View
                    </a>
                    <button
                      onClick={() => setDeleteConfirm(file)}
                      className="flex-1 bg-red-500 text-white text-xs px-3 py-2 rounded hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t flex justify-center items-center gap-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  First
                </button>
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1;
                    // Show first page, last page, current page, and adjacent pages
                    if (
                      page === 1 ||
                      page === pagination.totalPages ||
                      (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 border rounded ${
                            page === pagination.currentPage
                              ? 'bg-blue-500 text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === pagination.currentPage - 2 ||
                      page === pagination.currentPage + 2
                    ) {
                      return <span key={page} className="px-2">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <button
                  onClick={() => handlePageChange(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Last
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.fileName}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {previewFile && fileType === 'IMAGE' && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewFile(null)}
        >
          <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <AuthMedia
              fileId={previewFile.id}
              type="IMAGE"
              alt={previewFile.fileName}
              className="max-w-full max-h-[80vh] object-contain mx-auto rounded"
            />
            <div className="text-white text-center mt-4 space-y-2">
              <p className="font-semibold">{previewFile.fileName}</p>
              {previewFile.description && (
                <p className="text-sm text-gray-300">{previewFile.description}</p>
              )}
            </div>
            <button
              onClick={() => setPreviewFile(null)}
              className="mt-4 mx-auto block bg-white text-black px-6 py-2 rounded hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFiles;
