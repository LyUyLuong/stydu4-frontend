import apiClient from './api';

export const orderService = {
  // Get user's order history
  getMyOrders: async () => {
    const response = await apiClient.get('/orders/my-orders');
    return response.data;
  },
};

export default orderService;
