import api from './api';

const questionTestService = {
  // Get all question tests
  getAllQuestionTests: async (page = 1, size = 10) => {
    const response = await api.get(`/question-tests?page=${page}&size=${size}`);
    return response.data;
  },

  // Get question test by ID
  getQuestionTestById: async (id) => {
    const response = await api.get(`/question-tests/${id}`);
    return response.data;
  },

  // Search question tests with specification
  searchQuestionTests: async (searchParams) => {
    const response = await api.get('/question-tests/search-with-specification', {
      params: searchParams
    });
    return response.data;
  },

  // ✅ Get questions by part ID
  getQuestionsByPartId: async (partId, page = 1, size = 100) => {
    const response = await api.get('/question-tests/search-with-specification', {
      params: {
        partId,
        page,
        size
      }
    });
    return response.data;
  },

  // ✅ Get questions by question group ID
  getQuestionsByQuestionGroupId: async (questionGroupId, page = 1, size = 100) => {
    const response = await api.get('/question-tests/search-with-specification', {
      params: {
        questionGroupId,
        page,
        size
      }
    });
    return response.data;
  },

  // Create new question test
  createQuestionTest: async (data) => {
    const response = await api.post('/question-tests', data);
    return response.data;
  },

  // Create question test with files
  createQuestionTestWithFiles: async (formData) => {
    const response = await api.post('/question-tests/with-files', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update question test
  updateQuestionTest: async (id, data) => {
    const response = await api.put(`/question-tests/${id}`, data);
    return response.data;
  },

  // Update question test audio
  updateQuestionTestAudio: async (id, audioFile) => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    const response = await api.post(`/question-tests/${id}/audio`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update question test image
  updateQuestionTestImage: async (id, imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await api.post(`/question-tests/${id}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete question test
  deleteQuestionTest: async (id) => {
    const response = await api.delete(`/question-tests/${id}`);
    return response.data;
  },

  // Get question types (enum values)
  getQuestionTypes: async () => {
    const response = await api.get('/question-tests/types');
    return response.data;
  }
};

export default questionTestService;
