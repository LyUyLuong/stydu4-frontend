import api from './api';

const questionGroupService = {
  // Get all question groups
  getAllQuestionGroups: async (page = 1, size = 10) => {
    const response = await api.get(`/question-groups?page=${page}&size=${size}`);
    return response.data;
  },

  // Get question group by ID
  getQuestionGroupById: async (id) => {
    const response = await api.get(`/question-groups/${id}`);
    return response.data;
  },

  // Search question groups with specification
  searchQuestionGroups: async (searchParams) => {
    const response = await api.get('/question-groups/search-with-specification', {
      params: searchParams
    });
    return response.data;
  },

  // ✅ Get question groups by part ID
  getQuestionGroupsByPartId: async (partId, page = 1, size = 100) => {
    const response = await api.get('/question-groups/search-with-specification', {
      params: {
        partId,
        page,
        size
      }
    });
    return response.data;
  },

  // Create new question group
  createQuestionGroup: async (data) => {
    const response = await api.post('/question-groups', data);
    return response.data;
  },

  // Create question group with files
  createQuestionGroupWithFiles: async (formData) => {
    const response = await api.post('/question-groups/with-files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update question group
  updateQuestionGroup: async (id, data) => {
    const response = await api.put(`/question-groups/${id}`, data);
    return response.data;
  },

  // Update question group audio
  updateQuestionGroupAudio: async (id, audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    const response = await api.post(`/question-groups/${id}/audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update question group image
  updateQuestionGroupImage: async (id, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await api.post(`/question-groups/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete question group
  deleteQuestionGroup: async (id) => {
    const response = await api.delete(`/question-groups/${id}`);
    return response.data;
  },

  getQuestionGroupTypes: async () => {
    // Giả sử endpoint là /question-groups/types
    const response = await api.get('/question-groups/types');
    return response.data;
  }
};

export default questionGroupService;
