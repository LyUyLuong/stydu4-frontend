import apiClient from './api';

export const paymentService = {
  // Create payment session (purchase course)
  // Note: Use courseService.purchaseCourse(courseId) instead
  // This creates payment through /courses/{id}/purchase endpoint
  createPayment: async (courseId) => {
    const response = await apiClient.post(`/courses/${courseId}/purchase`);
    return response.data;
  },

  // Capture payment after Stripe checkout
  capturePayment: async (sessionId) => {
    const response = await apiClient.post('/courses/payment/capture', { sessionId });
    return response.data;
  },

  // Get payment history
  // Note: Backend doesn't have dedicated payment history endpoint yet
  // Use courseService.getEnrolledCourses() to see purchased courses
  getPaymentHistory: async (page = 1, size = 20) => {
    console.warn('Payment history API not implemented in backend. Use getEnrolledCourses() instead.');
    throw new Error('Payment history API not available. Use enrolled courses instead.');
    // const response = await apiClient.get('/payments/history', {
    //   params: { page, size },
    // });
    // return response.data;
  },
};

export default paymentService;
