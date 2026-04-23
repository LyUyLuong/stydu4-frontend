import api from './api';

const partTestService = {
  // Get all part tests
  getAllPartTests: async (page = 1, size = 10) => {
    const response = await api.get(`/part-tests?page=${page}&size=${size}`);
    return response.data;
  },

  // Get part test by ID
  getPartTestById: async (id) => {
    const response = await api.get(`/part-tests/${id}`);
    return response.data;
  },

  // Search part tests with specification
  searchPartTests: async (searchParams) => {
    const response = await api.get('/part-tests/search-with-specification', {
      params: searchParams
    });
    return response.data;
  },

  // ✅ Get parts by test ID
  getPartsByTestId: async (testId, page = 1, size = 100) => {
    const response = await api.get('/part-tests/search-with-specification', {
      params: {
        testId,
        page,
        size
      }
    });
    return response.data;
  },

  // Create new part test
  createPartTest: async (data) => {
    const response = await api.post('/part-tests', data);
    return response.data;
  },

  // Update part test
  updatePartTest: async (id, data) => {
    const response = await api.put(`/part-tests/${id}`, data);
    return response.data;
  },

  // Delete part test
  deletePartTest: async (id) => {
    const response = await api.delete(`/part-tests/${id}`);
    return response.data;
  }, // <-- BẠN BỊ THIẾU DẤU PHẨY Ở ĐÂY

  // Get part test types (enum values)
  getPartTestTypes: async () => {
    // Giả sử endpoint là /part-tests/types
    const response = await api.get('/part-tests/types');
    return response.data;
  }
};

export default partTestService;