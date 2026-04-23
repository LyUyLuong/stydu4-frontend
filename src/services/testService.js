import api from './api';

const testService = {
  // Get all tests with pagination
  getAllTests: async (page = 1, size = 20) => {
    const response = await api.get('/tests', {
      params: { page, size },
    });
    return response.data;
  },

  // Search tests with filters (for normal users)
  searchTests: async (filters = {}) => {
    const { name, type, page = 1, size = 20 } = filters;
    const response = await api.get('/tests/search', {
      params: { 
        name, 
        type, 
        page, 
        size 
      },
    });
    return response.data;
  },

  // === THÊM HÀM MỚI TẠI ĐÂY ===
  /**
   * Search tests for Admin panel using specification
   * @param {object} searchParams - Object containing filters like name, type, status, page, size
   */
  searchTestsAdmin: async (searchParams) => {
    const response = await api.get('/tests/search-with-specification', {
      params: searchParams
    });
    return response.data;
  },
  // === KẾT THÚC HÀM MỚI ===

  // Get test by ID
  getTestById: async (testId) => {
    const response = await api.get(`/tests/${testId}`);
    return response.data;
  },

  // Start full test - Get questions for a test
  getTestQuestions: async (testId) => {
    const response = await api.get(`/exams/tests/${testId}/start`);
    const data = response.data.result;
    
    return {
      code: response.data.code,
      message: response.data.message,
      result: data
    };
  },

  // Start practice test with selected parts
  getPracticeQuestions: async (testId, partIds = []) => {
    const params = new URLSearchParams();
    partIds.forEach(partId => params.append('part', partId));
    
    const response = await api.get(`/exams/tests/${testId}/practice?${params.toString()}`);
    const data = response.data.result;
    
    return {
      code: response.data.code,
      message: response.data.message,
      result: data
    };
  },

  // Submit test answers
  submitTest: async (testId, answers, partIds = null, startedAt = null, durationSeconds = null) => {
    const payload = {
      testId,
      partIds: partIds || [],
      answers: answers.map(answer => ({
        questionId: answer.questionId,
        answerId: answer.answerId
      })),
      startedAt: startedAt,  // ✅ Include exam start time
      durationSeconds: durationSeconds  // ✅ NEW: Include actual duration from client (in seconds)
    };

    const response = await api.post(`/exams/submit`, payload);
    return response.data;
  },

  // Get test results (changed from /tests/{testId}/results to /exams/tests/{testId}/my-results)
  getTestResults: async (testId) => {
    const response = await api.get(`/exams/tests/${testId}/my-results`);
    return response.data;
  },

  // Get exam result by result ID
  getExamResult: async (resultId) => {
    const response = await api.get(`/exams/results/${resultId}`);
    return response.data;
  },

  // Get all exam results for current user (across all tests)
  getAllMyResults: async () => {
    const response = await api.get('/exams/my-results');
    return response.data;
  },

  // Admin CRUD operations
  createTest: async (data) => {
    const response = await api.post('/tests', data);
    return response.data;
  },

  createTestWithFiles: async (formData) => {
    const response = await api.post('/tests/with-files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateTest: async (testId, data) => {
    const response = await api.put(`/tests/${testId}`, data);
    return response.data;
  },

  updateTestWithFiles: async (testId, formData) => {
    const response = await api.post(`/tests/${testId}/with-files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteTest: async (testId) => {
    const response = await api.delete(`/tests/${testId}`);
    return response.data;
  },

  // Get test types (enum values)
  getTestTypes: async () => {
    const response = await api.get('/tests/types');
    return response.data;
  }
};

export default testService;