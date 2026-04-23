import apiClient from './api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const fileService = {
  // Upload image
  uploadImage: async (file, subFolder = 'general', description = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subFolder', subFolder);
    if (description) {
      formData.append('description', description);
    }

    const response = await apiClient.post('/files/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.result;
  },

  // Upload audio
  uploadAudio: async (file, subFolder = 'general', description = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subFolder', subFolder);
    if (description) {
      formData.append('description', description);
    }

    const response = await apiClient.post('/files/upload/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.result;
  },

  // Upload video
  uploadVideo: async (file, subFolder = 'general', description = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subFolder', subFolder);
    if (description) {
      formData.append('description', description);
    }

    const response = await apiClient.post('/files/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload document
  uploadDocument: async (file, subFolder = 'general', description = '') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('subFolder', subFolder);
    if (description) {
      formData.append('description', description);
    }

    const response = await apiClient.post('/files/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get files by type
  getFilesByType: async (fileType) => {
    const response = await apiClient.get(`/files/type/${fileType}`);
    return response.data.result;
  },

  // Get files by type with pagination
  getFilesByTypeWithPagination: async (fileType, page = 1, size = 12, sortBy = 'createdDate', sortDirection = 'DESC') => {
    const response = await apiClient.get(`/files/type/${fileType}/search`, {
      params: { page, size, sortBy, sortDirection }
    });
    return response.data.result;
  },

  // Delete file
  deleteFile: async (fileId) => {
    const response = await apiClient.delete(`/files/${fileId}`);
    return response.data;
  },

  // Get file URL - returns full URL to access file
  getFileUrl: (fileId) => {
    return `${API_BASE_URL}/files/${fileId}`;
  },

  // Check if file exists
  fileExists: async (fileId) => {
    const response = await apiClient.get(`/files/${fileId}/exists`);
    return response.data.result;
  },
};

export default fileService;
