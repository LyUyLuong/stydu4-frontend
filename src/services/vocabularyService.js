import apiClient from './api';

const vocabularyService = {
  /**
   * Get vocabulary by ID
   * @param {string} id - Vocabulary ID
   * @returns {Promise} Vocabulary details
   */
  getVocabularyById: async (id) => {
    const response = await apiClient.get(`/vocabularies/${id}`);
    return response.data;
  },

  /**
   * Get vocabulary by word
   * @param {string} word - Vocabulary word
   * @returns {Promise} Vocabulary details
   */
  getVocabularyByWord: async (word) => {
    const response = await apiClient.get(`/vocabularies/word/${word}`);
    return response.data;
  },

  /**
   * Get multiple vocabularies by IDs
   * @param {string[]} ids - Array of vocabulary IDs
   * @returns {Promise} Array of vocabulary details
   */
  getVocabulariesByIds: async (ids) => {
    const response = await apiClient.post(`/vocabularies/batch`, { ids });
    return response.data;
  },

  /**
   * Search vocabularies
   * @param {string} query - Search query
   * @param {number} page - Page number (default: 0)
   * @param {number} size - Page size (default: 20)
   * @returns {Promise} Paginated vocabulary results
   */
  searchVocabulary: async (query, page = 0, size = 20) => {
    const response = await apiClient.get(`/vocabularies/search`, {
      params: { q: query, page, size }
    });
    return response.data;
  },

  /**
   * Get vocabularies by difficulty level
   * @param {string} level - Difficulty level (BEGINNER, INTERMEDIATE, etc.)
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise} Paginated vocabulary results
   */
  getVocabulariesByLevel: async (level, page = 0, size = 20) => {
    const response = await apiClient.get(`/vocabularies/level/${level}`, {
      params: { page, size }
    });
    return response.data;
  },

  /**
   * Add vocabulary to user's learning list
   * @param {string} wordId - Vocabulary ID
   * @returns {Promise} User vocabulary record
   */
  addVocabularyToUser: async (wordId) => {
    const response = await apiClient.post(`/vocabularies/user/vocabularies/${wordId}`);
    return response.data;
  },

  /**
   * Update learning progress for a vocabulary
   * @param {string} wordId - Vocabulary ID
   * @param {boolean} isCorrect - Whether the answer was correct
   * @returns {Promise} Updated user vocabulary record
   */
  updateLearningProgress: async (wordId, isCorrect) => {
    const response = await apiClient.put(`/vocabularies/user/vocabularies/${wordId}/progress`, null, {
      params: { correct: isCorrect }
    });
    return response.data;
  },

  /**
   * Get vocabularies due for review
   * @returns {Promise} Array of vocabularies due for review
   */
  getDueForReview: async () => {
    const response = await apiClient.get(`/vocabularies/user/vocabularies/due-review`);
    return response.data;
  },

  /**
   * Get bookmarked vocabularies
   * @param {number} page - Page number
   * @param {number} size - Page size
   * @returns {Promise} Paginated bookmarked vocabularies
   */
  getBookmarkedWords: async (page = 0, size = 20) => {
    const response = await apiClient.get(`/vocabularies/user/vocabularies/bookmarked`, {
      params: { page, size }
    });
    return response.data;
  },

  /**
   * Toggle bookmark for a vocabulary
   * @param {string} wordId - Vocabulary ID
   * @returns {Promise} Updated user vocabulary record
   */
  toggleBookmark: async (wordId) => {
    const response = await apiClient.post(`/vocabularies/user/vocabularies/${wordId}/bookmark`);
    return response.data;
  },

  /**
   * Get grammar point by ID
   * @param {string} id - Grammar point ID
   * @returns {Promise} Grammar point details
   */
  getGrammarPointById: async (id) => {
    const response = await apiClient.get(`/grammar-points/${id}`);
    return response.data;
  },

  /**
   * Get multiple grammar points by IDs
   * @param {string[]} ids - Array of grammar point IDs
   * @returns {Promise} Array of grammar points
   */
  getGrammarPointsByIds: async (ids) => {
    const response = await apiClient.post(`/grammar-points/batch`, { ids });
    return response.data;
  },

  /**
   * Get grammar points by difficulty level
   * @param {string} level - Difficulty level
   * @returns {Promise} Array of grammar points
   */
  getGrammarPointsByLevel: async (level) => {
    const response = await apiClient.get(`/grammar-points/level/${level}`);
    return response.data;
  },
};

export default vocabularyService;
