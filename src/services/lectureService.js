import apiClient from './api';

export const lectureService = {
  // Create lecture for a course (admin only)
  createLecture: async (courseId, lectureData) => {
    const response = await apiClient.post(`/lectures/courses/${courseId}`, lectureData);
    return response.data;
  },

  // Update lecture (admin only)
  updateLecture: async (lectureId, lectureData) => {
    const response = await apiClient.put(`/lectures/${lectureId}`, lectureData);
    return response.data;
  },

  // Delete lecture (admin only)
  deleteLecture: async (lectureId) => {
    const response = await apiClient.delete(`/lectures/${lectureId}`);
    return response.data;
  },

  // Get single lecture by ID
  getLectureById: async (lectureId) => {
    const response = await apiClient.get(`/lectures/${lectureId}`);
    return response.data;
  },

  // Get all lectures for a course - Admin view (includes unpublished)
  getAllLecturesByCourse: async (courseId) => {
    const response = await apiClient.get(`/lectures/courses/${courseId}/all`);
    return response.data;
  },

  // Get published lectures for a course - User view
  getPublishedLecturesByCourse: async (courseId) => {
    const response = await apiClient.get(`/lectures/courses/${courseId}`);
    return response.data;
  },

  // Reorder lectures (admin only)
  reorderLectures: async (courseId, lectureIds) => {
    const response = await apiClient.put(`/lectures/courses/${courseId}/reorder`, {
      lectureIds,
    });
    return response.data;
  },

  // Publish lecture (admin only)
  publishLecture: async (lectureId) => {
    const response = await apiClient.put(`/lectures/${lectureId}/publish`);
    return response.data;
  },

  // Unpublish lecture (admin only)
  unpublishLecture: async (lectureId) => {
    const response = await apiClient.put(`/lectures/${lectureId}/unpublish`);
    return response.data;
  },
};

export default lectureService;
