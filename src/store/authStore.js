import { create } from 'zustand';
import { authService } from '../services/authService';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Set user
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  // Set token (for OAuth2 login)
  setToken: async (token) => {
    try {
      localStorage.setItem('access_token', token);
      
      // Get user info using the token
      const userInfo = await authService.getMyInfo();
      set({ user: userInfo.result, isAuthenticated: true, isLoading: false });
      
      return { success: true };
    } catch (error) {
      localStorage.removeItem('access_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
      return { success: false, error: error.response?.data?.message || 'Failed to load user info' };
    }
  },

  // Login
  login: async (username, password) => {
    try {
      const response = await authService.login(username, password);
      const { token, refreshToken } = response.result;
      
      localStorage.setItem('access_token', token);
      localStorage.setItem('refresh_token', refreshToken);
      
      // Get user info
      const userInfo = await authService.getMyInfo();
      set({ user: userInfo.result, isAuthenticated: true, isLoading: false });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: true, data: response.result };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    }
  },

  // Logout
  logout: async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (token) {
        await authService.logout();
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Luôn xóa token và user info ở client, kể cả khi API call failed
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false });
    }
  },

  // Load user from token
  loadUser: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const response = await authService.getMyInfo();
      set({ user: response.result, isAuthenticated: true, isLoading: false });
    } catch (error) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

export default useAuthStore;
