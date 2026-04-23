import apiClient from './api';

export const courseService = {
  // Get all published courses (for users)
  getAllCourses: async (page = 1, size = 20) => {
    const response = await apiClient.get('/courses', {
      params: { page, size },
    });
    return response.data;
  },

  // Get all courses including unpublished (for admin)
  getAllCoursesForAdmin: async () => {
    const response = await apiClient.get('/courses/admin/all');
    return response.data;
  },

  // Get course by ID
  getCourseById: async (courseId) => {
    const response = await apiClient.get(`/courses/${courseId}`);
    return response.data;
  },

  // Purchase/Enroll in a course (changed from enrollCourse)
  purchaseCourse: async (courseId) => {
    const response = await apiClient.post(`/courses/${courseId}/purchase`);
    return response.data;
  },

  // Get enrolled courses (changed from /courses/enrolled to /courses/my-courses)
  getEnrolledCourses: async () => {
    const response = await apiClient.get('/courses/my-courses');
    return response.data;
  },

  // Capture payment after checkout
  capturePayment: async (sessionId) => {
    const response = await apiClient.post('/courses/payment/capture', { sessionId });
    return response.data;
  },

  // Publish course (admin only)
  publishCourse: async (courseId) => {
    const response = await apiClient.put(`/courses/${courseId}/publish`);
    return response.data;
  },

  // Unpublish course (admin only)
  unpublishCourse: async (courseId) => {
    const response = await apiClient.put(`/courses/${courseId}/unpublish`);
    return response.data;
  },

  // Create course (admin only)
  createCourse: async (courseData) => {
    const response = await apiClient.post('/courses', courseData);
    return response.data;
  },

  // Update course (admin only)
  updateCourse: async (courseId, courseData) => {
    const response = await apiClient.put(`/courses/${courseId}`, courseData);
    return response.data;
  },

  // Delete course (admin only)
  deleteCourse: async (courseId) => {
    const response = await apiClient.delete(`/courses/${courseId}`);
    return response.data;
  },

  // Upload course image (admin only)
  uploadCourseImage: async (courseId, imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await apiClient.post(`/courses/${courseId}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Note: Review endpoints are not implemented in backend yet
  // The following methods are commented out until backend implements them
  
  // addReview: async (courseId, reviewData) => {
  //   const response = await apiClient.post(`/courses/${courseId}/reviews`, reviewData);
  //   return response.data;
  // },

  // getCourseReviews: async (courseId, page = 1, size = 10) => {
  //   const response = await apiClient.get(`/courses/${courseId}/reviews`, {
  //     params: { page, size },
  //   });
  //   return response.data;
  // },

  // voteReviewHelpful: async (reviewId) => {
  //   const response = await apiClient.post(`/reviews/${reviewId}/helpful`);
  //   return response.data;
  // },
};

export default courseService;
