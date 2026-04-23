import apiClient from './api';

// Note: Progress endpoints are not implemented in backend yet
// These methods will not work until backend implements ProgressController

export const progressService = {
  // Get user progress
  getUserProgress: async () => {
    // TODO: Backend endpoint not implemented yet
    console.warn('Progress API not implemented in backend');
    throw new Error('Progress API not available');
    // const response = await apiClient.get('/progress');
    // return response.data;
  },

  // Get test history
  getTestHistory: async (page = 1, size = 20) => {
    // As a workaround, you can use /exams/tests/{testId}/my-results for specific tests
    // TODO: Backend needs to implement general history endpoint
    console.warn('Progress history API not implemented in backend');
    throw new Error('Progress history API not available');
    // const response = await apiClient.get('/progress/history', {
    //   params: { page, size },
    // });
    // return response.data;
  },

  // Get progress statistics
  getStatistics: async () => {
    // TODO: Backend endpoint not implemented yet
    console.warn('Statistics API not implemented in backend');
    throw new Error('Statistics API not available');
    // const response = await apiClient.get('/progress/statistics');
    // return response.data;
  },

  // Get current streak
  getCurrentStreak: async () => {
    // TODO: Backend endpoint not implemented yet
    console.warn('Streak API not implemented in backend');
    throw new Error('Streak API not available');
    // const response = await apiClient.get('/progress/streak');
    // return response.data;
  },
};

export default progressService;
