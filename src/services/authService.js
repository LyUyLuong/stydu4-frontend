import apiClient from './api';

export const authService = {
  // Login with email and password
  login: async (username, password) => {
    const response = await apiClient.post('/auth/token', { username, password });
    return response.data;
  },

  // Register new user
  register: async (userData) => {
    const response = await apiClient.post('/users', userData);
    return response.data;
  },

  // Logout
  logout: async () => {
    const token = localStorage.getItem('access_token');
    const response = await apiClient.post('/auth/logout', { token });
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    return response.data;
  },

  // Get current user info
  getMyInfo: async () => {
    const response = await apiClient.get('/users/myInfo');
    return response.data;
  },

  // Refresh token
  refreshToken: async (refreshToken) => {
    const response = await apiClient.post('/auth/refresh', { token: refreshToken });
    return response.data;
  },

  // Google OAuth2 login
  googleLogin: () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/oauth2/authorization/google`;
  },
};

export default authService;
