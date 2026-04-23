import apiClient from './api';

export const dashboardService = {
  // Fetch all dashboard stats with date range
  getAllStats: async (startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get('/dashboard/stats', { params });
      return response.data.result;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Fetch revenue analytics with date range
  getRevenueAnalytics: async (startDate = null, endDate = null) => {
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get('/dashboard/revenue-analytics', { params });
      return response.data.result;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  }
};

export default dashboardService;
